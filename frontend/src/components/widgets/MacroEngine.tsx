"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Activity, LineChart, WifiOff } from "lucide-react"

const FALLBACK_INDICATORS = [
  { key: "CPIAUCSL", label: "CPI", color: "#c084fc", value: 315.5, prev: 314.8 },
  { key: "UNRATE", label: "Unemployment", color: "#10b981", value: 4.1, prev: 4.2 },
  { key: "PAYEMS", label: "Nonfarm Payrolls", color: "#a855f7", value: 156000, prev: 142000 },
  { key: "GDP", label: "GDP", color: "#f59e0b", value: 29300, prev: 29100 },
  { key: "PPIFIS", label: "PPI", color: "#06b6d4", value: 143.2, prev: 142.8 },
  { key: "INDPRO", label: "Industrial Prod.", color: "#f97316", value: 102.5, prev: 102.1 },
]

export default function MacroEngine() {
  const [data, setData] = useState<Record<string, { value: number; prev: number }> | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        const fb: Record<string, { value: number; prev: number }> = {}
        FALLBACK_INDICATORS.forEach((ind) => { fb[ind.key] = { value: ind.value, prev: ind.prev } })
        setData(fb)
        setLoading(false)
        setOffline(true)
      }
    }, 4000)

    const fetchMacro = async () => {
      try {
        const promises = FALLBACK_INDICATORS.map((ind) =>
          fetch(`/api/fred?series_id=${ind.key}&limit=2`).then((r) => r.json())
        )
        const results = await Promise.allSettled(promises)
        if (cancelled) return
        const mapped: Record<string, { value: number; prev: number }> = {}
        let gotData = false
        results.forEach((res, i) => {
          if (res.status === "fulfilled" && res.value?.latest?.value !== undefined) {
            mapped[FALLBACK_INDICATORS[i].key] = {
              value: res.value.latest.value,
              prev: res.value.previous?.value ?? res.value.latest.value,
            }
            gotData = true
          }
        })
        if (gotData) {
          setData(mapped)
          setOffline(false)
        } else {
          const fb: Record<string, { value: number; prev: number }> = {}
          FALLBACK_INDICATORS.forEach((ind) => { fb[ind.key] = { value: ind.value, prev: ind.prev } })
          setData(fb)
          setOffline(true)
        }
      } catch {
        if (!cancelled) {
          const fb: Record<string, { value: number; prev: number }> = {}
          FALLBACK_INDICATORS.forEach((ind) => { fb[ind.key] = { value: ind.value, prev: ind.prev } })
          setData(fb)
          setOffline(true)
        }
      } finally {
        if (!cancelled) { setLoading(false); clearTimeout(timeout) }
      }
    }
    fetchMacro()
    const interval = setInterval(fetchMacro, 300000)
    return () => { cancelled = true; clearInterval(interval); clearTimeout(timeout) }
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <LineChart size={16} className="text-[#a855f7]" />
          <h3 className="text-white font-display font-semibold">Macro Engine</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-[#ffffff08] rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <LineChart size={16} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold">Macro Engine</h3>
        {offline && (
          <span className="ml-auto flex items-center gap-1 text-[#f59e0b] text-[10px] font-mono">
            <WifiOff size={10} /> DEMO
          </span>
        )}
      </div>

      <div className="space-y-2">
        {FALLBACK_INDICATORS.map((ind) => {
          const d = data?.[ind.key]
          const value = d?.value ?? ind.value
          const prev = d?.prev ?? ind.prev
          const change = value - prev
          const isUp = change > 0
          const isDown = change < 0

          return (
            <div key={ind.key} className="bg-[#ffffff08] rounded-xl p-3 flex items-center justify-between border border-[#ffffff08]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ind.color }} />
                <span className="text-[#94a3b8] text-xs font-mono">{ind.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold font-mono text-sm">
                  {ind.key === "PAYEMS" ? value.toLocaleString() : value.toFixed(ind.key === "UNRATE" ? 1 : 2)}
                </span>
                <span className={`flex items-center gap-1 text-xs font-mono ${isUp ? "text-[#10b981]" : isDown ? "text-[#ef4444]" : "text-[#94a3b8]"}`}>
                  {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : <Activity size={11} />}
                  {ind.key === "PAYEMS" ? (change > 0 ? "+" : "") + change.toLocaleString() : (change > 0 ? "+" : "") + change.toFixed(2)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 text-center text-[#64748b] text-[10px] font-mono">
        {offline ? "Live data unavailable — showing estimates" : "Via FRED API — updates every 5m"}
      </div>
    </motion.div>
  )
}
