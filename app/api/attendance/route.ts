import { logAttendance, getStudents, getStore } from '@/lib/db';
import { sendAttendanceEmail } from '@/lib/mail';
import { AttendanceLog } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, storeId, type } = body;

        if (!studentId || !storeId || !type) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const students = await getStudents(storeId);
        const student = students.find(s => s.id === studentId);

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        let mailStatus: AttendanceLog['mailStatus'] = 'not_sent';

        // メール通知
        if (student.email) {
            try {
                const mailResult = await sendAttendanceEmail({
                    to: student.email,
                    studentName: student.name,
                    type: type as 'in' | 'out',
                    storeName: (await getStore(storeId))?.name || '不明な店舗',
                    timestamp: new Date().toISOString()
                });

                if (mailResult.simulated) {
                    mailStatus = 'simulated';
                } else if (mailResult.success) {
                    mailStatus = 'sent';
                } else {
                    mailStatus = 'failed';
                    // エラー内容をサーバーの標準出力に詳しく出す
                    console.error('[CRITICAL] Resend Mail Error:', JSON.stringify(mailResult.error, null, 2));
                    console.error('[CRITICAL] API KEY:', process.env.RESEND_API_KEY?.substring(0, 5) + '...');
                }
            } catch (mailErr) {
                console.error('Email failed but attendance logged:', mailErr);
                mailStatus = 'failed';
            }
        }

        const log: AttendanceLog = {
            studentId,
            studentName: student.name,
            type,
            timestamp: new Date().toISOString(),
            storeId,
            mailStatus
        };

        await logAttendance(log);

        return NextResponse.json({ success: true, log });
    } catch (error) {
        console.error('Attendance API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
