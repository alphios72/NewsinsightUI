'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { SignJWT } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')

export async function login(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        return { error: 'Username and password are required' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return { error: 'Invalid credentials' }
        }

        const isValid = await verifyPassword(password, user.password)

        if (!isValid) {
            return { error: 'Invalid credentials' }
        }

        // Create session
        const token = await new SignJWT({ userId: user.id, role: user.role, username: user.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(SECRET_KEY)

        const cookieStore = await cookies()
        cookieStore.set('session', token, {
            httpOnly: true,
            // Only set secure if in production AND using HTTPS
            secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https://'),
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        })

        return { success: true }
    } catch (error) {
        console.error('Login error:', error)
        return { error: 'Something went wrong' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}
