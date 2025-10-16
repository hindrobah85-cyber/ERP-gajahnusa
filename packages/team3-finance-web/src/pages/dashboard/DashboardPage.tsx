import React, { useEffect, useState } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
  Button,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  Payment,
  Assessment,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

import { useFinance } from '@/contexts/FinanceContext'
import { DashboardSummary, ChartData } from '@/types'

// Mock data for demo
const mockSummary: DashboardSummary = {
  totalRevenue: 1250000,
  totalExpenses: 850000,
  netIncome: 400000,
  cashBalance: 2100000,
  accountsReceivable: 350000,
  accountsPayable: 280000,
  revenueGrowth: 12.5,
  expenseGrowth: 8.3,
}

const mockRevenueData: ChartData[] = [
  { name: 'Jan', value: 95000 },
  { name: 'Feb', value: 105000 },
  { name: 'Mar', value: 115000 },
  { name: 'Apr', value: 108000 },
  { name: 'May', value: 125000 },
  { name: 'Jun', value: 135000 },
]

const mockExpenseData: ChartData[] = [
  { name: 'Salaries', value: 350000 },
  { name: 'Rent', value: 120000 },
  { name: 'Utilities', value: 45000 },
  { name: 'Marketing', value: 85000 },
  { name: 'Equipment', value: 95000 },
  { name: 'Others', value: 155000 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  growth?: number
  prefix?: string
  suffix?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  growth, 
  prefix = '$', 
  suffix = '' 
}) => {
  const theme = useTheme()
  
  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${prefix}${(val / 1000000).toFixed(1)}M${suffix}`
    } else if (val >= 1000) {
      return `${prefix}${(val / 1000).toFixed(1)}K${suffix}`
    }
    return `${prefix}${val.toLocaleString()}${suffix}`
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {formatValue(value)}
            </Typography>
            {growth !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {growth > 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={growth > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {growth > 0 ? '+' : ''}{growth}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 1, 
              bgcolor: theme.palette.primary.main + '20', 
              borderRadius: 1 
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const DashboardPage: React.FC = () => {
  const { dashboardSummary, updateDashboardSummary, setLoading, loading } = useFinance()
  const theme = useTheme()

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      updateDashboardSummary(mockSummary)
      setLoading(false)
    }, 1000)
  }, [updateDashboardSummary, setLoading])

  if (loading || !dashboardSummary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Dashboard
        </Typography>
        <Button variant="outlined" startIcon={<Assessment />}>
          Generate Report
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={dashboardSummary.totalRevenue}
            icon={<TrendingUp color="primary" />}
            growth={dashboardSummary.revenueGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Expenses"
            value={dashboardSummary.totalExpenses}
            icon={<Receipt color="primary" />}
            growth={dashboardSummary.expenseGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Net Income"
            value={dashboardSummary.netIncome}
            icon={<AccountBalance color="primary" />}
            growth={(dashboardSummary.revenueGrowth - dashboardSummary.expenseGrowth)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cash Balance"
            value={dashboardSummary.cashBalance}
            icon={<Payment color="primary" />}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend (Last 6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expense Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockExpenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Comparison */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue vs Expenses
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockRevenueData.map((item, index) => ({
                ...item,
                expenses: mockExpenseData.reduce((acc, exp) => acc + exp.value, 0) / 6,
                revenue: item.value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`, 
                    name === 'revenue' ? 'Revenue' : 'Expenses'
                  ]} 
                />
                <Legend />
                <Bar dataKey="revenue" fill={theme.palette.primary.main} name="revenue" />
                <Bar dataKey="expenses" fill={theme.palette.error.main} name="expenses" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Accounts Receivable:</Typography>
              <Typography fontWeight="bold">
                ${dashboardSummary.accountsReceivable.toLocaleString()}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Accounts Payable:</Typography>
              <Typography fontWeight="bold">
                ${dashboardSummary.accountsPayable.toLocaleString()}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Net Receivables:</Typography>
              <Typography fontWeight="bold" color="primary">
                ${(dashboardSummary.accountsReceivable - dashboardSummary.accountsPayable).toLocaleString()}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography>Profit Margin:</Typography>
              <Typography fontWeight="bold" color="success.main">
                {((dashboardSummary.netIncome / dashboardSummary.totalRevenue) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Today, 10:30 AM
              </Typography>
              <Typography>
                Payment received: $15,000 from Client ABC
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Yesterday, 3:45 PM
              </Typography>
              <Typography>
                Invoice #INV-2024-001 sent to Client XYZ
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Yesterday, 11:20 AM
              </Typography>
              <Typography>
                Expense recorded: $2,500 for office supplies
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                2 days ago, 2:15 PM
              </Typography>
              <Typography>
                Budget updated for Q4 2024
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage