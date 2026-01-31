import { NextResponse } from 'next/server'
import { verifyCredentials, generateSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 })
        }

        if (!verifyCredentials(email, password)) {
            return NextResponse.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 })
        }

        const token = generateSessionToken()

        const response = NextResponse.json({ success: true })
        response.cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24時間
            path: '/'
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'ログイン処理中にエラーが発生しました' }, { status: 500 })
    }
}
