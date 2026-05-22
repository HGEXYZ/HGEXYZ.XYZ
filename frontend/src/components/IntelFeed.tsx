'use client'

import { useState, useEffect } from 'react'
import { Shield, Sparkles, Activity, AlertTriangle, Radio, Globe, Database, Zap } from 'lucide-react'

interface IntelItem {
  id: number
  time: string
  source: string
  category: string
  text: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const mockIntel: IntelItem[] = [
  { id: 1, time: '23:58:12Z', source: 'SIGINT/NSA', category: 'CYBER', text: 'Large-scale phishing campaign targeting defense contractors detected across APAC region.', severity: 'high' },
  { id: 2, time: '23:56:44Z', source: 'OPEN-SOURCE', category: 'GEOPOL', text: 'Satellite imagery confirms new naval construction at disputed Spratly Islands facility.', severity: 'medium' },
  { id: 3, time: '23:54:01Z', source: 'SIGINT/GCHQ', category: 'COMMS', text: 'Encrypted diplomatic traffic spike observed between Moscow and Tehran. Possible coordination.', severity: 'high' },
  { id: 4, time: '23:50:30Z', source: 'OSINT/RAIL', category: 'LOGISTICS', text: 'Unusual military rail movements detected near Belarusian border with Poland. 3x normal volume.', severity: 'critical' },
  { id: 5, time: '23:47:18Z', source: 'SIGINT/FVEY', category: 'ENERGY', text: 'Russian gas exports via TurkStream reduced by 40% amid maintenance. EU reserves at 68%.', severity: 'medium' },
  { id: 6, time: '23:43:55Z', source: 'OPEN-SOURCE', category: 'FINANCE', text: 'Chinese state-owned entities moving large gold reserves from London to Shanghai vaults.', severity: 'high' },
  { id: 7, time: '23:40:22Z', source: 'SIGINT/NSA', category: 'MILITARY', text: 'North Korean radar systems activated along DMZ. Conducting electronic warfare exercises.', severity: 'critical' },
  { id: 8, time: '23:36:10Z', source: 'OSINT/ADS-B', category: 'AVIATION', text: 'Six unidentified aircraft operating without transponders over Black Sea. NATO AWACS scrambled.', severity: 'high' },
  { id: 9, time: '23:32:48Z', source: 'SIGINT/DFRL', category: 'CYBER', text: 'New strain of ransomware targeting European energy grid operators. CISA warning issued.', severity: 'medium' },
  { id: 10, time: '23:28:15Z', source: 'OPEN-SOURCE', category: 'WEATHER', text: 'CAT-5 typhoon expected to impact semiconductor manufacturing hubs in Taiwan within 48hrs.', severity: 'medium' },
]

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'CRITICAL', color: '#ef4444', bg: 'bg-[#ef4444]/15' },
  high: { label: 'HIGH', color: '#a855f7', bg: 'bg-[#a855f7]/15' },
  medium: { label: 'MEDIUM', color: '#c084fc', bg: 'bg-[#c084fc]/15' },
  low: { label: 'LOW', color: '#94a3b8', bg: 'bg-[#94a3b8]/15' },
}

const catIconsMap: Record<string, typeof Shield> = {
  ALL: Activity, CYBER: Shield, GEOPOL: Globe, MILITARY: Zap, ENERGY: Zap, FINANCE: Database, COMMS: Radio,
}

export default function IntelFeed() {
  const [items, setItems] = useState<IntelItem[]>(mockIntel)
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  const categories = ['ALL', 'CYBER', 'GEOPOL', 'MILITARY', 'ENERGY', 'FINANCE', 'COMMS']
  const filtered = filter === 'ALL' ? items : items.filter((i) => i.category === filter)

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const res = await fetch('/api/osiris/gdelt')
        const json = await res.json()
        if (json?.events?.length) {
          const mapped: IntelItem[] = json.events.map((e: any, i: number) => ({
            id: i,
            time: new Date().toISOString().slice(11, 19) + 'Z',
            source: (e.name || '').split(']')[0]?.replace('[', '') || 'OSINT',
            category: (e.type || 'INTEL').toUpperCase(),
            text: (e.name || '').replace(/\[.*?\]\s*/, ''),
            severity: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
          }))
          setItems(mapped.slice(0, 30))
        }
      } catch {
        // keep mock fallback
      } finally {
        setLoading(false)
      }
    }
    fetchIntel()
    const interval = setInterval(fetchIntel, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-card overflow-hidden animate-slide-up stagger-2">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
            <Shield size={16} className="text-[#a855f7]" />
          </div>
          <div>
            <h3 className="text-white font-display font-semibold text-lg">SIGINT / OSINT</h3>
            <p className="text-[#94a3b8] text-xs font-mono">Global intelligence monitoring</p>
          </div>
        </div>
        <div className="bg-[#ffffff08] px-3 py-1.5 rounded-xl border border-[#ffffff08] text-xs font-mono text-[#94a3b8] flex items-center gap-1.5">
          <Activity size={12} className="text-[#10b981]" />
          {items.length} active
        </div>
      </div>

      <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-[#ffffff08]">
        {categories.map((cat) => {
          const CatIcon = catIconsMap[cat] || Activity
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                filter === cat
                  ? 'bg-[#a855f7]/15 border-[#a855f7]/30 text-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                  : 'bg-transparent border-[#ffffff10] text-[#94a3b8] hover:text-white hover:bg-[#ffffff08]'
              }`}
            >
              <CatIcon size={12} />
              {cat}
            </button>
          )
        })}
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] animate-spin" />
              <span className="text-sm text-[#94a3b8] font-mono">Fetching intelligence...</span>
            </div>
          </div>
        ) : (
          filtered.map((item, i) => {
            const sev = severityConfig[item.severity] || severityConfig.low
            return (
              <div
                key={item.id}
                className={`px-5 py-3.5 transition-all cursor-pointer hover:bg-[#ffffff04] group ${
                  i < filtered.length - 1 ? 'border-b border-[#ffffff08]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: sev.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-mono mb-1.5 flex-wrap">
                      <span className="text-[#94a3b8]">{item.time}</span>
                      <span className="text-[#a855f7] font-medium">[{item.source}]</span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium border ${sev.bg}`} style={{ borderColor: `${sev.color}30`, color: sev.color }}>
                        {sev.label}
                      </span>
                      <span className="text-[#94a3b8] text-xs px-2 py-0.5 rounded-lg bg-[#ffffff05] border border-[#ffffff10]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex items-center gap-2 px-6 py-3 border-t border-[#ffffff08] bg-[#ffffff04]">
        <Sparkles size={12} className="text-[#a855f7]" />
        <span className="text-xs text-[#94a3b8] font-mono">Live — HGEXYZ GDELT / OSINT</span>
      </div>
    </div>
  )
}
