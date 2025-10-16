/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Categories table
    .createTable('categories', table => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('description', 1000);
      table.string('parent_category', 255);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    
    // Warehouses table
    .createTable('warehouses', table => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('code', 50).notNullable().unique();
      table.string('location', 500).notNullable();
      table.text('address');
      table.integer('manager_id').unsigned();
      table.integer('capacity');
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    
    // Inventory items table
    .createTable('inventory_items', table => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('sku', 100).notNullable().unique();
      table.text('description');
      table.integer('category_id').unsigned().references('id').inTable('categories');
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').notNullable();
      table.integer('quantity').notNullable().defaultTo(0);
      table.string('unit', 50).notNullable();
      table.decimal('unit_cost', 10, 2);
      table.decimal('selling_price', 10, 2);
      table.integer('reorder_level').defaultTo(0);
      table.integer('reorder_quantity').defaultTo(0);
      table.integer('supplier_id').unsigned();
      table.string('location', 255);
      table.string('barcode', 255);
      table.date('expiry_date');
      table.string('batch_number', 255);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    
    // Inventory movements table
    .createTable('inventory_movements', table => {
      table.increments('id').primary();
      table.integer('inventory_item_id').unsigned().references('id').inTable('inventory_items').notNullable();
      table.enum('movement_type', ['add', 'subtract', 'set', 'transfer']).notNullable();
      table.integer('quantity').notNullable();
      table.integer('previous_quantity').notNullable();
      table.integer('new_quantity').notNullable();
      table.string('reason', 500);
      table.integer('user_id').unsigned();
      table.integer('from_warehouse_id').unsigned().references('id').inTable('warehouses');
      table.integer('to_warehouse_id').unsigned().references('id').inTable('warehouses');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('inventory_movements')
    .dropTableIfExists('inventory_items')
    .dropTableIfExists('warehouses')
    .dropTableIfExists('categories');
};