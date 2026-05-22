"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, Shield, Activity, Zap, Sparkles } from "lucide-react"

interface AssetCard {
  name: string
  bias: "BUY" | "SELL" | "HOLD"
  confidence: number
  analysis: string
  entry_zone: string
  key_levels: { support: string; resistance: string }
  sentiment: string
  risk: string
}

interface Props {
  assets: AssetCard[]
  loading?: boolean
}

export default function AssetAnalysis({ assets, loading }: Props) {
  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-[#a855f7]" />
          <h3 className="text-white font-display font-semibold">Asset Analysis</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#ffffff08] rounded-xl" />)}
        </div>
      </div>
    )
  }

  const getBiasColor = (b: string) => {
    if (b === "BUY") return "#10b981"
    if (b === "SELL") return "#ef4444"
    return "#a855f7"
  }
  const getBiasIcon = (b: string) => {
    if (b === "BUY") return TrendingUp
    if (b === "SELL") return TrendingDown
    return Minus
  }
  const getRiskColor = (r: string) => {
    if (r === "LOW") return "#10b981"
    if (r === "MEDIUM") return "#f59e0b"
    return "#ef4444"
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold">Asset Analysis</h3>
        <span className="ml-auto text-[#64748b] text-[10px] font-mono">{assets.length} assets</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {assets.map((asset, i) => {
          const BiasIcon = getBiasIcon(asset.bias)
          const biasColor = getBiasColor(asset.bias)
          const riskColor = getRiskColor(asset.risk)

          return (
            <motion.div
              key={asset.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#ffffff08] rounded-xl p-4 border border-[#ffffff08] hover:border-[#a855f7]/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
                    <BiasIcon size={16} style={{ color: biasColor }} />
                  </span>
                  <div>
                    <h4 className="text-white font-display font-semibold text-sm">{asset.name}</h4>
                    <span className="text-[#64748b] text-[10px] font-mono">{asset.sentiment || ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${getRiskColor(asset.risk)}20`,
                      color: riskColor,
                    }}
                  >
                    {asset.risk}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold font-mono"
                    style={{
                      backgroundColor: `${biasColor}20`,
                      color: biasColor,
                      border: `1px solid ${biasColor}30`,
                    }}
                  >
                    {asset.bias}
                  </span>
                </div>
              </div>

              <p className="text-[#94a3b8] text-xs leading-relaxed mb-3">{asset.analysis}</p>

              {/* Key levels */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#07010f] rounded-lg p-2 text-center">
                  <div className="text-[#64748b] text-[9px] font-mono">SUPPORT</div>
                  <div className="text-[#10b981] text-xs font-bold font-mono">{asset.key_levels?.support || "—"}</div>
                </div>
                <div className="bg-[#07010f] rounded-lg p-2 text-center">
                  <div className="text-[#64748b] text-[9px] font-mono">RESISTANCE</div>
                  <div className="text-[#ef4444] text-xs font-bold font-mono">{asset.key_levels?.resistance || "—"}</div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-2 flex items-center gap-2">
                <Shield size={10} className="text-[#a855f7]" />
                <div className="flex-1 h-1 rounded-full bg-[#ffffff10] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${asset.confidence * 10}%`,
                      background: asset.confidence >= 7
                        ? "linear-gradient(90deg, #a855f7, #10b981)"
                        : asset.confidence >= 4
                          ? "linear-gradient(90deg, #f59e0b, #a855f7)"
                          : "linear-gradient(90deg, #ef4444, #f59e0b)",
                    }}
                  />
                </div>
                <span className="text-white text-[10px] font-mono">{asset.confidence}/10</span>
              </div>

              {asset.entry_zone && asset.entry_zone !== "N/A" && (
                <div className="mt-1.5 flex items-center gap-1 text-[#c084fc]">
                  <Zap size={10} />
                  <span className="text-[10px] font-mono">Entry: {asset.entry_zone}</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
