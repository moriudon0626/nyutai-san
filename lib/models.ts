/**
 * Redis Key Design
 * 
 * 店舗 (Stores): stores:{storeId} -> JSON (name, email, settings)
 * 生徒 (Students): store:{storeId}:students -> Hash { studentId: JSON(name, email, qrCode) }
 * 入退室ログ (Logs): store:{storeId}:logs -> List [ JSON(studentId, type, timestamp) ]
 * 
 * ※ studentId は店舗内でユニークなものを使用
 */

export interface Store {
    id: string;
    name: string;
    ownerEmail: string;
}

export interface Student {
    id: string; // 固有番号
    name: string;
    email: string;
    storeId: string;
}

export interface AttendanceLog {
    studentId: string;
    studentName: string;
    type: 'in' | 'out';
    timestamp: string; // ISOString
    storeId: string;
    mailStatus?: 'sent' | 'failed' | 'simulated' | 'not_sent';
}
