import pandas as pd
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .parsers import DeliveryReportParser, FinancialReportParser


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_delivery_report(request):
    """
    Import delivery report from CSV file.
    Expects:
    - file: CSV file
    - year: Year value (e.g., 2025)
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    year = request.data.get('year')
    if not year:
        return Response(
            {'error': 'Year is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        year_value = int(year)
    except ValueError:
        return Response(
            {'error': 'Invalid year format'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES['file']

    # Check file extension
    if not file.name.endswith('.csv'):
        return Response(
            {'error': 'Only CSV files are allowed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Parse and import
    parser = DeliveryReportParser()
    success, result = parser.parse_and_import(file, year_value, request.user)

    if success:
        return Response({
            'message': 'Delivery report imported successfully',
            'data': result
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({
            'error': 'Failed to import delivery report',
            'details': result
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_financial_report(request):
    """
    Import financial report from CSV file.
    Expects:
    - file: CSV file
    - year: Year value (e.g., 2025)
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    year = request.data.get('year')
    if not year:
        return Response(
            {'error': 'Year is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        year_value = int(year)
    except ValueError:
        return Response(
            {'error': 'Invalid year format'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES['file']

    # Check file extension
    if not file.name.endswith('.csv'):
        return Response(
            {'error': 'Only CSV files are allowed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Parse and import
    parser = FinancialReportParser()
    success, result = parser.parse_and_import(file, year_value, request.user)

    if success:
        return Response({
            'message': 'Financial report imported successfully',
            'data': result
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({
            'error': 'Failed to import financial report',
            'details': result
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def validate_csv(request):
    """
    Validate CSV file without importing.
    Expects:
    - file: CSV file
    - report_type: 'delivery' or 'financial'
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    report_type = request.data.get('report_type')
    if report_type not in ['delivery', 'financial']:
        return Response(
            {'error': 'Invalid report_type. Must be "delivery" or "financial"'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES['file']

    # Check file extension
    if not file.name.endswith('.csv'):
        return Response(
            {'error': 'Only CSV files are allowed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Simple validation - just check if we can read the CSV
    try:
        df = pd.read_csv(file)
        return Response({
            'valid': True,
            'message': 'CSV file is valid',
            'row_count': len(df),
            'column_count': len(df.columns)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'valid': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
