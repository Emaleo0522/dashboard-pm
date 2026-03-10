import { NextRequest, NextResponse } from 'next/server'

function isTokenExpired(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return false // no expiration claim = treat as valid
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function unauthorized(isApiRoute: boolean, req: NextRequest) {
  if (isApiRoute) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.redirect(new URL('/login', req.url))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas publicas: login, API de auth y rutas internas de Next.js
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
    return unauthorized(isApiRoute, req)
  }

  try {
    const { token } = JSON.parse(cookie)
    if (!token || typeof token !== 'string') {
      return unauthorized(isApiRoute, req)
    }
    // Validate JWT is not expired
    if (isTokenExpired(token)) {
      const response = unauthorized(isApiRoute, req)
      // Clear the expired cookie
      if (!isApiRoute) {
        response.cookies.delete('pb_auth')
      }
      return response
    }
  } catch {
    return unauthorized(isApiRoute, req)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
