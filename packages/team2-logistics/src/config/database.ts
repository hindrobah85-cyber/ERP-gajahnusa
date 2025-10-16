import knex from 'knex';
import { logger } from '@/utils/logger';

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'erp_logistics',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

export const db = knex(config);

export async function connectDatabase(): Promise<void> {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ PostgreSQL database connected successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL database:', error);
    throw error;
  }
}

export default db;