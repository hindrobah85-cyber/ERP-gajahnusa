import crypto from 'crypto';
import { format, parseISO, isValid } from 'date-fns';

// ID Generation Utilities
class IDGeneratorClass {
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
class DateUtilsClass {
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

  static addDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  }

  static getDaysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static isBusinessDay(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  static getNextBusinessDay(date: Date | string): Date {
    let nextDay = this.addDays(date, 1);
    while (!this.isBusinessDay(nextDay)) {
      nextDay = this.addDays(nextDay, 1);
    }
    return nextDay;
  }
}

// Validation Utilities
class ValidationUtilsClass {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
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
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateIdCard(idCard: string): boolean {
    const idRegex = /^[0-9]{16}$/;
    return idRegex.test(idCard);
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
}

// Data Processing Utilities
class DataUtilsClass {
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  static isEmpty(value: any): boolean {
    return value == null || value === '' || 
           (Array.isArray(value) && value.length === 0) || 
           (typeof value === 'object' && Object.keys(value).length === 0);
  }

  static isEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  static sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static flatten<T>(arrays: T[][]): T[] {
    return arrays.reduce((acc, val) => acc.concat(val), []);
  }

  static paginate<T>(array: T[], page: number, limit: number): {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  } {
    const total = array.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = array.slice(offset, offset + limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    };
  }
}

// Security Utilities
class SecurityUtilsClass {
  static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateApiKey(): string {
    return `erp_${crypto.randomBytes(16).toString('hex')}`;
  }
}

// Business Logic Utilities
class BusinessUtilsClass {
  static calculateTax(amount: number, taxRate: number): number {
    return amount * (taxRate / 100);
  }

  static calculateDiscount(price: number, discountPercent: number): number {
    return price * (discountPercent / 100);
  }

  static calculateTotal(subtotal: number, taxRate: number = 0, discountPercent: number = 0): number {
    const discount = this.calculateDiscount(subtotal, discountPercent);
    const afterDiscount = subtotal - discount;
    const tax = this.calculateTax(afterDiscount, taxRate);
    return afterDiscount + tax;
  }

  static formatCurrency(amount: number, currency: string = 'IDR', locale: string = 'id-ID'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static generateInvoiceNumber(prefix: string = 'INV'): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const day = new Date().getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}${day}-${random}`;
  }

  static calculateAge(birthDate: Date | string): number {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

// Error Handling Utilities
class ErrorUtilsClass {
  static createError(message: string, code?: string, statusCode?: number): Error {
    const error = new Error(message) as any;
    if (code) error.code = code;
    if (statusCode) error.statusCode = statusCode;
    return error;
  }

  static handleAsyncError<T>(promise: Promise<T>): Promise<[T | null, Error | null]> {
    return promise
      .then<[T, null]>((data: T) => [data, null])
      .catch<[null, Error]>((error: Error) => [null, error]);
  }

  static logError(error: Error, context?: string): void {
    console.error(`[${new Date().toISOString()}] ${context || 'Error'}:`, error);
  }
}

// Performance Utilities
class PerformanceUtilsClass {
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static measurePerformance<T>(
    func: () => T,
    label?: string
  ): { result: T; duration: number } {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    const duration = end - start;
    
    if (label) {
      console.log(`${label} took ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }
}

// Export all utilities
export const IDGenerator = IDGeneratorClass;
export const DateUtils = DateUtilsClass;
export const ValidationUtils = ValidationUtilsClass;
export const DataUtils = DataUtilsClass;
export const SecurityUtils = SecurityUtilsClass;
export const BusinessUtils = BusinessUtilsClass;
export const ErrorUtils = ErrorUtilsClass;
export const PerformanceUtils = PerformanceUtilsClass;

// Default export
export default {
  IDGenerator,
  DateUtils,
  ValidationUtils,
  DataUtils,
  SecurityUtils,
  BusinessUtils,
  ErrorUtils,
  PerformanceUtils
};