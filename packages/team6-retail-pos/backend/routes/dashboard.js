import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get dashboard statistics for a store
router.get('/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { period = 'today' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case 'today':
        dateCondition = "DATE(created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateCondition = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateCondition = "created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      default:
        dateCondition = "DATE(created_at) = CURRENT_DATE";
    }
    
    // Total sales
    const salesResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total_sales,
        COUNT(*) as total_transactions,
        COALESCE(AVG(total), 0) as avg_transaction
      FROM transactions
      WHERE store_id = $1 AND ${dateCondition}
    `, [storeId]);
    
    // Unique customers
    const customersResult = await pool.query(`
      SELECT COUNT(DISTINCT customer_name) as unique_customers
      FROM transactions
      WHERE store_id = $1 AND customer_name IS NOT NULL AND ${dateCondition}
    `, [storeId]);
    
    // Sales by payment method
    const paymentMethodResult = await pool.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as total_amount
      FROM transactions
      WHERE store_id = $1 AND ${dateCondition}
      GROUP BY payment_method
    `, [storeId]);
    
    // Top selling products
    const topProductsResult = await pool.query(`
      SELECT 
        ti.product_code,
        ti.product_name,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.store_id = $1 AND ${dateCondition}
      GROUP BY ti.product_code, ti.product_name
      ORDER BY total_revenue DESC
      LIMIT 5
    `, [storeId]);
    
    // Sales by category
    const categoryResult = await pool.query(`
      SELECT 
        p.category,
        SUM(ti.subtotal) as total_revenue,
        SUM(ti.quantity) as total_quantity
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      JOIN products p ON ti.product_id = p.id
      WHERE t.store_id = $1 AND ${dateCondition}
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `, [storeId]);
    
    // Inventory summary
    const inventoryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock) as total_units,
        SUM(stock * p.price) as total_value,
        COUNT(CASE WHEN stock < min_stock THEN 1 END) as low_stock_items
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.store_id = $1
    `, [storeId]);
    
    // Recent transactions
    const recentResult = await pool.query(`
      SELECT t.*, e.name as cashier_name
      FROM transactions t
      LEFT JOIN employees e ON t.cashier_id = e.id
      WHERE t.store_id = $1
      ORDER BY t.created_at DESC
      LIMIT 5
    `, [storeId]);
    
    // Weekly sales trend
    const weeklySalesResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Day') as day_name,
        DATE(created_at) as date,
        SUM(total) as sales
      FROM transactions
      WHERE store_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Day')
      ORDER BY DATE(created_at)
    `, [storeId]);
    
    res.json({
      period,
      sales: salesResult.rows[0],
      customers: customersResult.rows[0],
      paymentMethods: paymentMethodResult.rows,
      topProducts: topProductsResult.rows,
      categories: categoryResult.rows,
      inventory: inventoryResult.rows[0],
      recentTransactions: recentResult.rows,
      weeklySales: weeklySalesResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get monthly comparison
router.get('/store/:storeId/monthly', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { months = 6 } = req.query;
    
    const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month_name,
        DATE_TRUNC('month', created_at) as month,
        SUM(total) as sales,
        COUNT(*) as transactions
      FROM transactions
      WHERE store_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon')
      ORDER BY DATE_TRUNC('month', created_at)
    `, [storeId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.status(500).json({ error: 'Failed to fetch monthly data' });
  }
});

export default router;
