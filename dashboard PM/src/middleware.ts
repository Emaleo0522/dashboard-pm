import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas públicas: login, API de auth y rutas internas de Next.js
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/fonts/')
  ) {
    return NextResponse.next()
  }

  // Las rutas de API (/api/pb/*, /api/ai/*, etc.) no deben redirigir a HTML
  // porque el browser espera JSON. Si no hay auth, devolver 401 JSON.
  const isApiRoute = pathname.startsWith('/api/')

  // Verificar cookie de auth
  const cookie = req.cookies.get('pb_auth')?.value
  if (!cookie) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { token } = JSON.parse(cookie)
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }
  } catch {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
