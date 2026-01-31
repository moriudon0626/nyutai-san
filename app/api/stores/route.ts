import { redis } from '@/lib/redis'
import { Store } from '@/lib/models'
import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'

export async function GET(request: Request) {
    const auth = checkApiAuth(request)
    if (!auth.authenticated) return auth.error

    const keys = await redis.keys('store:*')
    const stores = []
    for (const key of keys) {
        if (key.includes(':students') || key.includes(':logs')) continue
        const store = await redis.get<Store>(key)
        if (store) stores.push(store)
    }
    return NextResponse.json(stores)
}

export async function POST(request: Request) {
    const auth = checkApiAuth(request)
    if (!auth.authenticated) return auth.error

    const body = await request.json()
    const { name, id } = body
    if (!name || !id) return NextResponse.json({ error: 'Missing name or id' }, { status: 400 })

    const newStore: Store = { id, name, ownerEmail: '' }
    await redis.set(`store:${id}`, newStore)
    return NextResponse.json(newStore)
}
