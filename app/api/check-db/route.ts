import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        await redis.set('connection-test', 'ok')
        const result = await redis.get('connection-test')
        return NextResponse.json({ status: 'connected', result })
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }
}
