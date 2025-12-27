import pandas as pd
from decimal import Decimal, InvalidOperation
from django.db import transaction
from apps.core.models import Year, Month, DeliveryReportSnapshot, FinReportSnapshot


def clean_value(value):
    """Clean and convert value to Decimal."""
    if pd.isna(value) or value == '' or value == '-':
        return None

    # Remove $ and , from numbers
    if isinstance(value, str):
        value = value.replace('$', '').replace(',', '').replace('%', '').strip()

    try:
        return Decimal(str(value))
    except (ValueError, InvalidOperation):
        return None


class DeliveryReportParser:
    """Parser for delivery report CSV files (transposed format)."""

    def parse_and_import(self, file, year_value, user):
        """
        Parse transposed CSV where rows are metrics and columns are months.
        Expected structure:
        - Row 1: empty, "Benchmark", empty columns
        - Row 2: "Name", empty, "January", "February", ..., "December"
        - Row 3+: Metric name, benchmark value, data for each month
        """
        try:
            # Read CSV with header=1 (second row is header with month names)
            df = pd.read_csv(file, header=1)

            # Get or create year
            year, _ = Year.objects.get_or_create(year=year_value, defaults={'created_by': user})

            # Month names to look for in columns
            month_names = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']

            # Map metric names to model fields
            metrics_map = {
                'Total Spent': 'total_spent',
                'PTO': 'pto',
                'Base': 'base_hours',
                'Project hours': 'project_hours',
                'Billable hours': 'billable_hours',
                'Utilization(Excl PTO)': 'utilization_excl_pto',
                'Utilization(Incl PTO)': 'utilization_incl_pto',
                'Billability': 'billability',
                'Billability Outsoursing': 'billability_outsourcing',
                'Billability Outstaffing': 'billability_outstaffing',
                'Billability T&M': 'billability_tm',
                'Billability FP': 'billability_fp',
                'FTE': 'fte',
                'Av. Rate, h': 'av_rate_h',
                'Revenue': 'revenue',
                'Revenue growth, MtM 2024': 'revenue_growth_mtm',
                'Salary': 'salary',
                'Salary growth, MtM 2024': 'salary_growth_mtm',
                'Av.Salary, h': 'av_salary_h',
                'GP': 'gp',
                'GP/FTE, h': 'gp_fte_h',
                'Rev/prod salary': 'rev_prod_salary',
                'GM,%': 'gm_percent',
                'Avarage revenue per Outstaffing\n': 'avg_revenue_outstaffing',
                'Avarage revenue per Outstaffing': 'avg_revenue_outstaffing',
                'Avarage revenue per Outsourcing': 'avg_revenue_outsourcing',
                'Avarage income per Outstaffing': 'avg_income_outstaffing',
                'Avarage income per Outsourcing': 'avg_income_outsourcing',
                'Avarage revenue per T&M\n': 'avg_revenue_tm',
                'Avarage revenue per T&M': 'avg_revenue_tm',
                'Avarage revenue per Fixed Price': 'avg_revenue_fp',
                'Avarage income per T&M': 'avg_income_tm',
                'Avarage income per Fixed Price': 'avg_income_fp',
                'Average income per employee': 'avg_income_per_employee',
                'Avarage salary prod': 'avg_salary_prod',
            }

            months_imported = []

            with transaction.atomic():
                # Process each month column
                for month_num, month_name in enumerate(month_names, start=1):
                    # Find the column with this month name
                    month_col = None
                    for col in df.columns:
                        if month_name in str(col):
                            month_col = col
                            break

                    if month_col is None:
                        continue

                    # Get or create month
                    month, _ = Month.objects.get_or_create(
                        year=year,
                        month=month_num
                    )

                    # Collect data for this month
                    report_data = {'uploaded_by': user}

                    for _, row in df.iterrows():
                        # First column (Name) contains metric name
                        metric_name = str(row.iloc[0]).strip() if not pd.isna(row.iloc[0]) else ''

                        if not metric_name:
                            continue

                        # Check if this metric is in our map
                        if metric_name in metrics_map:
                            field_name = metrics_map[metric_name]
                            value = clean_value(row[month_col])

                            if value is not None:
                                # Special handling for FTE (integer)
                                if field_name == 'fte':
                                    report_data[field_name] = int(value)
                                else:
                                    report_data[field_name] = value

                    # Create or update delivery report only if we have data
                    if len(report_data) > 1:  # More than just uploaded_by
                        DeliveryReportSnapshot.objects.update_or_create(
                            month=month,
                            defaults=report_data
                        )
                        months_imported.append(month_name)

            return True, {'months_imported': months_imported, 'count': len(months_imported)}

        except Exception as e:
            import traceback
            return False, f"Import failed: {str(e)}\n{traceback.format_exc()}"


class FinancialReportParser:
    """Parser for financial report CSV files."""

    def parse_and_import(self, file, year_value, user):
        """
        Parse financial CSV where first column is month number.
        Expected structure:
        - Row 1: Optional type information
        - Row 2: Headers
        - Rows 3+: Data with month numbers in first column
        """
        try:
            # Read CSV, skipping first row if it's type info
            df = pd.read_csv(file, skiprows=1)

            # Get or create year
            year, _ = Year.objects.get_or_create(year=year_value, defaults={'created_by': user})

            # Map column names to model fields
            fields_map = {
                'Accrual Revenue (From QBO)': 'accrual_revenue',
                'Accrual income (From Jira)': 'accrual_income',
                'Cash income': 'cash_income',
                'Sales commissions': 'sales_commissions',
                'COGS': 'cogs',
                'Gross Profit': 'gross_profit',
                'Gross Margin, %': 'gross_margin_percent',
                'Overhead': 'overhead',
                'Production Team, FTE': 'production_team_fte',
                'Overhead by FTE': 'overhead_by_fte',
                'Net Margin before tax, $': 'net_margin_before_tax',
                'Net Margin before tax, $(From Jira)': 'net_margin_before_tax_jira',
                'Net Margin before tax, $\n(From Jira)': 'net_margin_before_tax_jira',
                'Net Margin(cash), $': 'net_margin_cash',
                'Income Tax': 'income_tax',
                'Dividends to be paid': 'dividends_to_be_paid',
                'Paid dividends': 'paid_dividends',
                'Emergency fund to be saved': 'emergency_fund_to_be_saved',
                'Emergency fund - saved': 'emergency_fund_saved',
                'Dividends, %': 'dividends_percent',
                'Emergency fund': 'emergency_fund_percent',
            }

            months_imported = []

            with transaction.atomic():
                for _, row in df.iterrows():
                    month_num = row.iloc[0]  # First column is month number

                    # Skip if not a valid month
                    try:
                        month_num = int(month_num)
                        if month_num < 1 or month_num > 12:
                            continue
                    except (ValueError, TypeError):
                        continue

                    # Get or create month
                    month, _ = Month.objects.get_or_create(
                        year=year,
                        month=month_num
                    )

                    # Collect data for this month
                    report_data = {'uploaded_by': user}

                    for col_name, field_name in fields_map.items():
                        if col_name in df.columns:
                            value = clean_value(row[col_name])
                            if value is not None:
                                # Special handling for FTE (integer)
                                if field_name == 'production_team_fte':
                                    report_data[field_name] = int(value)
                                else:
                                    report_data[field_name] = value

                    # Create or update financial report
                    FinReportSnapshot.objects.update_or_create(
                        month=month,
                        defaults=report_data
                    )

                    months_imported.append(month.get_month_display())

            return True, {'months_imported': months_imported, 'count': len(months_imported)}

        except Exception as e:
            return False, [f"Import failed: {str(e)}"]
