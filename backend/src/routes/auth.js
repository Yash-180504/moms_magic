import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

function safeUser(user) {
  const { password_hash, ...rest } = user
  return rest
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'customer' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' })
    }
    if (!['customer', 'provider'].includes(role)) {
      return res.status(400).json({ error: 'role must be customer or provider' })
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const result = await query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, password_hash, phone || null, role]
    )

    const user = result.rows[0]
    const token = signToken(user)

    res.status(201).json({ token, user: safeUser(user) })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user)
    res.json({ token, user: safeUser(user) })
  } catch (err) {
    next(err)
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.userId])
    const user = result.rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: safeUser(user) })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/auth/me — update profile
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, phone, avatar_url } = req.body
    const result = await query(
      `UPDATE users SET
        name       = COALESCE($1, name),
        phone      = COALESCE($2, phone),
        avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4 RETURNING *`,
      [name || null, phone || null, avatar_url || null, req.userId]
    )
    res.json({ user: safeUser(result.rows[0]) })
  } catch (err) {
    next(err)
  }
})

export default router
