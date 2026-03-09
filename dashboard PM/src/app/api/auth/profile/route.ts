import { NextRequest, NextResponse } from 'next/server'

const PB = process.env.POCKETBASE_URL ?? 'http://161.153.203.83:8090'

export async function PATCH(req: NextRequest) {
  const cookie = req.cookies.get('pb_auth')?.value
  if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { token, user: cookieUser } = JSON.parse(cookie)
    const body = await req.json()

    const res = await fetch(`${PB}/api/collections/users/records/${cookieUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
