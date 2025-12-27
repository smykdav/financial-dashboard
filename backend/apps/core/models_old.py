from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Year(models.Model):
    """
    Represents a year for which financial data is tracked.
    """
    year = models.IntegerField(
        unique=True,
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        help_text="Year value (e.g., 2025)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='years_created'
    )

    class Meta:
        ordering = ['-year']
        verbose_name = 'Year'
        verbose_name_plural = 'Years'

    def __str__(self):
        return str(self.year)


class Month(models.Model):
    """
    Represents a specific month within a year.
    """
    MONTH_CHOICES = [
        (1, 'January'),
        (2, 'February'),
        (3, 'March'),
        (4, 'April'),
        (5, 'May'),
        (6, 'June'),
        (7, 'July'),
        (8, 'August'),
        (9, 'September'),
        (10, 'October'),
        (11, 'November'),
        (12, 'December'),
    ]

    year = models.ForeignKey(
        Year,
        on_delete=models.CASCADE,
        related_name='months'
    )
    month = models.IntegerField(
        choices=MONTH_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['year', 'month']
        ordering = ['-year__year', '-month']
        verbose_name = 'Month'
        verbose_name_plural = 'Months'

    def __str__(self):
        return f"{self.get_month_display()} {self.year.year}"

    @property
    def month_display(self):
        return self.get_month_display()


class DeliveryReportSnapshot(models.Model):
    """
    Snapshot of delivery metrics for a specific month.
    Fields can be adjusted based on actual CSV structure.
    """
    month = models.OneToOneField(
        Month,
        on_delete=models.CASCADE,
        related_name='delivery_report',
        primary_key=True
    )

    # Delivery metrics
    total_deliveries = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Total number of deliveries"
    )
    on_time_deliveries = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of on-time deliveries"
    )
    late_deliveries = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of late deliveries"
    )
    delivery_accuracy = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Delivery accuracy percentage"
    )

    # Revenue metrics
    total_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Total revenue from deliveries"
    )
    delivery_costs = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Total delivery costs"
    )

    # Additional fields (customize based on Google Sheet structure)
    notes = models.TextField(blank=True, null=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_reports_uploaded'
    )

    class Meta:
        verbose_name = 'Delivery Report Snapshot'
        verbose_name_plural = 'Delivery Report Snapshots'

    def __str__(self):
        return f"Delivery Report - {self.month}"

    @property
    def on_time_percentage(self):
        if self.total_deliveries > 0:
            return (self.on_time_deliveries / self.total_deliveries) * 100
        return 0


class FinReportSnapshot(models.Model):
    """
    Snapshot of financial metrics for a specific month.
    Fields can be adjusted based on actual CSV structure.
    """
    month = models.OneToOneField(
        Month,
        on_delete=models.CASCADE,
        related_name='fin_report',
        primary_key=True
    )

    # Primary financial metrics
    total_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Total income for the month"
    )
    total_expenses = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Total expenses for the month"
    )
    net_profit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Net profit (income - expenses)"
    )

    # Expense breakdown
    operating_expenses = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Operating expenses"
    )
    marketing_expenses = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Marketing and advertising expenses"
    )
    payroll_expenses = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Payroll and HR expenses"
    )

    # Additional fields (customize based on Google Sheet structure)
    notes = models.TextField(blank=True, null=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='fin_reports_uploaded'
    )

    class Meta:
        verbose_name = 'Financial Report Snapshot'
        verbose_name_plural = 'Financial Report Snapshots'

    def __str__(self):
        return f"Financial Report - {self.month}"

    @property
    def profit_margin(self):
        if self.total_income > 0:
            return (self.net_profit / self.total_income) * 100
        return 0
