import { NextRequest, NextResponse } from 'next/server'

const PB = process.env.POCKETBASE_URL ?? 'http://161.153.203.83:8090'

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
  const body = await req.json()
  const token = getToken(req)
  const res = await fetch(`${PB}/api/collections/${collection}/records/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params
  const token = getToken(req)
  const res = await fetch(`${PB}/api/collections/${collection}/records/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
