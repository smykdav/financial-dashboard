from django.core.management.base import BaseCommand
from apps.reports.models import ReportType


class Command(BaseCommand):
    help = 'Create default report types (Delivery and Financial) with complete configuration'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating default report types...')

        # Create Delivery Report Type
        delivery_config = self.get_delivery_config()
        delivery_type, created = ReportType.objects.update_or_create(
            slug='delivery',
            defaults=delivery_config
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created: {delivery_type.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ Updated: {delivery_type.name}'))

        # Create Financial Report Type
        financial_config = self.get_financial_config()
        financial_type, created = ReportType.objects.update_or_create(
            slug='financial',
            defaults=financial_config
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created: {financial_type.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ Updated: {financial_type.name}'))

        total_types = ReportType.objects.count()
        self.stdout.write(self.style.SUCCESS(f'\nTotal report types: {total_types}'))

    def get_delivery_config(self):
        """Configuration for Delivery Report"""
        return {
            'name': 'Delivery Report',
            'description': 'Monthly delivery metrics including FTE, hours, revenue, and profitability',
            'icon': '📦',
            'is_system': True,
            'parsing_config': {
                'format': 'transposed',
                'header_row': 1,
                'data_start_row': 2,
                'month_column_type': 'names',
                'field_mappings': {
                    'Total Spent': {'field': 'total_spent', 'type': 'decimal', 'required': False},
                    'PTO': {'field': 'pto', 'type': 'decimal', 'required': False},
                    'Base': {'field': 'base_hours', 'type': 'decimal', 'required': False},
                    'Project hours': {'field': 'project_hours', 'type': 'decimal', 'required': False},
                    'Utilization(Excl PTO)': {'field': 'utilization_excl_pto', 'type': 'percentage', 'required': False},
                    'Utilization(Incl PTO)': {'field': 'utilization_incl_pto', 'type': 'percentage', 'required': False},
                    'Billable hours': {'field': 'billable_hours', 'type': 'decimal', 'required': False},
                    'Billability': {'field': 'billability', 'type': 'percentage', 'required': False},
                    'Billability Outsoursing': {'field': 'billability_outsourcing', 'type': 'percentage', 'required': False},
                    'Billability Outstaffing': {'field': 'billability_outstaffing', 'type': 'percentage', 'required': False},
                    'Billability T&M': {'field': 'billability_tm', 'type': 'percentage', 'required': False},
                    'Billability FP': {'field': 'billability_fp', 'type': 'percentage', 'required': False},
                    'FTE': {'field': 'fte', 'type': 'integer', 'required': False},
                    'Av. Rate, h': {'field': 'av_rate_h', 'type': 'decimal', 'required': False},
                    'Revenue': {'field': 'revenue', 'type': 'decimal', 'required': False},
                    'Revenue growth, MtM 2024': {'field': 'revenue_growth_mtm', 'type': 'percentage', 'required': False},
                    'Salary': {'field': 'salary', 'type': 'decimal', 'required': False},
                    'Salary growth, MtM 2024': {'field': 'salary_growth_mtm', 'type': 'percentage', 'required': False},
                    'Av.Salary, h': {'field': 'av_salary_h', 'type': 'decimal', 'required': False},
                    'GP': {'field': 'gp', 'type': 'decimal', 'required': False},
                    'GP/FTE, h': {'field': 'gp_fte_h', 'type': 'decimal', 'required': False},
                    'Rev/prod salary': {'field': 'rev_prod_salary', 'type': 'decimal', 'required': False},
                    'GM,%': {'field': 'gm_percent', 'type': 'percentage', 'required': False},
                    'Bench Cost,$': {'field': 'bench_cost', 'type': 'decimal', 'required': False},
                    'PTO cost, $': {'field': 'pto_cost', 'type': 'decimal', 'required': False},
                    'Avarage revenue per Outstaffing\n': {'field': 'avg_revenue_outstaffing', 'type': 'decimal', 'required': False},
                    'Avarage revenue per Outsourcing': {'field': 'avg_revenue_outsourcing', 'type': 'decimal', 'required': False},
                    'Avarage income per Outstaffing': {'field': 'avg_income_outstaffing', 'type': 'decimal', 'required': False},
                    'Avarage income per Outsourcing': {'field': 'avg_income_outsourcing', 'type': 'decimal', 'required': False},
                    'Avarage revenue per T&M\n': {'field': 'avg_revenue_tm', 'type': 'decimal', 'required': False},
                    'Avarage revenue per Fixed Price': {'field': 'avg_revenue_fp', 'type': 'decimal', 'required': False},
                    'Avarage income per T&M': {'field': 'avg_income_tm', 'type': 'decimal', 'required': False},
                    'Avarage income per Fixed Price': {'field': 'avg_income_fp', 'type': 'decimal', 'required': False},
                    'Average income per employee': {'field': 'avg_income_per_employee', 'type': 'decimal', 'required': False},
                    'Avarage salary prod': {'field': 'avg_salary_prod', 'type': 'decimal', 'required': False},
                }
            },
            'field_schema': {
                'total_spent': {'label': 'Total Spent', 'type': 'decimal', 'format': '0,0.00', 'description': 'Total hours spent'},
                'pto': {'label': 'PTO', 'type': 'decimal', 'format': '0,0.00', 'description': 'Paid time off hours'},
                'base_hours': {'label': 'Base Hours', 'type': 'decimal', 'format': '0,0.00', 'description': 'Base working hours'},
                'project_hours': {'label': 'Project Hours', 'type': 'decimal', 'format': '0,0.00', 'description': 'Hours spent on projects'},
                'billable_hours': {'label': 'Billable Hours', 'type': 'decimal', 'format': '0,0.00', 'description': 'Billable hours'},
                'utilization_excl_pto': {'label': 'Utilization (Excl PTO)', 'type': 'percentage', 'format': '0.00%', 'description': 'Utilization excluding PTO'},
                'utilization_incl_pto': {'label': 'Utilization (Incl PTO)', 'type': 'percentage', 'format': '0.00%', 'description': 'Utilization including PTO'},
                'billability': {'label': 'Billability', 'type': 'percentage', 'format': '0.00%', 'description': 'Overall billability rate'},
                'billability_outsourcing': {'label': 'Billability Outsourcing', 'type': 'percentage', 'format': '0.00%', 'description': 'Billability for outsourcing'},
                'billability_outstaffing': {'label': 'Billability Outstaffing', 'type': 'percentage', 'format': '0.00%', 'description': 'Billability for outstaffing'},
                'billability_tm': {'label': 'Billability T&M', 'type': 'percentage', 'format': '0.00%', 'description': 'Billability for Time & Materials'},
                'billability_fp': {'label': 'Billability FP', 'type': 'percentage', 'format': '0.00%', 'description': 'Billability for Fixed Price'},
                'fte': {'label': 'FTE', 'type': 'integer', 'format': '0', 'description': 'Full-time equivalent employees'},
                'av_rate_h': {'label': 'Avg Rate/Hour', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average hourly rate'},
                'revenue': {'label': 'Revenue', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Total revenue'},
                'revenue_growth_mtm': {'label': 'Revenue Growth MtM', 'type': 'percentage', 'format': '0.00%', 'description': 'Month-to-month revenue growth'},
                'salary': {'label': 'Salary', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Total salary costs'},
                'salary_growth_mtm': {'label': 'Salary Growth MtM', 'type': 'percentage', 'format': '0.00%', 'description': 'Month-to-month salary growth'},
                'av_salary_h': {'label': 'Avg Salary/Hour', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average salary per hour'},
                'gp': {'label': 'Gross Profit', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Gross profit'},
                'gp_fte_h': {'label': 'GP/FTE/Hour', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Gross profit per FTE per hour'},
                'rev_prod_salary': {'label': 'Revenue/Salary', 'type': 'decimal', 'format': '0.00', 'description': 'Revenue to salary ratio'},
                'gm_percent': {'label': 'Gross Margin %', 'type': 'percentage', 'format': '0.00%', 'description': 'Gross margin percentage'},
                'bench_cost': {'label': 'Bench Cost', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Cost of bench time'},
                'pto_cost': {'label': 'PTO Cost', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Cost of PTO'},
                'avg_revenue_outstaffing': {'label': 'Avg Revenue Outstaffing', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average revenue per outstaffing'},
                'avg_revenue_outsourcing': {'label': 'Avg Revenue Outsourcing', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average revenue per outsourcing'},
                'avg_income_outstaffing': {'label': 'Avg Income Outstaffing', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average income per outstaffing'},
                'avg_income_outsourcing': {'label': 'Avg Income Outsourcing', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average income per outsourcing'},
                'avg_revenue_tm': {'label': 'Avg Revenue T&M', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average revenue for T&M'},
                'avg_revenue_fp': {'label': 'Avg Revenue FP', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average revenue for Fixed Price'},
                'avg_income_tm': {'label': 'Avg Income T&M', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average income for T&M'},
                'avg_income_fp': {'label': 'Avg Income FP', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average income for Fixed Price'},
                'avg_income_per_employee': {'label': 'Avg Income/Employee', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average income per employee'},
                'avg_salary_prod': {'label': 'Avg Salary (Prod)', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Average production salary'},
            },
            'display_config': {
                'table_columns': ['month', 'fte', 'revenue', 'salary', 'gp', 'gm_percent'],
                'summary_fields': ['revenue', 'salary', 'gp'],
            }
        }

    def get_financial_config(self):
        """Configuration for Financial Report"""
        return {
            'name': 'Financial Report',
            'description': 'Monthly financial metrics including revenue, costs, taxes, and dividends',
            'icon': '💰',
            'is_system': True,
            'parsing_config': {
                'format': 'normal',
                'header_row': 1,
                'data_start_row': 3,
                'month_column_name': 'Month',
                'field_mappings': {
                    'Accrual Revenue (From QBO)': {'field': 'accrual_revenue', 'type': 'decimal', 'required': False},
                    'Accrual income (From Jira)': {'field': 'accrual_income', 'type': 'decimal', 'required': False},
                    'Cash income': {'field': 'cash_income', 'type': 'decimal', 'required': False},
                    'Sales commissions': {'field': 'sales_commissions', 'type': 'decimal', 'required': False},
                    'COGS': {'field': 'cogs', 'type': 'decimal', 'required': False},
                    'Gross Profit': {'field': 'gross_profit', 'type': 'decimal', 'required': False},
                    'Gross Margin, %': {'field': 'gross_margin_percent', 'type': 'percentage', 'required': False},
                    'Overhead': {'field': 'overhead', 'type': 'decimal', 'required': False},
                    'Production Team, FTE': {'field': 'production_team_fte', 'type': 'integer', 'required': False},
                    'Overhead by FTE': {'field': 'overhead_by_fte', 'type': 'decimal', 'required': False},
                    'Net Margin before tax, $': {'field': 'net_margin_before_tax', 'type': 'decimal', 'required': False},
                    'Net Margin before tax, $\n(From Jira)': {'field': 'net_margin_before_tax_jira', 'type': 'decimal', 'required': False},
                    'Net Margin(cash), $': {'field': 'net_margin_cash', 'type': 'decimal', 'required': False},
                    'Income Tax': {'field': 'income_tax', 'type': 'decimal', 'required': False},
                    'Dividends to be paid': {'field': 'dividends_to_be_paid', 'type': 'decimal', 'required': False},
                    'Paid dividends': {'field': 'paid_dividends', 'type': 'decimal', 'required': False},
                    'Emergency fund to be saved': {'field': 'emergency_fund_to_be_saved', 'type': 'decimal', 'required': False},
                    'Emergency fund - saved': {'field': 'emergency_fund_saved', 'type': 'decimal', 'required': False},
                    'Dividends, %': {'field': 'dividends_percent', 'type': 'percentage', 'required': False},
                    'Emergency fund': {'field': 'emergency_fund_percent', 'type': 'percentage', 'required': False},
                }
            },
            'field_schema': {
                'accrual_revenue': {'label': 'Accrual Revenue', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Accrual revenue from QBO'},
                'accrual_income': {'label': 'Accrual Income', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Accrual income from Jira'},
                'cash_income': {'label': 'Cash Income', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Cash income'},
                'sales_commissions': {'label': 'Sales Commissions', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Sales commissions'},
                'cogs': {'label': 'COGS', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Cost of goods sold'},
                'gross_profit': {'label': 'Gross Profit', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Gross profit'},
                'gross_margin_percent': {'label': 'Gross Margin %', 'type': 'percentage', 'format': '0.00%', 'description': 'Gross margin percentage'},
                'overhead': {'label': 'Overhead', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Overhead costs'},
                'production_team_fte': {'label': 'Production Team FTE', 'type': 'integer', 'format': '0', 'description': 'Production team full-time equivalents'},
                'overhead_by_fte': {'label': 'Overhead by FTE', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Overhead cost per FTE'},
                'net_margin_before_tax': {'label': 'Net Margin (Before Tax)', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Net margin before tax'},
                'net_margin_before_tax_jira': {'label': 'Net Margin (Jira)', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Net margin before tax from Jira'},
                'net_margin_cash': {'label': 'Net Margin (Cash)', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Net margin cash basis'},
                'income_tax': {'label': 'Income Tax', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Income tax'},
                'dividends_to_be_paid': {'label': 'Dividends To Be Paid', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Dividends to be paid'},
                'paid_dividends': {'label': 'Paid Dividends', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Dividends already paid'},
                'dividends_percent': {'label': 'Dividends %', 'type': 'percentage', 'format': '0.00%', 'description': 'Dividends percentage'},
                'emergency_fund_to_be_saved': {'label': 'Emergency Fund (To Save)', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Emergency fund to be saved'},
                'emergency_fund_saved': {'label': 'Emergency Fund (Saved)', 'type': 'decimal', 'format': '$0,0.00', 'description': 'Emergency fund already saved'},
                'emergency_fund_percent': {'label': 'Emergency Fund %', 'type': 'percentage', 'format': '0.00%', 'description': 'Emergency fund percentage'},
            },
            'display_config': {
                'table_columns': ['month', 'accrual_revenue', 'gross_profit', 'net_margin_before_tax'],
                'summary_fields': ['accrual_revenue', 'gross_profit', 'net_margin_before_tax'],
            }
        }
