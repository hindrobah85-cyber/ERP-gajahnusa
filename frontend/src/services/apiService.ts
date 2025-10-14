import axios, { AxiosInstance } from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async login(credentials: { username: string; password: string }) {
    return this.api.post('/auth/login', credentials);
  }

  async logout() {
    return this.api.post('/auth/logout');
  }

  async verifyToken() {
    return this.api.get('/auth/verify');
  }

  async register(userData: any) {
    return this.api.post('/auth/register', userData);
  }

  // User Management APIs
  async getUsers() {
    return this.api.get('/users');
  }

  async getUser(id: string) {
    return this.api.get(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.api.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return this.api.delete(`/users/${id}`);
  }

  // Customer APIs
  async getCustomers() {
    return this.api.get('/customers');
  }

  async getCustomer(id: string) {
    return this.api.get(`/customers/${id}`);
  }

  async createCustomer(customerData: any) {
    return this.api.post('/customers', customerData);
  }

  async updateCustomer(id: string, customerData: any) {
    return this.api.put(`/customers/${id}`, customerData);
  }

  // Order APIs
  async getOrders() {
    return this.api.get('/orders');
  }

  async getOrder(id: string) {
    return this.api.get(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.api.post('/orders', orderData);
  }

  async updateOrder(id: string, orderData: any) {
    return this.api.put(`/orders/${id}`, orderData);
  }

  // Payment APIs
  async getPayments() {
    return this.api.get('/payments');
  }

  async createPayment(paymentData: any) {
    return this.api.post('/payments', paymentData);
  }

  async verifyPayment(id: string, verificationData: any) {
    return this.api.post(`/payments/${id}/verify`, verificationData);
  }

  // Analytics APIs
  async getDashboardStats() {
    return this.api.get('/analytics/dashboard');
  }

  async getSalesAnalytics(period: string = '30d') {
    return this.api.get(`/analytics/sales?period=${period}`);
  }

  async getFraudAnalytics() {
    return this.api.get('/analytics/fraud');
  }

  // ML Prediction APIs
  async predictDemand(productId: string, period: number) {
    return this.api.post('/ml/predict-demand', { productId, period });
  }

  async detectFraud(transactionData: any) {
    return this.api.post('/ml/detect-fraud', transactionData);
  }

  async optimizeRoute(routeData: any) {
    return this.api.post('/ml/optimize-route', routeData);
  }

  // File Upload APIs
  async uploadFile(file: File, type: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Reports APIs
  async generateReport(reportType: string, params: any) {
    return this.api.post(`/reports/${reportType}`, params, {
      responseType: 'blob',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
