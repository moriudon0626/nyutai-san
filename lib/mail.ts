import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// 送信元を認証済みドメインに固定
const FROM_EMAIL = '入退さん <info@asaasa.me>';

export async function sendAttendanceEmail({ to, studentName, type, storeName, timestamp }: {
    to: string;
    studentName: string;
    type: 'in' | 'out';
    storeName: string;
    timestamp: string;
}) {
    if (!resend || !to) {
        console.warn('[Mail] Simulation Mode - Check RESEND_API_KEY or Student Email');
        return { success: true, simulated: true };
    }

    const timeStr = new Date(timestamp).toLocaleString('ja-JP', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const subject = `【${type === 'in' ? '入室' : '退室'}】${studentName}様`;
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">入退室のお知らせ</h2>
      <p>保護者様</p>
      <p>いつもご利用ありがとうございます。${studentName}様の入退室状況をお知らせいたします。</p>
      
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>店舗:</strong> ${storeName}</p>
        <p style="margin: 5px 0;"><strong>区分:</strong> <span style="color: ${type === 'in' ? '#22c55e' : '#ec4899'}; font-weight: bold;">${type === 'in' ? '入室' : '退室'}</span></p>
        <p style="margin: 5px 0;"><strong>時刻:</strong> ${timeStr}</p>
      </div>

      <p style="font-size: 14px; color: #64748b;">※本メールはシステムによる自動送信です。</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">入退室管理サービス「入退さん」</p>
    </div>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('Mail Send Error:', error);
            return { success: false, error };
        }

        return { success: true, data }
    } catch (err: any) {
        console.error('Mail Send Exception:', err)
        return { success: false, error: err.message || err }
    }
}

/**
 * ResendのAudience（連絡先リスト）に生徒を同期する
 */
export async function syncStudentToResend(student: { name: string, email: string }) {
    if (!resend || !student.email) return;

    try {
        const audiences = await resend.audiences.list();
        let audienceId = audiences.data?.[0]?.id;

        if (!audienceId) {
            const newAudience = await resend.audiences.create({ name: '入退さん保護者様' });
            audienceId = newAudience.data?.id;
        }

        if (audienceId) {
            await resend.contacts.create({
                email: student.email,
                firstName: student.name,
                audienceId: audienceId,
            });
            console.log(`[Resend] Synced contact: ${student.email}`);
        }
    } catch (err: any) {
        // 既に登録されている場合などのエラーは無視してもOK
        console.warn('Sync to Resend failed:', err.message || err);
    }
}
