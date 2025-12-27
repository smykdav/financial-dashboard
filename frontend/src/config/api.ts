export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  ME: '/auth/me/',
  REFRESH: '/auth/refresh/',

  // Years and Months
  YEARS: '/years/',
  YEAR_DETAIL: (id: number) => `/years/${id}/`,
  YEAR_MONTHS: (id: number) => `/years/${id}/months/`,
  MONTHS: '/months/',
  MONTH_DETAIL: (id: number) => `/months/${id}/`,

  // Reports (generic)
  REPORT_TYPES: '/report-types/',
  REPORT_TYPE_DETAIL: (slug: string) => `/report-types/${slug}/`,
  REPORTS: '/reports/',
  REPORT_DETAIL: (id: number) => `/reports/${id}/`,
  REPORTS_BULK_CREATE: '/reports/bulk-create/',

  // Dashboard
  DASHBOARD: (year: number, month: number) => `/dashboard/${year}/${month}/`,

  // Base endpoint for generic API calls
  BASE: '',
};
