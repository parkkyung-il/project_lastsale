import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Check for missing environment variables to prevent 500 crashes
    // If keys are missing, we just pass through.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // console.error('Middleware: Env vars missing, skipping auth check')
        return NextResponse.next({
            request,
        })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                            supabaseResponse = NextResponse.next({
                                request,
                            })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                supabaseResponse.cookies.set(name, value, options)
                            )
                        } catch (e) {
                            // Cookie error
                        }
                    },
                },
            }
        )

        // Avoid writing logic between createServerClient and getUser
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // You can check user and redirect here if needed

    } catch (e) {
        // console.error('Middleware Supabase Error:', e)
        // Ensure we don't crash
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
