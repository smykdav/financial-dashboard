from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Year, Month, DeliveryReportSnapshot, FinReportSnapshot
from .serializers import (
    YearSerializer,
    MonthSerializer,
    MonthDetailSerializer,
    DeliveryReportSerializer,
    FinReportSerializer
)


class YearViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Year model.
    Provides list, retrieve, create, update, and delete operations.
    """
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-year']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def months(self, request, pk=None):
        """Get all months for a specific year."""
        year = self.get_object()
        months = year.months.all()
        serializer = MonthSerializer(months, many=True)
        return Response(serializer.data)


class MonthViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Month model.
    Provides list, retrieve, create, update, and delete operations.
    """
    queryset = Month.objects.select_related('year').all()
    permission_classes = [IsAuthenticated]
    ordering = ['-year__year', '-month']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MonthDetailSerializer
        return MonthSerializer

    @action(detail=True, methods=['get'])
    def delivery_report(self, request, pk=None):
        """Get delivery report for a specific month."""
        month = self.get_object()
        try:
            report = month.delivery_report
            serializer = DeliveryReportSerializer(report)
            return Response(serializer.data)
        except DeliveryReportSnapshot.DoesNotExist:
            return Response(
                {'detail': 'Delivery report not found for this month'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def fin_report(self, request, pk=None):
        """Get financial report for a specific month."""
        month = self.get_object()
        try:
            report = month.fin_report
            serializer = FinReportSerializer(report)
            return Response(serializer.data)
        except FinReportSnapshot.DoesNotExist:
            return Response(
                {'detail': 'Financial report not found for this month'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request, year, month):
    """
    Get all dashboard data for a specific year and month.
    Returns both delivery and financial reports with aggregated data for charts.
    """
    try:
        year_obj = Year.objects.get(year=year)
        month_obj = Month.objects.get(year=year_obj, month=month)

        response_data = {
            'year': year,
            'month': month,
            'month_display': month_obj.month_display,
        }

        # Get delivery report if exists
        try:
            delivery_report = month_obj.delivery_report
            response_data['delivery_report'] = DeliveryReportSerializer(delivery_report).data
        except DeliveryReportSnapshot.DoesNotExist:
            response_data['delivery_report'] = None

        # Get financial report if exists
        try:
            fin_report = month_obj.fin_report
            response_data['fin_report'] = FinReportSerializer(fin_report).data
        except FinReportSnapshot.DoesNotExist:
            response_data['fin_report'] = None

        # Get historical data for charts (last 6 months)
        historical_months = Month.objects.filter(
            year__year__lte=year
        ).order_by('-year__year', '-month')[:6]

        historical_data = []
        for hist_month in reversed(list(historical_months)):
            month_data = {
                'month': hist_month.month_display,
                'year': hist_month.year.year,
            }

            # Add delivery metrics if available
            try:
                delivery = hist_month.delivery_report
                if delivery.revenue:
                    month_data['delivery_revenue'] = float(delivery.revenue)
                if delivery.fte:
                    month_data['fte'] = delivery.fte
            except DeliveryReportSnapshot.DoesNotExist:
                pass

            # Add financial metrics if available
            try:
                fin = hist_month.fin_report
                if fin.cash_income:
                    month_data['cash_income'] = float(fin.cash_income)
                if fin.accrual_income:
                    month_data['accrual_income'] = float(fin.accrual_income)
                if fin.accrual_revenue:
                    month_data['accrual_revenue'] = float(fin.accrual_revenue)
                if fin.gross_profit:
                    month_data['gross_profit'] = float(fin.gross_profit)
                if fin.cogs:
                    month_data['cogs'] = float(fin.cogs)
            except FinReportSnapshot.DoesNotExist:
                pass

            historical_data.append(month_data)

        response_data['historical_data'] = historical_data

        return Response(response_data, status=status.HTTP_200_OK)

    except Year.DoesNotExist:
        return Response(
            {'detail': f'Year {year} not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Month.DoesNotExist:
        return Response(
            {'detail': f'Month {month} not found for year {year}'},
            status=status.HTTP_404_NOT_FOUND
        )
