import { Router } from 'express'
import { query } from '../db/index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

const ORDER_STATUSES = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled']

// ── Create order ─────────────────────────────────────────────────────────
// POST /api/orders
router.post('/', requireAuth, requireRole('customer', 'admin'), async (req, res, next) => {
  try {
    const { provider_id, delivery_address, notes, items } = req.body

    if (!provider_id || !delivery_address || !items?.length) {
      return res.status(400).json({ error: 'provider_id, delivery_address and items are required' })
    }

    // Verify provider exists
    const pRes = await query('SELECT id FROM providers WHERE id = $1 AND is_active = TRUE', [provider_id])
    if (!pRes.rows.length) return res.status(404).json({ error: 'Provider not found or inactive' })

    // Fetch menu item prices from DB to avoid price tampering
    const itemIds = items.map(i => i.menu_item_id)
    const menuRes = await query(
      `SELECT id, name, price FROM menu_items WHERE id = ANY($1) AND is_available = TRUE`,
      [itemIds]
    )
    const menuMap = Object.fromEntries(menuRes.rows.map(r => [r.id, r]))

    let total = 0
    const validatedItems = []
    for (const item of items) {
      const menu = menuMap[item.menu_item_id]
      if (!menu) return res.status(400).json({ error: `Menu item ${item.menu_item_id} not found or unavailable` })
      const qty = parseInt(item.quantity) || 1
      total += menu.price * qty
      validatedItems.push({ menu_item_id: menu.id, name: menu.name, price: menu.price, quantity: qty })
    }

    // Insert order + items in a transaction
    const client = await (await import('../db/index.js')).default.connect()
    try {
      await client.query('BEGIN')

      const orderRes = await client.query(
        `INSERT INTO orders (customer_id, provider_id, total_amount, delivery_address, notes)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [req.userId, provider_id, total, delivery_address, notes || null]
      )
      const order = orderRes.rows[0]

      for (const it of validatedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, name, quantity, price)
           VALUES ($1,$2,$3,$4,$5)`,
          [order.id, it.menu_item_id, it.name, it.quantity, it.price]
        )
      }

      // Bump provider total_orders
      await client.query(
        'UPDATE providers SET total_orders = total_orders + 1, updated_at = NOW() WHERE id = $1',
        [provider_id]
      )

      await client.query('COMMIT')
      order.items = validatedItems
      res.status(201).json({ order })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    next(err)
  }
})

// ── List orders (customer sees own; provider sees their kitchen's orders) ─
// GET /api/orders
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let result
    if (req.userRole === 'customer') {
      result = await query(
        `SELECT o.*,
                p.kitchen_name,
                p.cover_image_url,
                json_agg(json_build_object(
                  'id', oi.id, 'name', oi.name, 'quantity', oi.quantity, 'price', oi.price
                )) AS items
         FROM orders o
         JOIN providers p ON p.id = o.provider_id
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = $1
         GROUP BY o.id, p.kitchen_name, p.cover_image_url
         ORDER BY o.created_at DESC`,
        [req.userId]
      )
    } else if (req.userRole === 'provider') {
      // Get their kitchen id
      const pRes = await query('SELECT id FROM providers WHERE user_id = $1', [req.userId])
      if (!pRes.rows.length) return res.json({ orders: [] })
      result = await query(
        `SELECT o.*,
                u.name AS customer_name,
                u.phone AS customer_phone,
                json_agg(json_build_object(
                  'id', oi.id, 'name', oi.name, 'quantity', oi.quantity, 'price', oi.price
                )) AS items
         FROM orders o
         JOIN users u ON u.id = o.customer_id
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.provider_id = $1
         GROUP BY o.id, u.name, u.phone
         ORDER BY o.created_at DESC`,
        [pRes.rows[0].id]
      )
    } else {
      // admin
      result = await query(
        `SELECT o.*,
                p.kitchen_name, u.name AS customer_name,
                json_agg(json_build_object(
                  'id', oi.id, 'name', oi.name, 'quantity', oi.quantity, 'price', oi.price
                )) AS items
         FROM orders o
         JOIN providers p ON p.id = o.provider_id
         JOIN users u ON u.id = o.customer_id
         JOIN order_items oi ON oi.order_id = o.id
         GROUP BY o.id, p.kitchen_name, u.name
         ORDER BY o.created_at DESC`
      )
    }

    res.json({ orders: result.rows })
  } catch (err) {
    next(err)
  }
})

// ── Get single order ─────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT o.*,
              p.kitchen_name, p.cover_image_url, p.phone AS kitchen_phone,
              u.name AS customer_name, u.phone AS customer_phone,
              json_agg(json_build_object(
                'id', oi.id, 'name', oi.name, 'quantity', oi.quantity, 'price', oi.price
              )) AS items
       FROM orders o
       JOIN providers p ON p.id = o.provider_id
       JOIN users u ON u.id = o.customer_id
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id, p.kitchen_name, p.cover_image_url, p.phone, u.name, u.phone`,
      [req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Order not found' })

    const order = result.rows[0]
    // Auth: customer only sees own, provider only sees their kitchen's
    const pRes = await query('SELECT id FROM providers WHERE user_id = $1', [req.userId])
    const isOwner = order.customer_id === req.userId
    const isProvider = pRes.rows[0]?.id === order.provider_id
    if (!isOwner && !isProvider && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.json({ order })
  } catch (err) {
    next(err)
  }
})

// ── Update order status ───────────────────────────────────────────────────
router.put('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ORDER_STATUSES.join(', ')}` })
    }

    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [req.params.id])
    if (!orderRes.rows.length) return res.status(404).json({ error: 'Order not found' })
    const order = orderRes.rows[0]

    // Customers can only cancel their own pending orders
    if (req.userRole === 'customer') {
      if (order.customer_id !== req.userId) return res.status(403).json({ error: 'Forbidden' })
      if (status !== 'cancelled') return res.status(403).json({ error: 'Customers can only cancel orders' })
      if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled' })
    } else if (req.userRole === 'provider') {
      const pRes = await query('SELECT id FROM providers WHERE user_id = $1', [req.userId])
      if (pRes.rows[0]?.id !== order.provider_id) return res.status(403).json({ error: 'Forbidden' })
    }

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    )
    res.json({ order: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

export default router
