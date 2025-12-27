import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { reportsService, Report, ReportType } from "../services/reports.service";

type GroupingMode = 'month' | 'quarter' | 'half-year' | 'year';

export const ViewDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>(() => {
    const saved = localStorage.getItem('viewDataGroupingMode');
    return (saved as GroupingMode) || 'month';
  });

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
    localStorage.setItem('viewDataGroupingMode', groupingMode);
  }, [groupingMode]);

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
      // Load all reports first
      const allReports = await reportsService.getReports({});
      console.log('Loaded all reports:', allReports);
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

  const handleClearFilters = () => {
    setSelectedReportTypes([]);
    setSelectedYears([]);
    setSelectedMonths([]);
  };

  // Filter reports based on selected filters
  const filteredReports = reports.filter((report) => {
    // Filter by report type
    if (selectedReportTypes.length > 0) {
      const reportType = reportTypes.find((rt) => rt.id === report.report_type);
      if (!reportType || !selectedReportTypes.includes(reportType.slug)) {
        return false;
      }
    }

    // Filter by year
    if (selectedYears.length > 0 && !selectedYears.includes(report.year_value)) {
      return false;
    }

    // Filter by month
    if (selectedMonths.length > 0 && !selectedMonths.includes(report.month_value)) {
      return false;
    }

    return true;
  });

  // Helper function to get quarter for a month
  const getQuarter = (month: number): number => {
    return Math.ceil(month / 3);
  };

  // Helper function to get half-year for a month
  const getHalfYear = (month: number): number => {
    return month <= 6 ? 1 : 2;
  };

  // Helper function to get month range for grouping
  const getMonthRange = (year: number, startMonth: number, endMonth: number): number[] => {
    const months = [];
    for (let m = startMonth; m <= endMonth; m++) {
      months.push(m);
    }
    return months;
  };

  // Helper function to get display label for grouped period
  const getPeriodLabel = (year: number, startMonth: number, endMonth: number): string => {
    if (startMonth === endMonth) {
      return availableMonths.find(m => m.value === startMonth)?.label || `Month ${startMonth}`;
    }
    const startLabel = availableMonths.find(m => m.value === startMonth)?.label || `Month ${startMonth}`;
    const endLabel = availableMonths.find(m => m.value === endMonth)?.label || `Month ${endMonth}`;
    return `${startLabel} - ${endLabel}`;
  };

  // Group filtered reports based on grouping mode
  const groupedReports = (() => {
    const groups: Record<string, {
      year: number;
      months: number[];
      period_display: string;
      reports: Report[]
    }> = {};

    filteredReports.forEach(report => {
      let key: string;
      let months: number[];
      let periodDisplay: string;

      switch (groupingMode) {
        case 'quarter': {
          const quarter = getQuarter(report.month_value);
          const startMonth = (quarter - 1) * 3 + 1;
          const endMonth = quarter * 3;
          key = `${report.year_value}-Q${quarter}`;
          months = getMonthRange(report.year_value, startMonth, endMonth);
          periodDisplay = `Q${quarter} (${getPeriodLabel(report.year_value, startMonth, endMonth)})`;
          break;
        }
        case 'half-year': {
          const half = getHalfYear(report.month_value);
          const startMonth = half === 1 ? 1 : 7;
          const endMonth = half === 1 ? 6 : 12;
          key = `${report.year_value}-H${half}`;
          months = getMonthRange(report.year_value, startMonth, endMonth);
          periodDisplay = `H${half} (${getPeriodLabel(report.year_value, startMonth, endMonth)})`;
          break;
        }
        case 'year': {
          key = `${report.year_value}`;
          months = getMonthRange(report.year_value, 1, 12);
          periodDisplay = `Full Year`;
          break;
        }
        default: { // 'month'
          key = `${report.year_value}-${report.month_value}`;
          months = [report.month_value];
          periodDisplay = report.month_display;
          break;
        }
      }

      if (!groups[key]) {
        groups[key] = {
          year: report.year_value,
          months,
          period_display: periodDisplay,
          reports: [],
        };
      }
      groups[key].reports.push(report);
    });

    return groups;
  })();

  const sortedGroups = Object.values(groupedReports).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.months[0] - a.months[0];
  });

  return (
    <Box sx={{ pb: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        View Data
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

      {/* Grouping Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink>Group By</InputLabel>
                <Select
                  value={groupingMode}
                  onChange={(e) => setGroupingMode(e.target.value as GroupingMode)}
                  displayEmpty
                  notched
                >
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="quarter">Quarterly (3 months)</MenuItem>
                  <MenuItem value="half-year">Half-Yearly (6 months)</MenuItem>
                  <MenuItem value="year">Yearly (12 months)</MenuItem>
                </Select>
              </FormControl>
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
      ) : sortedGroups.length === 0 ? (
        <Alert severity="info">
          No data available. Please import data first or adjust your filters.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 500, sm: 650 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Year</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Period</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Report Types</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Total Reports</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedGroups.map((group) => {
                // Get unique report type names
                const uniqueReportTypes = Array.from(
                  new Set(group.reports.map(r => r.report_type_name))
                );

                // If grouping by multiple months, show which months have which report types
                const showDetailedInfo = group.months.length > 1;

                // Group reports by type and show which months are available
                const reportTypesByMonth: Record<string, Set<number>> = {};
                group.reports.forEach(report => {
                  if (!reportTypesByMonth[report.report_type_name]) {
                    reportTypesByMonth[report.report_type_name] = new Set();
                  }
                  reportTypesByMonth[report.report_type_name].add(report.month_value);
                });

                const getMonthLabel = (monthNum: number): string => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return monthNames[monthNum - 1] || String(monthNum);
                };

                return (
                  <TableRow key={`${group.year}-${group.months.join(',')}`} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                    <TableCell>{group.year}</TableCell>
                    <TableCell>{group.period_display}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {uniqueReportTypes.map((typeName) => {
                          const availableMonths = Array.from(reportTypesByMonth[typeName] || []).sort((a, b) => a - b);
                          const allMonthsPresent = availableMonths.length === group.months.length;

                          if (showDetailedInfo && !allMonthsPresent) {
                            // Show chip with month availability info
                            const monthsText = availableMonths.map(m => getMonthLabel(m)).join(', ');
                            return (
                              <Box key={typeName} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip
                                  label={typeName}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  ({monthsText})
                                </Typography>
                              </Box>
                            );
                          }

                          // For single month or all months present, show as chip only
                          return (
                            <Chip
                              key={typeName}
                              label={typeName}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {group.reports.length} report{group.reports.length !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/view-data/${group.year}/${group.months.join(',')}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {sortedGroups.length} month{sortedGroups.length !== 1 ? 's' : ''} ({filteredReports.length} filtered report{filteredReports.length !== 1 ? 's' : ''} out of {reports.length} total)
        </Typography>
      </Box>
    </Box>
  );
};
