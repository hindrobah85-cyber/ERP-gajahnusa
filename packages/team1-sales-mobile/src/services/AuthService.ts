import AsyncStorage from '@react-native-async-storage/async-storage';
import { JWTManager, AuthToken } from '@erp/shared-auth';
import { createServiceClient, createDefaultServiceRegistry } from '@erp/shared-api-client';

export class AuthService {
  private static jwtManager = new JWTManager();
  private static serviceRegistry = createDefaultServiceRegistry();
  private static apiClient = createServiceClient('team1', this.serviceRegistry);

  static async login(email: string, password: string): Promise<boolean> {
    try {
      // In real implementation, this would call the authentication API
      // For now, using mock authentication
      const mockUser = {
        id: 'user-123',
        email,
        role: 'sales',
        team: 'team1'
      };

      const token = this.jwtManager.generateToken(mockUser);
      
      // Store token locally
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
      
      // Set token for API calls
      this.apiClient.setAuthToken?.(token);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      // Remove token from API client
      this.apiClient.removeAuthToken?.();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return false;

      // Verify token is still valid
      const authData = this.jwtManager.verifyToken(token);
      if (!authData) {
        await this.logout();
        return false;
      }

      // Set token for API calls
      this.apiClient.setAuthToken?.(token);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  static async getCurrentUser(): Promise<AuthToken | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return null;

      return this.jwtManager.verifyToken(token);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  static async refreshToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return false;

      // In real implementation, this would call refresh endpoint
      // For now, just check if current token is valid
      const authData = this.jwtManager.verifyToken(token);
      return !!authData;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
}