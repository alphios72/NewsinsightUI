import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // Public paths
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/_next')) {
        return NextResponse.next()
    }

    // Check auth
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
        const { payload } = await jwtVerify(session, SECRET_KEY)

        // Protect Admin routes
        if (request.nextUrl.pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Add user info to headers for easier access in server components (optional but useful)
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', payload.userId as string)
        requestHeaders.set('x-user-role', payload.role as string)

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (err) {
        // Invalid token
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
