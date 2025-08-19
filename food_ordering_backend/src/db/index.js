'use strict';

/**
 * Minimal database bootstrap:
 * - Reads env for DB connection details
 * - Creates a pooled connection using pg or mysql2
 * - Runs idempotent SQL migrations to ensure tables exist
 * - Exposes a simple query function
 *
 * We avoid large ORM dependencies and keep it lightweight.
 */

const fs = require('fs');
const path = require('path');

const {
  DB_CLIENT = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL = 'false',
} = process.env;

let client = null;
let pool = null;
let query = null;

/**
// PUBLIC_INTERFACE
 */
function getDbInfo() {
  /** Returns current DB client and database name for diagnostics. */
  return {
    client: DB_CLIENT,
    database: DB_NAME || '',
    host: DB_HOST || '',
  };
}

async function createPostgresPool() {
  const { Pool } = require('pg');
  const config = {
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 5432,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
  };
  const pgPool = new Pool(config);

  return {
    async query(text, params) {
      const res = await pgPool.query(text, params);
      return res;
    },
    async end() {
      await pgPool.end();
    },
    raw: pgPool,
  };
}

async function createMySqlPool() {
  const mysql = require('mysql2/promise');
  const pool = await mysql.createPool({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  return {
    async query(text, params) {
      const [rows] = await pool.query(text, params);
      // Normalize result shape similar to pg
      return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
    },
    async end() {
      await pool.end();
    },
    raw: pool,
  };
}

function readSqlFilesFrom(dir) {
  const abs = path.join(__dirname, 'migrations', dir);
  const exists = fs.existsSync(abs);
  if (!exists) return [];
  const files = fs
    .readdirSync(abs)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  return files.map((f) => ({
    name: f,
    sql: fs.readFileSync(path.join(abs, f), 'utf-8'),
  }));
}

async function runMigrations(db) {
  // We only run the '001_schema' create statements.
  const createFiles = readSqlFilesFrom('001_schema');
  for (const file of createFiles) {
    await db.query(file.sql);
  }
}

/**
 * Initialize DB connection and run migrations.
 * This should be called once during app startup.
 */
// PUBLIC_INTERFACE
async function initDb() {
  /** Initialize the database connection pool and run schema migrations. */
  if (pool) return { pool, query };

  const lower = (DB_CLIENT || 'postgres').toLowerCase();
  client = lower;

  if (!DB_NAME || !DB_USER || !DB_HOST) {
    console.warn('[DB] Missing environment variables. Database will not initialize. Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD');
    return null;
  }

  if (client === 'postgres' || client === 'pg') {
    pool = await createPostgresPool();
  } else if (client === 'mysql' || client === 'mysql2') {
    pool = await createMySqlPool();
  } else {
    throw new Error(`Unsupported DB_CLIENT: ${DB_CLIENT}`);
  }

  query = pool.query;

  // Ensure a minimal migration tracking table exists (no-op for now).
  await runMigrations(pool);

  console.log('[DB] Initialized with client:', client);
  return { pool, query };
}

/**
// PUBLIC_INTERFACE
 */
function getQuery() {
  /** Returns the query function after initDb has been called. */
  if (!query) {
    throw new Error('DB not initialized. Call initDb() first.');
  }
  return query;
}

module.exports = {
  initDb,
  getQuery,
  getDbInfo,
};

