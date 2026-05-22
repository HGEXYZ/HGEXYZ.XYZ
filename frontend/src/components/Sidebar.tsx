'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, TrendingUp, Calendar, Radio, Settings, ChevronLeft, ChevronRight, BrainCircuit, BarChart3, Landmark, Newspaper } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: BarChart3 },
  { href: '/ai-terminal', label: 'AI Terminal', icon: BrainCircuit },
  { href: '/fed-monitor', label: 'Fed Monitor', icon: Landmark },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/intel-feed', label: 'Intel Feed', icon: Newspaper },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isChart = pathname.startsWith('/chart')
  if (isChart) return null

  return (
    <aside
      className={`relative flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      } shrink-0`}
    >
      <div className="glass-strong flex flex-col h-full py-5 px-3 rounded-none border-l-0 border-y-0 relative overflow-hidden">
        <div className="glow-orb w-48 h-48 bg-[#a855f7] top-[-80px] right-[-60px] opacity-10" />

        <Link href="/" className={`flex items-center gap-3 px-2 mb-8 ${collapsed ? 'justify-center' : ''}`}>
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center neon-glow-sm shrink-0">
            <span className="text-white text-sm font-bold font-mono">H</span>
          </span>
          {!collapsed && (
            <span className="text-white font-bold font-display text-lg tracking-tight">
              HG<span className="text-[#a855f7]">EXYZ</span>
            </span>
          )}
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20 neon-glow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a855f7] glow-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className={`flex flex-col gap-1 mt-auto ${collapsed ? 'items-center' : ''}`}>
          <button className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#94a3b8] hover:text-white hover:bg-white/5 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}>
            <Settings size={20} />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1e1b2e] border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7] hover:bg-[#a855f7]/20 transition-all z-10"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  )
}
