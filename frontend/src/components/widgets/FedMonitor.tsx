"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Landmark, TrendingUp, TrendingDown, Activity, BarChart3, WifiOff } from "lucide-react"

const FALLBACK_DATA = {
  fedRate: { value: 4.33, prev: 4.50, date: "2025-05-01" },
  dgs10: { value: 4.28, prev: 4.15, date: "2025-05-01" },
  dgs2: { value: 4.62, prev: 4.55, date: "2025-05-01" },
  t10yie: { value: 2.38, prev: 2.35, date: "2025-05-01" },
}

export default function FedMonitor() {
  const [data, setData] = useState<typeof FALLBACK_DATA | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        setData(FALLBACK_DATA)
        setLoading(false)
        setOffline(true)
      }
    }, 4000)

    const fetchData = async () => {
      try {
        const [fedRes, dgs10Res, dgs2Res, t10yieRes] = await Promise.all([
          fetch("/api/fred?series_id=FEDFUNDS&limit=2"),
          fetch("/api/fred?series_id=DGS10&limit=2"),
          fetch("/api/fred?series_id=DGS2&limit=2"),
          fetch("/api/fred?series_id=T10YIE&limit=2"),
        ])
        if (cancelled) return
        const fed = await fedRes.json()
        const d10 = await dgs10Res.json()
        const d2 = await dgs2Res.json()
        const t10 = await t10yieRes.json()

        if (fed?.latest?.value !== undefined) {
          setData({
            fedRate: { value: fed.latest.value, prev: fed.previous?.value ?? fed.latest.value, date: fed.latest.date },
            dgs10: { value: d10.latest?.value ?? FALLBACK_DATA.dgs10.value, prev: d10.previous?.value ?? FALLBACK_DATA.dgs10.prev, date: d10.latest?.date ?? "" },
            dgs2: { value: d2.latest?.value ?? FALLBACK_DATA.dgs2.value, prev: d2.previous?.value ?? FALLBACK_DATA.dgs2.prev, date: d2.latest?.date ?? "" },
            t10yie: { value: t10.latest?.value ?? FALLBACK_DATA.t10yie.value, prev: t10.previous?.value ?? FALLBACK_DATA.t10yie.prev, date: t10.latest?.date ?? "" },
          })
          setOffline(false)
        } else {
          setData(FALLBACK_DATA)
          setOffline(true)
        }
      } catch {
        if (!cancelled) {
          setData(FALLBACK_DATA)
          setOffline(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          clearTimeout(timeout)
        }
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 900000)
    return () => { cancelled = true; clearInterval(interval); clearTimeout(timeout) }
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={16} className="text-[#a855f7]" />
          <h3 className="text-white font-display font-semibold">Fed Monitor</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-14 bg-[#ffffff08] rounded-xl" />
          <div className="h-14 bg-[#ffffff08] rounded-xl" />
          <div className="h-14 bg-[#ffffff08] rounded-xl" />
          <div className="h-14 bg-[#ffffff08] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Landmark size={16} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold">Fed Monitor</h3>
        <span className="ml-auto flex items-center gap-1.5">
          {offline ? (
            <span className="flex items-center gap-1 text-[#f59e0b] text-[10px] font-mono">
              <WifiOff size={10} /> DEMO
            </span>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] glow-pulse" />
              <span className="text-[#10b981] text-[10px] font-mono">LIVE</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FedCard label="Fed Funds Rate" value={data?.fedRate.value} prev={data?.fedRate.prev} date={data?.fedRate.date} format="pct" />
        <FedCard label="10Y Treasury" value={data?.dgs10.value} prev={data?.dgs10.prev} date={data?.dgs10.date} format="pct" />
        <FedCard label="2Y Treasury" value={data?.dgs2.value} prev={data?.dgs2.prev} date={data?.dgs2.date} format="pct" />
        <FedCard label="10Y Breakeven" value={data?.t10yie.value} prev={data?.t10yie.prev} date={data?.t10yie.date} format="pct" />
      </div>

      {data?.dgs10?.value !== undefined && data?.dgs2?.value !== undefined && (
        <div className="mt-3 bg-[#ffffff08] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-[#c084fc]" />
            <span className="text-[#94a3b8] text-[11px] font-mono">10Y-2Y Spread</span>
          </div>
          <span className={`text-sm font-bold font-mono ${(data.dgs10.value - data.dgs2.value) < 0 ? "text-[#ef4444]" : "text-[#10b981]"}`}>
            {(data.dgs10.value - data.dgs2.value).toFixed(2)}%
          </span>
        </div>
      )}

      <div className="mt-3 text-center text-[#64748b] text-[10px] font-mono">
        {offline ? "Live data unavailable — showing estimates" : "Via FRED API — updates every 15m"}
      </div>
    </motion.div>
  )
}

function FedCard({ label, value, prev, date, format }: { label: string; value?: number; prev?: number; date?: string; format: "pct" | "num" }) {
  const change = value !== undefined && prev !== undefined ? value - prev : null
  const isUp = change !== null && change > 0
  const isDown = change !== null && change < 0

  return (
    <div className="bg-[#ffffff08] rounded-xl p-3 border border-[#ffffff08]">
      <div className="text-[#94a3b8] text-[11px] font-mono mb-1">{label}</div>
      <div className="text-xl font-display font-bold text-white">
        {value !== undefined ? `${value.toFixed(2)}${format === "pct" ? "%" : ""}` : "—"}
      </div>
      {change !== null && (
        <div className={`flex items-center gap-1 mt-1 ${isUp ? "text-[#10b981]" : isDown ? "text-[#ef4444]" : "text-[#94a3b8]"}`}>
          {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Activity size={12} />}
          <span className="text-xs font-mono">{change > 0 ? "+" : ""}{change.toFixed(2)}%</span>
        </div>
      )}
      {date && <div className="text-[#64748b] text-[10px] font-mono mt-1">{date}</div>}
    </div>
  )
}
