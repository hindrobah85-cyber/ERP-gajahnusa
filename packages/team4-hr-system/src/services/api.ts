import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8004/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hr_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hr_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },
  getCurrentUser: async () => {
    const { data } = await apiClient.get('/auth/me')
    return data
  }
}

export const employeeAPI = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get('/employees', { params })
    return data
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/employees/${id}`)
    return data
  },
  create: async (employee: any) => {
    const { data } = await apiClient.post('/employees', employee)
    return data
  },
  update: async (id: string, employee: any) => {
    const { data } = await apiClient.put(`/employees/${id}`, employee)
    return data
  },
  delete: async (id: string) => {
    const { data} = await apiClient.delete(`/employees/${id}`)
    return data
  }
}

export const attendanceAPI = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get('/attendance', { params })
    return data
  },
  checkIn: async (employeeId: string) => {
    const { data } = await apiClient.post('/attendance/check-in', { employeeId })
    return data
  },
  checkOut: async (employeeId: string) => {
    const { data } = await apiClient.post('/attendance/check-out', { employeeId })
    return data
  },
  getReport: async (params: any) => {
    const { data } = await apiClient.get('/attendance/report', { params })
    return data
  }
}

export const payrollAPI = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get('/payroll', { params })
    return data
  },
  generate: async (period: string) => {
    const { data } = await apiClient.post('/payroll/generate', { period })
    return data
  },
  approve: async (id: string) => {
    const { data } = await apiClient.post(`/payroll/${id}/approve`)
    return data
  },
  process: async (id: string) => {
    const { data } = await apiClient.post(`/payroll/${id}/process`)
    return data
  }
}

export const leaveAPI = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get('/leave', { params })
    return data
  },
  create: async (leave: any) => {
    const { data } = await apiClient.post('/leave', leave)
    return data
  },
  approve: async (id: string, approved: boolean, note?: string) => {
    const { data } = await apiClient.post(`/leave/${id}/approve`, { approved, note })
    return data
  }
}

export const performanceAPI = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get('/performance', { params })
    return data
  },
  create: async (review: any) => {
    const { data } = await apiClient.post('/performance', review)
    return data
  },
  update: async (id: string, review: any) => {
    const { data } = await apiClient.put(`/performance/${id}`, review)
    return data
  }
}

export default apiClient