import api from './api';
import { API_ENDPOINTS } from '../config/api';
import {
  Year,
  Month,
  DeliveryReport,
  FinReport,
  DashboardData,
} from '../types/financial';

export const financialService = {
  // Years
  getYears: async (): Promise<Year[]> => {
    const response = await api.get<{ results: Year[] }>(API_ENDPOINTS.YEARS);
    return response.data.results || [];
  },

  getYear: async (id: number): Promise<Year> => {
    const response = await api.get<Year>(API_ENDPOINTS.YEAR_DETAIL(id));
    return response.data;
  },

  // Months
  getMonthsForYear: async (yearId: number): Promise<Month[]> => {
    const response = await api.get<Month[]>(API_ENDPOINTS.YEAR_MONTHS(yearId));
    // This endpoint returns array directly, not paginated
    return Array.isArray(response.data) ? response.data : [];
  },

  getMonth: async (id: number): Promise<Month> => {
    const response = await api.get<Month>(API_ENDPOINTS.MONTH_DETAIL(id));
    return response.data;
  },

  // Reports
  getDeliveryReport: async (monthId: number): Promise<DeliveryReport> => {
    const response = await api.get<DeliveryReport>(
      API_ENDPOINTS.MONTH_DELIVERY_REPORT(monthId)
    );
    return response.data;
  },

  getFinReport: async (monthId: number): Promise<FinReport> => {
    const response = await api.get<FinReport>(API_ENDPOINTS.MONTH_FIN_REPORT(monthId));
    return response.data;
  },

  // Dashboard
  getDashboardData: async (year: number, month: number): Promise<DashboardData> => {
    const response = await api.get<DashboardData>(API_ENDPOINTS.DASHBOARD(year, month));
    return response.data;
  },
};
