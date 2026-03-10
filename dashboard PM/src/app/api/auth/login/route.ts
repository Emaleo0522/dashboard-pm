import { NextRequest, NextResponse } from 'next/server'

const PB = process.env.POCKETBASE_URL

export async function POST(req: NextRequest) {
  if (!PB) {
    return NextResponse.json({ error: 'Servidor no configurado' }, { status: 503 })
  }
  const { email, password } = await req.json()

  const res = await fetch(`${PB}/api/collections/users/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const data = await res.json()
  const { token, record } = data

  const user = { id: record.id, email: record.email, name: record.name ?? record.email }

  const response = NextResponse.json({ user })
  response.cookies.set('pb_auth', JSON.stringify({ token, user }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })

  return response
}
