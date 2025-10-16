import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get inventory for a specific store
router.get('/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { category, search, lowStock } = req.query;
    
    let query = `
      SELECT i.*, p.code, p.name, p.category, p.price, p.unit
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.store_id = $1
    `;
    const params = [storeId];
    
    if (category) {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.code ILIKE $${params.length})`;
    }
    
    if (lowStock === 'true') {
      query += ` AND i.stock < i.min_stock`;
    }
    
    query += ' ORDER BY p.category, p.name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Stock adjustment (in/out/adjust)
router.post('/adjust', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { storeId, productId, type, quantity, reason, employeeId } = req.body;
    
    // Get current stock
    const inventoryResult = await client.query(
      'SELECT stock FROM inventory WHERE store_id = $1 AND product_id = $2',
      [storeId, productId]
    );
    
    if (inventoryResult.rows.length === 0) {
      throw new Error('Inventory record not found');
    }
    
    const currentStock = inventoryResult.rows[0].stock;
    let newStock;
    
    switch (type) {
      case 'in':
        newStock = currentStock + quantity;
        break;
      case 'out':
        if (currentStock < quantity) {
          throw new Error('Insufficient stock');
        }
        newStock = currentStock - quantity;
        break;
      case 'adjust':
        newStock = quantity;
        break;
      default:
        throw new Error('Invalid adjustment type');
    }
    
    // Update inventory
    await client.query(
      'UPDATE inventory SET stock = $1, last_updated = CURRENT_TIMESTAMP WHERE store_id = $2 AND product_id = $3',
      [newStock, storeId, productId]
    );
    
    // Record stock movement
    await client.query(`
      INSERT INTO stock_movements (store_id, product_id, type, quantity, previous_stock, new_stock, reason, employee_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [storeId, productId, type, quantity, currentStock, newStock, reason, employeeId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      previousStock: currentStock,
      newStock,
      message: `Stock ${type} successful`
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adjusting inventory:', error);
    res.status(500).json({ error: error.message || 'Failed to adjust inventory' });
  } finally {
    client.release();
  }
});

// Get stock movements history
router.get('/movements/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { limit = 50 } = req.query;
    
    const result = await pool.query(`
      SELECT sm.*, p.code, p.name, e.name as employee_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN employees e ON sm.employee_id = e.id
      WHERE sm.store_id = $1
      ORDER BY sm.created_at DESC
      LIMIT $2
    `, [storeId, limit]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

export default router;
