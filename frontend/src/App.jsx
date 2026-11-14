import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import TransactionFormModal from './components/transactions/TransactionFormModal';
import { transactionService } from './services/transactionService';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading FinFlow...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />;
};

// Main Authenticated Layout
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [modalLoading, setModalLoading] = useState(false);

  const location = useLocation();

  // Determine page title based on path
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Financial Dashboard', subtitle: 'Real-time overview of your income, expenses, and savings' };
      case '/income':
        return { title: 'Income Management', subtitle: 'View, filter, and track all income streams' };
      case '/expenses':
        return { title: 'Expense Management', subtitle: 'Monitor, categorize, and control outgoing expenses' };
      case '/transactions':
        return { title: 'Transaction History', subtitle: 'Search, sort, filter, and export all financial records' };
      case '/reports':
        return { title: 'Reports & Analytics', subtitle: 'Deep dive cash flow trends and category charts' };
      default:
        return { title: 'FinFlow Finance', subtitle: 'Personal expense tracking' };
    }
  };

  const { title, subtitle } = getPageInfo();

  const handleOpenTransactionModal = (type = 'expense') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCreateTransaction = async (data) => {
    setModalLoading(true);
    try {
      await transactionService.createTransaction(data);
      setModalOpen(false);
      // Reload page or trigger re-fetch by dispatching an event
      window.dispatchEvent(new CustomEvent('transactionUpdated'));
      // In single-page apps, trigger small reload or let page hooks re-fetch
      window.location.reload();
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenNewTransaction={() => handleOpenTransactionModal('expense')}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewTransaction={handleOpenTransactionModal}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTransaction}
        initialType={modalType}
        loading={modalLoading}
      />
    </div>
  );
};

// Public Route Guard (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
