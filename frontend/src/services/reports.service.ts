import api from './api';
import { API_ENDPOINTS } from '../config/api';
import { ReportTypeConfig } from '../utils/csvParser';

export interface ReportType {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_system: boolean;
  parsing_config: any;
  field_schema: any;
  display_config: any;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  report_type: number;
  report_type_name: string;
  year: number;
  year_value: number;
  month: number;
  month_value: number;
  month_display: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BulkReportCreatePayload {
  report_type_slug: string;
  year: number;
  months: Array<{
    month: number;
    data: Record<string, any>;
  }>;
}

export interface BulkReportCreateResponse {
  message: string;
  created: string[];
  updated: string[];
  total: number;
}

export const reportsService = {
  // Report Types
  getReportTypes: async (): Promise<ReportType[]> => {
    const response = await api.get<{ results: ReportType[] }>(`${API_ENDPOINTS.BASE}/report-types/`);
    return response.data.results || [];
  },

  getReportType: async (slug: string): Promise<ReportType> => {
    const response = await api.get<ReportType>(`${API_ENDPOINTS.BASE}/report-types/${slug}/`);
    return response.data;
  },

  getReportTypeById: async (id: number): Promise<ReportType> => {
    const response = await api.get<ReportType>(`${API_ENDPOINTS.BASE}/report-types/${id}/`);
    return response.data;
  },

  createReportType: async (data: Partial<ReportType>): Promise<ReportType> => {
    const response = await api.post<ReportType>(`${API_ENDPOINTS.BASE}/report-types/`, data);
    return response.data;
  },

  updateReportType: async (slug: string, data: Partial<ReportType>): Promise<ReportType> => {
    const response = await api.patch<ReportType>(`${API_ENDPOINTS.BASE}/report-types/${slug}/`, data);
    return response.data;
  },

  deleteReportType: async (slug: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.BASE}/report-types/${slug}/`);
  },

  // Reports
  getReports: async (params?: {
    report_type?: string;
    year?: number;
    month?: number | string; // Can be single number or comma-separated string like "1,2,3"
  }): Promise<Report[]> => {
    const response = await api.get<{ results: Report[] }>(`${API_ENDPOINTS.BASE}/reports/`, { params });
    return response.data.results || response.data as any;
  },

  getReport: async (id: number): Promise<Report> => {
    const response = await api.get<Report>(`${API_ENDPOINTS.BASE}/reports/${id}/`);
    return response.data;
  },

  bulkCreateReports: async (data: BulkReportCreatePayload): Promise<BulkReportCreateResponse> => {
    const response = await api.post<BulkReportCreateResponse>(
      `${API_ENDPOINTS.BASE}/reports/bulk-create/`,
      data
    );
    return response.data;
  },
};
