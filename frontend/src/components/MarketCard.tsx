'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface MarketData {
  symbol: string
  name: string
  price: string
  change: string
  changePercent: string
  positive: boolean
}

const defaultMarkets: Record<string, MarketData[]> = {
  indices: [
    { symbol: '^GSPC', name: 'S&P 500', price: '5,234.18', change: '+12.45', changePercent: '+0.24%', positive: true },
    { symbol: '^IXIC', name: 'NASDAQ', price: '16,428.82', change: '+55.30', changePercent: '+0.34%', positive: true },
    { symbol: '^DJI', name: 'DOW JONES', price: '39,175.40', change: '-8.60', changePercent: '-0.02%', positive: false },
    { symbol: 'DX-Y.NYB', name: 'DOLLAR INDEX', price: '104.87', change: '+0.32', changePercent: '+0.31%', positive: true },
  ],
  defense: [
    { symbol: 'RTX', name: 'RAYTHEON', price: '107.23', change: '+1.45', changePercent: '+1.37%', positive: true },
    { symbol: 'LMT', name: 'LOCKHEED M', price: '485.60', change: '+3.20', changePercent: '+0.66%', positive: true },
    { symbol: 'GD', name: 'GEN DYNAMICS', price: '298.45', change: '-1.10', changePercent: '-0.37%', positive: false },
    { symbol: 'NOC', name: 'NORTHROP', price: '472.80', change: '+5.90', changePercent: '+1.26%', positive: true },
  ],
  energy: [
    { symbol: 'CL=F', name: 'CRUDE OIL', price: '82.47', change: '+0.85', changePercent: '+1.04%', positive: true },
    { symbol: 'NG=F', name: 'NATURAL GAS', price: '2.16', change: '-0.04', changePercent: '-1.82%', positive: false },
    { symbol: 'XLE', name: 'ENERGY SCTR', price: '89.34', change: '+0.52', changePercent: '+0.59%', positive: true },
  ],
  commodities: [
    { symbol: 'GC=F', name: 'GOLD', price: '2,158.30', change: '+12.40', changePercent: '+0.58%', positive: true },
    { symbol: 'SI=F', name: 'SILVER', price: '24.67', change: '-0.18', changePercent: '-0.72%', positive: false },
    { symbol: 'HG=F', name: 'COPPER', price: '4.12', change: '+0.06', changePercent: '+1.48%', positive: true },
  ],
  crypto: [
    { symbol: 'BTC-USD', name: 'BITCOIN', price: '67,432', change: '+1,234', changePercent: '+1.86%', positive: true },
    { symbol: 'ETH-USD', name: 'ETHEREUM', price: '3,521', change: '+87', changePercent: '+2.53%', positive: true },
    { symbol: 'SOL-USD', name: 'SOLANA', price: '172.45', change: '-3.20', changePercent: '-1.82%', positive: false },
  ],
}

const displaySymbols: Record<string, string> = {
  '^GSPC': 'SPX', '^IXIC': 'IXIC', '^DJI': 'DJI', 'DX-Y.NYB': 'DXY',
  'CL=F': 'CL', 'NG=F': 'NG', 'GC=F': 'GC', 'SI=F': 'SI', 'HG=F': 'HG',
  'BTC-USD': 'BTC', 'ETH-USD': 'ETH', 'SOL-USD': 'SOL',
}

const categoryIcons: Record<string, string> = {
  indices: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  defense: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  energy: 'M12 3v9l4-2.5M12 3L8 9.5 12 12m0-9L8 9.5m4 2.5v9l4-5.5M12 21V12l-4 5.5M12 21l4-5.5M8 9.5l-4 2.5 4 5.5M8 9.5L12 12m-4 5.5L12 12',
  commodities: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  crypto: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
}

