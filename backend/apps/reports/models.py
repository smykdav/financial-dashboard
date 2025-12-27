from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Year, Month


class ReportType(models.Model):
    """
    Template/configuration for different report types.
    System types (Delivery, Financial) cannot be edited or deleted.
    """

    # Basic information
    name = models.CharField(max_length=100, help_text="Display name (e.g., 'Delivery Report')")
    slug = models.SlugField(unique=True, help_text="URL-friendly identifier")
    description = models.TextField(blank=True, help_text="Description of what this report contains")
    icon = models.CharField(max_length=50, default='📊', help_text="Emoji or icon identifier")

    # System protection
    is_system = models.BooleanField(
        default=False,
        help_text="System report types cannot be edited or deleted"
    )

    # Parsing configuration (how to parse CSV)
    parsing_config = models.JSONField(
        default=dict,
        help_text="""
        Configuration for CSV parsing. Example:
        {
            "format": "transposed",  # or "normal"
            "header_row": 1,  # which row (0-indexed) contains column headers
            "data_start_row": 2,  # which row data starts
            "month_column_type": "names",  # "names" (January, February) or "numbers" (1, 2, 3)
            "field_mappings": {
                "CSV Column Name": {
                    "field": "database_field_name",
                    "type": "decimal",  # or "integer", "percentage", "string"
                    "required": false
                }
            }
        }
        """
    )

    # Field schema (defines all fields this report type has)
    field_schema = models.JSONField(
        default=dict,
        help_text="""
        Schema defining all fields. Example:
        {
            "revenue": {
                "label": "Revenue",
                "type": "decimal",
                "format": "$0,0.00",
                "description": "Total revenue for the month"
            },
            "fte": {
                "label": "FTE",
                "type": "integer",
                "description": "Full-time equivalent employees"
            }
        }
        """
    )

    # Display configuration (how to show data on frontend)
    display_config = models.JSONField(
        default=dict,
        help_text="""
        Configuration for displaying data. Example:
        {
            "table_columns": ["month", "revenue", "fte"],
            "summary_fields": ["total_revenue", "avg_fte"],
            "charts": [
                {
                    "type": "line",
                    "title": "Revenue Trend",
                    "y_axis": ["revenue"]
                }
            ]
        }
        """
    )

    # Metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_report_types'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['is_system', '-created_at']
        verbose_name = 'Report Type'
        verbose_name_plural = 'Report Types'

    def __str__(self):
        suffix = ' (System)' if self.is_system else ''
        return f"{self.icon} {self.name}{suffix}"


class Report(models.Model):
    """
    Generic report data storage.
    Replaces DeliveryReportSnapshot and FinReportSnapshot.
    All actual data is stored in the 'data' JSONField.
    """

    # Reference to report type and time period
    report_type = models.ForeignKey(
        ReportType,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    year = models.ForeignKey(
        Year,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    month = models.ForeignKey(
        Month,
        on_delete=models.CASCADE,
        related_name='reports'
    )

    # Flexible data storage - all report fields stored here as JSON
    data = models.JSONField(
        default=dict,
        help_text="""
        Report data stored as key-value pairs. Example:
        {
            "revenue": 1000.50,
            "fte": 14,
            "utilization": 85.5,
            "custom_metric": "some value"
        }
        """
    )

    # Metadata
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['report_type', 'year', 'month']
        ordering = ['-year__year', '-month__month']
        verbose_name = 'Report'
        verbose_name_plural = 'Reports'
        indexes = [
            models.Index(fields=['report_type', 'year', 'month']),
        ]

    def __str__(self):
        return f"{self.report_type.name} - {self.year.year}/{self.month.month}"

    def get_field_value(self, field_name, default=None):
        """Helper method to safely get field values from data JSON"""
        return self.data.get(field_name, default)
