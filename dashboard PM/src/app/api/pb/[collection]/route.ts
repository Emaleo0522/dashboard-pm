import { NextRequest, NextResponse } from 'next/server'

const PB = process.env.POCKETBASE_URL ?? 'http://161.153.203.83:8090'

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('pb_auth')?.value
  if (!cookie) return null
  try { return JSON.parse(cookie).token ?? null } catch { return null }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params
  const search = req.nextUrl.searchParams.toString()
  const url = `${PB}/api/collections/${collection}/records${search ? `?${search}` : ''}`
  const token = getToken(req)
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params
  const body = await req.json()
  const token = getToken(req)
  const res = await fetch(`${PB}/api/collections/${collection}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
