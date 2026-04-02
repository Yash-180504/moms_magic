import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, err } from '@/lib/auth'

// GET /api/providers/:id  (public)
export async function GET(_request, { params }) {
  try {
    const { id } = await params
    const result = await query(
      `SELECT p.*, u.name AS owner_name, u.email AS owner_email
       FROM providers p JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    )
    if (!result.rows.length) return err('Provider not found', 404)
    return NextResponse.json({ provider: result.rows[0] })
  } catch (e) {
    return err(e.message)
  }
}

// PUT /api/providers/:id
export async function PUT(request, { params }) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { id } = await params
    const providerRes = await query('SELECT * FROM providers WHERE id = $1', [id])
    if (!providerRes.rows.length) return err('Provider not found', 404)
    const provider = providerRes.rows[0]

    if (provider.user_id !== payload.sub && payload.role !== 'admin')
      return err('Forbidden', 403)

    const {
      kitchen_name, description, location, city, address, phone,
      cover_image_url, cover_image_id, is_veg, is_nonveg, is_active,
      price_from, delivery_time,
    } = await request.json()

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
        id,
      ]
    )
    return NextResponse.json({ provider: result.rows[0] })
  } catch (e) {
    return err(e.message)
  }
}

// DELETE /api/providers/:id
export async function DELETE(request, { params }) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { id } = await params
    const providerRes = await query('SELECT user_id FROM providers WHERE id = $1', [id])
    if (!providerRes.rows.length) return err('Provider not found', 404)
    if (providerRes.rows[0].user_id !== payload.sub && payload.role !== 'admin')
      return err('Forbidden', 403)

    await query('DELETE FROM providers WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    return err(e.message)
  }
}
