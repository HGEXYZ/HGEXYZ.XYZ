"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, WifiOff } from "lucide-react"

const FALLBACK_TICKER = [
  { text: "Fed holds rates steady at 4.33% as inflation moderates", sentiment: "NEUTRAL" },
  { text: "S&P 500 hits new all-time high above 5,500", sentiment: "BULLISH" },
  { text: "Gold breaks above $2,400 on safe-haven demand", sentiment: "BULLISH" },
  { text: "Bitcoin reclaims $70,000 level amid institutional inflows", sentiment: "BULLISH" },
  { text: "DXY weakens on dovish Fed expectations", sentiment: "BEARISH" },
  { text: "Crude oil drops on China demand concerns", sentiment: "BEARISH" },
  { text: "10-year Treasury yield falls below 4.30%", sentiment: "BULLISH" },
  { text: "EURUSD tests 1.0900 resistance level", sentiment: "BULLISH" },
  { text: "Tech stocks rally on AI sector momentum", sentiment: "BULLISH" },
  { text: "Geopolitical tensions drive safe-haven flows", sentiment: "BEARISH" },
]

export default function LiveTicker() {
  const [items, setItems] = useState(FALLBACK_TICKER)
  const [offline, setOffline] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news?query=markets&limit=10")
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          if (data?.articles?.length > 0) {
            const tickerItems = data.articles.map((a: any) => ({
              text: a.title,
              sentiment: a.sentiment || "NEUTRAL",
            }))
            setItems((prev) => [...tickerItems, ...prev].slice(0, 30))
            setOffline(false)
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchNews()
    const interval = setInterval(fetchNews, 60000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return (
    <div className="glass-card overflow-hidden py-2 px-0 relative">
      <div className="flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#0f0a1a] to-transparent" />
        <div className="flex gap-8 animate-ticker whitespace-nowrap" style={{ animationDuration: `${Math.max(items.length, 10) * 4}s` }}>
          {(offline ? FALLBACK_TICKER : items).concat(offline ? FALLBACK_TICKER : items).map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
              {item.sentiment === "BULLISH" ? <TrendingUp size={12} className="text-[#10b981]" /> :
               item.sentiment === "BEARISH" ? <TrendingDown size={12} className="text-[#ef4444]" /> :
               <span className="w-3" />}
              {item.text}
            </span>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#0f0a1a] to-transparent" />
      </div>
      {offline && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 text-[#f59e0b] text-[9px] font-mono bg-[#07010f]/80 px-2 py-0.5 rounded">
          <WifiOff size={8} /> DEMO
        </div>
      )}
    </div>
  )
}
