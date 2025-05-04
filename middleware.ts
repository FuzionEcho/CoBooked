import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the path starts with /admin but is not the login page
  if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, redirect to admin login
    if (!session) {
      const redirectUrl = new URL("/admin/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has admin role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // If not admin, redirect to home
    if (!profile || profile.role !== "admin") {
      const redirectUrl = new URL("/", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Only run middleware on admin routes
export const config = {
  matcher: "/admin/:path*",
}
