import { getStudents, saveStudent, deleteStudent } from '@/lib/db'
import { Student } from '@/lib/models'
import { NextResponse } from 'next/server'
import { syncStudentToResend } from '@/lib/mail'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'Missing storeId' }, { status: 400 })

    const students = await getStudents(storeId)
    return NextResponse.json(students)
}

export async function POST(request: Request) {
    const body = await request.json()
    await saveStudent(body)

    // Resendに同期 (非同期で実行)
    if (body.email) {
        syncStudentToResend({ name: body.name, email: body.email }).catch(console.error);
    }

    return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const studentId = searchParams.get('studentId')

    if (!storeId || !studentId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    await deleteStudent(storeId, studentId)
    return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
    const body = await request.json()
    const { id, storeId } = body
    if (!id || !storeId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await saveStudent(body)

    // Resendに同期 (非同期で実行)
    if (body.email) {
        syncStudentToResend({ name: body.name, email: body.email }).catch(console.error);
    }

    return NextResponse.json({ success: true })
}
