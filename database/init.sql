-- GAJAH NUSA ERP Database Initialization
-- PostgreSQL Database Schema for Anti-Fraud ERP System

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS ml_models;

-- Set search path
SET search_path TO public, analytics, ml_models;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'driver', 'finance', 'manager');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'verified');
CREATE TYPE order_status AS ENUM ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE nota_status AS ENUM ('draft', 'issued', 'paid', 'overdue', 'cancelled');
CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'delivered', 'failed', 'returned');

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'sales',
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    province VARCHAR(50),
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- days
    risk_score DECIMAL(5, 2) DEFAULT 0, -- ML fraud risk score
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'pcs',
    price DECIMAL(15, 2) NOT NULL,
    cost DECIMAL(15, 2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    sales_id UUID NOT NULL REFERENCES users(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status order_status DEFAULT 'draft',
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    fraud_score DECIMAL(5, 2) DEFAULT 0, -- ML fraud detection score
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    line_total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status payment_status DEFAULT 'pending',
    reference_number VARCHAR(100),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    fraud_probability DECIMAL(5, 4) DEFAULT 0, -- ML fraud probability
    risk_factors JSON, -- Array of detected risk factors
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales Visits table
CREATE TABLE sales_visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    visit_number VARCHAR(50) UNIQUE NOT NULL,
    sales_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purpose VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    photo_urls JSON, -- Array of photo URLs
    is_successful BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    driver_id UUID NOT NULL REFERENCES users(id),
    delivery_date DATE NOT NULL,
    status delivery_status DEFAULT 'pending',
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    estimated_distance DECIMAL(8, 2), -- in kilometers
    actual_distance DECIMAL(8, 2),
    estimated_time INTEGER, -- in minutes
    actual_time INTEGER,
    fuel_cost DECIMAL(10, 2),
    delivery_proof_url VARCHAR(255),
    recipient_name VARCHAR(100),
    recipient_signature_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ML Models table (for model versioning)
CREATE TABLE ml_models.models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- fraud_detection, demand_prediction, route_optimization
    file_path VARCHAR(255) NOT NULL,
    accuracy DECIMAL(5, 4),
    precision_score DECIMAL(5, 4),
    recall_score DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    training_data_size INTEGER,
    hyperparameters JSON,
    is_active BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, version)
);

-- Fraud Detection Logs table
CREATE TABLE analytics.fraud_detection_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL, -- payment, order, etc
    transaction_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(id),
    fraud_probability DECIMAL(5, 4) NOT NULL,
    risk_factors JSON,
    model_version VARCHAR(20),
    is_fraud BOOLEAN,
    investigated_by UUID REFERENCES users(id),
    investigation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Demand Predictions table
CREATE TABLE analytics.demand_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    prediction_date DATE NOT NULL,
    predicted_quantity INTEGER NOT NULL,
    confidence_score DECIMAL(5, 4),
    model_version VARCHAR(20),
    actual_quantity INTEGER, -- filled after actual sales
    accuracy_score DECIMAL(5, 4), -- calculated after actual data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, prediction_date)
);

-- Create indexes for performance
CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_risk_score ON customers(risk_score);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_sales ON orders(sales_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_fraud_score ON orders(fraud_score);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_fraud_probability ON payments(fraud_probability);
CREATE INDEX idx_sales_visits_sales ON sales_visits(sales_id);
CREATE INDEX idx_sales_visits_customer ON sales_visits(customer_id);
CREATE INDEX idx_sales_visits_date ON sales_visits(visit_date);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_date ON deliveries(delivery_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@gajahnusa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLF1HJ8vW6LfjCG', 'Administrator', 'admin');

-- Insert sample data for development
INSERT INTO products (product_code, name, description, category, price, cost, stock_quantity) VALUES
('PRD001', 'Produk A', 'Deskripsi Produk A', 'Kategori 1', 100000, 75000, 100),
('PRD002', 'Produk B', 'Deskripsi Produk B', 'Kategori 1', 150000, 112500, 50),
('PRD003', 'Produk C', 'Deskripsi Produk C', 'Kategori 2', 200000, 150000, 75);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gajahnusa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO gajahnusa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ml_models TO gajahnusa;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gajahnusa;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO gajahnusa;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ml_models TO gajahnusa;
