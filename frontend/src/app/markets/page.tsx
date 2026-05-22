import MarketsOverview from '@/components/MarketsOverview'
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react'

const stats = [
  { label: 'S&P 500 YTD', value: '+9.8%', color: '#10b981', icon: TrendingUp },
  { label: 'NASDAQ YTD', value: '+12.4%', color: '#10b981', icon: TrendingUp },
  { label: '10-YR YIELD', value: '4.28%', color: '#c084fc', icon: Activity },
  { label: 'VIX', value: '14.32', color: '#a855f7', icon: Activity },
  { label: 'DXY', value: '104.87', color: '#10b981', icon: TrendingUp },
]

export default function MarketsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">
          Markets &amp; <span className="gradient-text">Data</span>
        </h1>
        <p className="text-[#94a3b8] text-sm mt-1.5 font-mono">
          Live asset prices — Yahoo Finance
        </p>
      </div>

      <MarketsOverview />

      <div className="glass-card overflow-hidden animate-slide-up">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ffffff08]">
          <div className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
            <BarChart3 size={16} className="text-[#a855f7]" />
          </div>
          <h3 className="text-white font-display font-semibold text-lg">Market Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-[#ffffff08] rounded-2xl p-4 border border-[#ffffff08] text-center hover:bg-[#ffffff10] transition-all hover:border-[#ffffff15]">
                <div className="flex justify-center mb-2">
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div className="text-xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[#94a3b8] text-xs font-mono mt-1.5 tracking-wide">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
