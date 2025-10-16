// Shared API Client for ERP System
// Provides standardized HTTP communication between services

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

// HTTP Client
export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}, timeout: number = 30000) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
    this.timeout = timeout;
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const url = config.url.startsWith('http') ? config.url : `${this.baseURL}${config.url}`;
    const headers = { ...this.defaultHeaders, ...config.headers };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.timeout);

      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: responseData.message || response.statusText,
            details: responseData
          },
          timestamp: new Date()
        };
      }

      return {
        success: true,
        data: responseData,
        timestamp: new Date()
      };

    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network request failed',
          details: { originalError: error.toString() }
        },
        timestamp: new Date()
      };
    }
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, headers });
  }

  async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, headers });
  }

  async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, headers });
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, headers });
  }

  async patch<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, headers });
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Service Discovery
export class ServiceRegistry {
  private services: Map<string, string> = new Map();

  register(serviceName: string, baseUrl: string): void {
    this.services.set(serviceName, baseUrl);
  }

  get(serviceName: string): string | undefined {
    return this.services.get(serviceName);
  }

  getAll(): Record<string, string> {
    return Object.fromEntries(this.services);
  }
}

// Team-specific API clients
export class TeamAPIClient {
  private httpClient: HttpClient;
  private teamName: string;

  constructor(teamName: string, serviceRegistry: ServiceRegistry, authToken?: string) {
    this.teamName = teamName;
    const baseUrl = serviceRegistry.get(teamName) || `http://localhost:8000`;
    
    this.httpClient = new HttpClient(baseUrl);
    if (authToken) {
      this.httpClient.setAuthToken(authToken);
    }
  }

  // Generic CRUD operations
  async getAll<T>(endpoint: string): Promise<ApiResponse<T[]>> {
    return this.httpClient.get<T[]>(`/api/${endpoint}`);
  }

  async getById<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    return this.httpClient.get<T>(`/api/${endpoint}/${id}`);
  }

  async create<T>(endpoint: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.httpClient.post<T>(`/api/${endpoint}`, data);
  }

  async update<T>(endpoint: string, id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.httpClient.put<T>(`/api/${endpoint}/${id}`, data);
  }

  async delete(endpoint: string, id: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/${endpoint}/${id}`);
  }

  // Pagination support
  async getPaginated<T>(endpoint: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return this.httpClient.get(`/api/${endpoint}?page=${page}&limit=${limit}`);
  }

  // Search support
  async search<T>(endpoint: string, query: string): Promise<ApiResponse<T[]>> {
    return this.httpClient.get<T[]>(`/api/${endpoint}/search?q=${encodeURIComponent(query)}`);
  }
}

// ML Hub API Client
export class MLHubClient {
  private httpClient: HttpClient;
  private teamName: string;

  constructor(teamName: string, baseUrl: string = 'http://localhost:9000', authToken?: string) {
    this.teamName = teamName;
    this.httpClient = new HttpClient(baseUrl);
    
    if (authToken) {
      this.httpClient.setAuthToken(authToken);
    }
  }

  async predict<T>(modelName: string, inputData: any): Promise<ApiResponse<T>> {
    return this.httpClient.post<T>(`/api/ml/${this.teamName}/${modelName}/predict`, {
      inputData,
      metadata: {
        timestamp: new Date().toISOString(),
        team: this.teamName
      }
    });
  }

  async getModel(modelName: string): Promise<ApiResponse<any>> {
    return this.httpClient.get(`/api/ml/${this.teamName}/${modelName}`);
  }

  async listModels(): Promise<ApiResponse<string[]>> {
    return this.httpClient.get(`/api/ml/${this.teamName}/models`);
  }

  async getModelMetrics(modelName: string): Promise<ApiResponse<any>> {
    return this.httpClient.get(`/api/ml/${this.teamName}/${modelName}/metrics`);
  }
}

// Event Bus Client for microservices communication
export class EventBusClient {
  private httpClient: HttpClient;

  constructor(baseUrl: string = 'http://localhost:8080', authToken?: string) {
    this.httpClient = new HttpClient(baseUrl);
    
    if (authToken) {
      this.httpClient.setAuthToken(authToken);
    }
  }

  async publish(eventType: string, data: any, source: string): Promise<ApiResponse<void>> {
    const event = {
      id: crypto.randomUUID(),
      type: eventType,
      source,
      timestamp: new Date().toISOString(),
      data,
      version: '1.0'
    };

    return this.httpClient.post<void>('/api/events/publish', event);
  }

  async subscribe(eventTypes: string[], callbackUrl: string): Promise<ApiResponse<{ subscriptionId: string }>> {
    return this.httpClient.post('/api/events/subscribe', {
      eventTypes,
      callbackUrl
    });
  }

  async unsubscribe(subscriptionId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete(`/api/events/subscribe/${subscriptionId}`);
  }
}

// Health Check Client
export class HealthCheckClient {
  private httpClient: HttpClient;

  constructor(baseUrl: string) {
    this.httpClient = new HttpClient(baseUrl);
  }

  async checkHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    uptime: number;
    version: string;
    dependencies: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    }>;
  }>> {
    return this.httpClient.get('/health');
  }
}

// Factory function to create service clients
export function createServiceClient(
  teamName: string, 
  serviceRegistry: ServiceRegistry, 
  authToken?: string
): TeamAPIClient {
  return new TeamAPIClient(teamName, serviceRegistry, authToken);
}

// Factory function to create ML client
export function createMLClient(
  teamName: string,
  baseUrl?: string,
  authToken?: string
): MLHubClient {
  return new MLHubClient(teamName, baseUrl, authToken);
}

// Default service registry with development URLs
export function createDefaultServiceRegistry(): ServiceRegistry {
  const registry = new ServiceRegistry();
  
  // Register default service endpoints
  registry.register('team1', 'http://localhost:8001'); // Sales Mobile
  registry.register('team2', 'http://localhost:8002'); // Logistics  
  registry.register('team3', 'http://localhost:8003'); // Finance
  registry.register('team4', 'http://localhost:8004'); // Online Sales
  registry.register('team5', 'http://localhost:8005'); // Offline Store
  registry.register('team6', 'http://localhost:8006'); // CRM
  registry.register('team7', 'http://localhost:8007'); // HRD
  registry.register('ml-hub', 'http://localhost:9000'); // ML Hub
  registry.register('api-gateway', 'http://localhost:8080'); // API Gateway
  
  return registry;
}