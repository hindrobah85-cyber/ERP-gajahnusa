import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get central warehouse inventory
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = `
      SELECT cw.*, p.code, p.name, p.category, p.price, p.unit
      FROM central_warehouse cw
      JOIN products p ON cw.product_id = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.code ILIKE $${params.length})`;
    }
    
    query += ' ORDER BY p.category, p.name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching central warehouse:', error);
    res.status(500).json({ error: 'Failed to fetch central warehouse inventory' });
  }
});

// Get single central warehouse item
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const result = await pool.query(`
      SELECT cw.*, p.code, p.name, p.category, p.price, p.unit
      FROM central_warehouse cw
      JOIN products p ON cw.product_id = p.id
      WHERE cw.product_id = $1
    `, [productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in central warehouse' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching central warehouse item:', error);
    res.status(500).json({ error: 'Failed to fetch central warehouse item' });
  }
});

// Update central warehouse stock (for HQ use)
router.put('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { totalStock, reservedStock, supplier } = req.body;
    
    const result = await pool.query(`
      UPDATE central_warehouse 
      SET total_stock = $1, reserved_stock = $2, supplier = $3, 
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $4
      RETURNING *
    `, [totalStock, reservedStock, supplier, productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in central warehouse' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating central warehouse:', error);
    res.status(500).json({ error: 'Failed to update central warehouse' });
  }
});

export default router;
