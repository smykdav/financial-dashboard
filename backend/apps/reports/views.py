from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from apps.core.models import Year, Month
from .models import ReportType, Report
from .serializers import (
    ReportTypeSerializer,
    ReportSerializer,
    BulkReportCreateSerializer
)


class ReportTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report types.
    System report types cannot be edited or deleted.
    GET requests are public, other methods require authentication.
    """
    queryset = ReportType.objects.all()
    serializer_class = ReportTypeSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        """Allow anyone to view report types, but require auth for modifications"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Set created_by when creating new report type"""
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Prevent deletion of system report types"""
        instance = self.get_object()
        if instance.is_system:
            return Response(
                {"error": "System report types cannot be deleted"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report data.
    Supports filtering by report_type, year, and month.
    """
    queryset = Report.objects.select_related('report_type', 'year', 'month').all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter reports based on query parameters"""
        queryset = super().get_queryset()

        # Filter by report type slug
        report_type_slug = self.request.query_params.get('report_type')
        if report_type_slug:
            queryset = queryset.filter(report_type__slug=report_type_slug)

        # Filter by year
        year_value = self.request.query_params.get('year')
        if year_value:
            queryset = queryset.filter(year__year=year_value)

        # Filter by month (supports single month or comma-separated list)
        month_value = self.request.query_params.get('month')
        if month_value:
            # Support comma-separated months: ?month=1,2,3
            if ',' in month_value:
                month_list = [int(m.strip()) for m in month_value.split(',') if m.strip().isdigit()]
                queryset = queryset.filter(month__month__in=month_list)
            else:
                queryset = queryset.filter(month__month=month_value)

        return queryset

    def perform_create(self, serializer):
        """Set uploaded_by when creating new report"""
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request):
        """
        Bulk create reports from frontend-parsed CSV data.
        Expected payload:
        {
            "report_type_slug": "delivery",
            "year": 2024,
            "months": [
                {"month": 1, "data": {"fte": 14, "revenue": 1000.50, ...}},
                {"month": 2, "data": {...}},
                ...
            ]
        }
        """
        serializer = BulkReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        report_type_slug = serializer.validated_data['report_type_slug']
        year_value = serializer.validated_data['year']
        months_data = serializer.validated_data['months']

        # Get or create ReportType
        report_type = get_object_or_404(ReportType, slug=report_type_slug)

        # Get or create Year
        year_obj, _ = Year.objects.get_or_create(year=year_value)

        created_reports = []
        updated_reports = []

        for month_data in months_data:
            month_number = month_data['month']
            data = month_data['data']

            # Get or create Month
            month_obj, _ = Month.objects.get_or_create(
                year=year_obj,
                month=month_number
            )

            # Create or update Report
            report, created = Report.objects.update_or_create(
                report_type=report_type,
                year=year_obj,
                month=month_obj,
                defaults={
                    'data': data,
                    'uploaded_by': request.user
                }
            )

            if created:
                created_reports.append(f"{year_value}-{month_number:02d}")
            else:
                updated_reports.append(f"{year_value}-{month_number:02d}")

        return Response({
            "message": "Reports processed successfully",
            "created": created_reports,
            "updated": updated_reports,
            "total": len(months_data)
        }, status=status.HTTP_201_CREATED)
