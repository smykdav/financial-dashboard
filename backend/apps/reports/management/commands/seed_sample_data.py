import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.models import Year, Month
from apps.reports.models import ReportType, Report

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds sample report data for 2024-2026'

    def handle(self, *args, **options):
        self.stdout.write('Seeding sample report data for 2024-2026...')

        # Get or create a user for uploaded_by
        user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )

        # Get report types
        delivery_type = ReportType.objects.get(slug='delivery')
        financial_type = ReportType.objects.get(slug='financial')

        years = [2024, 2025, 2026]
        months = list(range(1, 13))

        # Base values for realistic growth
        base_fte = 12
        base_revenue = 180000
        base_accrual_revenue = 200000

        created_count = 0
        updated_count = 0

        for year_value in years:
            # Get or create Year
            year_obj, _ = Year.objects.get_or_create(year=year_value)

            # Apply year-over-year growth
            year_multiplier = 1 + (year_value - 2024) * 0.15  # 15% growth per year

            for month_num in months:
                # Get or create Month
                month_obj, _ = Month.objects.get_or_create(
                    year=year_obj,
                    month=month_num
                )

                # Apply seasonal variation
                seasonal_factor = 1 + (random.random() * 0.2 - 0.1)  # ±10% variation

                # ===== DELIVERY REPORT DATA =====
                fte = int(base_fte * year_multiplier * seasonal_factor)
                base_hours_per_fte = 160
                base_hours = fte * base_hours_per_fte

                # Random variations
                pto = round(base_hours * random.uniform(0.05, 0.10), 2)  # 5-10% PTO
                project_hours = round(base_hours * random.uniform(0.75, 0.85), 2)  # 75-85% project hours
                billable_hours = round(project_hours * random.uniform(0.80, 0.95), 2)  # 80-95% billable

                utilization_excl_pto = round((project_hours / base_hours) * 100, 2)
                utilization_incl_pto = round((project_hours / (base_hours + pto)) * 100, 2)
                billability = round((billable_hours / project_hours) * 100, 2) if project_hours > 0 else 0

                revenue = round(base_revenue * year_multiplier * seasonal_factor, 2)
                salary = round(revenue * random.uniform(0.55, 0.65), 2)  # 55-65% of revenue
                total_spent = round(salary * random.uniform(1.05, 1.15), 2)  # Total spent slightly more than salary
                gp = round(revenue - total_spent, 2)  # Gross Profit

                delivery_data = {
                    'total_spent': str(total_spent),
                    'pto': str(pto),
                    'base_hours': str(base_hours),
                    'project_hours': str(project_hours),
                    'billable_hours': str(billable_hours),
                    'utilization_excl_pto': str(utilization_excl_pto),
                    'utilization_incl_pto': str(utilization_incl_pto),
                    'billability': str(billability),
                    'fte': fte,
                    'revenue': str(revenue),
                    'salary': str(salary),
                    'gp': str(gp),
                }

                report, created = Report.objects.update_or_create(
                    report_type=delivery_type,
                    year=year_obj,
                    month=month_obj,
                    defaults={
                        'data': delivery_data,
                        'uploaded_by': user
                    }
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

                # ===== FINANCIAL REPORT DATA =====
                accrual_revenue = round(base_accrual_revenue * year_multiplier * seasonal_factor, 2)
                accrual_income = round(accrual_revenue * random.uniform(0.95, 1.05), 2)  # Similar to accrual revenue
                cash_income = round(accrual_revenue * random.uniform(0.90, 1.10), 2)  # Can vary more

                sales_commissions = round(accrual_revenue * random.uniform(0.05, 0.10), 2)  # 5-10%
                cogs = round(accrual_revenue * random.uniform(0.50, 0.60), 2)  # 50-60% COGS
                gross_profit = round(accrual_revenue - cogs, 2)
                gross_margin_percent = round((gross_profit / accrual_revenue) * 100, 2) if accrual_revenue > 0 else 0

                overhead = round(accrual_revenue * random.uniform(0.15, 0.25), 2)  # 15-25% overhead
                net_margin_before_tax = round(gross_profit - overhead - sales_commissions, 2)

                dividends_to_be_paid = round(net_margin_before_tax * random.uniform(0.20, 0.40), 2) if net_margin_before_tax > 0 else 0
                emergency_fund_to_be_saved = round(net_margin_before_tax * random.uniform(0.10, 0.20), 2) if net_margin_before_tax > 0 else 0

                financial_data = {
                    'accrual_revenue': str(accrual_revenue),
                    'accrual_income': str(accrual_income),
                    'cash_income': str(cash_income),
                    'sales_commissions': str(sales_commissions),
                    'cogs': str(cogs),
                    'gross_profit': str(gross_profit),
                    'gross_margin_percent': str(gross_margin_percent),
                    'overhead': str(overhead),
                    'net_margin_before_tax': str(net_margin_before_tax),
                    'dividends_to_be_paid': str(dividends_to_be_paid),
                    'emergency_fund_to_be_saved': str(emergency_fund_to_be_saved),
                }

                report, created = Report.objects.update_or_create(
                    report_type=financial_type,
                    year=year_obj,
                    month=month_obj,
                    defaults={
                        'data': financial_data,
                        'uploaded_by': user
                    }
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

                self.stdout.write(f'  Processed {year_value}-{month_num:02d}')

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Seeding completed! Created: {created_count}, Updated: {updated_count}'
        ))
