from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.core.models import Year, Month
from apps.reports.models import ReportType, Report
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Populate database with realistic financial data for 2024-2026'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data population...')

        # Get user
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR('No user found. Please create a user first.'))
            return

        # Get report types
        delivery_type = ReportType.objects.filter(slug='delivery').first()
        financial_type = ReportType.objects.filter(slug='financial').first()

        if not delivery_type or not financial_type:
            self.stdout.write(self.style.ERROR(
                'Report types not found. Please run: python manage.py seed_report_types'
            ))
            return

        # Clear existing data
        Report.objects.all().delete()
        Month.objects.all().delete()
        Year.objects.all().delete()
        self.stdout.write('Cleared existing data')

        # Generate data for each year
        for year_num in [2024, 2025, 2026]:
            self.stdout.write(f'Generating data for {year_num}...')
            self.generate_year_data(user, year_num, delivery_type, financial_type)

        total_reports = Report.objects.count()
        total_months = Month.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {total_reports} reports for {total_months} months'
        ))

    def generate_year_data(self, user, year_num, delivery_type, financial_type):
        # Create year
        year_obj, created = Year.objects.get_or_create(year=year_num, defaults={'created_by': user})

        # Base metrics that will grow over time
        base_fte = 45 + (year_num - 2024) * 5  # Start with 45, grow by 5 each year
        base_revenue = Decimal('850000') + Decimal((year_num - 2024) * 100000)

        prev_month_revenue = None
        prev_month_salary = None

        for month_num in range(1, 13):
            # Create month
            month_obj, created = Month.objects.get_or_create(
                year=year_obj,
                month=month_num
            )

            # Seasonal variations
            seasonal_multiplier = self.get_seasonal_multiplier(month_num)

            # Generate Delivery Report
            delivery_data = self.generate_delivery_data(
                base_fte, base_revenue, seasonal_multiplier, prev_month_revenue
            )
            Report.objects.create(
                report_type=delivery_type,
                year=year_obj,
                month=month_obj,
                data=delivery_data,
                uploaded_by=user
            )

            # Generate Financial Report
            financial_data = self.generate_financial_data(
                base_revenue, seasonal_multiplier, prev_month_revenue, prev_month_salary
            )
            Report.objects.create(
                report_type=financial_type,
                year=year_obj,
                month=month_obj,
                data=financial_data,
                uploaded_by=user
            )

            # Update previous month values for growth calculations
            prev_month_revenue = Decimal(str(delivery_data['revenue']))
            prev_month_salary = Decimal(str(delivery_data['salary']))

    def get_seasonal_multiplier(self, month_num):
        """Returns seasonal business variation (0.85 to 1.15)"""
        # Lower activity in summer (July-August) and holidays (December)
        if month_num in [7, 8]:
            return Decimal(str(random.uniform(0.85, 0.95)))
        elif month_num == 12:
            return Decimal(str(random.uniform(0.90, 1.00)))
        # Higher activity in Q1 and Q4
        elif month_num in [1, 2, 3, 10, 11]:
            return Decimal(str(random.uniform(1.05, 1.15)))
        else:
            return Decimal(str(random.uniform(0.95, 1.05)))

    def generate_delivery_data(self, base_fte, base_revenue, seasonal_multiplier, prev_month_revenue):
        """Generate delivery report data"""
        # Team size with slight variation
        fte = base_fte + random.randint(-3, 3)

        # Hours calculation
        working_days = random.randint(20, 23)
        base_hours = Decimal('160')  # Standard monthly hours
        total_spent = base_hours * Decimal(str(random.uniform(0.95, 1.05)))
        pto = Decimal(str(random.uniform(5, 15)))
        project_hours = total_spent - pto
        billable_hours = project_hours * Decimal(str(random.uniform(0.75, 0.90)))

        # Utilization metrics
        utilization_excl_pto = (project_hours / base_hours) * Decimal('100')
        utilization_incl_pto = (project_hours / total_spent) * Decimal('100')
        billability = (billable_hours / project_hours) * Decimal('100')

        # Billability by type
        billability_outsourcing = Decimal(str(random.uniform(60, 75)))
        billability_outstaffing = Decimal(str(random.uniform(85, 95)))
        billability_tm = Decimal(str(random.uniform(70, 85)))
        billability_fp = Decimal(str(random.uniform(65, 80)))

        # Revenue
        revenue = (base_revenue * seasonal_multiplier).quantize(Decimal('0.01'))

        # Revenue growth MtM
        if prev_month_revenue and prev_month_revenue > 0:
            revenue_growth_mtm = ((revenue - prev_month_revenue) / prev_month_revenue * Decimal('100')).quantize(Decimal('0.01'))
        else:
            revenue_growth_mtm = Decimal('0')

        # Average hourly rate
        av_rate_h = (revenue / (billable_hours * fte)).quantize(Decimal('0.01'))

        # Salary
        avg_salary_monthly = Decimal(str(random.uniform(3500, 4500)))
        salary = (avg_salary_monthly * fte).quantize(Decimal('0.01'))
        av_salary_h = (salary / (project_hours * fte)).quantize(Decimal('0.01'))

        # Salary growth MtM
        if prev_month_revenue and prev_month_revenue > 0:
            salary_growth_mtm = Decimal(str(random.uniform(-2, 5)))
        else:
            salary_growth_mtm = Decimal('0')

        # Gross Profit
        gp = revenue - salary
        gp_fte_h = (gp / (fte * base_hours)).quantize(Decimal('0.01'))
        rev_prod_salary = (revenue / salary).quantize(Decimal('0.01'))
        gm_percent = (gp / revenue * Decimal('100')).quantize(Decimal('0.01'))

        # Additional revenue metrics
        avg_revenue_outstaffing = Decimal(str(random.uniform(45, 65)))
        avg_revenue_outsourcing = Decimal(str(random.uniform(55, 75)))
        avg_income_outstaffing = Decimal(str(random.uniform(40, 60)))
        avg_income_outsourcing = Decimal(str(random.uniform(50, 70)))
        avg_revenue_tm = Decimal(str(random.uniform(50, 70)))
        avg_revenue_fp = Decimal(str(random.uniform(60, 80)))
        avg_income_tm = Decimal(str(random.uniform(45, 65)))
        avg_income_fp = Decimal(str(random.uniform(55, 75)))
        avg_income_per_employee = (revenue / fte).quantize(Decimal('0.01'))
        avg_salary_prod = avg_salary_monthly

        return {
            'total_spent': float(total_spent),
            'pto': float(pto),
            'base_hours': float(base_hours),
            'project_hours': float(project_hours),
            'billable_hours': float(billable_hours),
            'utilization_excl_pto': float(utilization_excl_pto),
            'utilization_incl_pto': float(utilization_incl_pto),
            'billability': float(billability),
            'billability_outsourcing': float(billability_outsourcing),
            'billability_outstaffing': float(billability_outstaffing),
            'billability_tm': float(billability_tm),
            'billability_fp': float(billability_fp),
            'fte': fte,
            'av_rate_h': float(av_rate_h),
            'revenue': float(revenue),
            'revenue_growth_mtm': float(revenue_growth_mtm),
            'salary': float(salary),
            'salary_growth_mtm': float(salary_growth_mtm),
            'av_salary_h': float(av_salary_h),
            'gp': float(gp),
            'gp_fte_h': float(gp_fte_h),
            'rev_prod_salary': float(rev_prod_salary),
            'gm_percent': float(gm_percent),
            'avg_revenue_outstaffing': float(avg_revenue_outstaffing),
            'avg_revenue_outsourcing': float(avg_revenue_outsourcing),
            'avg_income_outstaffing': float(avg_income_outstaffing),
            'avg_income_outsourcing': float(avg_income_outsourcing),
            'avg_revenue_tm': float(avg_revenue_tm),
            'avg_revenue_fp': float(avg_revenue_fp),
            'avg_income_tm': float(avg_income_tm),
            'avg_income_fp': float(avg_income_fp),
            'avg_income_per_employee': float(avg_income_per_employee),
            'avg_salary_prod': float(avg_salary_prod),
        }

    def generate_financial_data(self, base_revenue, seasonal_multiplier, prev_month_revenue, prev_month_salary):
        """Generate financial report data"""
        # Revenue
        accrual_revenue = (base_revenue * seasonal_multiplier).quantize(Decimal('0.01'))
        accrual_income = (accrual_revenue * Decimal(str(random.uniform(0.95, 1.05)))).quantize(Decimal('0.01'))
        cash_income = (accrual_income * Decimal(str(random.uniform(0.90, 1.10)))).quantize(Decimal('0.01'))

        # Sales commissions (3-7% of revenue)
        sales_commissions = (accrual_revenue * Decimal(str(random.uniform(0.03, 0.07)))).quantize(Decimal('0.01'))

        # COGS (40-50% of revenue - includes salaries and direct costs)
        cogs = (accrual_revenue * Decimal(str(random.uniform(0.40, 0.50)))).quantize(Decimal('0.01'))

        # Gross Profit
        gross_profit = accrual_revenue - sales_commissions - cogs
        gross_margin_percent = (gross_profit / accrual_revenue * Decimal('100')).quantize(Decimal('0.01'))

        # Overhead (15-25% of revenue)
        overhead = (accrual_revenue * Decimal(str(random.uniform(0.15, 0.25)))).quantize(Decimal('0.01'))
        production_team_fte = random.randint(40, 50)
        overhead_by_fte = (overhead / production_team_fte).quantize(Decimal('0.01'))

        # Net Margin
        net_margin_before_tax = gross_profit - overhead
        net_margin_before_tax_jira = net_margin_before_tax * Decimal(str(random.uniform(0.95, 1.05)))
        net_margin_cash = (cash_income - cogs - sales_commissions - overhead).quantize(Decimal('0.01'))

        # Tax (18-20% of net margin)
        income_tax = (net_margin_before_tax * Decimal(str(random.uniform(0.18, 0.20)))).quantize(Decimal('0.01'))

        # Dividends (40-60% of after-tax profit)
        after_tax_profit = net_margin_before_tax - income_tax
        dividends_percent = Decimal(str(random.uniform(40, 60)))
        dividends_to_be_paid = (after_tax_profit * dividends_percent / Decimal('100')).quantize(Decimal('0.01'))
        paid_dividends = (dividends_to_be_paid * Decimal(str(random.uniform(0.80, 1.00)))).quantize(Decimal('0.01'))

        # Emergency Fund (15-25% of after-tax profit)
        emergency_fund_percent = Decimal(str(random.uniform(15, 25)))
        emergency_fund_to_be_saved = (after_tax_profit * emergency_fund_percent / Decimal('100')).quantize(Decimal('0.01'))
        emergency_fund_saved = (emergency_fund_to_be_saved * Decimal(str(random.uniform(0.85, 1.00)))).quantize(Decimal('0.01'))

        return {
            'accrual_revenue': float(accrual_revenue),
            'accrual_income': float(accrual_income),
            'cash_income': float(cash_income),
            'sales_commissions': float(sales_commissions),
            'cogs': float(cogs),
            'gross_profit': float(gross_profit),
            'gross_margin_percent': float(gross_margin_percent),
            'overhead': float(overhead),
            'production_team_fte': production_team_fte,
            'overhead_by_fte': float(overhead_by_fte),
            'net_margin_before_tax': float(net_margin_before_tax),
            'net_margin_before_tax_jira': float(net_margin_before_tax_jira),
            'net_margin_cash': float(net_margin_cash),
            'income_tax': float(income_tax),
            'dividends_to_be_paid': float(dividends_to_be_paid),
            'paid_dividends': float(paid_dividends),
            'dividends_percent': float(dividends_percent),
            'emergency_fund_to_be_saved': float(emergency_fund_to_be_saved),
            'emergency_fund_saved': float(emergency_fund_saved),
            'emergency_fund_percent': float(emergency_fund_percent),
        }
