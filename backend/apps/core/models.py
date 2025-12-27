from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Year(models.Model):
    """Represents a year for which financial data is tracked."""
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
    """Represents a specific month within a year."""
    MONTH_CHOICES = [
        (1, 'January'), (2, 'February'), (3, 'March'),
        (4, 'April'), (5, 'May'), (6, 'June'),
        (7, 'July'), (8, 'August'), (9, 'September'),
        (10, 'October'), (11, 'November'), (12, 'December'),
    ]

    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='months')
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
    """Delivery metrics based on actual CSV structure."""
    month = models.OneToOneField(Month, on_delete=models.CASCADE, related_name='delivery_report', primary_key=True)

    # Hours metrics
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    pto = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    base_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    project_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    billable_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    
    # Utilization & Billability
    utilization_excl_pto = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    utilization_incl_pto = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    billability = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    billability_outsourcing = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    billability_outstaffing = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    billability_tm = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    billability_fp = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    
    # Team
    fte = models.IntegerField(default=0, null=True, blank=True)
    av_rate_h = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    
    # Revenue
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    revenue_growth_mtm = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    
    # Salary
    salary = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    salary_growth_mtm = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    av_salary_h = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    
    # Gross Profit
    gp = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    gp_fte_h = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    rev_prod_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    gm_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    
    # Additional revenue metrics
    avg_revenue_outstaffing = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_revenue_outsourcing = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_income_outstaffing = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_income_outsourcing = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_revenue_tm = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_revenue_fp = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_income_tm = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_income_fp = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_income_per_employee = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    avg_salary_prod = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='delivery_reports_uploaded')

    class Meta:
        verbose_name = 'Delivery Report Snapshot'
        verbose_name_plural = 'Delivery Report Snapshots'

    def __str__(self):
        return f"Delivery Report - {self.month}"


class FinReportSnapshot(models.Model):
    """Financial metrics based on actual CSV structure."""
    month = models.OneToOneField(Month, on_delete=models.CASCADE, related_name='fin_report', primary_key=True)

    # Revenue
    accrual_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    accrual_income = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    cash_income = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    
    # Costs
    sales_commissions = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    cogs = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    
    # Profit
    gross_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    gross_margin_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    
    # Overhead
    overhead = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    production_team_fte = models.IntegerField(default=0, null=True, blank=True)
    overhead_by_fte = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    
    # Net Margin
    net_margin_before_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    net_margin_before_tax_jira = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    net_margin_cash = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    
    # Tax & Dividends
    income_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    dividends_to_be_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    paid_dividends = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    dividends_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    
    # Emergency Fund
    emergency_fund_to_be_saved = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    emergency_fund_saved = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    emergency_fund_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='fin_reports_uploaded')

    class Meta:
        verbose_name = 'Financial Report Snapshot'
        verbose_name_plural = 'Financial Report Snapshots'

    def __str__(self):
        return f"Financial Report - {self.month}"

    @property
    def profit_margin(self):
        if self.cash_income and self.cash_income > 0:
            return (self.net_margin_cash / self.cash_income) * 100
        return 0
