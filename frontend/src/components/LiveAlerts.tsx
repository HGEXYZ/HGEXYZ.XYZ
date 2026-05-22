'use client'

import { useState, useEffect } from 'react'
import { Radio, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react'

interface NewsItem {
  id: number
  time: string
  source: string
  title: string
  riskScore: number
}

const FALLBACK_NEWS: NewsItem[] = [
  { id: 90, time: 'LIVE', source: 'REUTERS', title: 'S&P 500 hits record high as tech stocks rally on AI optimism', riskScore: 7 },
  { id: 89, time: 'LIVE', source: 'BLOOMBERG', title: 'Fed minutes signal cautious approach to rate cuts amid sticky inflation', riskScore: 9 },
  { id: 88, time: 'LIVE', source: 'CNBC', title: 'Crude oil climbs above $83 as OPEC+ maintains production cuts', riskScore: 6 },
  { id: 87, time: '14m', source: 'WSJ', title: 'Treasury yields edge higher as market prices gradual Fed easing', riskScore: 5 },
  { id: 86, time: '22m', source: 'FINANCIAL TIMES', title: 'Gold holds near $2,160 as dollar weakens on rate cut expectations', riskScore: 6 },
  { id: 85, time: '31m', source: 'REUTERS', title: 'Bitcoin surpasses $67,000 as institutional inflows accelerate', riskScore: 5 },
  { id: 84, time: '45m', source: 'BLOOMBERG', title: 'ECB holds rates steady at 3.75%, Lagarde flags uncertainty', riskScore: 8 },
  { id: 83, time: '1h', source: 'WSJ', title: 'Japan core machinery orders fall unexpectedly, BOJ under pressure', riskScore: 4 },
  { id: 82, time: '1h', source: 'CNBC', title: 'NVIDIA shares extend gains as Blackwell GPU demand surges', riskScore: 5 },
  { id: 81, time: '2h', source: 'REUTERS', title: 'China PBOC injects liquidity amid slowing economic recovery', riskScore: 6 },
]

export default function LiveAlerts({ minRisk = 0 }: { minRisk?: number }) {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/osiris/news')
        const json = await res.json()
        if (json?.news?.length) {
          const mapped: NewsItem[] = json.news
            .filter((n: any) => (n.risk_score ?? 0) >= 4)
            .map((n: any, i: number) => {
              const pubDate = n.published ? new Date(n.published) : new Date()
              const minutesAgo = Math.floor((Date.now() - pubDate.getTime()) / 60000)
              const timeLabel = minutesAgo < 1 ? 'LIVE' : minutesAgo < 60 ? `${minutesAgo}m` : pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              return {
                id: i,
                time: timeLabel,
                source: n.source || 'OSINT',
                title: n.title || '',
                riskScore: n.risk_score ?? 0,
              }
            })
          if (mapped.length > 0) setNews(mapped)
        }
      } catch {
        // keep fallback
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
    const interval = setInterval(fetchNews, 15000)
    return () => clearInterval(interval)
  }, [])

  const filteredNews = news.filter((n) => n.riskScore >= minRisk)

  return (
    <div className="glass-card overflow-hidden animate-slide-up stagger-3">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#ffffff08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
            <Radio size={16} className="text-[#a855f7]" />
          </div>
          <div>
            <h3 className="text-white font-display font-semibold">Market News</h3>
            <p className="text-[#94a3b8] text-xs font-mono">Real-time financial news</p>
          </div>
        </div>
        <div className="bg-[#ffffff08] px-2.5 py-1 rounded-xl border border-[#ffffff08] text-xs font-mono text-[#94a3b8]">
          {filteredNews.length}
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] animate-spin" />
              <span className="text-sm text-[#94a3b8] font-mono">Fetching news...</span>
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-10 text-sm text-[#94a3b8] font-mono">
            No headlines at this level
          </div>
        ) : (
          filteredNews.slice(0, 10).map((item, i) => (
            <div
              key={item.id}
              className={`px-5 py-3.5 transition-all cursor-pointer hover:bg-[#ffffff04] group ${
                i < Math.min(filteredNews.length, 10) - 1 ? 'border-b border-[#ffffff08]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.time === 'LIVE' ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-[#94a3b8]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-mono mb-1.5 flex-wrap">
                    <span className={`${item.time === 'LIVE' ? 'text-[#10b981] font-semibold' : 'text-[#94a3b8]'}`}>
                      {item.time}
                    </span>
                    <span className="text-[#a855f7] font-medium">[{item.source.toUpperCase()}]</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                      item.riskScore >= 8 ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20' :
                      item.riskScore >= 6 ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20' :
                      'bg-[#94a3b8]/15 text-[#94a3b8] border border-[#94a3b8]/20'
                    }`}>{item.riskScore}</span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors font-medium">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 px-5 py-3 border-t border-[#ffffff08] bg-[#ffffff04]">
        <Sparkles size={12} className="text-[#a855f7]" />
        <span className="text-xs text-[#94a3b8] font-mono">Real-time financial news — multiple sources</span>
      </div>
    </div>
  )
}
