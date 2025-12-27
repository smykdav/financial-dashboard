from django.core.management.base import BaseCommand
from apps.reports.models import ReportType


class Command(BaseCommand):
    help = 'Seeds default system report types (Delivery and Financial)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding default report types...')

        # Delivery Report Type
        delivery_report_type, created = ReportType.objects.get_or_create(
            slug='delivery',
            defaults={
                'name': 'Delivery Report',
                'description': 'Monthly delivery metrics including FTE, hours, utilization, and revenue',
                'icon': '📊',
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
                        'Billable hours': {'field': 'billable_hours', 'type': 'decimal', 'required': False},
                        'Utilization(Excl PTO)': {'field': 'utilization_excl_pto', 'type': 'percentage', 'required': False},
                        'Utilization(Incl PTO)': {'field': 'utilization_incl_pto', 'type': 'percentage', 'required': False},
                        'Billability': {'field': 'billability', 'type': 'percentage', 'required': False},
                        'FTE': {'field': 'fte', 'type': 'integer', 'required': False},
                        'Revenue': {'field': 'revenue', 'type': 'decimal', 'required': False},
                        'Salary': {'field': 'salary', 'type': 'decimal', 'required': False},
                        'GP': {'field': 'gp', 'type': 'decimal', 'required': False},
                    }
                },
                'field_schema': {
                    'total_spent': {'label': 'Total Spent', 'type': 'decimal', 'format': '$0,0.00'},
                    'pto': {'label': 'PTO', 'type': 'decimal', 'format': '0,0.00'},
                    'base_hours': {'label': 'Base Hours', 'type': 'decimal', 'format': '0,0.00'},
                    'project_hours': {'label': 'Project Hours', 'type': 'decimal', 'format': '0,0.00'},
                    'billable_hours': {'label': 'Billable Hours', 'type': 'decimal', 'format': '0,0.00'},
                    'utilization_excl_pto': {'label': 'Utilization (excl PTO)', 'type': 'percentage', 'format': '0.00%'},
                    'utilization_incl_pto': {'label': 'Utilization (incl PTO)', 'type': 'percentage', 'format': '0.00%'},
                    'billability': {'label': 'Billability', 'type': 'percentage', 'format': '0.00%'},
                    'fte': {'label': 'FTE', 'type': 'integer', 'format': '0'},
                    'revenue': {'label': 'Revenue', 'type': 'decimal', 'format': '$0,0.00'},
                    'salary': {'label': 'Salary', 'type': 'decimal', 'format': '$0,0.00'},
                    'gp': {'label': 'GP', 'type': 'decimal', 'format': '$0,0.00'},
                },
                'display_config': {
                    'table_columns': ['month', 'fte', 'revenue', 'utilization_excl_pto', 'billability'],
                    'charts': [
                        {
                            'type': 'line',
                            'title': 'Revenue & FTE Trend',
                            'y_axis': ['revenue', 'fte']
                        }
                    ]
                }
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Delivery Report Type'))
        else:
            self.stdout.write(self.style.WARNING(f'- Delivery Report Type already exists'))

        # Financial Report Type
        financial_report_type, created = ReportType.objects.get_or_create(
            slug='financial',
            defaults={
                'name': 'Financial Report',
                'description': 'Monthly financial metrics including revenue, COGS, profit, and margins',
                'icon': '💰',
                'is_system': True,
                'parsing_config': {
                    'format': 'normal',
                    'header_row': 1,
                    'data_start_row': 2,
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
                        'Net Margin Before Tax': {'field': 'net_margin_before_tax', 'type': 'decimal', 'required': False},
                        'Dividends to be Paid': {'field': 'dividends_to_be_paid', 'type': 'decimal', 'required': False},
                        'Emergency Fund to be Saved': {'field': 'emergency_fund_to_be_saved', 'type': 'decimal', 'required': False},
                    }
                },
                'field_schema': {
                    'accrual_revenue': {'label': 'Accrual Revenue', 'type': 'decimal', 'format': '$0,0.00'},
                    'accrual_income': {'label': 'Accrual Income', 'type': 'decimal', 'format': '$0,0.00'},
                    'cash_income': {'label': 'Cash Income', 'type': 'decimal', 'format': '$0,0.00'},
                    'sales_commissions': {'label': 'Sales Commissions', 'type': 'decimal', 'format': '$0,0.00'},
                    'cogs': {'label': 'COGS', 'type': 'decimal', 'format': '$0,0.00'},
                    'gross_profit': {'label': 'Gross Profit', 'type': 'decimal', 'format': '$0,0.00'},
                    'gross_margin_percent': {'label': 'Gross Margin %', 'type': 'percentage', 'format': '0.00%'},
                    'overhead': {'label': 'Overhead', 'type': 'decimal', 'format': '$0,0.00'},
                    'net_margin_before_tax': {'label': 'Net Margin Before Tax', 'type': 'decimal', 'format': '$0,0.00'},
                    'dividends_to_be_paid': {'label': 'Dividends to be Paid', 'type': 'decimal', 'format': '$0,0.00'},
                    'emergency_fund_to_be_saved': {'label': 'Emergency Fund to be Saved', 'type': 'decimal', 'format': '$0,0.00'},
                },
                'display_config': {
                    'table_columns': ['month', 'accrual_revenue', 'cash_income', 'gross_profit', 'cogs'],
                    'charts': [
                        {
                            'type': 'line',
                            'title': 'Revenue Trend',
                            'y_axis': ['accrual_revenue', 'cash_income']
                        },
                        {
                            'type': 'line',
                            'title': 'Profit & COGS',
                            'y_axis': ['gross_profit', 'cogs']
                        }
                    ]
                }
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Financial Report Type'))
        else:
            self.stdout.write(self.style.WARNING(f'- Financial Report Type already exists'))

        self.stdout.write(self.style.SUCCESS('\nSeeding completed!'))
