import { Router } from 'express'
import { query } from '../db/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router({ mergeParams: true })

// ── List menu for a provider (public) ────────────────────────────────────
// GET /api/providers/:providerId/menu
router.get('/providers/:providerId/menu', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM menu_items WHERE provider_id = $1 ORDER BY category, name`,
      [req.params.providerId]
    )
    res.json({ items: result.rows })
  } catch (err) {
    next(err)
  }
})

// ── Add menu item ─────────────────────────────────────────────────────────
// POST /api/providers/:providerId/menu
router.post('/providers/:providerId/menu', requireAuth, async (req, res, next) => {
  try {
    // Verify ownership
    const pRes = await query('SELECT user_id FROM providers WHERE id = $1', [req.params.providerId])
    if (!pRes.rows.length) return res.status(404).json({ error: 'Provider not found' })
    if (pRes.rows[0].user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { name, description, price, image_url, image_id, is_veg, category } = req.body
    if (!name || !price) return res.status(400).json({ error: 'name and price are required' })

    const result = await query(
      `INSERT INTO menu_items
        (provider_id, name, description, price, image_url, image_id, is_veg, category)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        req.params.providerId, name, description || null, price,
        image_url || null, image_id || null,
        is_veg === true || is_veg === 'true' || is_veg == null,
        category || null,
      ]
    )

    res.status(201).json({ item: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// ── Update menu item ─────────────────────────────────────────────────────
// PUT /api/menu/:id
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const itemRes = await query(
      `SELECT m.*, p.user_id AS provider_user_id
       FROM menu_items m JOIN providers p ON p.id = m.provider_id
       WHERE m.id = $1`,
      [req.params.id]
    )
    if (!itemRes.rows.length) return res.status(404).json({ error: 'Menu item not found' })
    const item = itemRes.rows[0]

    if (item.provider_user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { name, description, price, image_url, image_id, is_veg, is_available, category } = req.body

    const result = await query(
      `UPDATE menu_items SET
        name         = COALESCE($1, name),
        description  = COALESCE($2, description),
        price        = COALESCE($3, price),
        image_url    = COALESCE($4, image_url),
        image_id     = COALESCE($5, image_id),
        is_veg       = COALESCE($6, is_veg),
        is_available = COALESCE($7, is_available),
        category     = COALESCE($8, category)
       WHERE id = $9 RETURNING *`,
      [
        name ?? null, description ?? null, price ?? null,
        image_url ?? null, image_id ?? null,
        is_veg != null ? (is_veg === true || is_veg === 'true') : null,
        is_available != null ? (is_available === true || is_available === 'true') : null,
        category ?? null,
        req.params.id,
      ]
    )

    res.json({ item: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// ── Delete menu item ─────────────────────────────────────────────────────
// DELETE /api/menu/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const itemRes = await query(
      `SELECT m.id, p.user_id AS provider_user_id
       FROM menu_items m JOIN providers p ON p.id = m.provider_id
       WHERE m.id = $1`,
      [req.params.id]
    )
    if (!itemRes.rows.length) return res.status(404).json({ error: 'Menu item not found' })
    if (itemRes.rows[0].provider_user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    await query('DELETE FROM menu_items WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
