import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { User, LoginCredentials } from '@/types'
import { authAPI } from '@/services/authService'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case 'AUTH_LOGOUT':
      return initialState
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('finance_token')
      if (token) {
        try {
          const userData = await authAPI.validateToken(token)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: userData, token },
          })
        } catch (error) {
          localStorage.removeItem('finance_token')
          dispatch({ type: 'AUTH_FAILURE' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authAPI.login(credentials)
      localStorage.setItem('finance_token', response.token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      })
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('finance_token')
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  const refreshToken = async () => {
    const token = localStorage.getItem('finance_token')
    if (!token) {
      logout()
      return
    }

    try {
      const response = await authAPI.refreshToken(token)
      localStorage.setItem('finance_token', response.token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      })
    } catch (error) {
      logout()
      throw error
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}