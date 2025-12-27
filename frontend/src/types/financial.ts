export interface Year {
  id: number;
  year: number;
  created_at: string;
  months_count: number;
}

export interface Month {
  id: number;
  year: number;
  year_value: number;
  month: number;
  month_display: string;
  has_delivery_report: boolean;
  has_fin_report: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryReport {
  month: number;
  total_spent?: string;
  pto?: string;
  base_hours?: string;
  project_hours?: string;
  billable_hours?: string;
  utilization_excl_pto?: string;
  utilization_incl_pto?: string;
  billability?: string;
  fte?: number;
  revenue?: string;
  salary?: string;
  gp?: string;
  created_at: string;
  updated_at: string;
}

export interface FinReport {
  month: number;
  accrual_revenue?: string;
  accrual_income?: string;
  cash_income?: string;
  sales_commissions?: string;
  cogs?: string;
  gross_profit?: string;
  gross_margin_percent?: string;
  overhead?: string;
  net_margin_before_tax?: string;
  dividends_to_be_paid?: string;
  emergency_fund_to_be_saved?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  year: number;
  month: number;
  month_display: string;
  delivery_report: DeliveryReport | null;
  fin_report: FinReport | null;
  historical_data: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  month: string;
  year: number;
  delivery_revenue?: number;
  fte?: number;
  cash_income?: number;
  accrual_income?: number;
  accrual_revenue?: number;
  gross_profit?: number;
  cogs?: number;
}

export interface CSVImportResponse {
  message: string;
  data: {
    months_imported: string[];
    count: number;
  };
}

export interface CSVValidationResponse {
  valid: boolean;
  message?: string;
  months_found?: string[];
  row_count?: number;
  errors?: string[];
}
