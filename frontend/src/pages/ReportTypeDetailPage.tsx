import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Lock as LockIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { reportsService, ReportType } from '../services/reports.service';

export const ReportTypeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadReportType(slug);
    }
  }, [slug]);

  const loadReportType = async (slug: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await reportsService.getReportType(slug);
      setReportType(data);
    } catch (err: any) {
      setError('Failed to load report type details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !reportType) {
    return (
      <Box>
        <Alert severity="error">{error || 'Report type not found'}</Alert>
        <Button onClick={() => navigate('/report-types')} sx={{ mt: 2 }}>
          Back to Report Types
        </Button>
      </Box>
    );
  }

  const fieldMappings = reportType.parsing_config.field_mappings || {};
  const fieldSchema = reportType.field_schema || {};

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/report-types')}
        sx={{ mb: 2 }}
      >
        Back to Report Types
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h3">{reportType.icon}</Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">{reportType.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            {reportType.description}
          </Typography>
        </Box>
        {reportType.is_system && (
          <Chip icon={<LockIcon />} label="System" color="default" />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* CSV Format Example */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CSV Format Example
              </Typography>
              {reportType.parsing_config.format === 'transposed' ? (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Transposed format:</strong> Rows = metrics, Columns = months (January-December)
                    <br />
                    <strong>Header Row:</strong> Row {reportType.parsing_config.header_row + 1} (zero-indexed: {reportType.parsing_config.header_row})
                    <br />
                    <strong>Data Start Row:</strong> Row {reportType.parsing_config.data_start_row + 1} (zero-indexed: {reportType.parsing_config.data_start_row})
                  </Alert>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500, overflowX: 'auto', overflowY: 'auto' }}>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { fontSize: '0.75rem', padding: '6px 8px', whiteSpace: 'nowrap' } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', position: 'sticky', left: 0, bgcolor: 'primary.main', zIndex: 2 }}>
                            Metric Name
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>January</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>February</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>March</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>April</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>May</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>June</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>July</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>August</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>September</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>October</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>November</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>December</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(fieldMappings).map(([csvName, mapping]: [string, any], idx) => (
                          <TableRow key={csvName} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: idx % 2 === 0 ? 'grey.50' : 'grey.100', position: 'sticky', left: 0, zIndex: 1 }}>
                              {csvName}
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
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Normal format:</strong> Rows = months (1-12), Columns = metrics
                    <br />
                    <strong>Header Row:</strong> Row {reportType.parsing_config.header_row + 1} (zero-indexed: {reportType.parsing_config.header_row})
                    <br />
                    <strong>Data Start Row:</strong> Row {reportType.parsing_config.data_start_row + 1} (zero-indexed: {reportType.parsing_config.data_start_row})
                    <br />
                    <strong>Month Column:</strong> {reportType.parsing_config.month_column_name}
                  </Alert>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500, overflowX: 'auto', overflowY: 'auto' }}>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { fontSize: '0.75rem', padding: '6px 8px', whiteSpace: 'nowrap' } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', position: 'sticky', left: 0, bgcolor: 'primary.main', zIndex: 2 }}>
                            {reportType.parsing_config.month_column_name || 'Month'}
                          </TableCell>
                          {Object.entries(fieldMappings).map(([csvName]: [string, any]) => (
                            <TableCell key={csvName} sx={{ color: 'white', fontWeight: 'bold' }}>
                              {csvName}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month, idx) => (
                          <TableRow key={month} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: idx % 2 === 0 ? 'grey.50' : 'grey.100', position: 'sticky', left: 0, zIndex: 1 }}>
                              {month}
                            </TableCell>
                            {Object.keys(fieldMappings).map((_, fieldIdx) => (
                              <TableCell key={fieldIdx}>###</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* General Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Slug
                  </Typography>
                  <Typography variant="body1">{reportType.slug}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(reportType.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(reportType.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Parsing Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Parsing Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Format
                  </Typography>
                  <Typography variant="body1">
                    <Chip label={reportType.parsing_config.format} size="small" />
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Header Row
                  </Typography>
                  <Typography variant="body1">
                    Row {reportType.parsing_config.header_row}
                  </Typography>
                </Box>
                {reportType.parsing_config.data_start_row !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Data Start Row
                    </Typography>
                    <Typography variant="body1">
                      Row {reportType.parsing_config.data_start_row}
                    </Typography>
                  </Box>
                )}
                {reportType.parsing_config.month_column_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Month Column Name
                    </Typography>
                    <Typography variant="body1">
                      {reportType.parsing_config.month_column_name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Field Mappings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Field Mappings ({Object.keys(fieldMappings).length} fields)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>CSV Column Name</strong></TableCell>
                      <TableCell><strong>Field Name</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Label</strong></TableCell>
                      <TableCell><strong>Format</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(fieldMappings).map(([csvName, mapping]: [string, any]) => {
                      const schema = fieldSchema[mapping.field] || {};
                      return (
                        <TableRow key={csvName}>
                          <TableCell>{csvName}</TableCell>
                          <TableCell>
                            <code>{mapping.field}</code>
                          </TableCell>
                          <TableCell>
                            <Chip label={mapping.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{schema.label || '-'}</TableCell>
                          <TableCell>
                            <code>{schema.format || '-'}</code>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};
