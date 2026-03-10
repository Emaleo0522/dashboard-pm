import { NextRequest, NextResponse } from 'next/server'

const PB = process.env.POCKETBASE_URL

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('pb_auth')?.value
  if (!cookie) return NextResponse.json({ user: null }, { status: 401 })

  try {
    const { token, user: cookieUser } = JSON.parse(cookie)

    if (!PB) {
      // fallback: datos del cookie sin googleCalendarUrl
      return NextResponse.json({ user: { ...cookieUser, googleCalendarUrl: '' } })
    }

    const res = await fetch(`${PB}/api/collections/users/records/${cookieUser.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })

    if (!res.ok) {
      // fallback: datos del cookie sin googleCalendarUrl
      return NextResponse.json({ user: { ...cookieUser, googleCalendarUrl: '' } })
    }

    const record = await res.json()
    const user = {
      id: record.id,
      email: record.email,
      name: record.name ?? record.email,
      googleCalendarUrl: record.googleCalendarUrl || '',
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
