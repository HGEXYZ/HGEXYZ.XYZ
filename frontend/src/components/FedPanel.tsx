'use client'

import { Landmark, Clock, Sparkles, TrendingDown } from 'lucide-react'

const FED_RATE = '4.25% – 4.50%'
const NEXT_FOMC = 'June 18, 2026'
const NEXT_FOMC_DAYS = (() => {
  const diff = Math.ceil((new Date(2026, 5, 18).getTime() - Date.now()) / 86400000)
  return diff > 0 ? `${diff} DAYS` : 'TODAY'
})()

const RECENT_DECISIONS = [
  { date: 'May 7, 2026', decision: 'HOLD', rate: '4.25% – 4.50%', change: '0.00%', icon: 'equal' },
  { date: 'Mar 19, 2026', decision: 'HOLD', rate: '4.25% – 4.50%', change: '0.00%', icon: 'equal' },
  { date: 'Jan 29, 2026', decision: 'HOLD', rate: '4.25% – 4.50%', change: '0.00%', icon: 'equal' },
  { date: 'Dec 18, 2025', decision: 'CUT', rate: '4.25% – 4.50%', change: '-0.25%', icon: 'down' },
  { date: 'Nov 7, 2025', decision: 'CUT', rate: '4.50% – 4.75%', change: '-0.25%', icon: 'down' },
  { date: 'Sep 18, 2025', decision: 'CUT', rate: '4.75% – 5.00%', change: '-0.50%', icon: 'down' },
]

export default function FedPanel() {
  return (
    <div className="glass-card overflow-hidden animate-slide-up stagger-2">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#ffffff08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
            <Landmark size={16} className="text-[#a855f7]" />
          </div>
          <div>
            <h3 className="text-white font-display font-semibold">Federal Reserve</h3>
            <p className="text-[#94a3b8] text-xs font-mono">Monetary policy monitor</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <div className="bg-[#ffffff08] rounded-2xl p-4 border border-[#ffffff08]">
          <div className="text-xs font-mono text-[#94a3b8] mb-2">Current Rate</div>
          <div className="text-lg font-display font-bold text-[#c084fc]">{FED_RATE}</div>
          <div className="text-xs text-[#94a3b8] mt-1">Federal Funds Rate</div>
        </div>
        <div className="bg-[#ffffff08] rounded-2xl p-4 border border-[#ffffff08]">
          <div className="text-xs font-mono text-[#94a3b8] mb-2">Next FOMC</div>
          <div className="text-sm font-display font-bold text-white">{NEXT_FOMC}</div>
          <div className="flex items-center gap-1.5 text-xs text-[#10b981] mt-2">
            <Clock size={12} />
            {NEXT_FOMC_DAYS}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="text-xs font-mono text-[#94a3b8] mb-3 tracking-wider uppercase">Recent Decisions</div>
        <div className="space-y-1.5">
          {RECENT_DECISIONS.map((d) => (
            <div
              key={d.date}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#ffffff04] border border-[#ffffff08] hover:bg-[#ffffff08] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                  d.decision === 'HOLD' ? 'bg-[#a855f7]/15 text-[#a855f7]' : 'bg-[#10b981]/15 text-[#10b981]'
                }`}>
                  {d.decision === 'HOLD' ? '=' : '\u2193'}
                </span>
                <span className="text-sm text-[#94a3b8]">{d.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono">{d.rate}</span>
                <span className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded-lg ${
                  d.change.startsWith('+') ? 'bg-[#10b981]/15 text-[#10b981]' :
                  d.change === '0.00%' ? 'bg-[#94a3b8]/15 text-[#94a3b8]' :
                  'bg-[#ef4444]/15 text-[#ef4444]'
                }`}>{d.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
