import pandas as pd
from decimal import Decimal
from django.db import transaction
from apps.core.models import Year, Month, DeliveryReportSnapshot, FinReportSnapshot


class CSVParser:
    """Base class for CSV parsing."""

    def __init__(self, file):
        self.file = file
        self.errors = []

    def read_csv(self):
        """Read CSV file into pandas DataFrame."""
        try:
            df = pd.read_csv(self.file)
            return df
        except Exception as e:
            self.errors.append(f"Failed to read CSV: {str(e)}")
            return None

    def validate_headers(self, df, required_headers):
        """Validate that all required headers are present."""
        missing_headers = set(required_headers) - set(df.columns)
        if missing_headers:
            self.errors.append(f"Missing required columns: {', '.join(missing_headers)}")
            return False
        return True


class DeliveryReportParser(CSVParser):
    """Parser for delivery report CSV files."""

    REQUIRED_HEADERS = [
        'Month',  # e.g., "January", "February"
        'Total Deliveries',
        'On Time Deliveries',
        'Late Deliveries',
        'Delivery Accuracy',
        'Total Revenue',
        'Delivery Costs'
    ]

    def parse_and_import(self, year_value, user):
        """
        Parse CSV and import delivery reports for the given year.
        Expected CSV format:
        Month, Total Deliveries, On Time Deliveries, Late Deliveries, Delivery Accuracy, Total Revenue, Delivery Costs
        """
        df = self.read_csv()
        if df is None:
            return False, self.errors

        if not self.validate_headers(df, self.REQUIRED_HEADERS):
            return False, self.errors

        # Get or create year
        year, _ = Year.objects.get_or_create(year=year_value, defaults={'created_by': user})

        months_imported = []

        try:
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # Parse month name to number
                        month_name = str(row['Month']).strip()
                        month_num = self.parse_month_name(month_name)

                        if month_num is None:
                            self.errors.append(f"Row {index + 2}: Invalid month name '{month_name}'")
                            continue

                        # Get or create month
                        month, _ = Month.objects.get_or_create(
                            year=year,
                            month=month_num
                        )

                        # Create or update delivery report
                        DeliveryReportSnapshot.objects.update_or_create(
                            month=month,
                            defaults={
                                'total_deliveries': int(row['Total Deliveries'] or 0),
                                'on_time_deliveries': int(row['On Time Deliveries'] or 0),
                                'late_deliveries': int(row['Late Deliveries'] or 0),
                                'delivery_accuracy': Decimal(str(row['Delivery Accuracy'] or 0)),
                                'total_revenue': Decimal(str(row['Total Revenue'] or 0)),
                                'delivery_costs': Decimal(str(row['Delivery Costs'] or 0)),
                                'uploaded_by': user
                            }
                        )

                        months_imported.append(month_name)

                    except Exception as e:
                        self.errors.append(f"Row {index + 2}: {str(e)}")

            return True, {'months_imported': months_imported, 'count': len(months_imported)}

        except Exception as e:
            self.errors.append(f"Transaction failed: {str(e)}")
            return False, self.errors

    @staticmethod
    def parse_month_name(month_name):
        """Convert month name to number (1-12)."""
        months_map = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        }
        return months_map.get(month_name.lower())


class FinancialReportParser(CSVParser):
    """Parser for financial report CSV files."""

    REQUIRED_HEADERS = [
        'Month',
        'Total Income',
        'Total Expenses',
        'Net Profit',
        'Operating Expenses',
        'Marketing Expenses',
        'Payroll Expenses'
    ]

    def parse_and_import(self, year_value, user):
        """
        Parse CSV and import financial reports for the given year.
        Expected CSV format:
        Month, Total Income, Total Expenses, Net Profit, Operating Expenses, Marketing Expenses, Payroll Expenses
        """
        df = self.read_csv()
        if df is None:
            return False, self.errors

        if not self.validate_headers(df, self.REQUIRED_HEADERS):
            return False, self.errors

        # Get or create year
        year, _ = Year.objects.get_or_create(year=year_value, defaults={'created_by': user})

        months_imported = []

        try:
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # Parse month name to number
                        month_name = str(row['Month']).strip()
                        month_num = self.parse_month_name(month_name)

                        if month_num is None:
                            self.errors.append(f"Row {index + 2}: Invalid month name '{month_name}'")
                            continue

                        # Get or create month
                        month, _ = Month.objects.get_or_create(
                            year=year,
                            month=month_num
                        )

                        # Create or update financial report
                        FinReportSnapshot.objects.update_or_create(
                            month=month,
                            defaults={
                                'total_income': Decimal(str(row['Total Income'] or 0)),
                                'total_expenses': Decimal(str(row['Total Expenses'] or 0)),
                                'net_profit': Decimal(str(row['Net Profit'] or 0)),
                                'operating_expenses': Decimal(str(row['Operating Expenses'] or 0)),
                                'marketing_expenses': Decimal(str(row['Marketing Expenses'] or 0)),
                                'payroll_expenses': Decimal(str(row['Payroll Expenses'] or 0)),
                                'uploaded_by': user
                            }
                        )

                        months_imported.append(month_name)

                    except Exception as e:
                        self.errors.append(f"Row {index + 2}: {str(e)}")

            return True, {'months_imported': months_imported, 'count': len(months_imported)}

        except Exception as e:
            self.errors.append(f"Transaction failed: {str(e)}")
            return False, self.errors

    @staticmethod
    def parse_month_name(month_name):
        """Convert month name to number (1-12)."""
        months_map = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        }
        return months_map.get(month_name.lower())
