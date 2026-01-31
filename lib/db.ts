import { redis } from './redis'
import { Store, Student, AttendanceLog } from './models'

// Store functions
export async function getStore(storeId: string): Promise<Store | null> {
    return await redis.get<Store>(`store:${storeId}`)
}

export async function saveStore(store: Store): Promise<void> {
    await redis.set(`store:${store.id}`, store)
}

export async function deleteStore(storeId: string): Promise<void> {
    // 関連データの削除も検討すべきだが、まずは店舗の基本情報を削除
    await redis.del(`store:${storeId}`)
}

// Student functions
export async function getStudents(storeId: string): Promise<Student[]> {
    const studentsMap = await redis.hgetall<Record<string, Student>>(`store:${storeId}:students`)
    return studentsMap ? Object.values(studentsMap) : []
}

export async function saveStudent(student: Student): Promise<void> {
    await redis.hset(`store:${student.storeId}:students`, { [student.id]: student })
}

export async function deleteStudent(storeId: string, studentId: string): Promise<void> {
    await redis.hdel(`store:${storeId}:students`, studentId)
}

// Attendance functions
export async function logAttendance(log: AttendanceLog): Promise<void> {
    await redis.lpush(`store:${log.storeId}:logs`, log)
    // 直近1000件程度を保持
    await redis.ltrim(`store:${log.storeId}:logs`, 0, 999)
}

export async function getLogs(storeId: string): Promise<AttendanceLog[]> {
    return await redis.lrange<AttendanceLog>(`store:${storeId}:logs`, 0, 99)
}

export async function clearLogs(storeId: string): Promise<void> {
    await redis.del(`store:${storeId}:logs`)
}
