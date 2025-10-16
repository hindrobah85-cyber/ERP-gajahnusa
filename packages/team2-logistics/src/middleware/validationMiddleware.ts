import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '@/utils/logger';

const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: error.details.map(detail => detail.message)
        }
      });
    }
    
    next();
  };
};

// Inventory item validation schema
const inventoryItemSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  sku: Joi.string().required().min(1).max(100),
  description: Joi.string().allow('').max(1000),
  category_id: Joi.number().integer().positive(),
  warehouse_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(0).required(),
  unit: Joi.string().required().max(50),
  unit_cost: Joi.number().precision(2).min(0),
  selling_price: Joi.number().precision(2).min(0),
  reorder_level: Joi.number().integer().min(0),
  reorder_quantity: Joi.number().integer().min(0),
  supplier_id: Joi.number().integer().positive(),
  location: Joi.string().max(255),
  barcode: Joi.string().max(255),
  expiry_date: Joi.date().allow(null),
  batch_number: Joi.string().max(255).allow(''),
  is_active: Joi.boolean().default(true)
});

// Stock update validation schema
const stockUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  operation: Joi.string().valid('add', 'subtract', 'set').required(),
  reason: Joi.string().max(500).allow('')
});

// Warehouse validation schema
const warehouseSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  code: Joi.string().required().min(1).max(50),
  location: Joi.string().required().max(500),
  address: Joi.string().max(1000),
  manager_id: Joi.number().integer().positive(),
  capacity: Joi.number().integer().min(0),
  is_active: Joi.boolean().default(true)
});

// Shipment validation schema
const shipmentSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  warehouse_id: Joi.number().integer().positive().required(),
  carrier: Joi.string().required().max(255),
  tracking_number: Joi.string().max(255),
  shipping_method: Joi.string().required().max(100),
  estimated_delivery: Joi.date().required(),
  shipping_cost: Joi.number().precision(2).min(0),
  recipient_name: Joi.string().required().max(255),
  recipient_phone: Joi.string().max(50),
  shipping_address: Joi.object({
    street: Joi.string().required().max(500),
    city: Joi.string().required().max(100),
    state: Joi.string().required().max(100),
    postal_code: Joi.string().required().max(20),
    country: Joi.string().required().max(100)
  }).required(),
  items: Joi.array().items(
    Joi.object({
      inventory_item_id: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required()
});

export const validateInventoryItem = validate(inventoryItemSchema);
export const validateStockUpdate = validate(stockUpdateSchema);
export const validateWarehouse = validate(warehouseSchema);
export const validateShipment = validate(shipmentSchema);