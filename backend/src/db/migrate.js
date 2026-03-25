import 'dotenv/config'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pool from './index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8')

try {
  await pool.query(sql)
  console.log('✅ Database migration complete')
} catch (err) {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
} finally {
  await pool.end()
}
