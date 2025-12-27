import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/common/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ViewDataPage } from './pages/ViewDataPage';
import { ImportDataPage } from './pages/ImportDataPage';
import { ReportTypesPage } from './pages/ReportTypesPage';
import { ReportTypeDetailPage } from './pages/ReportTypeDetailPage';
import { ReportDetailPage } from './pages/ReportDetailPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-data"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ViewDataPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-data/:year/:month"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/import"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ImportDataPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-types"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportTypesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-types/:slug"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportTypeDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
