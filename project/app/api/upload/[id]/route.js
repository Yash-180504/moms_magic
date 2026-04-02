import { NextResponse } from 'next/server'
import { getAuth, err } from '@/lib/auth'

const OPENINARY_BASE = process.env.OPENINARY_BASE_URL
const OPENINARY_KEY  = process.env.OPENINARY_API_KEY

function openinaryHeaders() {
  return OPENINARY_KEY ? { Authorization: `ApiKey ${OPENINARY_KEY}` } : {}
}

// DELETE /api/upload/:id
export async function DELETE(request, { params }) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const { id } = await params
    const response = await fetch(`${OPENINARY_BASE}/api/asset/${id}`, {
      method: 'DELETE',
      headers: openinaryHeaders(),
    })
    if (response.status === 404) return err('Asset not found', 404)
    if (!response.ok) return err('Delete failed', response.status)
    return NextResponse.json({ success: true })
  } catch (e) {
    return err(e.message)
  }
}
