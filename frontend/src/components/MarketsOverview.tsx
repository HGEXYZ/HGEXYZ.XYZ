'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, BarChart3, Activity, Sparkles } from 'lucide-react'

interface MarketItem {
  symbol: string
  name: string
  group: string
  price: string
  change: string
  changePercent: string
  positive: boolean
}

const displaySymbols: Record<string, string> = {
  '^GSPC': 'SPX', '^IXIC': 'IXIC', '^DJI': 'DJI', 'DX-Y.NYB': 'DXY',
  'CL=F': 'CL', 'GC=F': 'GC', 'SI=F': 'SI', 'BTC-USD': 'BTC', 'ETH-USD': 'ETH',
}

const SYMBOL_ICONS: Record<string, { char: string; bg: string; gradient: string }> = {
  SPX: { char: 'S', bg: '#ff9800', gradient: 'from-[#ff9800] to-[#f57c00]' },
  IXIC: { char: 'N', bg: '#2962ff', gradient: 'from-[#2962ff] to-[#1a237e]' },
  DJI: { char: 'D', bg: '#089981', gradient: 'from-[#089981] to-[#00695c]' },
  DXY: { char: '$', bg: '#a78bfa', gradient: 'from-[#a78bfa] to-[#7c3aed]' },
  CL: { char: 'O', bg: '#f23645', gradient: 'from-[#f23645] to-[#b71c1c]' },
  GC: { char: 'G', bg: '#d1b200', gradient: 'from-[#d1b200] to-[#f9a825]' },
  SI: { char: 'S', bg: '#787b86', gradient: 'from-[#787b86] to-[#455a64]' },
  BTC: { char: '\u0243', bg: '#ff9800', gradient: 'from-[#ff9800] to-[#e65100]' },
  ETH: { char: '\u27E0', bg: '#2962ff', gradient: 'from-[#2962ff] to-[#0d47a1]' },
}

function SymbolIcon({ sym, size = 36 }: { sym: string; size?: number }) {
  const icon = SYMBOL_ICONS[sym] || { char: sym[0], bg: '#434651', gradient: 'from-[#434651] to-[#263238]' }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl shrink-0 font-bold font-mono text-white bg-gradient-to-br ${icon.gradient} shadow-lg`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {icon.char}
    </span>
  )
}

function MiniSparkline({ positive }: { positive: boolean }) {
  const path = positive
    ? 'M0,12 Q8,2 16,8 Q24,14 32,4 Q40,-2 48,6'
    : 'M0,4 Q8,14 16,8 Q24,2 32,12 Q40,18 48,10'
  return (
    <svg width="48" height="16" viewBox="0 0 48 16" className="shrink-0">
      <path d={path} fill="none" stroke={positive ? '#10b981' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function MarketsOverview() {
  const [markets, setMarkets] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const router = useRouter()

  const openChart = useCallback((sym: string, n: string) => {
    router.push(`/chart?s=${encodeURIComponent(sym)}&n=${encodeURIComponent(n)}`)
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/markets')
        const json = await res.json()
        if (json?.markets?.length) {
          setMarkets(json.markets)
          setError(false)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-card overflow-hidden animate-slide-up stagger-1">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
            <BarChart3 size={18} className="text-[#a855f7]" />
          </div>
          <div>
            <h3 className="text-white font-display font-semibold text-lg">Market Overview</h3>
            <p className="text-[#94a3b8] text-xs font-mono">Real-time prices</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-[#94a3b8] bg-[#ffffff08] px-3 py-1.5 rounded-xl border border-[#ffffff08]">
            <Activity size={12} className="text-[#10b981]" />
            Auto-refresh
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] animate-spin" />
            <span className="text-sm text-[#94a3b8] font-mono">Loading market data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-[#ef4444] text-sm font-mono">Could not load market data</p>
        </div>
      ) : (
        <div className="divide-y divide-[#ffffff08]">
          {markets.map((item, i) => {
            const sym = displaySymbols[item.symbol] || item.symbol
            const change = item.change !== '0.00' ? (item.positive ? '+' : '') + item.change : '0.00'
            const pct = item.changePercent !== '0.00' ? (item.positive ? '+' : '') + item.changePercent + '%' : '0.00%'
            return (
              <div
                key={item.symbol}
                onClick={() => openChart(item.symbol, item.name)}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#ffffff04] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <SymbolIcon sym={sym} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold font-mono text-sm">{sym}</span>
                      <span className="text-[#94a3b8] text-xs font-mono">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MiniSparkline positive={item.positive} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-white font-semibold font-mono text-base tabular-nums">
                    ${item.price !== '—' ? parseFloat(item.price).toLocaleString('en-US') : '—'}
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${item.positive ? 'bg-[#10b981]/10' : 'bg-[#ef4444]/10'}`}>
                    {item.positive
                      ? <TrendingUp size={14} className="text-[#10b981]" />
                      : <TrendingDown size={14} className="text-[#ef4444]" />
                    }
                    <span className={`font-mono text-sm font-semibold tabular-nums ${item.positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {change}
                    </span>
                    <span className={`font-mono text-xs ${item.positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {pct}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-2 px-6 py-3 border-t border-[#ffffff08] bg-[#ffffff04]">
        <Sparkles size={12} className="text-[#a855f7]" />
        <span className="text-xs text-[#94a3b8] font-mono">Yahoo Finance — click row for detailed chart</span>
      </div>
    </div>
  )
}
