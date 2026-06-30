'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton } from '@clerk/nextjs'
import {
  Sparkles, ClipboardList, BarChart2, Mail, RefreshCw,
  Keyboard, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'

const NAV = [
  { label: 'Summarize', href: '/dashboard', icon: Sparkles },
  { label: 'History', href: '/dashboard/history', icon: ClipboardList },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
]
const TOOLS = [
  { label: 'Email assistant', href: '/dashboard/email', icon: Mail },
  { label: 'Repurpose', href: '/dashboard/repurpose', icon: RefreshCw },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const pageTitle = [...NAV, ...TOOLS].find(n => n.href === pathname)?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative flex flex-col flex-shrink-0 overflow-hidden"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 h-[56px] px-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#f472b6)' }}>S</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-bold text-sm gradient-text whitespace-nowrap">
                SummrAI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {!collapsed && <div className="text-[10px] font-semibold tracking-[1.5px] uppercase px-2 py-2 pt-1" style={{ color: 'var(--text-secondary)' }}>Main</div>}
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${active ? 'sidebar-link active' : 'sidebar-link'}`}
                  title={collapsed ? label : undefined}>
                  <Icon size={16} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="whitespace-nowrap">{label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            )
          })}

          {!collapsed && <div className="text-[10px] font-semibold tracking-[1.5px] uppercase px-2 py-2 mt-2" style={{ color: 'var(--text-secondary)' }}>Tools</div>}
          {collapsed && <div className="h-3" />}
          {TOOLS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${active ? 'sidebar-link active' : 'sidebar-link'}`}
                  title={collapsed ? label : undefined}>
                  <Icon size={16} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="whitespace-nowrap">{label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Upgrade badge */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-2 mb-2 p-3 rounded-xl"
              style={{ background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={12} style={{ color: 'var(--accent-purple2)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-purple2)' }}>Pro plan</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Unlimited summaries & all features</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User */}
        <div className="flex items-center gap-2.5 p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
          <UserButton afterSignOutUrl="/" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                <div className="text-xs font-medium truncate">My Account</div>
                <div className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>Pro plan</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* MAIN */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 h-[56px] flex-shrink-0"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <h1 className="text-sm font-semibold">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Keyboard size={12} />
              <span>⌘ Enter to generate</span>
            </div>
            <Link href="/" className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              ← Home
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
