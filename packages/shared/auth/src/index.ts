// Basic Authentication Utilities for ERP System
// Simplified version for development setup

import * as crypto from 'crypto';

// Basic JWT-like token structure
export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  team: string;
  expiresAt: number;
}

// Simple JWT Manager
export class JWTManager {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.JWT_SECRET || 'dev_secret_change_in_production';
  }

  generateToken(userData: { id: string; email: string; role: string; team: string }): string {
    const payload: AuthToken = {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      team: userData.team,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.createSignature(encoded);
    return `${encoded}.${signature}`;
  }

  verifyToken(token: string): AuthToken | null {
    try {
      const [encoded, signature] = token.split('.');
      if (this.createSignature(encoded) !== signature) {
        return null;
      }

      const payload: AuthToken = JSON.parse(Buffer.from(encoded, 'base64').toString());
      
      if (payload.expiresAt < Date.now()) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  private createSignature(data: string): string {
    return crypto.createHmac('sha256', this.secret).update(data).digest('hex');
  }
}

// Simple Password Manager
export class PasswordManager {
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    } catch (error) {
      return false;
    }
  }

  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Permission definitions
export const TEAM_PERMISSIONS: Record<string, { resources: string[], actions: string[] }> = {
  team1: {
    resources: ['mobile-orders', 'customers', 'products'],
    actions: ['read', 'write']
  },
  team2: {
    resources: ['inventory', 'warehouse', 'purchase-orders'],
    actions: ['read', 'write', 'delete']
  },
  team3: {
    resources: ['accounts', 'transactions', 'financial-reports'],
    actions: ['read', 'write']
  },
  team4: {
    resources: ['ecommerce', 'online-orders', 'catalog'],
    actions: ['read', 'write']
  },
  team5: {
    resources: ['pos', 'store-analytics', 'local-inventory'],
    actions: ['read', 'write']
  },
  team6: {
    resources: ['crm', 'leads', 'customer-analytics'],
    actions: ['read', 'write', 'delete']
  },
  team7: {
    resources: ['employees', 'attendance', 'payroll'],
    actions: ['read', 'write', 'delete']
  }
};

// Permission Manager
export class PermissionManager {
  static hasPermission(team: string, resource: string, action: string): boolean {
    const teamPerms = TEAM_PERMISSIONS[team];
    if (!teamPerms) return false;

    return teamPerms.resources.includes(resource) && 
           teamPerms.actions.includes(action);
  }

  static getTeamPermissions(team: string) {
    return TEAM_PERMISSIONS[team] || { resources: [], actions: [] };
  }
}

// Role hierarchy
export const ROLE_HIERARCHY = {
  employee: 1,
  sales: 2,
  logistics: 2,
  finance: 2,
  crm: 2,
  hrd: 2,
  manager: 3,
  admin: 4
} as const;

// Role Manager
export class RoleManager {
  static hasHigherRole(userRole: string, requiredRole: string): boolean {
    const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0;
    return userLevel >= requiredLevel;
  }
}

// Authentication Middleware
export class AuthMiddleware {
  private jwtManager: JWTManager;

  constructor(jwtManager?: JWTManager) {
    this.jwtManager = jwtManager || new JWTManager();
  }

  authenticate(token: string): { user: AuthToken | null; error: string | null } {
    if (!token) {
      return { user: null, error: 'No authentication token provided' };
    }

    const user = this.jwtManager.verifyToken(token);
    if (!user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user, error: null };
  }

  authorize(user: AuthToken, resource: string, action: string): string | null {
    if (!PermissionManager.hasPermission(user.team, resource, action)) {
      return `Insufficient permissions for ${action} on ${resource}`;
    }
    return null;
  }
}

// Session Manager
export class SessionManager {
  private sessions = new Map<string, { userId: string; expiresAt: number }>();

  createSession(userId: string, durationMinutes: number = 60): string {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
    
    this.sessions.set(sessionId, { userId, expiresAt });
    return sessionId;
  }

  validateSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session.userId;
  }

  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}

// Utility functions
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000);
}