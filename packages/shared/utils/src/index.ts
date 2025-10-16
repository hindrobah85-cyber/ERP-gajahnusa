import crypto from 'crypto';
import { format, parseISO, isValid } from 'date-fns';
import { cloneDeep, isEmpty, isEqual } from 'lodash';

// ID Generation Utilities
export class IDGenerator {
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static generateShortId(length: number = 8): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  static generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  static generateCustomerId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `CUST-${timestamp}-${random}`.toUpperCase();
  }

  static generateProductSKU(category: string, sequence: number): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const seqStr = sequence.toString().padStart(6, '0');
    return `${categoryCode}-${seqStr}`;
  }
}

// Date & Time Utilities
export class DateUtils {
  static formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : '';
  }

  static formatDateTime(date: Date | string): string {
    return this.formatDate(date, 'yyyy-MM-dd HH:mm:ss');
  }

  static formatCurrency(amount: number, currency: string = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Validation Utilities
export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static isValidSKU(sku: string): boolean {
    const skuRegex = /^[A-Z]{3}-[0-9]{6}$/;
    return skuRegex.test(sku);
  }

  static validateRequired(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateMinLength(value: string, minLength: number, fieldName: string): string | null {
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
  }

  static validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
    if (value.length > maxLength) {
      return `${fieldName} must not exceed ${maxLength} characters`;
    }
    return null;
  }

  static validatePositiveNumber(value: number, fieldName: string): string | null {
    if (value <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  }
}

// Data Transformation Utilities
export class DataUtils {
  static deepClone<T>(obj: T): T {
    return cloneDeep(obj);
  }

  static isEmpty(value: any): boolean {
    return isEmpty(value);
  }

  static isEqual(obj1: any, obj2: any): boolean {
    return isEqual(obj1, obj2);
  }

  static removeEmptyFields(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
    return result;
  }

  static groupBy<T>(array: T[], keyGetter: (item: T) => string): Record<string, T[]> {
    const result: Record<string, T[]> = {};
    array.forEach(item => {
      const key = keyGetter(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    });
    return result;
  }

  static paginate<T>(array: T[], page: number, limit: number): { data: T[], totalPages: number, currentPage: number } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
      data: array.slice(startIndex, endIndex),
      totalPages: Math.ceil(array.length / limit),
      currentPage: page
    };
  }
}

// Encryption & Security Utilities
export class SecurityUtils {
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  static generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .substring(0, 1000); // Limit length
  }
}

// Business Logic Utilities
export class BusinessUtils {
  static calculateTax(amount: number, taxRate: number = 0.11): number {
    return Math.round(amount * taxRate * 100) / 100;
  }

  static calculateDiscount(amount: number, discountPercentage: number): number {
    return Math.round(amount * (discountPercentage / 100) * 100) / 100;
  }

  static calculateTotal(subtotal: number, tax?: number, discount?: number): number {
    const finalTax = tax || 0;
    const finalDiscount = discount || 0;
    return Math.round((subtotal + finalTax - finalDiscount) * 100) / 100;
  }

  static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = Date.now().toString().slice(-6);
    return `INV-${year}${month}-${sequence}`;
  }

  static calculateInventoryValue(quantity: number, unitCost: number): number {
    return Math.round(quantity * unitCost * 100) / 100;
  }

  static determineStockLevel(current: number, min: number, max: number): 'low' | 'normal' | 'high' | 'overstock' {
    if (current <= min) return 'low';
    if (current > max) return 'overstock';
    if (current > max * 0.8) return 'high';
    return 'normal';
  }
}

// Error Handling Utilities
export class ErrorUtils {
  static createApiError(code: string, message: string, details?: Record<string, any>) {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    };
  }

  static formatValidationErrors(errors: string[]): string {
    return errors.join('; ');
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || error?.message?.includes('network');
  }
}

// Performance & Monitoring Utilities
export class PerformanceUtils {
  static measureExecutionTime<T>(fn: () => T, label?: string): { result: T, duration: number } {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (label) {
      console.log(`${label} executed in ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }

  static async measureAsyncExecutionTime<T>(fn: () => Promise<T>, label?: string): Promise<{ result: T, duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (label) {
      console.log(`${label} executed in ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }
}

// Export all utilities
export {
  IDGenerator,
  DateUtils,
  ValidationUtils,
  DataUtils,
  SecurityUtils,
  BusinessUtils,
  ErrorUtils,
  PerformanceUtils
};