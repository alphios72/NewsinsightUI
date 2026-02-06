import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // Content Security Policy
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'self';
        connect-src 'self';
    `
    // DATA PROTECTION: Replace newlines with spaces for valid header
    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, ' ')
        .trim()

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

    // Public paths
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/_next')) {
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
        response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
        return response
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
        requestHeaders.set('x-user-id', payload.userId as string)
        requestHeaders.set('x-user-role', payload.role as string)

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
        response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
        return response

    } catch (err) {
        // Invalid token
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
