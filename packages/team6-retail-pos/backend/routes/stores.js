import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM stores ORDER BY code
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get single store
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM stores WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Create store
router.post('/', async (req, res) => {
  try {
    const { code, name, address, city, manager, phone, status, icon } = req.body;
    
    const result = await pool.query(`
      INSERT INTO stores (code, name, address, city, manager, phone, status, icon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [code, name, address, city, manager, phone, status || 'active', icon]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update store
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, manager, phone, status } = req.body;
    
    const result = await pool.query(`
      UPDATE stores 
      SET name = $1, address = $2, city = $3, manager = $4, phone = $5, 
          status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [name, address, city, manager, phone, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

export default router;
