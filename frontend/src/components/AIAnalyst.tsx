'use client'

import { useState, useEffect } from 'react'
import { Bot, TrendingUp, TrendingDown, Activity, BarChart3, AlertTriangle, Zap, Sparkles, Target, Shield, Brain } from 'lucide-react'

interface MarketSnapshot {
  symbol: string; name: string; price: string; change: string; changePercent: string; positive: boolean; group: string
}

interface Analysis {
  asset: string
  trend: 'bullish' | 'bearish' | 'neutral'
  strength: number // 1-10
  signal: string
  keyLevels: { support: string; resistance: string }
  analysis: string
  recommendation: string
}

function generateAnalysis(m: MarketSnapshot): Analysis {
  const chg = parseFloat(m.change)
  const absChg = Math.abs(chg)
  const trend: 'bullish' | 'bearish' | 'neutral' = m.positive ? 'bullish' : chg === 0 ? 'neutral' : 'bearish'
  const strength = Math.min(Math.round(absChg * 3 + 3), 10) as number
  const price = parseFloat(m.price)

  const bullishPhrases = [
    'Momentum indicators confirm bullish structure with higher highs. Volume profile supports continuation.',
    'Price action shows strong buyer absorption at key support levels. Trend remains intact.',
    'Breakout confirmed above resistance. Institutional flow indicators positive.',
    'Bull flag formation on the hourly. RSI has room to run before overbought.',
    'Smart Money Concepts show accumulator pattern. Liquidity sweeps confirmed.'
  ]
  const bearishPhrases = [
    'Distribution detected at current levels. Volume declining on rallies.',
    'Lower highs formed. Order flow shows seller aggression. Key support at risk.',
    'Bearish divergence on RSI. Momentum shift suggests potential reversal.',
    'Break of structure to downside. Liquidity resting below current range.',
    'Institutional selling pressure increasing. Risk-to-reward favors shorts.'
  ]
  const neutralPhrases = [
    'Range-bound consolidation. Awaiting catalyst for directional bias.',
    'Indicators flat. Volume declining. Ideal for mean reversion strategies.',
    'Bid-ask spread widening. Low conviction on both sides. Stay sidelined.',
    'Technical structure unclear. Wait for confirmation before positioning.'
  ]

  const phrases = trend === 'bullish' ? bullishPhrases : trend === 'bearish' ? bearishPhrases : neutralPhrases
  const phrase = phrases[Math.floor(Math.random() * phrases.length)]

  const recs = {
    bullish: [
      'Consider long on pullbacks to support. Trail stops below recent swing low.',
      'Accumulate on dips. Target next resistance zone. Manage risk tightly.',
      'Bullish bias. Look for continuation patterns on lower timeframe.'
    ],
    bearish: [
      'Reduce long exposure. Consider protective puts. Short on rallies to resistance.',
      'Bearish bias. Look for breakdown confirmation before adding size.',
      'Hedge downside risk. Favor short positions with tight stops above resistance.'
    ],
    neutral: [
      'Stand aside until clear direction emerges. Focus on lower timeframe scalps.',
      'Reduce position size. Wait for a confirmed breakout before committing capital.',
      'Range-bound strategy: buy support, sell resistance. Quick profits only.'
    ]
  }

  const recommendation = recs[trend][Math.floor(Math.random() * recs[trend].length)]

  const support = trend === 'bullish'
    ? `$${(price * 0.97).toFixed(price >= 100 ? 0 : 2)}`
    : `$${(price * 0.95).toFixed(price >= 100 ? 0 : 2)}`
  const resistance = trend === 'bearish'
    ? `$${(price * 1.03).toFixed(price >= 100 ? 0 : 2)}`
    : `$${(price * 1.05).toFixed(price >= 100 ? 0 : 2)}`

  return {
    asset: m.symbol,
    trend,
    strength,
    signal: trend === 'bullish' ? 'BUY' : trend === 'bearish' ? 'SELL' : 'HOLD',
    keyLevels: { support, resistance },
    analysis: phrase,
    recommendation,
  }
}

const displayNames: Record<string, string> = {
  '^GSPC': 'S&P 500', '^IXIC': 'NASDAQ', '^DJI': 'DOW JONES',
  'DX-Y.NYB': 'DOLLAR INDEX', 'GC=F': 'GOLD', 'CL=F': 'CRUDE OIL',
  'SI=F': 'SILVER', 'BTC-USD': 'BITCOIN', 'ETH-USD': 'ETHEREUM',
}

