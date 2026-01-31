import { redis } from '@/lib/redis'
import { Store } from '@/lib/models'
import { NextResponse } from 'next/server'

export async function GET() {
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
    const body = await request.json()
    const { name, id } = body
    if (!name || !id) return NextResponse.json({ error: 'Missing name or id' }, { status: 400 })

    const newStore: Store = { id, name, ownerEmail: '' }
    await redis.set(`store:${id}`, newStore)
    return NextResponse.json(newStore)
}
