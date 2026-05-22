"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Activity, WifiOff } from "lucide-react"

interface MarketAsset {
  symbol: string
  name: string
  group: string
  price: string
  change: string
  changePercent: string
  positive: boolean
}

const FALLBACK_MARKETS: MarketAsset[] = [
  { symbol: "^GSPC", name: "S&P 500", group: "indices", price: "5542.80", change: "+23.40", changePercent: "+0.42", positive: true },
  { symbol: "^IXIC", name: "NASDAQ", group: "indices", price: "17985.20", change: "+145.30", changePercent: "+0.81", positive: true },
  { symbol: "DX-Y.NYB", name: "DOLLAR INDEX", group: "indices", price: "104.28", change: "-0.35", changePercent: "-0.33", positive: false },
  { symbol: "GC=F", name: "GOLD", group: "commodities", price: "2408.50", change: "+18.20", changePercent: "+0.76", positive: true },
  { symbol: "CL=F", name: "CRUDE OIL", group: "commodities", price: "79.82", change: "-1.45", changePercent: "-1.79", positive: false },
  { symbol: "BTC-USD", name: "BITCOIN", group: "crypto", price: "71850.00", change: "+1250.00", changePercent: "+1.77", positive: true },
]

export default function LiveMarkets() {
  const [markets, setMarkets] = useState<MarketAsset[]>(FALLBACK_MARKETS)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(true)

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled) { setLoading(false) }
    }, 5000)

    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/markets")
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          if (data?.markets?.length > 0) {
            setMarkets(data.markets)
            setOffline(false)
          }
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) { setLoading(false); clearTimeout(timeout) }
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 15000)
    return () => { cancelled = true; clearInterval(interval); clearTimeout(timeout) }
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={14} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold text-sm">Live Market Prices</h3>
        <span className="ml-auto flex items-center gap-1.5">
          {offline ? (
            <span className="flex items-center gap-1 text-[#f59e0b] text-[9px] font-mono"><WifiOff size={8} /> DEMO</span>
          ) : (
            <span className="flex items-center gap-1 text-[#10b981] text-[9px] font-mono"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981] glow-pulse" /> LIVE</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {markets.map((m) => (
          <div key={m.symbol} className="bg-[#ffffff08] rounded-xl p-2.5 border border-[#ffffff08] text-center">
            <div className="text-[#64748b] text-[9px] font-mono uppercase tracking-wider">{m.name}</div>
            <div className="text-white text-sm font-bold font-mono mt-0.5">{m.price}</div>
            <div className={`flex items-center justify-center gap-0.5 text-[10px] font-mono mt-0.5 ${m.positive ? "text-[#10b981]" : "text-[#ef4444]"}`}>
              {m.positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {m.changePercent}%
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center text-[#64748b] text-[8px] font-mono">
        {offline ? "Live prices unavailable — showing estimates" : "Yahoo Finance — updates every 15s"}
      </div>
    </motion.div>
  )
}
