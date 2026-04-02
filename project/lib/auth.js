import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export function verifyToken(request) {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET)
  } catch {
    return null
  }
}

/** Returns { payload } on success, or responds with 401 */
export function getAuth(request) {
  const payload = verifyToken(request)
  if (!payload) return { payload: null, unauth: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) }
  return { payload, unauth: null }
}

/** Returns null if role is allowed, or a 403 Response */
export function checkRole(payload, ...roles) {
  if (!roles.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export function safeUser(user) {
  const { password_hash, ...rest } = user
  return rest
}

export function err(msg, status = 500) {
  return NextResponse.json({ error: msg }, { status })
}
