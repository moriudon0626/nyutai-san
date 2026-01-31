import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '入退さん - 複数店舗対応入退室管理サービス',
    description: '塾や自習室に最適なQRコード入退室管理システム',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    )
}
