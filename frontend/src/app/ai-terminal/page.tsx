"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { BrainCircuit, Loader2, Zap, BarChart3 } from "lucide-react"
import FedMonitor from "@/components/widgets/FedMonitor"
import MacroEngine from "@/components/widgets/MacroEngine"
import NewsIntel from "@/components/widgets/NewsIntel"
import AIAnalysisEngine from "@/components/widgets/AIAnalysisEngine"
import type { AIOutput } from "@/components/widgets/AIAnalysisEngine"
import AssetAnalysis from "@/components/widgets/AssetAnalysis"
import LiveTicker from "@/components/widgets/LiveTicker"
import LiveMarkets from "@/components/widgets/LiveMarkets"

const DEFAULT_ASSETS = ["SPX", "NASDAQ", "DXY", "XAUUSD", "BTCUSD", "CRUDE OIL"]
const ALL_ASSETS = ["SPX", "NASDAQ", "DXY", "XAUUSD", "BTCUSD", "ETHUSD", "EURUSD", "GBPUSD", "CRUDE OIL"]

export default function AITerminalPage() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(DEFAULT_ASSETS)
  const [aiResult, setAiResult] = useState<AIOutput | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleAsset = (asset: string) => {
    setSelectedAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    )
  }

  const runAnalysis = useCallback(async (): Promise<AIOutput | null> => {
    if (selectedAssets.length === 0) return null
    setLoading(true)
    try {
      const [fredRes, newsRes, marketsRes] = await Promise.all([
        fetch("/api/fred?series_id=ALL").catch(() => null),
        fetch("/api/news?query=financial markets&limit=10").catch(() => null),
        fetch("/api/markets").catch(() => null),
      ])
      const macroData = fredRes?.ok ? await fredRes.json() : null
      const newsData = newsRes?.ok ? await newsRes.json() : null
      const marketData = marketsRes?.ok ? await marketsRes.json() : null

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: selectedAssets,
          macroData,
          newsData: newsData?.articles || [],
          marketData: marketData?.markets || [],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiResult(data)
        return data
      }
      return null
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [selectedAssets])

  return (
    <div className="space-y-5 animate-fade-in">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              <BrainCircuit className="text-[#a855f7]" size={36} />
              AI <span className="gradient-text">Terminal</span>
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1.5 font-mono">
              Live Markets · Macro · Fed · News · AI Analysis
            </p>
          </div>
        </div>
      </motion.div>

      <LiveTicker />
      <LiveMarkets />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-[#a855f7]" />
          <span className="text-white font-display font-semibold text-sm">Asset Selection</span>
          <button
            onClick={runAnalysis}
            disabled={loading || selectedAssets.length === 0}
            className="ml-auto px-5 py-2 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-[0_0_30px_rgba(168,85,247,0.35)] flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" />Running AI Analysis...</>
            ) : (
              <><Zap size={14} />Run AI Analysis</>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_ASSETS.map((asset) => {
            const isSelected = selectedAssets.includes(asset)
            return (
              <button
                key={asset}
                onClick={() => toggleAsset(asset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? "bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 shadow-[0_0_10px_rgba(168,85,247,0.12)]"
                    : "bg-[#ffffff08] text-[#64748b] border border-[#ffffff08] hover:bg-[#ffffff10] hover:text-white"
                }`}
              >
                {asset}
              </button>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-1 space-y-5">
          <FedMonitor />
          <MacroEngine />
        </div>
        <div className="xl:col-span-1">
          <NewsIntel />
        </div>
        <div className="xl:col-span-2 space-y-5">
          <AIAnalysisEngine onAnalyze={runAnalysis} result={aiResult} loading={loading} assets={selectedAssets} />
        </div>
      </div>

      {aiResult?.asset_analyses && aiResult.asset_analyses.length > 0 && (
        <AssetAnalysis
          assets={aiResult.asset_analyses.map((a) => ({
            ...a,
            sentiment: (a as any).sentiment || "NEUTRAL",
            risk: (a as any).risk || "MEDIUM",
          }))}
          loading={loading}
        />
      )}

      <div className="text-[#64748b] text-[10px] font-mono text-center pt-2 border-t border-[#ffffff08]">
        HGEXYZ AI Terminal v2.0 — Yahoo Finance · FRED · FreeNewsAPI · OpenRouter/Qwen 2.5 72B
      </div>
    </div>
  )
}
