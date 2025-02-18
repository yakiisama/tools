import type { Metadata } from 'next'
import './globals.css'
import Nav from './nav'
import { Toaster } from 'sonner'
import { HomeIcon } from './icons/home'

export const metadata = {
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
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <Toaster />
        <main className="flex min-h-screen flex-col items-center justify-between bg-[#f2edea] bg-[url(/noise.png)]">
          <Nav />
          <div className="z-1 w-full max-w-5xl items-center justify-between p-24 text-sm">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
