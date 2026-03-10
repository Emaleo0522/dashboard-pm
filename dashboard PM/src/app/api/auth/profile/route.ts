import { NextRequest, NextResponse } from 'next/server'

const PB = process.env.POCKETBASE_URL
const ALLOWED_PROFILE_FIELDS = new Set(['name', 'googleCalendarUrl'])

export async function PATCH(req: NextRequest) {
  if (!PB) return NextResponse.json({ error: 'PocketBase not configured' }, { status: 503 })
  const cookie = req.cookies.get('pb_auth')?.value
  if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { token, user: cookieUser } = JSON.parse(cookie)
    const rawBody = await req.json()

    // Only allow whitelisted fields
    const sanitized: Record<string, unknown> = {}
    for (const key of Object.keys(rawBody)) {
      if (ALLOWED_PROFILE_FIELDS.has(key)) {
        sanitized[key] = rawBody[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const res = await fetch(`${PB}/api/collections/users/records/${cookieUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sanitized),
    })

    if (!res.ok) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    const record = await res.json()
    const user = {
      id: record.id,
      email: record.email,
      name: record.name ?? record.email,
      googleCalendarUrl: record.googleCalendarUrl || '',
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
