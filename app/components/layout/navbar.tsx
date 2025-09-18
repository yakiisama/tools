'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/lib/utils'

export interface NavbarProps {
  className?: string
}

/**
 * 顶部导航栏组件
 * 使用 shadcn/ui 和 icônes 图标系统
 */
export default function Navbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <nav className={cn(
      'fixed top-0 w-full z-50 bg-card/75 backdrop-blur-md border-b border-border',
      className
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo 区域 */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <i className="i-lucide:home w-6 h-6" />
            <span className="hidden sm:block font-semibold text-lg">
              工具箱
            </span>
          </Link>

          {/* 桌面端导航菜单 */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/" label="首页" isActive={pathname === '/'} />
            <NavLink href="/ktv" label="K歌下载" isActive={pathname === '/ktv'} />
            <NavLink href="/altitude" label="海拔测量" isActive={pathname === '/altitude'} />
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="打开菜单"
            >
              <i className={cn(
                "w-5 h-5 transition-all",
                isMenuOpen ? "i-lucide:x" : "i-lucide:menu"
              )} />
            </Button>
          </div>
        </div>

        {/* 移动端菜单面板 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              <MobileNavLink
                href="/"
                label="首页"
                icon="i-lucide:home"
                isActive={pathname === '/'}
                onClick={() => setIsMenuOpen(false)}
              />
              <MobileNavLink
                href="/ktv"
                label="K歌下载"
                icon="i-lucide:mic-vocal"
                isActive={pathname === '/ktv'}
                onClick={() => setIsMenuOpen(false)}
              />
              <MobileNavLink
                href="/altitude"
                label="海拔测量"
                icon="i-lucide:mountain"
                isActive={pathname === '/altitude'}
                onClick={() => setIsMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

/**
 * 桌面端导航链接组件
 */
interface NavLinkProps {
  href: string
  label: string
  isActive?: boolean
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative px-3 py-2 text-sm font-medium transition-colors rounded-md',
        'hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isActive 
          ? 'text-primary bg-accent' 
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      {isActive && (
        <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  )
}

/**
 * 移动端导航链接组件
 */
interface MobileNavLinkProps {
  href: string
  label: string
  icon: string
  isActive?: boolean
  onClick: () => void
}

function MobileNavLink({ href, label, icon, isActive, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive 
          ? 'bg-accent text-accent-foreground' 
          : 'text-muted-foreground'
      )}
    >
      <i className={`${icon} w-5 h-5`} />
      <span>{label}</span>
    </Link>
  )
}
