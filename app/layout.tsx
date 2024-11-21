import type { Metadata } from 'next'
import './globals.css'
import Nav from './nav'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: '工具箱',
  description: '日常使用的一些工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://www.looyank.cc/_astro/young.CTkkcRXA_2hMNE1.webp" sizes="any" />
      </head>
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
