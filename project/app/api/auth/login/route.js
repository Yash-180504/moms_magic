import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, safeUser, err } from '@/lib/auth'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) return err('Invalid request body', 400)

    const { email, password } = body
    if (!email || !password) return err('email and password are required', 400)

    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return err('Invalid email or password', 401)
    }

    return NextResponse.json({ token: signToken(user), user: safeUser(user) })
  } catch (e) {
    console.error('Login error:', e)
    return err(e?.message || 'Internal server error', 500)
  }
}
