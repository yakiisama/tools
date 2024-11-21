import type { Metadata } from 'next'
import './globals.css'
import Nav from './nav'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'TOOLS',
  description: '日常使用的一些工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <main className="flex h-full flex-col items-center justify-between">
          <Nav />
          <div className="z-1 w-full max-w-5xl items-center justify-between p-24 text-sm">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
