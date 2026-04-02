import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, checkRole, err } from '@/lib/auth'

export async function GET(request) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth
  const roleErr = checkRole(payload, 'provider', 'admin')
  if (roleErr) return roleErr

  try {
    const result = await query('SELECT * FROM providers WHERE user_id = $1', [payload.sub])
    if (!result.rows.length) return err('No kitchen profile yet', 404)
    return NextResponse.json({ provider: result.rows[0] })
  } catch (e) {
    return err(e.message)
  }
}
