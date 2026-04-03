import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.email || !body.password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Admin credentials not configured on server' }, { status: 500 })
    }

    if (body.email !== adminEmail || body.password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
    }

    const adminUser = { id: 'admin', name: 'Admin', email: adminEmail, role: 'admin' }
    const token = signToken(adminUser)

    return NextResponse.json({ token, user: adminUser })
  } catch (err) {
    console.error('Admin login failed:', err)
    return NextResponse.json({ error: 'Admin login failed' }, { status: 500 })
  }
}
