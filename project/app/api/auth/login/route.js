import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, safeUser, err } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) return err('email and password are required', 400)

    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return err('Invalid email or password', 401)

    return NextResponse.json({ token: signToken(user), user: safeUser(user) })
  } catch (e) {
    console.error(e)
    return err(e.message)
  }
}
