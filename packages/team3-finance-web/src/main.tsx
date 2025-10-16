import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { FinanceProvider } from './contexts/FinanceContext'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <SnackbarProvider 
              maxSnack={3}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <AuthProvider>
                <FinanceProvider>
                  <App />
                </FinanceProvider>
              </AuthProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)