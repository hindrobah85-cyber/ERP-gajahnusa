// Authentication types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'finance_manager' | 'accountant' | 'analyst' | 'viewer'
  permissions: string[]
  avatar?: string
  department: string
  createdAt: string
  lastLogin?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
  expiresIn: number
}

// Financial types
export interface Account {
  id: string
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  subtype: string
  balance: number
  parentId?: string
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  reference?: string
  totalAmount: number
  status: 'draft' | 'pending' | 'approved' | 'posted' | 'cancelled'
  entries: TransactionEntry[]
  attachments?: string[]
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionEntry {
  id: string
  accountId: string
  accountName: string
  debit: number
  credit: number
  description?: string
}

export interface Budget {
  id: string
  name: string
  period: 'monthly' | 'quarterly' | 'annually'
  year: number
  month?: number
  quarter?: number
  status: 'draft' | 'active' | 'closed'
  items: BudgetItem[]
  totalBudget: number
  totalActual: number
  variance: number
  createdAt: string
  updatedAt: string
}

export interface BudgetItem {
  id: string
  accountId: string
  accountName: string
  budgetAmount: number
  actualAmount: number
  variance: number
  variancePercent: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  issueDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  items: InvoiceItem[]
  notes?: string
  paymentTerms?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
}

export interface Payment {
  id: string
  paymentNumber: string
  type: 'received' | 'made'
  amount: number
  date: string
  method: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other'
  reference?: string
  description?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  accountId: string
  customerId?: string
  supplierId?: string
  invoiceId?: string
  billId?: string
  createdAt: string
  updatedAt: string
}

export interface TaxRecord {
  id: string
  taxType: 'sales' | 'purchase' | 'payroll' | 'income'
  period: string
  amount: number
  status: 'calculated' | 'filed' | 'paid'
  dueDate: string
  filedDate?: string
  paidDate?: string
  reference?: string
  details: TaxDetail[]
  createdAt: string
  updatedAt: string
}

export interface TaxDetail {
  id: string
  description: string
  taxableAmount: number
  taxRate: number
  taxAmount: number
}

// Report types
export interface FinancialReport {
  id: string
  type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance'
  name: string
  period: ReportPeriod
  data: any
  generatedAt: string
  generatedBy: string
}

export interface ReportPeriod {
  startDate: string
  endDate: string
  type: 'custom' | 'monthly' | 'quarterly' | 'annually'
}

// Dashboard types
export interface DashboardSummary {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  cashBalance: number
  accountsReceivable: number
  accountsPayable: number
  revenueGrowth: number
  expenseGrowth: number
}

export interface ChartData {
  name: string
  value: number
  date?: string
  category?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form types
export interface TransactionFormData {
  date: string
  description: string
  reference?: string
  entries: TransactionEntryFormData[]
}

export interface TransactionEntryFormData {
  accountId: string
  debit: number | string
  credit: number | string
  description?: string
}

export interface AccountFormData {
  code: string
  name: string
  type: string
  subtype: string
  parentId?: string
  description?: string
  isActive: boolean
}

export interface InvoiceFormData {
  customerId: string
  issueDate: string
  dueDate: string
  items: InvoiceItemFormData[]
  notes?: string
  paymentTerms?: string
}

export interface InvoiceItemFormData {
  productId?: string
  description: string
  quantity: number | string
  unitPrice: number | string
  taxRate: number | string
}

// Filter and search types
export interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  accountId?: string
  status?: string
  search?: string
}

export interface AccountFilters {
  type?: string
  isActive?: boolean
  search?: string
}

export interface InvoiceFilters {
  status?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Settings types
export interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  website?: string
  taxId?: string
  currency: string
  fiscalYearStart: string
  timezone: string
  logo?: string
}

export interface UserSettings {
  theme: 'light' | 'dark'
  language: string
  dateFormat: string
  numberFormat: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  invoiceReminders: boolean
  budgetAlerts: boolean
  paymentAlerts: boolean
}