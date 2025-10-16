import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get all purchase orders for a store
router.get('/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { status, limit = 50 } = req.query;
    
    let query = `
      SELECT po.*, e.name as requested_by_name, s.name as store_name,
        (SELECT COUNT(*) FROM purchase_order_items WHERE po_id = po.id) as items_count
      FROM purchase_orders po
      LEFT JOIN employees e ON po.requested_by = e.id
      LEFT JOIN stores s ON po.store_id = s.id
      WHERE po.store_id = $1
    `;
    const params = [storeId];
    
    if (status) {
      params.push(status);
      query += ` AND po.status = $${params.length}`;
    }
    
    params.push(limit);
    query += ` ORDER BY po.created_at DESC LIMIT $${params.length}`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Get single purchase order with items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const poResult = await pool.query(`
      SELECT po.*, e.name as requested_by_name, s.name as store_name
      FROM purchase_orders po
      LEFT JOIN employees e ON po.requested_by = e.id
      LEFT JOIN stores s ON po.store_id = s.id
      WHERE po.id = $1
    `, [id]);
    
    if (poResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    const itemsResult = await pool.query(`
      SELECT * FROM purchase_order_items WHERE po_id = $1
    `, [id]);
    
    res.json({
      ...poResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

// Create purchase order
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { storeId, items, notes, requestedBy } = req.body;
    
    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // Generate PO number
    const codeResult = await client.query(
      "SELECT po_number FROM purchase_orders WHERE store_id = $1 ORDER BY created_at DESC LIMIT 1",
      [storeId]
    );
    
    let newPoNumber;
    if (codeResult.rows.length > 0) {
      const lastCode = codeResult.rows[0].po_number;
      const lastNum = parseInt(lastCode.split('-')[1]);
      newPoNumber = `PO-${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      newPoNumber = 'PO-0001';
    }
    
    // Insert purchase order
    const poResult = await client.query(`
      INSERT INTO purchase_orders 
      (store_id, po_number, total_amount, status, notes, requested_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [storeId, newPoNumber, totalAmount, 'pending', notes, requestedBy]);
    
    const poId = poResult.rows[0].id;
    
    // Insert PO items and update central warehouse reserved stock
    for (const item of items) {
      await client.query(`
        INSERT INTO purchase_order_items 
        (po_id, product_id, product_name, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [poId, item.productId, item.productName, item.quantity, item.price, item.quantity * item.price]);
      
      // Update reserved stock in central warehouse
      await client.query(`
        UPDATE central_warehouse 
        SET reserved_stock = reserved_stock + $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2
      `, [item.quantity, item.productId]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      purchaseOrder: poResult.rows[0],
      message: 'Purchase order created successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: error.message || 'Failed to create purchase order' });
  } finally {
    client.release();
  }
});

// Update purchase order status
router.put('/:id/status', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Get PO details
    const poResult = await client.query(
      'SELECT * FROM purchase_orders WHERE id = $1',
      [id]
    );
    
    if (poResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    const po = poResult.rows[0];
    
    // Update PO status
    await client.query(`
      UPDATE purchase_orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [status, id]);
    
    // If status is 'received', update store inventory
    if (status === 'received') {
      const itemsResult = await client.query(
        'SELECT * FROM purchase_order_items WHERE po_id = $1',
        [id]
      );
      
      for (const item of itemsResult.rows) {
        // Update store inventory
        await client.query(`
          UPDATE inventory 
          SET stock = stock + $1, last_updated = CURRENT_TIMESTAMP
          WHERE store_id = $2 AND product_id = $3
        `, [item.quantity, po.store_id, item.product_id]);
        
        // Update central warehouse (reduce reserved, reduce total)
        await client.query(`
          UPDATE central_warehouse 
          SET reserved_stock = reserved_stock - $1, 
              total_stock = total_stock - $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2
        `, [item.quantity, item.product_id]);
        
        // Record stock movement
        await client.query(`
          INSERT INTO stock_movements 
          (store_id, product_id, type, quantity, reason)
          VALUES ($1, $2, 'in', $3, $4)
        `, [po.store_id, item.product_id, item.quantity, `PO Received: ${po.po_number}`]);
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: `Purchase order ${status} successfully`
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating purchase order status:', error);
    res.status(500).json({ error: error.message || 'Failed to update purchase order status' });
  } finally {
    client.release();
  }
});

export default router;
