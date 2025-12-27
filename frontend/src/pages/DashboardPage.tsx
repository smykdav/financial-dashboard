import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Divider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { reportsService, Report, ReportType } from '../services/reports.service';

type GroupingMode = 'month' | 'quarter' | 'half-year' | 'year';

interface ChartMetric {
  key: string;
  label: string;
  color: string;
  enabled: boolean;
}

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#82ca9d', '#a4de6c', '#f77dc2'
];

export const DashboardPage: React.FC = () => {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>(() => {
    const saved = localStorage.getItem('dashboardGroupingMode');
    return (saved as GroupingMode) || 'month';
  });

  // Metrics for each report type
  const [deliveryMetrics, setDeliveryMetrics] = useState<ChartMetric[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<ChartMetric[]>([]);

  const availableYears = Array.from(new Set(reports.map(r => r.year_value))).sort((a, b) => b - a);
  const availableMonths = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  useEffect(() => {
    loadReportTypes();
    loadReports();
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardGroupingMode', groupingMode);
  }, [groupingMode]);

  useEffect(() => {
    // Initialize metrics when reports change
    initializeMetrics();
  }, [reports, reportTypes]);

  const loadReportTypes = async () => {
    try {
      const types = await reportsService.getReportTypes();
      setReportTypes(types);
    } catch (err) {
      console.error('Failed to load report types:', err);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const allReports = await reportsService.getReports({});
      setReports(Array.isArray(allReports) ? allReports : []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load reports';
      setError(errorMsg);
      console.error('Failed to load reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const initializeMetrics = () => {
    if (reports.length === 0 || reportTypes.length === 0) return;

    // Find delivery and financial report types
    const deliveryType = reportTypes.find(rt => rt.slug === 'delivery');
    const financialType = reportTypes.find(rt => rt.slug === 'financial');

    // Initialize delivery metrics
    if (deliveryType && deliveryType.field_schema) {
      const deliveryFields = Object.entries(deliveryType.field_schema as Record<string, any>)
        .filter(([key, field]: [string, any]) => {
          const type = field.type;
          return type === 'decimal' || type === 'integer' || type === 'percentage';
        })
        .map(([key, field]: [string, any], index) => ({
          key,
          label: field.label || key,
          color: CHART_COLORS[index % CHART_COLORS.length],
          enabled: index < 3, // Enable first 3 by default
        }));
      setDeliveryMetrics(deliveryFields);
    }

    // Initialize financial metrics
    if (financialType && financialType.field_schema) {
      const financialFields = Object.entries(financialType.field_schema as Record<string, any>)
        .filter(([key, field]: [string, any]) => {
          const type = field.type;
          return type === 'decimal' || type === 'integer';
        })
        .map(([key, field]: [string, any], index) => ({
          key,
          label: field.label || key,
          color: CHART_COLORS[index % CHART_COLORS.length],
          enabled: index < 3, // Enable first 3 by default
        }));
      setFinancialMetrics(financialFields);
    }
  };

  const handleClearFilters = () => {
    setSelectedReportTypes([]);
    setSelectedYears([]);
    setSelectedMonths([]);
  };

  const toggleDeliveryMetric = (key: string) => {
    setDeliveryMetrics(prev =>
      prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m)
    );
  };

  const toggleFinancialMetric = (key: string) => {
    setFinancialMetrics(prev =>
      prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m)
    );
  };

  // Filter reports based on selected filters
  const filteredReports = reports.filter((report) => {
    if (selectedReportTypes.length > 0) {
      const reportType = reportTypes.find((rt) => rt.id === report.report_type);
      if (!reportType || !selectedReportTypes.includes(reportType.slug)) {
        return false;
      }
    }
    if (selectedYears.length > 0 && !selectedYears.includes(report.year_value)) {
      return false;
    }
    if (selectedMonths.length > 0 && !selectedMonths.includes(report.month_value)) {
      return false;
    }
    return true;
  });

  // Prepare chart data
  const prepareChartData = (reportTypeSlug: string) => {
    const relevantReports = filteredReports
      .filter(r => {
        const rt = reportTypes.find(type => type.id === r.report_type);
        return rt?.slug === reportTypeSlug;
      })
      .sort((a, b) => {
        if (a.year_value !== b.year_value) return a.year_value - b.year_value;
        return a.month_value - b.month_value;
      });

    return relevantReports.map(report => ({
      period: `${report.month_display} ${report.year_value}`,
      month: report.month_display,
      year: report.year_value,
      ...report.data,
    }));
  };

  const deliveryChartData = prepareChartData('delivery');
  const financialChartData = prepareChartData('financial');

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '0';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(numValue) ? '0' : numValue.toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        Dashboard
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink>Report Types</InputLabel>
                <Select
                  multiple
                  value={selectedReportTypes}
                  onChange={(e) => {
                    const value = typeof e.target.value === 'string' ? [e.target.value] : e.target.value;
                    if (value.includes('all')) {
                      setSelectedReportTypes(
                        selectedReportTypes.length === reportTypes.length
                          ? []
                          : reportTypes.map(rt => rt.slug)
                      );
                    } else {
                      setSelectedReportTypes(value);
                    }
                  }}
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <Typography color="text.secondary">All Types</Typography>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length === reportTypes.length ? (
                          <Chip label="All Types" size="small" />
                        ) : (
                          selected.map((slug) => {
                            const rt = reportTypes.find((t) => t.slug === slug);
                            return (
                              <Chip key={slug} label={rt ? `${rt.icon} ${rt.name}` : slug} size="small" />
                            );
                          })
                        )}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="all">
                    <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {selectedReportTypes.length === reportTypes.length ? '✓ ' : ''}Select All
                    </Box>
                  </MenuItem>
                  {reportTypes.map((rt) => (
                    <MenuItem key={rt.slug} value={rt.slug}>
                      {rt.icon} {rt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink>Years</InputLabel>
                <Select
                  multiple
                  value={selectedYears}
                  onChange={(e) => {
                    const value = typeof e.target.value === 'string' ? [Number(e.target.value)] : e.target.value as number[];
                    if (value.includes(-1 as any)) {
                      setSelectedYears(
                        selectedYears.length === availableYears.length
                          ? []
                          : availableYears
                      );
                    } else {
                      setSelectedYears(value);
                    }
                  }}
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <Typography color="text.secondary">All Years</Typography>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length === availableYears.length ? (
                          <Chip label="All Years" size="small" />
                        ) : (
                          selected.map((year) => (
                            <Chip key={year} label={year} size="small" />
                          ))
                        )}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value={-1}>
                    <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {selectedYears.length === availableYears.length ? '✓ ' : ''}Select All
                    </Box>
                  </MenuItem>
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink>Months</InputLabel>
                <Select
                  multiple
                  value={selectedMonths}
                  onChange={(e) => {
                    const value = typeof e.target.value === 'string' ? [Number(e.target.value)] : e.target.value as number[];
                    if (value.includes(-1 as any)) {
                      setSelectedMonths(
                        selectedMonths.length === availableMonths.length
                          ? []
                          : availableMonths.map(m => m.value)
                      );
                    } else {
                      setSelectedMonths(value);
                    }
                  }}
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <Typography color="text.secondary">All Months</Typography>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length === availableMonths.length ? (
                          <Chip label="All Months" size="small" />
                        ) : (
                          selected.map((monthNum) => {
                            const month = availableMonths.find((m) => m.value === monthNum);
                            return (
                              <Chip key={monthNum} label={month?.label || monthNum} size="small" />
                            );
                          })
                        )}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value={-1}>
                    <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {selectedMonths.length === availableMonths.length ? '✓ ' : ''}Select All
                    </Box>
                  </MenuItem>
                  {availableMonths.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleClearFilters}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Delivery Report Chart */}
          {(selectedReportTypes.length === 0 || selectedReportTypes.includes('delivery')) && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      📦 Delivery Report Metrics
                    </Typography>
                    <Chip
                      label={`${deliveryChartData.length} data points`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                {/* Metric toggles */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select metrics to display:
                  </Typography>
                  <FormGroup row sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    {deliveryMetrics.map((metric) => (
                      <FormControlLabel
                        key={metric.key}
                        control={
                          <Checkbox
                            checked={metric.enabled}
                            onChange={() => toggleDeliveryMetric(metric.key)}
                            sx={{
                              color: metric.color,
                              '&.Mui-checked': {
                                color: metric.color,
                              },
                            }}
                          />
                        }
                        label={metric.label}
                      />
                    ))}
                  </FormGroup>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {deliveryChartData.length === 0 ? (
                  <Alert severity="info">No delivery data available for the selected filters</Alert>
                ) : (
                  <Box sx={{ width: '100%', height: { xs: 300, sm: 350, md: 400 } }}>
                    <ResponsiveContainer>
                      <LineChart data={deliveryChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => formatValue(value)} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        {deliveryMetrics
                          .filter(m => m.enabled)
                          .map((metric) => (
                            <Line
                              key={metric.key}
                              type="monotone"
                              dataKey={metric.key}
                              stroke={metric.color}
                              name={metric.label}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          )}

          {/* Financial Report Chart */}
          {(selectedReportTypes.length === 0 || selectedReportTypes.includes('financial')) && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      💰 Financial Report Metrics
                    </Typography>
                    <Chip
                      label={`${financialChartData.length} data points`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                {/* Metric toggles */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select metrics to display:
                  </Typography>
                  <FormGroup row sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    {financialMetrics.map((metric) => (
                      <FormControlLabel
                        key={metric.key}
                        control={
                          <Checkbox
                            checked={metric.enabled}
                            onChange={() => toggleFinancialMetric(metric.key)}
                            sx={{
                              color: metric.color,
                              '&.Mui-checked': {
                                color: metric.color,
                              },
                            }}
                          />
                        }
                        label={metric.label}
                      />
                    ))}
                  </FormGroup>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {financialChartData.length === 0 ? (
                  <Alert severity="info">No financial data available for the selected filters</Alert>
                ) : (
                  <Box sx={{ width: '100%', height: { xs: 300, sm: 350, md: 400 } }}>
                    <ResponsiveContainer>
                      <LineChart data={financialChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => formatValue(value)} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        {financialMetrics
                          .filter(m => m.enabled)
                          .map((metric) => (
                            <Line
                              key={metric.key}
                              type="monotone"
                              dataKey={metric.key}
                              stroke={metric.color}
                              name={metric.label}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          )}
        </Grid>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing data from {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          {filteredReports.length > 0 && ` (${Array.from(new Set(filteredReports.map(r => r.report_type_name))).join(', ')})`}
        </Typography>
      </Box>
    </Box>
  );
};
