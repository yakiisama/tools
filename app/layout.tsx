import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import Navbar from './components/layout/navbar'

/**
 * 网站元数据配置 - SEO优化
 */
export const metadata: Metadata = {
  title: {
    default: '工具箱',
    template: '%s | 工具箱',
  },
  description: '日常使用的实用工具集合，包含K歌下载等功能',
  keywords: ['工具箱', 'K歌下载', '全民K歌', '实用工具'],
  authors: [{ name: '工具箱开发团队' }],
  creator: '工具箱',
  publisher: '工具箱',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: '工具箱',
    description: '日常使用的实用工具集合',
    siteName: '工具箱',
  },
  twitter: {
    card: 'summary_large_image',
    title: '工具箱',
    description: '日常使用的实用工具集合',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Toast 通知组件 */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        
        {/* 导航栏 */}
        <Navbar />
        
        {/* 主要内容区域 */}
        <main className="min-h-screen bg-[#f2edea] bg-[url(/noise.png)] pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
        
        {/* 页脚 */}
        <footer className="border-t bg-card/50 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>&copy; 2024 工具箱. 让生活更便捷.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
