import pg from 'pg'

const { Pool } = pg

// Singleton pool — prevents too many connections during Next.js hot reloads
if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

  global._pgPool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err)
  })
}

if (!global._pgPool.options.connectionString) {
  console.error('DATABASE_URL is not set. Please set process.env.DATABASE_URL to your Postgres connection string (e.g., postgres://user:pass@localhost:5432/dbname)')
}

const pool = global._pgPool

export const query = async (text, params) => {
  try {
    return await pool.query(text, params)
  } catch (error) {
    console.error('Database query failed:', error)
    throw error
  }
}
export default pool
