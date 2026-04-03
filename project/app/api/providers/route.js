import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, checkRole, err } from '@/lib/auth'

// GET /api/providers?city=&search=&veg=&nonveg=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const veg = searchParams.get('veg')
    const nonveg = searchParams.get('nonveg')

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

    const result = await query(
      `SELECT p.*, u.name AS owner_name, u.email AS owner_email
       FROM providers p JOIN users u ON u.id = p.user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.rating DESC, p.total_orders DESC`,
      params
    )
    return NextResponse.json({ providers: result.rows })
  } catch (e) {
    console.error('GET /api/providers failed:', e)
    return err(e?.message || String(e) || 'Unexpected error', 500)
  }
}

// POST /api/providers
export async function POST(request) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth
  const roleErr = checkRole(payload, 'provider', 'admin')
  if (roleErr) return roleErr

  try {
    const body = await request.json()
    const {
      kitchen_name, description, location, city, address, phone,
      cover_image_url, cover_image_id, is_veg, is_nonveg, price_from, delivery_time,
    } = body

    if (!kitchen_name || !location) return err('kitchen_name and location are required', 400)

    const existing = await query('SELECT id FROM providers WHERE user_id = $1', [payload.sub])
    if (existing.rows.length) return err('You already have a kitchen profile. Use PUT to update it.', 409)

    const result = await query(
      `INSERT INTO providers
        (user_id, kitchen_name, description, location, city, address, phone,
         cover_image_url, cover_image_id, is_veg, is_nonveg, price_from, delivery_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        payload.sub, kitchen_name, description || null,
        location, city || 'Kolkata', address || null, phone || null,
        cover_image_url || null, cover_image_id || null,
        is_veg === true || is_veg === 'true',
        is_nonveg === true || is_nonveg === 'true',
        price_from || 60, delivery_time || null,
      ]
    )
    return NextResponse.json({ provider: result.rows[0] }, { status: 201 })
  } catch (e) {
    return err(e.message)
  }
}
