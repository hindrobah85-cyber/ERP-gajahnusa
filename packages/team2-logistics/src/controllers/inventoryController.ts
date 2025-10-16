import { Request, Response } from 'express';
import { db } from '@/config/database';
import { logger } from '@/utils/logger';
import { inventoryQueue } from '@/config/queues';

// Get all inventory items with pagination and filtering
export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const category = req.query.category as string || '';
    const warehouseId = req.query.warehouseId as string || '';

    let query = db('inventory_items as i')
      .leftJoin('warehouses as w', 'i.warehouse_id', 'w.id')
      .leftJoin('categories as c', 'i.category_id', 'c.id')
      .select(
        'i.*',
        'w.name as warehouse_name',
        'c.name as category_name'
      );

    // Apply filters
    if (search) {
      query = query.where('i.name', 'ilike', `%${search}%`)
                  .orWhere('i.sku', 'ilike', `%${search}%`);
    }
    
    if (category) {
      query = query.where('c.name', 'ilike', `%${category}%`);
    }
    
    if (warehouseId) {
      query = query.where('i.warehouse_id', warehouseId);
    }

    // Get total count for pagination
    const totalQuery = query.clone();
    const total = await totalQuery.count('* as count').first();
    const totalItems = parseInt(total?.count as string) || 0;

    // Apply pagination
    const offset = (page - 1) * limit;
    const items = await query.offset(offset).limit(limit).orderBy('i.name');

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total: totalItems,
          pages: Math.ceil(totalItems / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching inventory items:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch inventory items' }
    });
  }
};

// Get single inventory item
export const getInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await db('inventory_items as i')
      .leftJoin('warehouses as w', 'i.warehouse_id', 'w.id')
      .leftJoin('categories as c', 'i.category_id', 'c.id')
      .select(
        'i.*',
        'w.name as warehouse_name',
        'w.location as warehouse_location',
        'c.name as category_name'
      )
      .where('i.id', id)
      .first();

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    logger.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch inventory item' }
    });
  }
};

// Create new inventory item
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const itemData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newItem] = await db('inventory_items')
      .insert(itemData)
      .returning('*');

    // Add to inventory processing queue
    await inventoryQueue.add('stock-update', {
      productId: newItem.id,
      quantity: newItem.quantity,
      operation: 'create'
    });

    logger.info(`New inventory item created: ${newItem.name} (ID: ${newItem.id})`);

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    logger.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create inventory item' }
    });
  }
};

// Update inventory item
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    const [updatedItem] = await db('inventory_items')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    logger.info(`Inventory item updated: ${updatedItem.name} (ID: ${updatedItem.id})`);

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    logger.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update inventory item' }
    });
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedCount = await db('inventory_items')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    logger.info(`Inventory item deleted: ID ${id}`);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete inventory item' }
    });
  }
};

// Update stock levels
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, operation, reason } = req.body; // operation: 'add', 'subtract', 'set'

    const trx = await db.transaction();

    try {
      // Get current item
      const item = await trx('inventory_items')
        .where('id', id)
        .first();

      if (!item) {
        await trx.rollback();
        return res.status(404).json({
          success: false,
          error: { message: 'Inventory item not found' }
        });
      }

      // Calculate new quantity
      let newQuantity = item.quantity;
      switch (operation) {
        case 'add':
          newQuantity += quantity;
          break;
        case 'subtract':
          newQuantity -= quantity;
          break;
        case 'set':
          newQuantity = quantity;
          break;
        default:
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: { message: 'Invalid operation' }
          });
      }

      // Ensure quantity doesn't go below zero
      if (newQuantity < 0) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: { message: 'Insufficient stock' }
        });
      }

      // Update inventory item
      const [updatedItem] = await trx('inventory_items')
        .where('id', id)
        .update({
          quantity: newQuantity,
          updated_at: new Date()
        })
        .returning('*');

      // Record inventory movement
      await trx('inventory_movements').insert({
        inventory_item_id: id,
        movement_type: operation,
        quantity: quantity,
        previous_quantity: item.quantity,
        new_quantity: newQuantity,
        reason: reason || 'Manual adjustment',
        created_at: new Date()
      });

      await trx.commit();

      // Add to processing queue for reorder check
      await inventoryQueue.add('reorder-check', {
        productId: id
      });

      logger.info(`Stock updated for item ${id}: ${item.quantity} -> ${newQuantity}`);

      res.json({
        success: true,
        data: updatedItem
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update stock' }
    });
  }
};

// Get low stock items
export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const items = await db('inventory_items as i')
      .leftJoin('warehouses as w', 'i.warehouse_id', 'w.id')
      .leftJoin('categories as c', 'i.category_id', 'c.id')
      .select(
        'i.*',
        'w.name as warehouse_name',
        'c.name as category_name'
      )
      .whereRaw('i.quantity <= i.reorder_level')
      .orderBy('i.quantity', 'asc');

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch low stock items' }
    });
  }
};

// Get inventory movements history
export const getInventoryMovements = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const itemId = req.query.itemId as string;

    let query = db('inventory_movements as im')
      .leftJoin('inventory_items as i', 'im.inventory_item_id', 'i.id')
      .select(
        'im.*',
        'i.name as item_name',
        'i.sku as item_sku'
      );

    if (itemId) {
      query = query.where('im.inventory_item_id', itemId);
    }

    const offset = (page - 1) * limit;
    const movements = await query
      .offset(offset)
      .limit(limit)
      .orderBy('im.created_at', 'desc');

    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    logger.error('Error fetching inventory movements:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch inventory movements' }
    });
  }
};