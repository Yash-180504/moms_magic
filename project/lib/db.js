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

const pool = global._pgPool

export const query = (text, params) => pool.query(text, params)
export default pool