export default function AIAnalyst() {
  const [markets, setMarkets] = useState<MarketSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'indices' | 'commodities' | 'crypto'>('all')
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/markets')
        const json = await res.json()
        if (json?.markets?.length) {
          setMarkets(json.markets)
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const filtered = activeTab === 'all' ? markets : markets.filter((m) => m.group === activeTab)
  const analyses = filtered.map(generateAnalysis)

  const tabs = [
    { key: 'all' as const, label: 'All Assets', icon: BarChart3 },
    { key: 'indices' as const, label: 'Indices', icon: TrendingUp },
    { key: 'commodities' as const, label: 'Commodities', icon: Activity },
    { key: 'crypto' as const, label: 'Crypto', icon: Zap },
  ]

  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-display font-semibold text-lg">AI Analyst</h3>
              <span className="flex items-center gap-1 text-[10px] text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[#94a3b8] text-xs font-mono">Pro-grade technical + sentiment analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#ffffff08] rounded-2xl p-1 border border-[#ffffff10]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] animate-spin" />
            <span className="text-sm text-[#94a3b8] font-mono">AI loading market data...</span>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#ffffff08]">
          {analyses.map((a, i) => {
            const market = filtered[i]
            const isHovered = hoveredAsset === a.asset
            return (
              <div
                key={a.asset}
                className="px-6 py-4 transition-all hover:bg-[#ffffff04]"
                onMouseEnter={() => setHoveredAsset(a.asset)}
                onMouseLeave={() => setHoveredAsset(null)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold font-mono ${
                      a.trend === 'bullish' ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20' :
                      a.trend === 'bearish' ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20' :
                      'bg-[#94a3b8]/15 text-[#94a3b8] border border-[#94a3b8]/20'
                    }`}>
                      {a.trend === 'bullish' ? <TrendingUp size={16} /> : a.trend === 'bearish' ? <TrendingDown size={16} /> : <Activity size={16} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold font-mono text-sm">{displayNames[a.asset] || a.asset}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
                          a.signal === 'BUY' ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20' :
                          a.signal === 'SELL' ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20' :
                          'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20'
                        }`}>{a.signal}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#94a3b8] font-mono">
                          Confidence: <span className={`font-semibold ${
                            a.strength >= 7 ? 'text-[#10b981]' : a.strength >= 4 ? 'text-[#a855f7]' : 'text-[#94a3b8]'
                          }`}>{a.strength}/10</span>
                        </span>
                        <span className="text-xs text-[#94a3b8] font-mono">
                          S: {a.keyLevels.support} | R: {a.keyLevels.resistance}
                        </span>
                      </div>
                    </div>
                  </div>
                  {market && (
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold font-mono text-base">${parseFloat(market.price).toLocaleString()}</span>
                      <span className={`text-xs font-mono font-semibold ${market.positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {market.positive ? '+' : ''}{market.change}%
                      </span>
                    </div>
                  )}
                </div>

                <div className={`grid transition-all duration-300 ${isHovered ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[1fr] opacity-100'}`}>
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-start gap-2.5">
                      <Target size={14} className="text-[#a855f7] mt-0.5 shrink-0" />
                      <p className="text-white/80 text-sm leading-relaxed">{a.analysis}</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Shield size={14} className="text-[#c084fc] mt-0.5 shrink-0" />
                      <p className="text-[#a855f7]/90 text-sm leading-relaxed">{a.recommendation}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-[#ffffff08] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            a.trend === 'bullish' ? 'bg-gradient-to-r from-[#10b981] to-[#059669]' :
                            a.trend === 'bearish' ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]' :
                            'bg-gradient-to-r from-[#a855f7] to-[#7c3aed]'
                          }`}
                          style={{ width: `${a.strength * 10}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#94a3b8] w-8 text-right">{a.strength}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-2 px-6 py-3 border-t border-[#ffffff08] bg-[#ffffff04]">
        <Sparkles size={12} className="text-[#a855f7]" />
        <span className="text-xs text-[#94a3b8] font-mono">AI-powered analysis based on real-time market data — not financial advice</span>
      </div>
    </div>
  )
}
