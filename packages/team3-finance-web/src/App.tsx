import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

import Layout from './components/Layout/Layout'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './contexts/AuthContext'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AccountsPage from './pages/accounts/AccountsPage'
import TransactionsPage from './pages/transactions/TransactionsPage'
import BudgetPage from './pages/budget/BudgetPage'
import ReportsPage from './pages/reports/ReportsPage'
import InvoicesPage from './pages/invoices/InvoicesPage'
import PaymentsPage from './pages/payments/PaymentsPage'
import TaxPage from './pages/tax/TaxPage'
import SettingsPage from './pages/settings/SettingsPage'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginPage />
          } 
        />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="accounts/*" element={<AccountsPage />} />
          <Route path="transactions/*" element={<TransactionsPage />} />
          <Route path="budget/*" element={<BudgetPage />} />
          <Route path="invoices/*" element={<InvoicesPage />} />
          <Route path="payments/*" element={<PaymentsPage />} />
          <Route path="reports/*" element={<ReportsPage />} />
          <Route path="tax/*" element={<TaxPage />} />
          <Route path="settings/*" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App