const MiniChart = ({ positive }: { positive: boolean }) => (
  <svg width="56" height="24" viewBox="0 0 56 24" className="shrink-0">
    <defs>
      <linearGradient id={`mg-${positive ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={positive ? '#00ff88' : '#ff4444'} stopOpacity="0.2" />
        <stop offset="100%" stopColor={positive ? '#00ff88' : '#ff4444'} stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path
      d={positive
        ? 'M0 20 Q8 18 14 19 T28 12 T42 6 T56 2'
        : 'M0 4 Q8 6 14 5 T28 12 T42 18 T56 22'
      }
      stroke={positive ? '#00ff88' : '#ff4444'}
      strokeWidth="1.5"
      fill="none"
      opacity="0.7"
    />
    <path
      d={positive
        ? 'M0 20 Q8 18 14 19 T28 12 T42 6 T56 2 L56 24 L0 24 Z'
        : 'M0 4 Q8 6 14 5 T28 12 T42 18 T56 22 L56 24 L0 24 Z'
      }
      fill={`url(#mg-${positive ? 'up' : 'dn'})`}
    />
  </svg>
)

export default function MarketCard({ category }: { category: string }) {
  const [markets, setMarkets] = useState<Record<string, MarketData[]>>(defaultMarkets)
  const [activeTab, setActiveTab] = useState(category)
  const [loading, setLoading] = useState(true)
  const categories = ['indices', 'defense', 'energy', 'commodities', 'crypto']
  const data = markets[activeTab] || []

  const router = useRouter()
  const openChart = useCallback((sym: string, n: string) => {
    router.push(`/chart?s=${encodeURIComponent(sym)}&n=${encodeURIComponent(n)}`)
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/markets')
        const json = await res.json()
        if (json?.categories) setMarkets(json.categories)
      } catch {
        // fallback to mock data
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const advancers = data.filter((d) => d.positive).length
  const decliners = data.filter((d) => !d.positive).length

  return (
    <div className="pro-panel p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="pro-header mb-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#00ff88]">
            <path d={categoryIcons[activeTab] || categoryIcons.indices} />
          </svg>
          {activeTab.toUpperCase()}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-[#00ff88]">▲ {advancers}</span>
          <span className="text-[#ff4444]">▼ {decliners}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all duration-150 ${
              activeTab === cat
                ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] shadow-[inset_0_0_0_1px_rgba(0,255,136,0.1)]'
                : 'bg-transparent border-[#1e293b]/60 text-[#475569] hover:text-[#94a3b8] hover:border-[#334155]'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-0.5">
        {loading && data.every((d) => d.price === '—') ? (
          <div className="flex items-center justify-center py-10 text-[10px] font-mono text-[#475569]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8800] animate-pulse mr-2.5" />
            LOADING MARKET DATA...
          </div>
        ) : (
          data.map((item, i) => {
            const price = item.price !== '—' ? parseFloat(item.price).toLocaleString('en-US') : '—'
            const change = item.change !== '0.00' ? (item.positive ? '+' : '') + item.change : '0.00'
            const pct = item.changePercent !== '0.00' ? (item.positive ? '+' : '') + item.changePercent + '%' : '0.00%'
            return (
              <div
                key={item.symbol}
                onClick={() => openChart(item.symbol, item.name)}
                className={`pro-row cursor-pointer ${i < data.length - 1 ? 'pro-divider' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[#00d4ff] text-xs font-mono font-semibold w-14 shrink-0">{displaySymbols[item.symbol] || item.symbol}</span>
                  <span className="text-[#475569] text-[11px] font-mono truncate hidden sm:block">{item.name}</span>
                  <MiniChart positive={item.positive} />
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <span className="pro-value text-sm tabular-nums w-24 text-right">${price}</span>
                  <div className="flex flex-col items-end w-24">
                    <span className={`${item.positive ? 'pro-up' : 'pro-down'} tabular-nums`}>{change}</span>
                    <span className={`${item.positive ? 'pro-up' : 'pro-down'} opacity-60 text-[10px]`}>{pct}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1e293b]/40 flex items-center gap-2 text-[10px] font-mono text-[#475569]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_6px_rgba(0,255,136,0.5)]" />
        LIVE &mdash; YAHOO FINANCE &mdash; CLICK FOR CHART
      </div>
    </div>
  )
}
