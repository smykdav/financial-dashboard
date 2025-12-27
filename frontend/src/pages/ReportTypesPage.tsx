import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  CardActionArea,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { reportsService, ReportType } from '../services/reports.service';

export const ReportTypesPage: React.FC = () => {
  const navigate = useNavigate();
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);

  useEffect(() => {
    loadReportTypes();
  }, []);

  const loadReportTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const types = await reportsService.getReportTypes();
      setReportTypes(types);
    } catch (err: any) {
      setError('Failed to load report types');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReportType) return;

    try {
      await reportsService.deleteReportType(selectedReportType.slug);
      setDeleteDialogOpen(false);
      setSelectedReportType(null);
      loadReportTypes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete report type');
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    setDeleteDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Report Types
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : reportTypes.length === 0 ? (
        <Box sx={{ py: 8 }}>
          <Card sx={{
            maxWidth: 700,
            mx: 'auto',
            border: '2px solid',
            borderColor: 'info.main',
            bgcolor: 'info.light',
            color: 'info.contrastText'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <InfoIcon sx={{ fontSize: 40, color: 'info.main', flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    No Report Types Found
                  </Typography>
                  <Typography variant="body1" paragraph>
                    To get started with the system, you need to create report types on the backend.
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ mt: 2, mb: 1 }}>
                    Run the following command on the backend to create default report types:
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: 'grey.900',
                      color: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      mb: 2,
                      overflowX: 'auto'
                    }}
                  >
                    python manage.py seed_report_types
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    This command will create two report types: <strong>Delivery Report</strong> (📦) and <strong>Financial Report</strong> (💰)
                    with pre-configured fields and parsing configuration.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reportTypes.map((reportType) => (
            <Grid item xs={12} sm={6} lg={4} key={reportType.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => navigate(`/report-types/${reportType.slug}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5" component="span">
                          {reportType.icon}
                        </Typography>
                        <Typography variant="h6" component="span">
                          {reportType.name}
                        </Typography>
                      </Box>
                      {reportType.is_system && (
                        <Chip
                          icon={<LockIcon />}
                          label="System"
                          size="small"
                          color="default"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {reportType.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Format: ${reportType.parsing_config.format}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Fields: ${Object.keys(reportType.parsing_config.field_mappings || {}).length}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Slug: ${reportType.slug}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(reportType.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Report Type</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedReportType?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
