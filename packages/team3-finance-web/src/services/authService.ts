import axios, { AxiosResponse } from 'axios'
import { LoginCredentials, AuthResponse, User } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finance_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finance_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  refreshToken: async (token: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/refresh', { token })
    return response.data
  },

  validateToken: async (token: string): Promise<User> => {
    const response: AxiosResponse<{ user: User }> = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data.user
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword })
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password })
  },
}

export default api