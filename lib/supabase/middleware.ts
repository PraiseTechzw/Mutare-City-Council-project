import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile to check role
  let userRole = null
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    userRole = profile?.role
  }

  // Protect customer routes
  if (request.nextUrl.pathname.startsWith("/customer") && (!user || userRole !== "customer")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Protect cashier routes
  if (request.nextUrl.pathname.startsWith("/cashier") && (!user || userRole !== "cashier")) {
    return NextResponse.redirect(new URL("/login/cashier", request.url))
  }

  // Redirect authenticated users away from login pages
  if (user && request.nextUrl.pathname === "/login") {
    if (userRole === "customer") {
      return NextResponse.redirect(new URL("/customer", request.url))
    } else if (userRole === "cashier") {
      return NextResponse.redirect(new URL("/cashier", request.url))
    }
  }

  return supabaseResponse
}
