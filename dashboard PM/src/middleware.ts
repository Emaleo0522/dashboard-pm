import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas públicas: login y API de auth
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/fonts/')
  ) {
    return NextResponse.next()
  }

  // Verificar cookie de auth
  const cookie = req.cookies.get('pb_auth')?.value
  if (!cookie) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { token } = JSON.parse(cookie)
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
