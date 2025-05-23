import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ["/profile", "/favorites"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Auth routes
  const authRoutes = ["/auth/login", "/auth/signup", "/auth/reset-password", "/auth/verify"]
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Redirect if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Redirect if accessing auth routes with session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/profile/:path*", "/favorites/:path*", "/auth/:path*"],
}
