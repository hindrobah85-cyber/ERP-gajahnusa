import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get all transactions for a store
router.get('/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { search, paymentMethod, dateFrom, dateTo, limit = 100 } = req.query;
    
    let query = `
      SELECT t.*, e.name as cashier_name,
        (SELECT COUNT(*) FROM transaction_items WHERE transaction_id = t.id) as items_count
      FROM transactions t
      LEFT JOIN employees e ON t.cashier_id = e.id
      WHERE t.store_id = $1
    `;
    const params = [storeId];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.transaction_code ILIKE $${params.length} OR t.customer_name ILIKE $${params.length})`;
    }
    
    if (paymentMethod) {
      params.push(paymentMethod);
      query += ` AND t.payment_method = $${params.length}`;
    }
    
    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND DATE(t.created_at) >= $${params.length}`;
    }
    
    if (dateTo) {
      params.push(dateTo);
      query += ` AND DATE(t.created_at) <= $${params.length}`;
    }
    
    params.push(limit);
    query += ` ORDER BY t.created_at DESC LIMIT $${params.length}`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get single transaction with items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transactionResult = await pool.query(`
      SELECT t.*, e.name as cashier_name, s.name as store_name
      FROM transactions t
      LEFT JOIN employees e ON t.cashier_id = e.id
      LEFT JOIN stores s ON t.store_id = s.id
      WHERE t.id = $1
    `, [id]);
    
    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const itemsResult = await pool.query(`
      SELECT * FROM transaction_items WHERE transaction_id = $1
    `, [id]);
    
    res.json({
      ...transactionResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create transaction (POS sale)
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      storeId,
      customerName,
      items,
      paymentMethod,
      paymentReceived,
      cashierId
    } = req.body;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.11; // 11% PPN
    const total = subtotal + tax;
    const change = paymentReceived - total;
    
    // Generate transaction code
    const codeResult = await client.query(
      "SELECT transaction_code FROM transactions WHERE store_id = $1 ORDER BY created_at DESC LIMIT 1",
      [storeId]
    );
    
    let newCode;
    if (codeResult.rows.length > 0) {
      const lastCode = codeResult.rows[0].transaction_code;
      const lastNum = parseInt(lastCode.split('-')[1]);
      newCode = `TRX-${String(lastNum + 1).padStart(3, '0')}`;
    } else {
      newCode = 'TRX-001';
    }
    
    // Insert transaction
    const transactionResult = await client.query(`
      INSERT INTO transactions 
      (store_id, transaction_code, customer_name, subtotal, tax, total, 
       payment_method, payment_received, change_amount, cashier_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [storeId, newCode, customerName, subtotal, tax, total, 
        paymentMethod, paymentReceived, change, cashierId, 'completed']);
    
    const transactionId = transactionResult.rows[0].id;
    
    // Insert transaction items and update inventory
    for (const item of items) {
      // Insert item
      await client.query(`
        INSERT INTO transaction_items 
        (transaction_id, product_id, product_name, product_code, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [transactionId, item.id, item.name, item.code, item.quantity, item.price, item.quantity * item.price]);
      
      // Update inventory
      await client.query(`
        UPDATE inventory 
        SET stock = stock - $1, last_updated = CURRENT_TIMESTAMP
        WHERE store_id = $2 AND product_id = $3
      `, [item.quantity, storeId, item.id]);
      
      // Record stock movement
      await client.query(`
        INSERT INTO stock_movements 
        (store_id, product_id, type, quantity, reason, employee_id)
        VALUES ($1, $2, 'out', $3, $4, $5)
      `, [storeId, item.id, item.quantity, `Sale: ${newCode}`, cashierId]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      transaction: transactionResult.rows[0],
      message: 'Transaction completed successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  } finally {
    client.release();
  }
});

export default router;
