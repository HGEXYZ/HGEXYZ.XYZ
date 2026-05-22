'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Bell, Bot, ChevronDown, Activity } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  if (pathname.startsWith('/chart')) return null
  const [time, setTime] = useState('')
  const [status, setStatus] = useState('CONNECTING')

  useEffect(() => {
    const sync = () => {
      const now = new Date()
      setTime(now.toISOString().slice(11, 19) + 'Z')
    }
    sync()
    const t = setInterval(sync, 1000)
    const s = setTimeout(() => setStatus('LIVE'), 1500)
    return () => { clearInterval(t); clearTimeout(s) }
  }, [])

  return (
    <header className="glass-strong rounded-2xl mx-4 mt-4 px-5 py-3 flex items-center justify-between relative overflow-hidden">
      <div className="glow-orb w-32 h-32 bg-[#a855f7]/20 top-[-40px] left-[-40px]" />

      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search markets, symbols, news..."
            className="w-full bg-[#ffffff08] border border-[#ffffff10] rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#a855f7]/40 focus:bg-[#ffffff10] transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#94a3b8] bg-[#ffffff08] px-1.5 py-0.5 rounded border border-[#ffffff10] font-mono">/</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 text-xs font-mono bg-[#ffffff08] px-3 py-1.5 rounded-xl border border-[#ffffff08]">
          <span className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-[#10b981]' : 'bg-[#a855f7]'} ${status === 'LIVE' ? 'shadow-[0_0_8px_rgba(16,185,129,0.4)]' : ''}`} />
          <span className="text-[#94a3b8] font-medium">ZULU</span>
          <span className="text-white font-semibold tabular-nums">{time}</span>
          <span className="text-[#ffffff20]">|</span>
          <span className={status === 'LIVE' ? 'text-[#10b981]' : 'text-[#a855f7]'}>{status}</span>
        </div>

        <div className="flex items-center gap-1">
          <button className="relative w-9 h-9 rounded-xl bg-[#ffffff08] border border-[#ffffff10] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#ffffff15] transition-all">
            <Bell size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7] hover:bg-[#a855f7]/25 transition-all neon-glow-sm">
            <Bot size={16} />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ffffff08] border border-[#ffffff10] hover:bg-[#ffffff15] transition-all">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-white text-[10px] font-bold">H</span>
            <ChevronDown size={14} className="text-[#94a3b8]" />
          </button>
        </div>
      </div>
    </header>
  )
}
