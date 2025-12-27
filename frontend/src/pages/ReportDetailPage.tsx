import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
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
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import {
  reportsService,
  Report,
  ReportType,
} from "../services/reports.service";

export const ReportDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { year, month } = useParams<{ year: string; month: string }>();
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  useEffect(() => {
    if (year && month) {
      loadReportDetails();
    }
  }, [year, month]);

  const loadReportDetails = async () => {
    if (!year || !month) return;

    setLoading(true);
    setError("");
    try {
      // Load reports for this year and month(s)
      // month can be a single value or comma-separated values like "1,2,3"
      const reportsData = await reportsService.getReports({
        year: Number(year),
        month: month, // Pass as string to support comma-separated values
      });
      setReports(reportsData);

      // Load all report types to get field schemas
      const types = await reportsService.getReportTypes();
      setReportTypes(types);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load report details";
      setError(errorMsg);
      console.error("Failed to load report details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (fieldKey: string, reportTypeId: number): string => {
    const reportType = reportTypes.find((rt) => rt.id === reportTypeId);
    if (!reportType?.field_schema) return fieldKey;
    const fieldSchema = reportType.field_schema as Record<string, any>;
    const field = fieldSchema[fieldKey];
    return field?.label || fieldKey;
  };

  const getFieldType = (fieldKey: string, reportTypeId: number): string => {
    const reportType = reportTypes.find((rt) => rt.id === reportTypeId);
    if (!reportType?.field_schema) return "text";
    const fieldSchema = reportType.field_schema as Record<string, any>;
    const field = fieldSchema[fieldKey];
    return field?.type || "text";
  };

  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return "—";

    if (type === "currency") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      return isNaN(numValue) ? value : `$${numValue.toLocaleString()}`;
    }

    if (type === "percentage") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      return isNaN(numValue) ? value : `${numValue}%`;
    }

    if (type === "number") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      return isNaN(numValue) ? value : numValue.toLocaleString();
    }

    return String(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/view-data")}
          sx={{ mb: 2 }}
        >
          Back to Reports
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (reports.length === 0) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/view-data")}
          sx={{ mb: 2 }}
        >
          Back to Reports
        </Button>
        <Alert severity="info">No reports found for this month</Alert>
      </Box>
    );
  }

  const firstReport = reports[0];

  // Helper to get period display from month parameter
  const getPeriodDisplay = (): string => {
    if (!month) return "";

    const monthNumbers = month.split(",").map((m) => parseInt(m.trim()));

    if (monthNumbers.length === 1) {
      // Single month - use the month_display from report
      return firstReport.month_display;
    } else if (monthNumbers.length === 12) {
      // Full year
      return "Full Year";
    } else if (monthNumbers.length === 6) {
      // Half year
      const firstMonth = monthNumbers[0];
      return firstMonth === 1 ? "H1 (January - June)" : "H2 (July - December)";
    } else if (monthNumbers.length === 3) {
      // Quarter
      const firstMonth = monthNumbers[0];
      const quarter = Math.ceil(firstMonth / 3);
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const startMonth = monthNames[firstMonth - 1];
      const endMonth = monthNames[monthNumbers[monthNumbers.length - 1] - 1];
      return `Q${quarter} (${startMonth} - ${endMonth})`;
    } else {
      // Custom selection
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return monthNumbers.map((m) => monthNames[m - 1]).join(", ");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/view-data")}
        >
          Back to Reports
        </Button>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
          fullWidth={false}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <ToggleButton value="table" sx={{ flex: { xs: 1, sm: "initial" } }}>
            <ViewListIcon
              sx={{
                mr: { xs: 0, sm: 1 },
                display: { xs: "block", sm: "inline" },
              }}
            />
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Table
            </Box>
          </ToggleButton>
          <ToggleButton value="cards" sx={{ flex: { xs: 1, sm: "initial" } }}>
            <ViewModuleIcon
              sx={{
                mr: { xs: 0, sm: 1 },
                display: { xs: "block", sm: "inline" },
              }}
            />
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Cards
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
      >
        {getPeriodDisplay()} {firstReport.year_value} - Report Details
      </Typography>

      {/* Summary Metadata */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Year
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {firstReport.year_value}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Period
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {getPeriodDisplay()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Typography variant="caption" color="text.secondary">
                Available Report Types
              </Typography>
              <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {Array.from(
                  new Set(reports.map((r) => r.report_type_name))
                ).map((typeName) => (
                  <Chip
                    key={typeName}
                    label={typeName}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Individual Report Data Tables - Cards View */}
      {viewMode === "cards" &&
        (() => {
          // Group reports by report type
          const reportsByType: Record<number, Report[]> = {};
          reports.forEach((report) => {
            if (!reportsByType[report.report_type]) {
              reportsByType[report.report_type] = [];
            }
            reportsByType[report.report_type].push(report);
          });

          return Object.entries(reportsByType).map(
            ([reportTypeId, typeReports]) => {
              // Sort reports by month
              const sortedReports = [...typeReports].sort(
                (a, b) => a.month_value - b.month_value
              );

              return (
                <Box key={reportTypeId} sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    {sortedReports[0].report_type_name}
                  </Typography>

                  <Grid container spacing={2}>
                    {sortedReports.map((report) => {
                      // Get field schema to filter which fields to show
                      const reportType = reportTypes.find(
                        (rt) => rt.id === report.report_type
                      );
                      const fieldSchema = (reportType?.field_schema ||
                        {}) as Record<string, any>;
                      const schemaKeys = Object.keys(fieldSchema);

                      // Filter data entries to only show fields in schema
                      const dataEntries = Object.entries(report.data || {}).filter(
                        ([key]) =>
                          schemaKeys.length === 0 || schemaKeys.includes(key)
                      );
                      return (
                        <Grid item xs={12} sm={6} lg={4} key={report.id}>
                          <Card>
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                <Typography variant="h6">
                                  {report.month_display}
                                </Typography>
                                <Chip
                                  label={`${dataEntries.length} fields`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                              {dataEntries.length === 0 ? (
                                <Alert severity="info">
                                  No data available for this report
                                </Alert>
                              ) : (
                                <TableContainer
                                  component={Paper}
                                  sx={{ mt: 2 }}
                                >
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow
                                        sx={{ bgcolor: "primary.main" }}
                                      >
                                        <TableCell
                                          sx={{
                                            color: "white",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          Field
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            color: "white",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          Value
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {dataEntries.map(([key, value]) => {
                                        const fieldType = getFieldType(
                                          key,
                                          report.report_type
                                        );
                                        const fieldLabel = getFieldLabel(
                                          key,
                                          report.report_type
                                        );
                                        return (
                                          <TableRow
                                            key={key}
                                            sx={{
                                              "&:nth-of-type(odd)": {
                                                bgcolor: "action.hover",
                                              },
                                            }}
                                          >
                                            <TableCell>
                                              <Typography
                                                variant="body2"
                                                fontWeight="medium"
                                              >
                                                {fieldLabel}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="body2">
                                                {formatValue(value, fieldType)}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              );
            }
          );
        })()}

      {/* Table View - Separate Table per Report Type */}
      {viewMode === "table" &&
        (() => {
          // Group reports by report type
          const reportsByType: Record<number, Report[]> = {};
          reports.forEach((report) => {
            if (!reportsByType[report.report_type]) {
              reportsByType[report.report_type] = [];
            }
            reportsByType[report.report_type].push(report);
          });

          return Object.entries(reportsByType).map(
            ([reportTypeId, typeReports]) => {
              const firstTypeReport = typeReports[0];

              // Collect all unique field keys from all reports of this type
              const allFieldKeys = new Set<string>();
              typeReports.forEach((report) => {
                Object.keys(report.data || {}).forEach((key) =>
                  allFieldKeys.add(key)
                );
              });

              // Create fields array from all unique keys
              const fields = Array.from(allFieldKeys).map((key) => ({
                key,
                label: getFieldLabel(key, firstTypeReport.report_type),
                type: getFieldType(key, firstTypeReport.report_type),
              }));

              // Sort reports by month
              const sortedReports = [...typeReports].sort(
                (a, b) => a.month_value - b.month_value
              );

              return (
                <Card key={reportTypeId} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">
                        {firstTypeReport.report_type_name}
                      </Typography>
                      <Chip
                        label={`${fields.length} fields`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`${sortedReports.length} month${
                          sortedReports.length !== 1 ? "s" : ""
                        }`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: { xs: 400, sm: 500, md: 600 },
                        overflowX: "auto",
                        overflowY: "auto",
                      }}
                    >
                      <Table
                        size="small"
                        stickyHeader
                        sx={{ minWidth: { xs: 600, sm: 650 } }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                fontWeight: "bold",
                                position: "sticky",
                                left: 0,
                                zIndex: 3,
                              }}
                            >
                              Month
                            </TableCell>
                            {fields.map((field) => (
                              <TableCell
                                key={field.key}
                                sx={{
                                  bgcolor: "primary.main",
                                  color: "white",
                                  fontWeight: "bold",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {field.label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedReports.map((report, idx) => (
                            <TableRow
                              key={report.id}
                              sx={{
                                bgcolor:
                                  idx % 2 === 0
                                    ? "action.hover"
                                    : "background.paper",
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: "bold",
                                  position: "sticky",
                                  left: 0,
                                  bgcolor:
                                    idx % 2 === 0
                                      ? "action.hover"
                                      : "background.paper",
                                  zIndex: 1,
                                }}
                              >
                                {report.month_display}
                              </TableCell>
                              {fields.map((field) => {
                                const value = report.data?.[field.key];
                                return (
                                  <TableCell key={field.key}>
                                    <Typography variant="body2">
                                      {formatValue(value, field.type)}
                                    </Typography>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              );
            }
          );
        })()}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {reports.length} report{reports.length !== 1 ? "s" : ""} for
          this period
          {viewMode === "table" &&
            ` (${reports.reduce(
              (sum, r) => sum + Object.keys(r.data || {}).length,
              0
            )} total fields)`}
        </Typography>
      </Box>
    </Box>
  );
};
