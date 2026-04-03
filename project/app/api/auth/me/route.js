import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, safeUser, err } from '@/lib/auth'

export async function GET(request) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  if (payload.role === 'admin') {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    return NextResponse.json({ user: { id: 'admin', name: 'Admin', email: adminEmail, role: 'admin' } })
  }

  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [payload.sub])
    if (!result.rows.length) return err('User not found', 404)
    return NextResponse.json({ user: safeUser(result.rows[0]) })
  } catch (e) {
    return err(e.message)
  }
}

export async function PATCH(request) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { name, phone, avatar_url, current_password, new_password } = await request.json()

    // Password change flow
    if (new_password) {
      const userRes = await query('SELECT * FROM users WHERE id = $1', [payload.sub])
      const user = userRes.rows[0]
      const bcrypt = (await import('bcryptjs')).default
      if (!(await bcrypt.compare(current_password || '', user.password_hash)))
        return err('Current password is incorrect', 400)
      const password_hash = await bcrypt.hash(new_password, 12)
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, payload.sub])
      return NextResponse.json({ success: true })
    }

    const result = await query(
      `UPDATE users SET
        name       = COALESCE($1, name),
        phone      = COALESCE($2, phone),
        avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4 RETURNING *`,
      [name || null, phone || null, avatar_url || null, payload.sub]
    )
    return NextResponse.json({ user: safeUser(result.rows[0]) })
  } catch (e) {
    return err(e.message)
  }
}
