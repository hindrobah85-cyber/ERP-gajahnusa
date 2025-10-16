/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Shipments table
    .createTable('shipments', table => {
      table.increments('id').primary();
      table.integer('order_id').unsigned().notNullable();
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').notNullable();
      table.string('tracking_number', 255).unique();
      table.string('carrier', 255).notNullable();
      table.string('shipping_method', 100).notNullable();
      table.enum('status', ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled']).defaultTo('pending');
      table.datetime('estimated_delivery').notNullable();
      table.datetime('actual_delivery');
      table.decimal('shipping_cost', 10, 2);
      table.string('recipient_name', 255).notNullable();
      table.string('recipient_phone', 50);
      table.json('shipping_address').notNullable();
      table.text('notes');
      table.timestamps(true, true);
    })
    
    // Shipment items table
    .createTable('shipment_items', table => {
      table.increments('id').primary();
      table.integer('shipment_id').unsigned().references('id').inTable('shipments').onDelete('CASCADE').notNullable();
      table.integer('inventory_item_id').unsigned().references('id').inTable('inventory_items').notNullable();
      table.integer('quantity').notNullable();
      table.decimal('unit_price', 10, 2);
      table.timestamps(true, true);
    })
    
    // Tracking events table
    .createTable('tracking_events', table => {
      table.increments('id').primary();
      table.integer('shipment_id').unsigned().references('id').inTable('shipments').onDelete('CASCADE').notNullable();
      table.enum('status', ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception']).notNullable();
      table.string('location', 500);
      table.text('description');
      table.datetime('event_time').notNullable();
      table.json('metadata');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('tracking_events')
    .dropTableIfExists('shipment_items')
    .dropTableIfExists('shipments');
};