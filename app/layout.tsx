import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '口播XX - 智能视频压缩工具',
  description: '将10分钟以上口播视频自动压缩至5分钟，保留核心内容且逻辑连贯',
  keywords: '视频压缩, 口播, AI剪辑, 内容创作, 知识博主',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
