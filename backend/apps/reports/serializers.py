from rest_framework import serializers
from .models import ReportType, Report


class ReportTypeSerializer(serializers.ModelSerializer):
    """Serializer for ReportType model"""

    class Meta:
        model = ReportType
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'is_system', 'parsing_config', 'field_schema',
            'display_config', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_system', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Prevent editing system report types"""
        if self.instance and self.instance.is_system:
            raise serializers.ValidationError(
                "System report types cannot be modified"
            )
        return attrs


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report model"""
    report_type_name = serializers.CharField(source='report_type.name', read_only=True)
    year_value = serializers.IntegerField(source='year.year', read_only=True)
    month_value = serializers.IntegerField(source='month.month', read_only=True)
    month_display = serializers.CharField(source='month.month_display', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'report_type', 'report_type_name',
            'year', 'year_value', 'month', 'month_value', 'month_display',
            'data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BulkReportCreateSerializer(serializers.Serializer):
    """Serializer for creating multiple reports at once (from frontend CSV parsing)"""
    report_type_slug = serializers.SlugField()
    year = serializers.IntegerField(min_value=2000, max_value=2100)
    months = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=12
    )

    def validate_months(self, value):
        """Validate months data structure"""
        for month_data in value:
            if 'month' not in month_data or 'data' not in month_data:
                raise serializers.ValidationError(
                    "Each month must have 'month' (number) and 'data' (dict) fields"
                )
            if not isinstance(month_data['month'], int) or not (1 <= month_data['month'] <= 12):
                raise serializers.ValidationError(
                    "Month must be an integer between 1 and 12"
                )
            if not isinstance(month_data['data'], dict):
                raise serializers.ValidationError(
                    "Month data must be a dictionary"
                )
        return value
