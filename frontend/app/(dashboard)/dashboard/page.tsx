"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { TrendingUp, TrendingDown, BarChart3, Activity, Newspaper } from "lucide-react"
import type { MarketQuote, MarketMovers, NewsArticle } from "@/types"

export default function DashboardPage() {
  const [movers, setMovers] = useState<MarketMovers | null>(null)
  const [indices, setIndices] = useState<MarketQuote[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.markets.movers(), api.markets.indices(), api.news.list(5)]).then(([m, i, n]) => {
      setMovers(m); setIndices(i); setNews(n)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-muted-foreground">Welcome to your trading command center</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {indices.map((idx) => (
          <Card key={idx.symbol}>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{idx.symbol}</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(idx.price)}</div><p className={idx.change_pct >= 0 ? "text-green-400" : "text-red-400"}>{formatPercent(idx.change_pct)}</p></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Market Movers</CardTitle></CardHeader>
          <CardContent>
            {movers && (
              <div className="space-y-4">
                <div><h4 className="text-sm font-medium text-green-400 mb-2">Top Gainers</h4>
                  {movers.gainers.slice(0, 5).map((g) => (
                    <div key={g.symbol} className="flex items-center justify-between py-1"><span className="text-sm">{g.symbol}</span><span className="text-sm text-green-400">{formatPercent(g.change_pct)}</span></div>
                  ))}
                </div>
                <div><h4 className="text-sm font-medium text-red-400 mb-2">Top Losers</h4>
                  {movers.losers.slice(0, 5).map((l) => (
                    <div key={l.symbol} className="flex items-center justify-between py-1"><span className="text-sm">{l.symbol}</span><span className="text-sm text-red-400">{formatPercent(l.change_pct)}</span></div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Latest News</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {news.map((article) => (
              <div key={article.id} className="border-b border-border last:border-0 pb-2 last:pb-0">
                <p className="text-sm font-medium">{article.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{article.source}</span>
                  {article.sentiment && <Badge variant={article.sentiment === "bullish" ? "success" : article.sentiment === "bearish" ? "destructive" : "secondary"}>{article.sentiment}</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
