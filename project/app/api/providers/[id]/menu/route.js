import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, err } from '@/lib/auth'

// GET /api/providers/:id/menu  (public)
export async function GET(_request, { params }) {
  try {
    const { id } = await params
    const result = await query(
      `SELECT * FROM menu_items WHERE provider_id = $1 ORDER BY category, name`,
      [id]
    )
    return NextResponse.json({ items: result.rows })
  } catch (e) {
    return err(e.message)
  }
}

// POST /api/providers/:id/menu
export async function POST(request, { params }) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { id } = await params
    const pRes = await query('SELECT user_id FROM providers WHERE id = $1', [id])
    if (!pRes.rows.length) return err('Provider not found', 404)
    if (pRes.rows[0].user_id !== payload.sub && payload.role !== 'admin')
      return err('Forbidden', 403)

    const { name, description, price, image_url, image_id, is_veg, category } = await request.json()
    if (!name || !price) return err('name and price are required', 400)

    const result = await query(
      `INSERT INTO menu_items
        (provider_id, name, description, price, image_url, image_id, is_veg, category)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        id, name, description || null, price,
        image_url || null, image_id || null,
        is_veg === true || is_veg === 'true' || is_veg == null,
        category || null,
      ]
    )
    return NextResponse.json({ item: result.rows[0] }, { status: 201 })
  } catch (e) {
    return err(e.message)
  }
}
