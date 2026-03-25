import { Router } from 'express'
import { query } from '../db/index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// ── List all active providers (public) ───────────────────────────────────
// GET /api/providers?city=&search=&veg=&nonveg=
router.get('/', async (req, res, next) => {
  try {
    const { city, search, veg, nonveg } = req.query

    const conditions = ['p.is_active = TRUE']
    const params = []

    if (city) {
      params.push(`%${city}%`)
      conditions.push(`p.city ILIKE $${params.length}`)
    }
    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(p.kitchen_name ILIKE $${params.length} OR p.location ILIKE $${params.length} OR p.description ILIKE $${params.length})`)
    }
    if (veg === 'true') conditions.push('p.is_veg = TRUE')
    if (nonveg === 'true') conditions.push('p.is_nonveg = TRUE')

    const where = conditions.join(' AND ')

    const result = await query(
      `SELECT p.*,
              u.name  AS owner_name,
              u.email AS owner_email
       FROM providers p
       JOIN users u ON u.id = p.user_id
       WHERE ${where}
       ORDER BY p.rating DESC, p.total_orders DESC`,
      params
    )

    res.json({ providers: result.rows })
  } catch (err) {
    next(err)
  }
})

// ── Get single provider (public) ─────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, u.name AS owner_name, u.email AS owner_email
       FROM providers p JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Provider not found' })
    res.json({ provider: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// ── Get provider for the logged-in provider user ──────────────────────────
router.get('/me/profile', requireAuth, requireRole('provider', 'admin'), async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM providers WHERE user_id = $1',
      [req.userId]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'No kitchen profile yet' })
    res.json({ provider: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// ── Create provider kitchen profile ──────────────────────────────────────
router.post('/', requireAuth, requireRole('provider', 'admin'), async (req, res, next) => {
  try {
    const {
      kitchen_name, description, location, city, address, phone,
      cover_image_url, cover_image_id,
      is_veg, is_nonveg, price_from, delivery_time,
    } = req.body

    if (!kitchen_name || !location) {
      return res.status(400).json({ error: 'kitchen_name and location are required' })
    }

    // One kitchen per provider
    const existing = await query('SELECT id FROM providers WHERE user_id = $1', [req.userId])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already have a kitchen profile. Use PUT to update it.' })
    }

    const result = await query(
      `INSERT INTO providers
        (user_id, kitchen_name, description, location, city, address, phone,
         cover_image_url, cover_image_id, is_veg, is_nonveg, price_from, delivery_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        req.userId, kitchen_name, description || null,
        location, city || 'Kolkata', address || null, phone || null,
        cover_image_url || null, cover_image_id || null,
        is_veg === true || is_veg === 'true',
        is_nonveg === true || is_nonveg === 'true',
        price_from || 60, delivery_time || null,
      ]
    )

    res.status(201).json({ provider: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// ── Update provider kitchen ───────────────────────────────────────────────
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const providerRes = await query('SELECT * FROM providers WHERE id = $1', [req.params.id])
    const provider = providerRes.rows[0]
    if (!provider) return res.status(404).json({ error: 'Provider not found' })

    if (provider.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const {
      kitchen_name, description, location, city, address, phone,
      cover_image_url, cover_image_id,
      is_veg, is_nonveg, is_active, price_from, delivery_time,
    } = req.body

    const result = await query(
      `UPDATE providers SET
        kitchen_name    = COALESCE($1,  kitchen_name),
        description     = COALESCE($2,  description),
        location        = COALESCE($3,  location),
        city            = COALESCE($4,  city),
        address         = COALESCE($5,  address),
        phone           = COALESCE($6,  phone),
        cover_image_url = COALESCE($7,  cover_image_url),
        cover_image_id  = COALESCE($8,  cover_image_id),
        is_veg          = COALESCE($9,  is_veg),
        is_nonveg       = COALESCE($10, is_nonveg),
        is_active       = COALESCE($11, is_active),
        price_from      = COALESCE($12, price_from),
        delivery_time   = COALESCE($13, delivery_time),
        updated_at      = NOW()
       WHERE id = $14 RETURNING *`,
      [
        kitchen_name ?? null, description ?? null, location ?? null,
        city ?? null, address ?? null, phone ?? null,
        cover_image_url ?? null, cover_image_id ?? null,
        is_veg != null ? (is_veg === true || is_veg === 'true') : null,
        is_nonveg != null ? (is_nonveg === true || is_nonveg === 'true') : null,
        is_active != null ? (is_active === true || is_active === 'true') : null,
        price_from ?? null, delivery_time ?? null,
        req.params.id,
      ]
    )

    res.json({ provider: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// ── Delete provider ───────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const providerRes = await query('SELECT user_id FROM providers WHERE id = $1', [req.params.id])
    const provider = providerRes.rows[0]
    if (!provider) return res.status(404).json({ error: 'Provider not found' })

    if (provider.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    await query('DELETE FROM providers WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
