import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/signup" || path === "/forgot-password"

  // For the root path, redirect to login
  if (path === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Allow all other paths to proceed - we'll handle auth checks client-side
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
