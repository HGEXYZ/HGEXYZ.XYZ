"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  AlertTriangle,
  Zap,
  Sparkles,
  WifiOff,
} from "lucide-react"

export interface AIOutput {
  market_bias: "BULLISH" | "BEARISH" | "NEUTRAL"
  confidence: number
  macro_summary: string
  fed_sentiment: "DOVISH" | "HAWKISH" | "NEUTRAL"
  risk_sentiment: "RISK_ON" | "RISK_OFF" | "MIXED"
  asset_analyses: {
    name: string
    bias: "BUY" | "SELL" | "HOLD"
    confidence: number
    analysis: string
    entry_zone: string
    key_levels: { support: string; resistance: string }
  }[]
  trade_opportunities: { asset: string; setup: string; direction: "LONG" | "SHORT"; confidence: number; rationale: string }[]
  important_news: { headline: string; impact: "HIGH" | "MEDIUM" | "LOW"; sentiment: string }[]
  warnings: string[]
}

interface Props {
  onAnalyze: () => Promise<AIOutput | null>
  result: AIOutput | null
  loading: boolean
  assets: string[]
}

function getBiasColor(bias: string) {
  if (bias === "BUY" || bias === "BULLISH" || bias === "RISK_ON") return "#10b981"
  if (bias === "SELL" || bias === "BEARISH" || bias === "RISK_OFF") return "#ef4444"
  return "#a855f7"
}

function getBiasIcon(bias: string) {
  if (bias === "BUY" || bias === "BULLISH" || bias === "RISK_ON") return TrendingUp
  if (bias === "SELL" || bias === "BEARISH" || bias === "RISK_OFF") return TrendingDown
  return Minus
}

export default function AIAnalysisEngine({ onAnalyze, result, loading, assets }: Props) {
  const [offline, setOffline] = useState(false)

  const handleAnalyze = async () => {
    setOffline(false)
    const r = await onAnalyze()
    if (!r || r.warnings?.some((w: string) => w.includes("offline"))) {
      setOffline(true)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit size={16} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold">AI Analysis Engine</h3>
        <div className="ml-auto flex items-center gap-2">
          {offline && (
            <span className="flex items-center gap-1 text-[#f59e0b] text-[10px] font-mono">
              <WifiOff size={10} /> OFFLINE
            </span>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading || assets.length === 0}
            className="px-4 py-1.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-1.5"
          >
            {loading ? (
              <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
            ) : (
              <><Zap size={12} />Run Full Analysis</>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <MacroBadge label="Market Bias" value={result.market_bias} color={getBiasColor(result.market_bias)} icon={getBiasIcon(result.market_bias)} />
            <MacroBadge label="Fed Sentiment" value={result.fed_sentiment} color={result.fed_sentiment === "DOVISH" ? "#10b981" : result.fed_sentiment === "HAWKISH" ? "#ef4444" : "#a855f7"} icon={Shield} />
            <MacroBadge label="Risk Sentiment" value={result.risk_sentiment} color={getBiasColor(result.risk_sentiment)} icon={Sparkles} />
          </div>

          <div className="bg-[#ffffff08] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#94a3b8] text-xs font-mono">AI Confidence</span>
              <span className="text-white font-bold font-mono text-sm">{result.confidence}/10</span>
            </div>
            <div className="h-2 rounded-full bg-[#ffffff10] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{
                width: `${result.confidence * 10}%`,
                background: result.confidence >= 7 ? "linear-gradient(90deg, #a855f7, #10b981)" : result.confidence >= 4 ? "linear-gradient(90deg, #f59e0b, #a855f7)" : "linear-gradient(90deg, #ef4444, #f59e0b)"
              }} />
            </div>
          </div>

          {result.macro_summary && (
            <div className="bg-[#ffffff08] rounded-xl p-3">
              <p className="text-[#cbd5e1] text-xs leading-relaxed">{result.macro_summary}</p>
            </div>
          )}

          {result.trade_opportunities?.length > 0 && (
            <div>
              <h4 className="text-white text-xs font-semibold mb-2 flex items-center gap-1.5">
                <Zap size={12} className="text-[#f59e0b]" /> Trade Opportunities
              </h4>
              <div className="space-y-2">
                {result.trade_opportunities.slice(0, 3).map((trade, i) => (
                  <div key={i} className="bg-[#ffffff08] rounded-xl p-3 border border-[#ffffff08]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-semibold">{trade.asset}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${trade.direction === "LONG" ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#ef4444]/20 text-[#ef4444]"}`}>
                        {trade.direction}
                      </span>
                    </div>
                    <p className="text-[#94a3b8] text-[11px] font-mono">{trade.setup}</p>
                    <p className="text-[#64748b] text-[10px] font-mono mt-1">{trade.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.warnings?.length > 0 && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl p-3">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-[#ef4444] text-xs">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.asset_analyses && result.asset_analyses.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.asset_analyses.map((asset, i) => {
            const BiasIcon = getBiasIcon(asset.bias)
            const biasColor = getBiasColor(asset.bias)
            return (
              <motion.div key={asset.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-[#ffffff08] rounded-xl p-3 border border-[#ffffff08] hover:border-[#a855f7]/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#a855f7]/15 flex items-center justify-center">
                      <BiasIcon size={12} style={{ color: biasColor }} />
                    </span>
                    <span className="text-white text-xs font-semibold">{asset.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748b] text-[10px] font-mono">S: {asset.key_levels?.support || "—"} R: {asset.key_levels?.resistance || "—"}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono" style={{ backgroundColor: `${biasColor}20`, color: biasColor, border: `1px solid ${biasColor}30` }}>{asset.bias}</span>
                  </div>
                </div>
                <p className="text-[#94a3b8] text-[11px] leading-relaxed">{asset.analysis}</p>
                {asset.entry_zone && asset.entry_zone !== "N/A" && (
                  <div className="mt-1.5 text-[#c084fc] text-[10px] font-mono">Entry Zone: {asset.entry_zone}</div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-8">
          <BrainCircuit size={32} className="text-[#a855f7]/30 mx-auto mb-3" />
          <p className="text-[#64748b] text-xs font-mono">Select assets and run AI analysis to generate institutional-grade trading intelligence</p>
        </div>
      )}

      <div className="mt-3 text-center text-[#64748b] text-[10px] font-mono">
        {offline ? "AI engine offline — showing demo analysis" : "AI via OpenRouter/Qwen 2.5 72B"}
      </div>
    </motion.div>
  )
}

function MacroBadge({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
  return (
    <div className="bg-[#ffffff08] rounded-xl p-3 text-center border border-[#ffffff08]">
      <div className="text-[#64748b] text-[10px] font-mono mb-1">{label}</div>
      <div className="flex items-center justify-center gap-1.5">
        <Icon size={12} style={{ color }} />
        <span className="text-white text-sm font-bold font-mono" style={{ color }}>{value}</span>
      </div>
    </div>
  )
}
