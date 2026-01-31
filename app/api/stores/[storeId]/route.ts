import { getStore, saveStore, deleteStore } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    const auth = checkApiAuth(request)
    if (!auth.authenticated) return auth.error

    const { storeId } = await params
    const store = await getStore(storeId)
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(store)
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    const auth = checkApiAuth(request)
    if (!auth.authenticated) return auth.error

    const { storeId } = await params
    const body = await request.json()
    const store = await getStore(storeId)
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updatedStore = { ...store, ...body, id: storeId }
    await saveStore(updatedStore)
    return NextResponse.json(updatedStore)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    const auth = checkApiAuth(request)
    if (!auth.authenticated) return auth.error

    const { storeId } = await params
    await deleteStore(storeId)
    return NextResponse.json({ success: true })
}
