'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function ScanPage() {
    const params = useParams()
    const storeId = params.storeId as string
    const [type, setType] = useState<'in' | 'out'>('in')
    const typeRef = useRef<'in' | 'out'>('in')
    const [result, setResult] = useState<{ type: 'success' | 'error', studentName?: string, message: string } | null>(null)
    const [history, setHistory] = useState<any[]>([])
    const scanInProgress = useRef(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // typeが変更されたときにtypeRefを同期
    useEffect(() => {
        typeRef.current = type
    }, [type])

    const [scannerActive, setScannerActive] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

    useEffect(() => {
        if (scannerActive && !isScanning) {
            const start = async () => {
                try {
                    const html5QrCode = new Html5Qrcode("reader");
                    html5QrCodeRef.current = html5QrCode;

                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 60,
                            qrbox: (w, h) => {
                                const min = Math.min(w, h);
                                return { width: min * 0.8, height: min * 0.8 };
                            },
                            aspectRatio: 1.0,
                            videoConstraints: {
                                facingMode: "environment",
                                width: { ideal: 1280 },
                                height: { ideal: 720 }
                            }
                        },
                        async (decodedText) => {
                            // 既にスキャン中の場合は無視
                            if (scanInProgress.current) return;

                            // スキャン成功時のフィードバック (即座に反応)
                            try {
                                if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
                            } catch (e) { }

                            scanInProgress.current = true;
                            await handleScanResult(decodedText);
                        },
                        () => { }
                    );
                    setIsScanning(true);
                } catch (err: any) {
                    console.error("Scanner start error:", err);
                    setCameraError("カメラの起動に失敗しました。ブラウザの設定でカメラを許可してください。");
                    setScannerActive(false);
                }
            };
            start();
        }
    }, [scannerActive, isScanning]); // resultを依存配列から削除して二重発火を防止

    const handleScanResult = async (decodedText: string) => {
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: decodedText,
                    storeId: storeId,
                    type: typeRef.current
                })
            })

            const resData = await res.json()
            if (resData.success) {
                playSuccessSound()
                setResult({
                    type: 'success',
                    studentName: resData.log.studentName,
                    message: `${resData.log.type === 'in' ? '入室' : '退室'}を記録しました`
                })

                const newEntry = {
                    name: resData.log.studentName,
                    time: new Date(resData.log.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                    type: resData.log.type
                }
                setHistory(prev => [newEntry, ...prev.slice(0, 4)])

                setTimeout(() => {
                    setResult(null)
                    scanInProgress.current = false
                }, 3000)
            } else {
                setResult({
                    type: 'error',
                    message: resData.error || '不明なエラーが発生しました'
                })
                setTimeout(() => {
                    setResult(null)
                    scanInProgress.current = false
                }, 3000)
            }
        } catch (err) {
            setResult({
                type: 'error',
                message: '通信エラーが発生しました'
            })
            setTimeout(() => {
                setResult(null)
                scanInProgress.current = false
            }, 3000)
        }
    }

    // This function now only triggers the scanner to become active
    const startScanner = () => {
        if (!isClient) return;
        setScannerActive(true);
    }

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(e => console.error("Failed to stop", e));
            }
        }
    }, []);

    const playSuccessSound = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = context.createOscillator()
            const gainNode = context.createGain()

            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(880, context.currentTime)
            oscillator.connect(gainNode)
            gainNode.connect(context.destination)

            gainNode.gain.setValueAtTime(0, context.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05)
            gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1)

            oscillator.start()
            oscillator.stop(context.currentTime + 0.1)
        } catch (e) { }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
            {/* Processing Overlay */}
            {result === null && isClient && (
                <div style={{
                    position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 50, background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1.5rem',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    opacity: 1, transition: 'opacity 0.2s'
                }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                        {scannerActive ? 'スキャン中...' : '待機中'}
                    </span>
                </div>
            )}

            {/* Result Overlay */}
            {result && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: result.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        {result.type === 'success' ? (
                            <CheckCircle size={120} style={{ marginBottom: '1.5rem' }} />
                        ) : (
                            <AlertCircle size={120} style={{ marginBottom: '1.5rem' }} />
                        )}
                        <h2 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>
                            {result.type === 'success' ? 'OK!' : 'ERROR'}
                        </h2>
                        {result.studentName && (
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                {result.studentName} さん
                            </div>
                        )}
                        <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>{result.message}</p>
                    </div>
                </div>
            )}

            <header style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
                <a href="/admin" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={20} />
                    管理へ戻る
                </a>
                <div style={{ fontWeight: '700', letterSpacing: '0.1rem' }}>入退さん SCANNER</div>
                <div style={{ width: '40px' }}></div>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '60px' }}>
                <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                    <div className="glass" style={{ width: '100%', maxWidth: '500px', background: '#fff', color: '#000', padding: '1rem', borderRadius: '20px', overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {!scannerActive ? (
                            <button
                                onClick={startScanner}
                                style={{
                                    padding: '1.5rem 2rem',
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <CheckCircle size={32} />
                                カメラを起動する
                            </button>
                        ) : (
                            <div id="reader" style={{ width: '100%' }}></div>
                        )}
                    </div>

                    {/* Type Selector */}
                    <div style={{ marginTop: '2rem', width: '100%', maxWidth: '500px' }}>
                        <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setType('in')}
                                    style={{
                                        flex: 1, padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1.25rem',
                                        background: type === 'in' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        color: '#fff', transition: 'all 0.2s'
                                    }}
                                >
                                    入室
                                </button>
                                <button
                                    onClick={() => setType('out')}
                                    style={{
                                        flex: 1, padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1.25rem',
                                        background: type === 'out' ? 'var(--secondary)' : 'rgba(255,255,255,0.1)',
                                        color: '#fff', transition: 'all 0.2s'
                                    }}
                                >
                                    退室
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>直近の記録</h4>
                    {history.length === 0 && <p style={{ fontSize: '0.8125rem', opacity: 0.5 }}>まだ記録はありません</p>}
                    {history.map((h, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem' }}>
                            <span>{h.name}</span>
                            <span>
                                <span className="status-badge" style={{ background: h.type === 'in' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(236, 72, 153, 0.2)', color: h.type === 'in' ? '#22c55e' : '#ec4899', marginRight: '0.5rem' }}>
                                    {h.type === 'in' ? '入' : '退'}
                                </span>
                                {h.time}
                            </span>
                        </div>
                    ))}
                </div>
            </main>

            <style jsx global>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                #reader__scan_region video {
                    border-radius: 12px;
                    object-fit: cover !important;
                }
                #reader__dashboard_section_csr button {
                    background: var(--primary) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    cursor: pointer;
                    font-weight: bold;
                }
                #reader__status_span { display: none !important; }
            `}</style>
        </div>
    )
}
