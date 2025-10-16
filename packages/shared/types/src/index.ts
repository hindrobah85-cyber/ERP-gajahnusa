// Core Business Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  team: TeamName;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'sales' | 'finance' | 'logistics' | 'crm' | 'hrd';

export type TeamName = 'team1' | 'team2' | 'team3' | 'team4' | 'team5' | 'team6' | 'team7' | 'ml-hub';

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

// Product & Inventory Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  cost: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: Dimensions;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 'building_materials' | 'tools' | 'hardware' | 'electrical' | 'plumbing' | 'paint' | 'other';

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'm' | 'mm';
}

export interface Inventory {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStock: number;
  maxStock: number;
  location?: string;
  lastUpdated: Date;
}

// Customer & Sales Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: Address;
  customerType: CustomerType;
  creditLimit?: number;
  paymentTerms?: string;
  salesPersonId?: string;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerType = 'individual' | 'business' | 'contractor' | 'retailer';

export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Order & Transaction Types
export interface Order {
  id: string;
  customerId: string;
  salesPersonId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  deliveryAddress?: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderType = 'online' | 'offline' | 'mobile';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

// Financial Types
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  accountId: string;
  categoryId?: string;
  orderId?: string;
  customerId?: string;
  vendorId?: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  createdAt: Date;
  processedAt?: Date;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'digital_wallet';

// ML & Analytics Types
export interface MLPrediction {
  modelName: string;
  teamName: TeamName;
  inputData: Record<string, any>;
  prediction: any;
  confidence?: number;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface MLModel {
  name: string;
  version: string;
  team: TeamName;
  type: MLModelType;
  status: MLModelStatus;
  accuracy?: number;
  lastTrained: Date;
  deployedAt?: Date;
}

export type MLModelType = 'classification' | 'regression' | 'clustering' | 'recommendation' | 'forecasting';

export type MLModelStatus = 'training' | 'testing' | 'deployed' | 'deprecated';

// API Response Types
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

// Event Types for Microservices Communication
export interface DomainEvent {
  id: string;
  type: string;
  source: TeamName;
  timestamp: Date;
  data: Record<string, any>;
  version: string;
}

export interface OrderCreatedEvent extends DomainEvent {
  type: 'ORDER_CREATED';
  data: {
    orderId: string;
    customerId: string;
    items: OrderItem[];
    total: number;
    salesPersonId?: string;
  };
}

export interface InventoryUpdatedEvent extends DomainEvent {
  type: 'INVENTORY_UPDATED';
  data: {
    productId: string;
    warehouseId: string;
    oldQuantity: number;
    newQuantity: number;
    reason: string;
  };
}

export interface PaymentProcessedEvent extends DomainEvent {
  type: 'PAYMENT_PROCESSED';
  data: {
    transactionId: string;
    orderId?: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
  };
}

// Configuration Types
export interface ServiceConfig {
  name: string;
  port: number;
  host: string;
  database?: DatabaseConfig;
  redis?: RedisConfig;
  mlHub?: MLHubConfig;
}

export interface DatabaseConfig {
  type: 'postgres' | 'mysql' | 'mongodb' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface MLHubConfig {
  baseUrl: string;
  apiKey?: string;
  teamName: TeamName;
}

// Health Check Types
export interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  timestamp: Date;
  dependencies: DependencyStatus[];
  version: string;
}

export interface DependencyStatus {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}