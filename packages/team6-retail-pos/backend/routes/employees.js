import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get all employees for a store
router.get('/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { department, search, status = 'active' } = req.query;
    
    let query = 'SELECT * FROM employees WHERE store_id = $1';
    const params = [storeId];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (department) {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR employee_code ILIKE $${params.length})`;
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    const {
      storeId,
      employeeCode,
      name,
      position,
      department,
      phone,
      email,
      status,
      joinDate
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO employees 
      (store_id, employee_code, name, position, department, phone, email, status, join_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [storeId, employeeCode, name, position, department, phone, email, status || 'active', joinDate]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, department, phone, email, status } = req.body;
    
    const result = await pool.query(`
      UPDATE employees 
      SET name = $1, position = $2, department = $3, phone = $4, 
          email = $5, status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [name, position, department, phone, email, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

export default router;
