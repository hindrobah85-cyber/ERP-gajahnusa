import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { DashboardSummary } from '@/types'

interface FinanceState {
  dashboardSummary: DashboardSummary | null
  selectedPeriod: {
    startDate: string
    endDate: string
  }
  currency: string
  loading: boolean
}

interface FinanceContextType extends FinanceState {
  updateDashboardSummary: (summary: DashboardSummary) => void
  updatePeriod: (period: { startDate: string; endDate: string }) => void
  setCurrency: (currency: string) => void
  setLoading: (loading: boolean) => void
}

type FinanceAction =
  | { type: 'UPDATE_DASHBOARD_SUMMARY'; payload: DashboardSummary }
  | { type: 'UPDATE_PERIOD'; payload: { startDate: string; endDate: string } }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: FinanceState = {
  dashboardSummary: null,
  selectedPeriod: {
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
  currency: 'USD',
  loading: false,
}

const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'UPDATE_DASHBOARD_SUMMARY':
      return { ...state, dashboardSummary: action.payload }
    case 'UPDATE_PERIOD':
      return { ...state, selectedPeriod: action.payload }
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

interface FinanceProviderProps {
  children: ReactNode
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState)

  const updateDashboardSummary = (summary: DashboardSummary) => {
    dispatch({ type: 'UPDATE_DASHBOARD_SUMMARY', payload: summary })
  }

  const updatePeriod = (period: { startDate: string; endDate: string }) => {
    dispatch({ type: 'UPDATE_PERIOD', payload: period })
  }

  const setCurrency = (currency: string) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const value: FinanceContextType = {
    ...state,
    updateDashboardSummary,
    updatePeriod,
    setCurrency,
    setLoading,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}