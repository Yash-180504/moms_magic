import { NextResponse } from 'next/server'
import { getAuth, err } from '@/lib/auth'

const OPENINARY_BASE = process.env.OPENINARY_BASE_URL
const OPENINARY_KEY  = process.env.OPENINARY_API_KEY

function openinaryHeaders() {
  return OPENINARY_KEY ? { Authorization: `ApiKey ${OPENINARY_KEY}` } : {}
}

// POST /api/upload
export async function POST(request) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'moms-magic'

    if (!file) return err('No file provided', 400)

    // Forward to Openinary
    const outForm = new FormData()
    outForm.append('file', file)
    outForm.append('folder', folder)

    const response = await fetch(`${OPENINARY_BASE}/api/upload`, {
      method: 'POST',
      headers: openinaryHeaders(),
      body: outForm,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return err(data.error || 'Openinary upload failed', response.status)

    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return err(e.message)
  }
}
