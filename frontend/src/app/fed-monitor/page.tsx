"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Landmark, LineChart, TrendingUp, TrendingDown } from "lucide-react"
import FedMonitor from "@/components/widgets/FedMonitor"
import MacroEngine from "@/components/widgets/MacroEngine"

export default function FedMonitorPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
            <Landmark size={22} className="text-[#a855f7]" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Fed <span className="gradient-text">Monitor</span>
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1 font-mono">
              Real-time Federal Reserve data — interest rates, treasury yields, inflation
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <FedMonitor />
        <MacroEngine />
      </div>

      {/* Macro data table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <LineChart size={16} className="text-[#a855f7]" />
          <h3 className="text-white font-display font-semibold">Economic Indicators</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ffffff08]">
                <th className="text-[#64748b] text-xs font-mono pb-3 font-medium">Indicator</th>
                <th className="text-[#64748b] text-xs font-mono pb-3 font-medium">Latest</th>
                <th className="text-[#64748b] text-xs font-mono pb-3 font-medium">Previous</th>
                <th className="text-[#64748b] text-xs font-mono pb-3 font-medium">Change</th>
                <th className="text-[#64748b] text-xs font-mono pb-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Fed Funds Rate", id: "FEDFUNDS", format: "pct" },
                { name: "CPI (YoY)", id: "CPIAUCSL", format: "pct" },
                { name: "Unemployment Rate", id: "UNRATE", format: "pct" },
                { name: "Nonfarm Payrolls", id: "PAYEMS", format: "num" },
                { name: "10Y Treasury", id: "DGS10", format: "pct" },
                { name: "2Y Treasury", id: "DGS2", format: "pct" },
                { name: "Breakeven 10Y", id: "T10YIE", format: "pct" },
                { name: "GDP", id: "GDP", format: "pct" },
                { name: "PPI", id: "PPIFIS", format: "pct" },
                { name: "Industrial Production", id: "INDPRO", format: "pct" },
              ].map((ind, i) => (
                <MacroRow key={ind.id} indicator={ind} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

function MacroRow({
  indicator,
}: {
  indicator: { name: string; id: string; format: string }
  index: number
}) {
  return (
    <tr className="border-b border-[#ffffff08] hover:bg-[#ffffff08] transition-colors">
      <td className="py-3">
        <span className="text-white text-xs font-semibold">{indicator.name}</span>
      </td>
      <td className="py-3">
        <MacroCell seriesId={indicator.id} field="latest" format={indicator.format} />
      </td>
      <td className="py-3">
        <MacroCell seriesId={indicator.id} field="previous" format={indicator.format} />
      </td>
      <td className="py-3">
        <MacroChangeCell seriesId={indicator.id} />
      </td>
      <td className="py-3">
        <MacroTrendCell seriesId={indicator.id} />
      </td>
    </tr>
  )
}

function MacroCell({
  seriesId,
  field,
  format,
}: {
  seriesId: string
  field: "latest" | "previous"
  format: string
}) {
  const [value, setValue] = useState<string>("—")

  useEffect(() => {
    fetch(`/api/fred?series_id=${seriesId}&limit=2`)
      .then((r) => r.json())
      .then((data) => {
        const obs = data[field]
        if (obs?.value !== undefined) {
          setValue(
            format === "pct" ? obs.value.toFixed(2) + "%" : obs.value.toLocaleString()
          )
        }
      })
      .catch(() => setValue("—"))
  }, [seriesId, field, format])

  return <span className="text-white text-xs font-mono">{value}</span>
}

function MacroChangeCell({ seriesId }: { seriesId: string }) {
  const [change, setChange] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/fred?series_id=${seriesId}&limit=2`)
      .then((r) => r.json())
      .then((data) => {
        if (data.latest?.value !== undefined && data.previous?.value !== undefined) {
          setChange(data.latest.value - data.previous.value)
        }
      })
      .catch(() => setChange(null))
  }, [seriesId])

  if (change === null) return <span className="text-[#64748b] text-xs font-mono">—</span>

  return (
    <span className={`text-xs font-mono ${change > 0 ? "text-[#10b981]" : change < 0 ? "text-[#ef4444]" : "text-[#64748b]"}`}>
      {change > 0 ? "+" : ""}{change.toFixed(2)}
    </span>
  )
}

function MacroTrendCell({ seriesId }: { seriesId: string }) {
  const [change, setChange] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/fred?series_id=${seriesId}&limit=2`)
      .then((r) => r.json())
      .then((data) => {
        if (data.latest?.value !== undefined && data.previous?.value !== undefined) {
          setChange(data.latest.value - data.previous.value)
        }
      })
      .catch(() => setChange(null))
  }, [seriesId])

  if (change === null) return <span className="text-[#64748b] text-xs font-mono">—</span>

  return change > 0 ? (
    <TrendingUp size={14} className="text-[#10b981]" />
  ) : change < 0 ? (
    <TrendingDown size={14} className="text-[#ef4444]" />
  ) : (
    <span className="w-3 h-0.5 bg-[#64748b] block" />
  )
}
