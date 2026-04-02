import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, err } from '@/lib/auth'

// PUT /api/menu/:id
export async function PUT(request, { params }) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { id } = await params
    const itemRes = await query(
      `SELECT m.*, p.user_id AS provider_user_id
       FROM menu_items m JOIN providers p ON p.id = m.provider_id
       WHERE m.id = $1`,
      [id]
    )
    if (!itemRes.rows.length) return err('Menu item not found', 404)
    if (itemRes.rows[0].provider_user_id !== payload.sub && payload.role !== 'admin')
      return err('Forbidden', 403)

    const { name, description, price, image_url, image_id, is_veg, is_available, category } = await request.json()

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
        id,
      ]
    )
    return NextResponse.json({ item: result.rows[0] })
  } catch (e) {
    return err(e.message)
  }
}

// DELETE /api/menu/:id
export async function DELETE(request, { params }) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { id } = await params
    const itemRes = await query(
      `SELECT m.id, p.user_id AS provider_user_id
       FROM menu_items m JOIN providers p ON p.id = m.provider_id
       WHERE m.id = $1`,
      [id]
    )
    if (!itemRes.rows.length) return err('Menu item not found', 404)
    if (itemRes.rows[0].provider_user_id !== payload.sub && payload.role !== 'admin')
      return err('Forbidden', 403)

    await query('DELETE FROM menu_items WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    return err(e.message)
  }
}
