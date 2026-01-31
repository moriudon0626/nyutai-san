import { getLogs, clearLogs } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
        return NextResponse.json({ error: 'Missing storeId' }, { status: 400 })
    }

    const logs = await getLogs(storeId)
    return NextResponse.json(logs)
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
        return NextResponse.json({ error: 'Missing storeId' }, { status: 400 })
    }

    await clearLogs(storeId)
    return NextResponse.json({ success: true })
}
