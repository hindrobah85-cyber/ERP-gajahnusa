import pool from './database.js';

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Create stores table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        manager VARCHAR(255),
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        icon VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Stores table created');

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50),
        price DECIMAL(15, 2) NOT NULL,
        unit VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Products table created');

    // Create inventory table (store-specific stock)
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 10,
        max_stock INTEGER DEFAULT 1000,
        location VARCHAR(20),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(store_id, product_id)
      )
    `);
    console.log('✅ Inventory table created');

    // Create central_warehouse table
    await client.query(`
      CREATE TABLE IF NOT EXISTS central_warehouse (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        total_stock INTEGER DEFAULT 0,
        reserved_stock INTEGER DEFAULT 0,
        available_stock INTEGER GENERATED ALWAYS AS (total_stock - reserved_stock) STORED,
        supplier VARCHAR(255),
        last_restock TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id)
      )
    `);
    console.log('✅ Central warehouse table created');

    // Create employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        employee_code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(100),
        department VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        join_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Employees table created');

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        transaction_code VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255),
        subtotal DECIMAL(15, 2) NOT NULL,
        tax DECIMAL(15, 2) DEFAULT 0,
        total DECIMAL(15, 2) NOT NULL,
        payment_method VARCHAR(20),
        payment_received DECIMAL(15, 2),
        change_amount DECIMAL(15, 2) DEFAULT 0,
        cashier_id INTEGER REFERENCES employees(id),
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Transactions table created');

    // Create transaction_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id SERIAL PRIMARY KEY,
        transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name VARCHAR(255),
        product_code VARCHAR(50),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(15, 2) NOT NULL,
        subtotal DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Transaction items table created');

    // Create purchase_orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(15, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        requested_by INTEGER REFERENCES employees(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Purchase orders table created');

    // Create purchase_order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name VARCHAR(255),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(15, 2) NOT NULL,
        subtotal DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Purchase order items table created');

    // Create stock_movements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        type VARCHAR(20) NOT NULL,
        quantity INTEGER NOT NULL,
        previous_stock INTEGER,
        new_stock INTEGER,
        reason TEXT,
        employee_id INTEGER REFERENCES employees(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Stock movements table created');

    // Insert sample stores
    await client.query(`
      INSERT INTO stores (code, name, address, city, manager, phone, status, icon)
      VALUES
        ('JKT-01', 'Gajah Nusa Jakarta Pusat', 'Jl. Gatot Subroto No. 123', 'Jakarta', 'Budi Santoso', '021-5551234', 'active', '🏢'),
        ('BDG-01', 'Gajah Nusa Bandung', 'Jl. Asia Afrika No. 45', 'Bandung', 'Siti Rahayu', '022-4442345', 'active', '🏪'),
        ('SBY-01', 'Gajah Nusa Surabaya', 'Jl. Basuki Rahmat No. 78', 'Surabaya', 'Ahmad Wijaya', '031-3334567', 'active', '🏬'),
        ('SMG-01', 'Gajah Nusa Semarang', 'Jl. Pemuda No. 56', 'Semarang', 'Dewi Lestari', '024-8885678', 'active', '🏭')
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('✅ Sample stores inserted');

    // Insert sample products
    await client.query(`
      INSERT INTO products (code, name, category, price, unit, description)
      VALUES
        ('SMN-001', 'Semen Gajah 50kg', 'cement', 65000, 'sak', 'Semen berkualitas tinggi'),
        ('SMN-002', 'Semen Tiga Roda 50kg', 'cement', 62000, 'sak', 'Semen untuk bangunan umum'),
        ('BTA-001', 'Bata Merah Super', 'bricks', 1200, 'pcs', 'Bata merah berkualitas premium'),
        ('BTA-002', 'Batako Press', 'bricks', 3500, 'pcs', 'Batako press untuk dinding'),
        ('BSI-001', 'Besi Beton 10mm', 'steel', 95000, 'batang', 'Besi beton polos 10mm 12m'),
        ('BSI-002', 'Besi Hollow 4x4', 'steel', 125000, 'batang', 'Besi hollow galvanis'),
        ('KRM-001', 'Keramik Lantai 40x40', 'tiles', 45000, 'm2', 'Keramik lantai motif natural'),
        ('KRM-002', 'Keramik Dinding 25x40', 'tiles', 55000, 'm2', 'Keramik dinding glossy'),
        ('CAT-001', 'Cat Tembok Putih 25kg', 'paint', 385000, 'pail', 'Cat tembok interior/eksterior'),
        ('CAT-002', 'Cat Kayu & Besi 1kg', 'paint', 45000, 'kaleng', 'Cat kayu dan besi warna'),
        ('ALT-001', 'Obeng Set 6pcs', 'tools', 45000, 'set', 'Set obeng berbagai ukuran'),
        ('ALT-002', 'Palu Besi 500gr', 'tools', 35000, 'pcs', 'Palu dengan gagang kayu'),
        ('LST-001', 'Kabel NYA 2.5mm', 'electrical', 8500, 'meter', 'Kabel listrik standar SNI'),
        ('LST-002', 'Stop Kontak 3 Lubang', 'electrical', 15000, 'pcs', 'Stop kontak standar'),
        ('PLP-001', 'Pipa PVC 3 inch', 'plumbing', 45000, 'batang', 'Pipa PVC 3 inch 4m')
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('✅ Sample products inserted');

    // Insert sample inventory for store 1 (Jakarta)
    await client.query(`
      INSERT INTO inventory (store_id, product_id, stock, min_stock, max_stock, location)
      SELECT 1, id, 
        CASE 
          WHEN category = 'cement' THEN 150
          WHEN category = 'bricks' THEN 5000
          WHEN category = 'steel' THEN 80
          WHEN category = 'tiles' THEN 200
          WHEN category = 'paint' THEN 40
          ELSE 100
        END,
        CASE 
          WHEN category = 'cement' THEN 50
          WHEN category = 'bricks' THEN 1000
          ELSE 20
        END,
        CASE 
          WHEN category = 'cement' THEN 300
          WHEN category = 'bricks' THEN 10000
          ELSE 500
        END,
        CASE 
          WHEN category = 'cement' THEN 'A1-01'
          WHEN category = 'bricks' THEN 'B2-01'
          WHEN category = 'steel' THEN 'A1-02'
          WHEN category = 'tiles' THEN 'C3-01'
          WHEN category = 'paint' THEN 'C3-02'
          WHEN category = 'tools' THEN 'D4-01'
          WHEN category = 'electrical' THEN 'D4-02'
          ELSE 'D4-03'
        END
      FROM products
      ON CONFLICT (store_id, product_id) DO NOTHING
    `);
    console.log('✅ Sample inventory inserted');

    // Insert sample central warehouse data
    await client.query(`
      INSERT INTO central_warehouse (product_id, total_stock, reserved_stock, supplier, last_restock)
      SELECT id,
        CASE 
          WHEN category = 'cement' THEN 5000
          WHEN category = 'bricks' THEN 50000
          WHEN category = 'steel' THEN 2000
          WHEN category = 'tiles' THEN 8000
          WHEN category = 'paint' THEN 1500
          ELSE 3000
        END,
        CASE 
          WHEN category = 'cement' THEN 200
          WHEN category = 'bricks' THEN 2000
          ELSE 100
        END,
        CASE 
          WHEN category = 'cement' THEN 'PT Semen Indonesia'
          WHEN category = 'bricks' THEN 'CV Bata Jaya'
          WHEN category = 'steel' THEN 'PT Krakatau Steel'
          WHEN category = 'tiles' THEN 'PT Keramik Mulia'
          WHEN category = 'paint' THEN 'PT Cat Avian'
          ELSE 'PT General Supplier'
        END,
        CURRENT_TIMESTAMP - INTERVAL '5 days'
      FROM products
      ON CONFLICT (product_id) DO NOTHING
    `);
    console.log('✅ Sample central warehouse data inserted');

    // Insert sample employees
    await client.query(`
      INSERT INTO employees (store_id, employee_code, name, position, department, phone, email, status, join_date)
      VALUES
        (1, 'EMP-001', 'Budi Santoso', 'Store Manager', 'Management', '081234567890', 'budi@gajahnusa.com', 'active', '2023-01-15'),
        (1, 'EMP-002', 'Siti Nurhaliza', 'Sales Staff', 'Sales', '081234567891', 'siti@gajahnusa.com', 'active', '2023-03-20'),
        (1, 'EMP-003', 'Ahmad Rizki', 'Warehouse Staff', 'Warehouse', '081234567892', 'ahmad@gajahnusa.com', 'active', '2023-02-10'),
        (2, 'EMP-004', 'Dewi Kusuma', 'Cashier', 'Sales', '081234567893', 'dewi@gajahnusa.com', 'active', '2023-04-05'),
        (2, 'EMP-005', 'Hendra Gunawan', 'Logistics', 'Logistics', '081234567894', 'hendra@gajahnusa.com', 'active', '2023-05-12'),
        (3, 'EMP-006', 'Linda Marlina', 'Sales Supervisor', 'Sales', '081234567895', 'linda@gajahnusa.com', 'active', '2023-01-20')
      ON CONFLICT (employee_code) DO NOTHING
    `);
    console.log('✅ Sample employees inserted');

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run initialization
createTables()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Initialization failed:', err);
    process.exit(1);
  });
