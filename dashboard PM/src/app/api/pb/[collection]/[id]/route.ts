import { NextRequest, NextResponse } from 'next/server'

// Force dynamic — never cache this route or its fetch() calls
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const PB = process.env.POCKETBASE_URL
if (!PB) {
  console.error('[PB proxy] POCKETBASE_URL env var is not set!')
}

const ALLOWED_COLLECTIONS = new Set([
  'inbox_entries',
  'brainstorm_notes',
  'backlog_cards',
  'calendar_events',
  'meeting_history',
])

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('pb_auth')?.value
  if (!cookie) return null
  try { return JSON.parse(cookie).token ?? null } catch { return null }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params
  if (!ALLOWED_COLLECTIONS.has(collection)) {
    return NextResponse.json({ error: 'Collection not allowed' }, { status: 403 })
  }
  if (!PB) {
    return NextResponse.json({ error: 'PocketBase not configured' }, { status: 503 })
  }
  const body = await req.json()
  const token = getToken(req)
  try {
    const res = await fetch(`${PB}/api/collections/${collection}/records/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.error(`[PB proxy] PATCH ${collection}/${id} → ${res.status}: ${errBody}`)
      return NextResponse.json({ error: errBody, status: res.status }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(`[PB proxy] PATCH ${collection}/${id} → network error:`, err)
    return NextResponse.json({ error: 'PocketBase unreachable' }, { status: 502 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params
  if (!ALLOWED_COLLECTIONS.has(collection)) {
    return NextResponse.json({ error: 'Collection not allowed' }, { status: 403 })
  }
  if (!PB) {
    return NextResponse.json({ error: 'PocketBase not configured' }, { status: 503 })
  }
  const token = getToken(req)
  try {
    const res = await fetch(`${PB}/api/collections/${collection}/records/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
    if (res.status === 204) return new NextResponse(null, { status: 204 })
    if (!res.ok) {
      const errBody = await res.text()
      console.error(`[PB proxy] DELETE ${collection}/${id} → ${res.status}: ${errBody}`)
      return NextResponse.json({ error: errBody, status: res.status }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(`[PB proxy] DELETE ${collection}/${id} → network error:`, err)
    return NextResponse.json({ error: 'PocketBase unreachable' }, { status: 502 })
  }
}
