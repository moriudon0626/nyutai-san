'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Store, Users, QrCode, Mail, ExternalLink, Trash2, Edit, Settings, LogOut } from 'lucide-react'

export default function AdminPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [activeTab, setActiveTab] = useState<'students' | 'logs'>('logs')
    const [logs, setLogs] = useState<any[]>([])
    const [stores, setStores] = useState<any[]>([])
    const [selectedStore, setSelectedStore] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedStore') || ''
        }
        return ''
    })
    const [students, setStudents] = useState<any[]>([])
    const [newStudent, setNewStudent] = useState({ id: '', name: '', email: '' })
    const [loading, setLoading] = useState(false)
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false)
    const [newStore, setNewStore] = useState({ id: '', name: '' })
    const [editingStudent, setEditingStudent] = useState<any | null>(null)
    const [editingStore, setEditingStore] = useState<any | null>(null)

    // 認証チェック
    useEffect(() => {
        fetch('/api/auth/check')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setIsAuthenticated(true)
                } else {
                    router.push('/login')
                }
            })
            .catch(() => router.push('/login'))
    }, [router])

    // ログアウト処理
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetch('/api/stores').then(res => res.json()).then(setStores)
        }
    }, [isAuthenticated])

    // 店舗選択をlocalStorageに保存
    useEffect(() => {
        if (selectedStore) {
            localStorage.setItem('selectedStore', selectedStore)
        }
    }, [selectedStore])

    const [filterStudentId, setFilterStudentId] = useState<string>('')

    const filteredLogs = filterStudentId
        ? logs.filter(log => log.studentId === filterStudentId)
        : logs

    useEffect(() => {
        if (selectedStore) {
            setLoading(true)
            if (activeTab === 'students') {
                fetch(`/api/students?storeId=${selectedStore}`)
                    .then(res => res.json())
                    .then(data => {
                        setStudents(data)
                        setLoading(false)
                    })
            } else {
                fetch(`/api/logs?storeId=${selectedStore}`)
                    .then(res => res.json())
                    .then(data => {
                        setLogs(data)
                        setLoading(false)
                    })
            }
        }
    }, [selectedStore, activeTab])

    const handleClearLogs = async () => {
        if (!confirm('全ての入退室ログを削除しますか？')) return
        setLoading(true)
        const res = await fetch(`/api/logs?storeId=${selectedStore}`, { method: 'DELETE' })
        if (res.ok) {
            setLogs([])
        }
        setLoading(false)
    }

    const handleAddStudent = async () => {
        if (!newStudent.id || !newStudent.name) return
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newStudent, storeId: selectedStore })
        })
        if (res.ok) {
            setNewStudent({ id: '', name: '', email: '' })
            const updated = await fetch(`/api/students?storeId=${selectedStore}`).then(res => res.json())
            setStudents(updated)
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm('この生徒を削除しますか？')) return
        const res = await fetch(`/api/students?storeId=${selectedStore}&studentId=${studentId}`, {
            method: 'DELETE'
        })
        if (res.ok) {
            setStudents(students.filter(s => s.id !== studentId))
        }
    }

    const handleDeleteStore = async (storeId: string) => {
        if (!confirm('この店舗と全データを削除しますか？この操作は取り消せません。')) return
        const res = await fetch(`/api/stores/${storeId}`, { method: 'DELETE' })
        if (res.ok) {
            const updated = stores.filter(s => s.id !== storeId)
            setStores(updated)
            if (selectedStore === storeId) setSelectedStore('')
        }
    }

    const handleUpdateStudent = async () => {
        if (!editingStudent) return
        setLoading(true)
        const res = await fetch('/api/students', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingStudent)
        })
        if (res.ok) {
            const updated = await fetch(`/api/students?storeId=${selectedStore}`).then(res => res.json())
            setStudents(updated)
            setEditingStudent(null)
        }
        setLoading(false)
    }

    const handleUpdateStore = async () => {
        if (!editingStore) return
        setLoading(true)
        const res = await fetch(`/api/stores/${editingStore.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingStore)
        })
        if (res.ok) {
            const updated = await fetch('/api/stores').then(res => res.json())
            setStores(updated)
            setEditingStore(null)
        }
        setLoading(false)
    }

    const handleCreateStore = async () => {
        if (!newStore.id || !newStore.name) return

        setLoading(true)
        const res = await fetch('/api/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStore)
        })
        if (res.ok) {
            const updated = await fetch('/api/stores').then(res => res.json())
            setStores(updated)
            setSelectedStore(newStore.id)
            setIsStoreModalOpen(false)
            setNewStore({ id: '', name: '' })
        }
        setLoading(false)
    }

    // 認証チェック中はローディング表示
    if (isAuthenticated === null) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: 'var(--text-muted)' }}>認証確認中...</p>
                </div>
                <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <div className="container">
            {/* Logout Button - Fixed Position */}
            <button
                onClick={handleLogout}
                style={{
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    zIndex: 100,
                    transition: 'all 0.2s'
                }}
            >
                <LogOut size={16} />
                ログアウト
            </button>

            {/* Store Edit Modal */}
            {editingStore && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 200, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass card" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>店舗情報の編集</h2>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>店舗名</label>
                            <input
                                className="input"
                                value={editingStore.name}
                                onChange={e => setEditingStore({ ...editingStore, name: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setEditingStore(null)}>キャンセル</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleUpdateStore}
                                disabled={!editingStore.name || loading}
                            >
                                {loading ? '更新中...' : '更新する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Edit Modal */}
            {editingStudent && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 200, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass card" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>生徒情報の編集</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>生徒ID</label>
                            <input className="input" value={editingStudent.id} disabled style={{ opacity: 0.6 }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>氏名</label>
                            <input
                                className="input"
                                value={editingStudent.name}
                                onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>保護者メールアドレス</label>
                            <input
                                className="input"
                                value={editingStudent.email}
                                onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setEditingStudent(null)}>キャンセル</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleUpdateStudent}
                                disabled={!editingStudent.name || loading}
                            >
                                {loading ? '更新中...' : '更新する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Store Creation Modal */}
            {isStoreModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass card" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>新規店舗登録</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>店舗ID (英数字のみ)</label>
                            <input
                                className="input"
                                placeholder="例: store01"
                                value={newStore.id}
                                onChange={e => setNewStore({ ...newStore, id: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>店舗名</label>
                            <input
                                className="input"
                                placeholder="例: 代々木校"
                                value={newStore.name}
                                onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setIsStoreModalOpen(false)}>キャンセル</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleCreateStore}
                                disabled={!newStore.id || !newStore.name || loading}
                            >
                                {loading ? '登録中...' : '登録する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>入退さん Admin</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>複数店舗対応入退室管理ダッシュボード</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
                <aside>
                    <div className="glass card">
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Store size={18} />
                            店舗選択
                        </h3>
                        <select
                            className="input"
                            value={selectedStore}
                            onChange={(e) => {
                                setSelectedStore(e.target.value)
                                setFilterStudentId('') // 店舗切替時にフィルタをリセット
                            }}
                            style={{ marginBottom: '0.5rem' }}
                        >
                            <option value="">店舗を選択</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                                onClick={() => setIsStoreModalOpen(true)}
                            >
                                <Plus size={14} style={{ marginRight: '0.25rem' }} />
                                追加
                            </button>
                            {selectedStore && (
                                <button
                                    className="btn"
                                    style={{ padding: '0.5rem', fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
                                    onClick={() => setEditingStore(stores.find(s => s.id === selectedStore))}
                                >
                                    <Settings size={14} />
                                </button>
                            )}
                            {selectedStore && (
                                <button
                                    className="btn"
                                    style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                                    onClick={() => handleDeleteStore(selectedStore)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                <main>
                    {!selectedStore ? (
                        <div className="glass card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <Store size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1.25rem' }}>店舗を選択してください</h2>
                            <p style={{ color: 'var(--text-muted)' }}>左のサイドバーから管理する店舗を選択、または作成してください。</p>
                        </div>
                    ) : (
                        <>
                            {/* Tab UI */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className={`btn ${activeTab === 'students' ? 'btn-primary' : ''}`}
                                        onClick={() => setActiveTab('students')}
                                    >
                                        <Users size={16} style={{ marginRight: '0.5rem' }} />
                                        生徒管理
                                    </button>
                                    <button
                                        className={`btn ${activeTab === 'logs' ? 'btn-primary' : ''}`}
                                        onClick={() => setActiveTab('logs')}
                                    >
                                        <QrCode size={16} style={{ marginRight: '0.5rem' }} />
                                        入退室ログ
                                    </button>
                                </div>
                                <a href={`/scan/${selectedStore}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'var(--accent)', color: 'white' }}>
                                    <QrCode size={16} style={{ marginRight: '0.5rem' }} />
                                    スキャン画面を開く
                                </a>
                            </div>

                            {activeTab === 'students' ? (
                                <>
                                    <div className="glass card" style={{ marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                            <Users size={20} />
                                            生徒登録 ({stores.find(s => s.id === selectedStore)?.name})
                                        </h2>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>生徒ID (固有番号)</label>
                                                <input className="input" placeholder="例: 1001" value={newStudent.id} onChange={e => setNewStudent({ ...newStudent, id: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>氏名</label>
                                                <input className="input" placeholder="例: 山田 太郎" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>保護者メールアドレス</label>
                                                <input className="input" placeholder="例: parent@example.com" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                                            </div>
                                            <button className="btn btn-primary" onClick={handleAddStudent}>登録</button>
                                        </div>
                                    </div>

                                    <div className="glass table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>氏名</th>
                                                    <th>連絡先</th>
                                                    <th style={{ textAlign: 'right' }}>操作</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</td></tr>
                                                ) : students.length === 0 ? (
                                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>登録された生徒はいません</td></tr>
                                                ) : students.map(s => (
                                                    <tr key={s.id}>
                                                        <td style={{ fontWeight: '600' }}>{s.id}</td>
                                                        <td>{s.name}</td>
                                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <Mail size={14} />
                                                                {s.email || '--'}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                <a
                                                                    href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(s.id)}&ecc=Q&margin=2`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn"
                                                                    style={{ padding: '0.25rem 0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
                                                                >
                                                                    <QrCode size={14} style={{ marginRight: '0.25rem' }} />
                                                                    QR
                                                                </a>
                                                                <button
                                                                    className="btn"
                                                                    style={{ padding: '0.25rem 0.5rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)' }}
                                                                    onClick={() => setEditingStudent(s)}
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    className="btn"
                                                                    style={{ padding: '0.25rem 0.5rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                                                                    onClick={() => handleDeleteStudent(s.id)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="glass card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>入退室履歴</h2>
                                            <select
                                                className="input"
                                                style={{ width: '200px', margin: 0 }}
                                                value={filterStudentId}
                                                onChange={(e) => setFilterStudentId(e.target.value)}
                                            >
                                                <option value="">全ての生徒を表示</option>
                                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                                            </select>
                                        </div>
                                        <button className="btn" style={{ color: 'var(--secondary)' }} onClick={handleClearLogs}>
                                            <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                                            ログを全削除
                                        </button>
                                    </div>

                                    <div className="glass table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>時刻</th>
                                                    <th>氏名</th>
                                                    <th>区分</th>
                                                    <th>通知</th>
                                                    <th>生徒ID</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</td></tr>
                                                ) : filteredLogs.length === 0 ? (
                                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>記録はありません</td></tr>
                                                ) : filteredLogs.map((log, i) => (
                                                    <tr key={i}>
                                                        <td>{new Date(log.timestamp).toLocaleString('ja-JP')}</td>
                                                        <td style={{ fontWeight: '600' }}>{log.studentName}</td>
                                                        <td>
                                                            <span className="status-badge" style={{
                                                                background: log.type === 'in' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                                                color: log.type === 'in' ? '#22c55e' : '#ec4899'
                                                            }}>
                                                                {log.type === 'in' ? '入室' : '退室'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {log.mailStatus === 'sent' && <span title="送信成功"><Mail size={16} style={{ color: '#22c55e' }} /></span>}
                                                            {log.mailStatus === 'failed' && <span title="送信エラー（宛先設定やResendの制限を確認）"><Mail size={16} style={{ color: '#ef4444' }} /></span>}
                                                            {log.mailStatus === 'simulated' && <span title="テスト送信（キー未設定）"><Mail size={16} style={{ color: '#f59e0b' }} /></span>}
                                                            {(!log.mailStatus || log.mailStatus === 'not_sent') && <span title="宛先なし・未送信"><Mail size={16} style={{ opacity: 0.2 }} /></span>}
                                                        </td>
                                                        <td style={{ color: 'var(--text-muted)' }}>{log.studentId}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
