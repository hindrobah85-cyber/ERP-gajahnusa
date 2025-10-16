import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporary interfaces for demo
interface AuthToken {
  token: string;
  expiresAt: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class AuthService {
  private static TOKEN_KEY = 'auth_token';

  static async login(email: string, password: string): Promise<boolean> {
    try {
      // Mock authentication - in real app, call API
      const mockUser: User = {
        id: '1',
        name: 'Sales Person',
        email: email,
        role: 'sales'
      };

      // Generate mock token
      const token = `mock_token_${Date.now()}`;
      const authToken: AuthToken = {
        token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      // Store token
      await AsyncStorage.setItem(this.TOKEN_KEY, JSON.stringify(authToken));
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async checkAuthStatus(): Promise<boolean> {
    try {
      const tokenData = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) {
        return false;
      }

      const authToken: AuthToken = JSON.parse(tokenData);
      
      // Check if token is expired
      if (Date.now() > authToken.expiresAt) {
        await this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const isAuthenticated = await this.checkAuthStatus();
      if (!isAuthenticated) {
        return null;
      }

      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      const tokenData = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) {
        return null;
      }

      const authToken: AuthToken = JSON.parse(tokenData);
      
      // Check if token is expired
      if (Date.now() > authToken.expiresAt) {
        await this.logout();
        return null;
      }

      return authToken.token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }
}