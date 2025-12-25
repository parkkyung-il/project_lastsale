import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Check for missing environment variables to prevent 500 crashes
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Middleware Error: Supabase keys are missing in Environment Variables!')
        // Pass through without auth if keys are missing (allows debugging page to load)
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
                            // Ignore cookie errors in middleware
                        }
                    },
                },
            }
        )

        // IMPORTANT: Avoid writing any logic between createServerClient and
        // supabase.auth.getUser().
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Auth redirection logic here if needed

    } catch (e) {
        console.error('Middleware Supabase Error:', e)
        // On error, just allow request to proceed so app doesn't crash
        return NextResponse.next({
            request,
        })
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
