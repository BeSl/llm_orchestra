import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of routes that don't require authentication
const publicRoutes = ['/login', '/api/health']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes and static files
  if (publicRoutes.includes(pathname) || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // For all other routes, check if user is authenticated
  // In a real implementation, you would check the auth token here
  // For now, we'll allow all routes for simplicity
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}