import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, err } from '@/lib/auth'

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export async function PUT(request, { params }) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { id } = await params
    const { status } = await request.json()

    if (!ORDER_STATUSES.includes(status))
      return err(`status must be one of: ${ORDER_STATUSES.join(', ')}`, 400)

    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [id])
    if (!orderRes.rows.length) return err('Order not found', 404)
    const order = orderRes.rows[0]

    if (payload.role === 'customer') {
      if (order.customer_id !== payload.sub) return err('Forbidden', 403)
      if (status !== 'cancelled') return err('Customers can only cancel orders', 403)
      if (order.status !== 'pending') return err('Only pending orders can be cancelled', 400)
    } else if (payload.role === 'provider') {
      const pRes = await query('SELECT id FROM providers WHERE user_id = $1', [payload.sub])
      if (pRes.rows[0]?.id !== order.provider_id) return err('Forbidden', 403)
    }

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    )
    return NextResponse.json({ order: result.rows[0] })
  } catch (e) {
    return err(e.message)
  }
}
