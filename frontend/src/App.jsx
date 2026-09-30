import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/ui/PageLoader';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import NasiyaPage from './pages/NasiyaPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';
import POSPage from './pages/POSPage';
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader fullScreen text="Tizim yuklanmoqda..." />;
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Direct Server Error page */}
        <Route path="/500" element={<ServerErrorPage />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="nasiya" element={<NasiyaPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Catch-All Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
