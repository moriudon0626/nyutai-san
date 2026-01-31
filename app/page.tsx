import { ArrowRight, QrCode, ShieldCheck, Mail, Users, Store } from 'lucide-react'

export default function Home() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
                    <QrCode size={28} />
                    入退さん
                </div>
                <a href="/admin" className="btn btn-primary">
                    管理者ログイン
                    <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                </a>
            </header>

            <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', paddingBottom: '4rem' }}>
                <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', marginBottom: '1.5rem' }}>
                    複数店舗対応・QR入退室管理システム
                </div>

                <h1 style={{ fontSize: '3.5rem', maxWidth: '800px', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                    塾や自習室の入退室を<br /><span style={{ color: 'var(--primary)', background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>もっと手軽に、確実に。</span>
                </h1>

                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', marginBottom: '2.5rem' }}>
                    QRコードスキャンだけで完結。保護者への自動通知、生徒管理、複数店舗の一括運用を驚くほどシンプルに。
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
                    <a href="/admin" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                        今すぐ使い始める
                    </a>
                    <button className="btn" style={{ padding: '1rem 2rem', fontSize: '1rem', background: '#fff', border: '1px solid var(--border)' }}>
                        デモを見る
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', width: '100%', maxWidth: '900px' }}>
                    <div className="glass card" style={{ textAlign: 'left' }}>
                        <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <QrCode size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>QRスキャン</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>お手持ちのスマホやタブレットのカメラで、QRコードを読み取るだけ。</p>
                    </div>

                    <div className="glass card" style={{ textAlign: 'left' }}>
                        <div style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Mail size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>自動メール通知</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>入退室の瞬間に保護者へ安心のメールをお届けします。※準備中</p>
                    </div>

                    <div className="glass card" style={{ textAlign: 'left' }}>
                        <div style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Store size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>複数店舗管理</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>一つのアカウントで、すべての教室の状況をリアルタイムに把握。</p>
                    </div>
                </div>
            </div>

            <footer className="container" style={{ borderTop: '1px solid var(--border)', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                &copy; 2026 入退さん. Built for modern classrooms.
            </footer>
        </main>
    )
}
