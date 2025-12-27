from django.core.management.base import BaseCommand
from apps.core.models import DeliveryReportSnapshot, FinReportSnapshot, Month
from apps.reports.models import ReportType, Report
from decimal import Decimal


class Command(BaseCommand):
    help = 'Migrate data from old snapshot models to new Report system'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting migration to new Report system...')

        # Get report types
        delivery_type = ReportType.objects.filter(slug='delivery').first()
        financial_type = ReportType.objects.filter(slug='financial').first()

        if not delivery_type or not financial_type:
            self.stdout.write(self.style.ERROR('Report types not found. Please create them first.'))
            return

        # Clear existing reports
        Report.objects.all().delete()
        self.stdout.write('Cleared existing reports')

        # Migrate Delivery Reports
        delivery_count = 0
        for snapshot in DeliveryReportSnapshot.objects.all():
            data = {
                'total_spent': float(snapshot.total_spent) if snapshot.total_spent else None,
                'pto': float(snapshot.pto) if snapshot.pto else None,
                'base_hours': float(snapshot.base_hours) if snapshot.base_hours else None,
                'project_hours': float(snapshot.project_hours) if snapshot.project_hours else None,
                'billable_hours': float(snapshot.billable_hours) if snapshot.billable_hours else None,
                'utilization_excl_pto': float(snapshot.utilization_excl_pto) if snapshot.utilization_excl_pto else None,
                'utilization_incl_pto': float(snapshot.utilization_incl_pto) if snapshot.utilization_incl_pto else None,
                'billability': float(snapshot.billability) if snapshot.billability else None,
                'billability_outsourcing': float(snapshot.billability_outsourcing) if snapshot.billability_outsourcing else None,
                'billability_outstaffing': float(snapshot.billability_outstaffing) if snapshot.billability_outstaffing else None,
                'billability_tm': float(snapshot.billability_tm) if snapshot.billability_tm else None,
                'billability_fp': float(snapshot.billability_fp) if snapshot.billability_fp else None,
                'fte': snapshot.fte,
                'av_rate_h': float(snapshot.av_rate_h) if snapshot.av_rate_h else None,
                'revenue': float(snapshot.revenue) if snapshot.revenue else None,
                'revenue_growth_mtm': float(snapshot.revenue_growth_mtm) if snapshot.revenue_growth_mtm else None,
                'salary': float(snapshot.salary) if snapshot.salary else None,
                'salary_growth_mtm': float(snapshot.salary_growth_mtm) if snapshot.salary_growth_mtm else None,
                'av_salary_h': float(snapshot.av_salary_h) if snapshot.av_salary_h else None,
                'gp': float(snapshot.gp) if snapshot.gp else None,
                'gp_fte_h': float(snapshot.gp_fte_h) if snapshot.gp_fte_h else None,
                'rev_prod_salary': float(snapshot.rev_prod_salary) if snapshot.rev_prod_salary else None,
                'gm_percent': float(snapshot.gm_percent) if snapshot.gm_percent else None,
                'avg_revenue_outstaffing': float(snapshot.avg_revenue_outstaffing) if snapshot.avg_revenue_outstaffing else None,
                'avg_revenue_outsourcing': float(snapshot.avg_revenue_outsourcing) if snapshot.avg_revenue_outsourcing else None,
                'avg_income_outstaffing': float(snapshot.avg_income_outstaffing) if snapshot.avg_income_outstaffing else None,
                'avg_income_outsourcing': float(snapshot.avg_income_outsourcing) if snapshot.avg_income_outsourcing else None,
                'avg_revenue_tm': float(snapshot.avg_revenue_tm) if snapshot.avg_revenue_tm else None,
                'avg_revenue_fp': float(snapshot.avg_revenue_fp) if snapshot.avg_revenue_fp else None,
                'avg_income_tm': float(snapshot.avg_income_tm) if snapshot.avg_income_tm else None,
                'avg_income_fp': float(snapshot.avg_income_fp) if snapshot.avg_income_fp else None,
                'avg_income_per_employee': float(snapshot.avg_income_per_employee) if snapshot.avg_income_per_employee else None,
                'avg_salary_prod': float(snapshot.avg_salary_prod) if snapshot.avg_salary_prod else None,
            }

            Report.objects.create(
                report_type=delivery_type,
                year=snapshot.month.year,
                month=snapshot.month,
                data=data,
                uploaded_by=snapshot.uploaded_by
            )
            delivery_count += 1

        self.stdout.write(f'Migrated {delivery_count} delivery reports')

        # Migrate Financial Reports
        financial_count = 0
        for snapshot in FinReportSnapshot.objects.all():
            data = {
                'accrual_revenue': float(snapshot.accrual_revenue) if snapshot.accrual_revenue else None,
                'accrual_income': float(snapshot.accrual_income) if snapshot.accrual_income else None,
                'cash_income': float(snapshot.cash_income) if snapshot.cash_income else None,
                'sales_commissions': float(snapshot.sales_commissions) if snapshot.sales_commissions else None,
                'cogs': float(snapshot.cogs) if snapshot.cogs else None,
                'gross_profit': float(snapshot.gross_profit) if snapshot.gross_profit else None,
                'gross_margin_percent': float(snapshot.gross_margin_percent) if snapshot.gross_margin_percent else None,
                'overhead': float(snapshot.overhead) if snapshot.overhead else None,
                'production_team_fte': snapshot.production_team_fte,
                'overhead_by_fte': float(snapshot.overhead_by_fte) if snapshot.overhead_by_fte else None,
                'net_margin_before_tax': float(snapshot.net_margin_before_tax) if snapshot.net_margin_before_tax else None,
                'net_margin_before_tax_jira': float(snapshot.net_margin_before_tax_jira) if snapshot.net_margin_before_tax_jira else None,
                'net_margin_cash': float(snapshot.net_margin_cash) if snapshot.net_margin_cash else None,
                'income_tax': float(snapshot.income_tax) if snapshot.income_tax else None,
                'dividends_to_be_paid': float(snapshot.dividends_to_be_paid) if snapshot.dividends_to_be_paid else None,
                'paid_dividends': float(snapshot.paid_dividends) if snapshot.paid_dividends else None,
                'dividends_percent': float(snapshot.dividends_percent) if snapshot.dividends_percent else None,
                'emergency_fund_to_be_saved': float(snapshot.emergency_fund_to_be_saved) if snapshot.emergency_fund_to_be_saved else None,
                'emergency_fund_saved': float(snapshot.emergency_fund_saved) if snapshot.emergency_fund_saved else None,
                'emergency_fund_percent': float(snapshot.emergency_fund_percent) if snapshot.emergency_fund_percent else None,
            }

            Report.objects.create(
                report_type=financial_type,
                year=snapshot.month.year,
                month=snapshot.month,
                data=data,
                uploaded_by=snapshot.uploaded_by
            )
            financial_count += 1

        self.stdout.write(f'Migrated {financial_count} financial reports')

        total_reports = Report.objects.count()
        self.stdout.write(self.style.SUCCESS(f'Successfully migrated {total_reports} total reports'))
