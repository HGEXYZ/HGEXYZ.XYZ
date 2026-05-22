"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Newspaper, Radio, Shield, TrendingUp, TrendingDown } from "lucide-react"
import NewsIntel from "@/components/widgets/NewsIntel"

export default function IntelFeedPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
            <Radio size={22} className="text-[#a855f7]" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Intelligence <span className="gradient-text">Feed</span>
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1 font-mono">
              Real-time financial news intelligence with AI sentiment scoring
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <NewsIntel />
        </div>
        <div className="space-y-5">
          <SentimentOverview />
          <CategoryBreakdown />
        </div>
      </div>
    </div>
  )
}

function SentimentOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold">AI Sentiment Overview</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#10b981] text-sm font-semibold">Bullish</span>
            <TrendingUp size={18} className="text-[#10b981]" />
          </div>
          <p className="text-[#64748b] text-xs font-mono mt-2">
            Positive market sentiment indicates risk-on environment
          </p>
        </div>
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#ef4444] text-sm font-semibold">Bearish</span>
            <TrendingDown size={18} className="text-[#ef4444]" />
          </div>
          <p className="text-[#64748b] text-xs font-mono mt-2">
            Negative headlines suggest cautious positioning
          </p>
        </div>
        <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#a855f7] text-sm font-semibold">Neutral</span>
            <span className="w-4 h-0.5 bg-[#a855f7]" />
          </div>
          <p className="text-[#64748b] text-xs font-mono mt-2">
            Mixed signals — market awaiting catalyst
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function CategoryBreakdown() {
  const categories = [
    { name: "Markets", color: "#10b981", count: 0 },
    { name: "Economy", color: "#06b6d4", count: 0 },
    { name: "Fed", color: "#a855f7", count: 0 },
    { name: "Crypto", color: "#f59e0b", count: 0 },
    { name: "Forex", color: "#c084fc", count: 0 },
    { name: "Geopolitical", color: "#ef4444", count: 0 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Newspaper size={16} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold">News Categories</h3>
      </div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-[#ffffff08] rounded-xl p-3 flex items-center justify-between border border-[#ffffff08]"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-[#94a3b8] text-xs font-mono">{cat.name}</span>
            </div>
            <CategoryCount category={cat.name.toLowerCase()} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
function CategoryCount({ category }: { category: string }) {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    fetch(`/api/news?query=${category}&limit=1`)
      .then((r) => r.json())
      .then((data) => setCount(data.total || 0))
      .catch(() => setCount(0))
  }, [category])

  return (
    <span className="text-white text-xs font-mono">{count}</span>
  )
}
