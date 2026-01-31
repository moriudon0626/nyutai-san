import { cookies } from 'next/headers'
import crypto from 'crypto'

// 環境変数から認証情報を取得
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password'
const SESSION_SECRET = process.env.SESSION_SECRET || 'nyutai-san-secret-key-2024'

// セッショントークン生成
export function generateSessionToken(): string {
    const timestamp = Date.now().toString()
    const random = crypto.randomBytes(16).toString('hex')
    const hash = crypto.createHmac('sha256', SESSION_SECRET)
        .update(`${timestamp}-${random}`)
        .digest('hex')
    return `${timestamp}-${hash}`
}

// セッショントークン検証（24時間有効）
export function validateSessionToken(token: string): boolean {
    if (!token) return false

    const parts = token.split('-')
    if (parts.length < 2) return false

    const timestamp = parseInt(parts[0], 10)
    if (isNaN(timestamp)) return false

    // 24時間以内かチェック
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24時間
    if (now - timestamp > maxAge) return false

    return true
}

// 認証チェック
export function verifyCredentials(email: string, password: string): boolean {
    return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

// セッションクッキー名
export const SESSION_COOKIE_NAME = 'nyutai_session'

// API用認証チェック（Cookieからトークンを検証）
export function checkApiAuth(request: Request): { authenticated: boolean; error?: Response } {
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [key, ...val] = c.trim().split('=')
            return [key, val.join('=')]
        })
    )
    const token = cookies[SESSION_COOKIE_NAME]

    if (!token || !validateSessionToken(token)) {
        return {
            authenticated: false,
            error: new Response(JSON.stringify({ error: '認証が必要です' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    }

    return { authenticated: true }
}
