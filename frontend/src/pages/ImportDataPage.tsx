import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Upload as UploadIcon } from "@mui/icons-material";
import { reportsService, ReportType } from "../services/reports.service";
import { parseCSVFile } from "../utils/csvParser";

export const ImportDataPage: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReportTypes, setLoadingReportTypes] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadReportTypes();
  }, []);

  const loadReportTypes = async () => {
    try {
      const types = await reportsService.getReportTypes();
      setReportTypes(types);
      if (types.length > 0) {
        setSelectedReportType(types[0].slug);
      }
    } catch (err) {
      setError("Failed to load report types");
    } finally {
      setLoadingReportTypes(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setMessage("");
        setError("");
      }
    },
  });

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!selectedReportType) {
      setError("Please select a report type");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Find the selected report type config
      const reportTypeConfig = reportTypes.find(
        (rt) => rt.slug === selectedReportType
      );
      if (!reportTypeConfig) {
        throw new Error("Report type configuration not found");
      }

      // Parse CSV on frontend
      const parseResult = await parseCSVFile(file, reportTypeConfig, year);

      if (!parseResult.success || !parseResult.data) {
        throw new Error(parseResult.error || "Failed to parse CSV");
      }

      // Send parsed data to backend
      const result = await reportsService.bulkCreateReports(parseResult.data);

      const totalProcessed = result.created.length + result.updated.length;
      setMessage(
        `Successfully processed ${totalProcessed} months. ` +
          `Created: ${result.created.length}, Updated: ${result.updated.length}`
      );
      setFile(null);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Import failed. Please check your CSV format."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        Import Data
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload CSV File
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {[2024, 2025, 2026].map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  disabled={loadingReportTypes}
                >
                  {Array.isArray(reportTypes) &&
                    reportTypes.map((rt) => (
                      <MenuItem key={rt.slug} value={rt.slug}>
                        {rt.icon} {rt.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <Box
                {...getRootProps()}
                sx={{
                  border: "2px dashed",
                  borderColor: isDragActive ? "primary.main" : "grey.400",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: isDragActive ? "action.hover" : "background.paper",
                  mb: 2,
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body1">
                  {isDragActive
                    ? "Drop the file here"
                    : "Drag and drop a CSV file, or click to select"}
                </Typography>
                {file && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Selected: {file.name}
                  </Typography>
                )}
              </Box>

              {message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? <CircularProgress size={24} /> : "Upload"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CSV Format Example
              </Typography>

              {(() => {
                const selectedConfig = reportTypes.find(
                  (rt) => rt.slug === selectedReportType
                );
                if (!selectedConfig) return null;

                const isTransposed =
                  selectedConfig.parsing_config.format === "transposed";
                const fieldMappings =
                  selectedConfig.parsing_config.field_mappings || {};
                const fieldSchema = selectedConfig.field_schema || {};

                return isTransposed ? (
                  <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Transposed format:</strong> Rows = metrics, Columns = months (January-December)
                      <br />
                      <strong>Header Row:</strong> Row {selectedConfig.parsing_config.header_row + 1} (zero-indexed: {selectedConfig.parsing_config.header_row})
                      <br />
                      <strong>Data Start Row:</strong> Row {selectedConfig.parsing_config.data_start_row + 1} (zero-indexed: {selectedConfig.parsing_config.data_start_row})
                    </Alert>

                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        mb: 2,
                        maxHeight: 500,
                        overflowX: "auto",
                        overflowY: "auto",
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          "& .MuiTableCell-root": {
                            fontSize: "0.75rem",
                            padding: "6px 8px",
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow sx={{ bgcolor: "primary.main" }}>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                position: "sticky",
                                left: 0,
                                bgcolor: "primary.main",
                                zIndex: 2,
                              }}
                            >
                              Metric Name
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              January
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              February
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              March
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              April
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              May
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              June
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              July
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              August
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              September
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              October
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              November
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              December
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(fieldMappings).map(
                            ([fieldName]: [string, any], idx) => (
                              <TableRow
                                key={fieldName}
                                sx={{
                                  "&:nth-of-type(odd)": {
                                    bgcolor: "action.hover",
                                  },
                                }}
                              >
                                <TableCell
                                  sx={{
                                    fontWeight: "bold",
                                    bgcolor:
                                      idx % 2 === 0 ? "grey.50" : "grey.100",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 1,
                                  }}
                                >
                                  {fieldName}
                                </TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                                <TableCell>###</TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                      <strong>Format:</strong> Each row = one metric, Columns =
                      months (January to December)
                      <br />
                      <strong>Total Metrics:</strong>{" "}
                      {Object.keys(fieldMappings).length}
                    </Alert>
                  </>
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Normal format:</strong> Rows = months (1-12), Columns = metrics
                      <br />
                      <strong>Header Row:</strong> Row {selectedConfig.parsing_config.header_row + 1} (zero-indexed: {selectedConfig.parsing_config.header_row})
                      <br />
                      <strong>Data Start Row:</strong> Row {selectedConfig.parsing_config.data_start_row + 1} (zero-indexed: {selectedConfig.parsing_config.data_start_row})
                      <br />
                      <strong>Month Column:</strong> {selectedConfig.parsing_config.month_column_name}
                    </Alert>

                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        mb: 2,
                        maxHeight: 500,
                        overflowX: "auto",
                        overflowY: "auto",
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          "& .MuiTableCell-root": {
                            fontSize: "0.75rem",
                            padding: "6px 8px",
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow sx={{ bgcolor: "primary.main" }}>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                position: "sticky",
                                left: 0,
                                bgcolor: "primary.main",
                                zIndex: 2,
                              }}
                            >
                              Month
                            </TableCell>
                            {Object.entries(fieldMappings).map(
                              ([name]: [string, any]) => (
                                <TableCell
                                  key={name}
                                  sx={{ color: "white", fontWeight: "bold" }}
                                >
                                  {name}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                            (month, idx) => (
                              <TableRow
                                key={month}
                                sx={{
                                  "&:nth-of-type(odd)": {
                                    bgcolor: "action.hover",
                                  },
                                }}
                              >
                                <TableCell
                                  sx={{
                                    fontWeight: "bold",
                                    bgcolor:
                                      idx % 2 === 0 ? "grey.50" : "grey.100",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 1,
                                  }}
                                >
                                  {month}
                                </TableCell>
                                {Object.keys(fieldMappings).map(
                                  (_, fieldIdx) => (
                                    <TableCell key={fieldIdx}>###</TableCell>
                                  )
                                )}
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                      <strong>Format:</strong> Each row = one month (1-12)
                      <br />
                      <strong>Total Columns:</strong>{" "}
                      {Object.keys(fieldMappings).length}
                    </Alert>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
