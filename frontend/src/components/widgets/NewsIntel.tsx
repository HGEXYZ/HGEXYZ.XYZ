"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  WifiOff,
} from "lucide-react"

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL"
  category: string
}

export default function NewsIntel() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        setOffline(true)
        setLoading(false)
      }
    }, 5000)

    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news?query=financial markets&limit=20")
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          if (data?.articles?.length > 0) {
            setArticles(data.articles)
            setOffline(false)
          } else {
            setOffline(true)
          }
        } else {
          setOffline(true)
        }
      } catch {
        if (!cancelled) setOffline(true)
      } finally {
        if (!cancelled) { setLoading(false); clearTimeout(timeout) }
      }
    }
    fetchNews()
    const interval = setInterval(fetchNews, 30000)
    return () => { cancelled = true; clearInterval(interval); clearTimeout(timeout) }
  }, [])

  const categories = ["all", ...Array.from(new Set(articles.map((a) => a.category)))]
  const filtered = filter === "all" ? articles : articles.filter((a) => a.category === filter)
  const bullish = articles.filter((a) => a.sentiment === "BULLISH").length
  const bearish = articles.filter((a) => a.sentiment === "BEARISH").length
  const neutral = articles.filter((a) => a.sentiment === "NEUTRAL").length

  const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
    if (sentiment === "BULLISH") return <TrendingUp size={14} className="text-[#10b981]" />
    if (sentiment === "BEARISH") return <TrendingDown size={14} className="text-[#ef4444]" />
    return <Minus size={14} className="text-[#a855f7]" />
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper size={16} className="text-[#a855f7]" />
        <h3 className="text-white font-display font-semibold">News Intelligence</h3>
        <div className="ml-auto flex items-center gap-2">
          {offline && (
            <span className="flex items-center gap-1 text-[#f59e0b] text-[10px] font-mono">
              <WifiOff size={10} /> DEMO
            </span>
          )}
          <button onClick={() => { setLoading(true); fetch("/api/news?query=financial markets&limit=20").then(r => r.json()).then(d => { if (d?.articles) setArticles(d.articles); setOffline(false); setLoading(false) }).catch(() => { setOffline(true); setLoading(false) }) }} className="text-[#64748b] hover:text-white transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {articles.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl p-2 text-center">
            <div className="text-[#10b981] text-lg font-bold font-disco">{bullish}</div>
            <div className="text-[#94a3b8] text-[10px] font-mono">BULLISH</div>
          </div>
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl p-2 text-center">
            <div className="text-[#ef4444] text-lg font-bold font-disco">{bearish}</div>
            <div className="text-[#94a3b8] text-[10px] font-mono">BEARISH</div>
          </div>
          <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-2 text-center">
            <div className="text-[#a855f7] text-lg font-bold font-disco">{neutral}</div>
            <div className="text-[#94a3b8] text-[10px] font-mono">NEUTRAL</div>
          </div>
        </div>
      )}

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                filter === cat
                  ? "bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30"
                  : "bg-[#ffffff08] text-[#94a3b8] border border-[#ffffff08] hover:bg-[#ffffff10]"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filtered.slice(0, 15).map((article, i) => (
          <motion.a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="block bg-[#ffffff08] hover:bg-[#ffffff10] rounded-xl p-3 border border-[#ffffff08] hover:border-[#ffffff15] transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#64748b] text-[10px] font-mono">{article.source}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    article.category === "crypto" ? "bg-[#f59e0b]/10 text-[#f59e0b]" :
                    article.category === "fed" ? "bg-[#a855f7]/10 text-[#a855f7]" :
                    article.category === "economy" ? "bg-[#06b6d4]/10 text-[#06b6d4]" :
                    article.category === "markets" ? "bg-[#10b981]/10 text-[#10b981]" :
                    article.category === "geopolitical" ? "bg-[#ef4444]/10 text-[#ef4444]" :
                    "bg-[#ffffff10] text-[#94a3b8]"
                  }`}>
                    {article.category}
                  </span>
                </div>
                <p className="text-white text-xs font-medium leading-relaxed line-clamp-2 group-hover:text-[#a855f7] transition-colors">{article.title}</p>
                {article.description && <p className="text-[#64748b] text-[11px] mt-1 line-clamp-1 font-mono">{article.description}</p>}
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <SentimentIcon sentiment={article.sentiment} />
                <ExternalLink size={10} className="text-[#64748b] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.a>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-8 text-[#64748b] text-xs font-mono">No articles for this category</div>
        )}
      </div>

      <div className="mt-3 text-center text-[#64748b] text-[10px] font-mono">
        {offline ? "Live news unavailable — showing demo headlines" : `Via FreeNewsAPI — ${articles.length} articles`}
      </div>
    </motion.div>
  )
}
