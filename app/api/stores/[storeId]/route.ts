import { getStore, saveStore, deleteStore } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { storeId: string } }
) {
    const store = await getStore(params.storeId)
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(store)
}

export async function PATCH(
    request: Request,
    { params }: { params: { storeId: string } }
) {
    const body = await request.json()
    const store = await getStore(params.storeId)
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updatedStore = { ...store, ...body, id: params.storeId } // IDは変更不可
    await saveStore(updatedStore)
    return NextResponse.json(updatedStore)
}

export async function DELETE(
    request: Request,
    { params }: { params: { storeId: string } }
) {
    await deleteStore(params.storeId)
    return NextResponse.json({ success: true })
}
