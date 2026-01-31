import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token || !validateSessionToken(token)) {
        return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ authenticated: true })
}
