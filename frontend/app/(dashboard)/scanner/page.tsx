"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { Search, Loader2 } from "lucide-react"
import type { ScannerResult, SMCResult } from "@/types"

export default function ScannerPage() {
  const [assetType, setAssetType] = useState("all")
  const [results, setResults] = useState<ScannerResult[]>([])
  const [smcResult, setSmcResult] = useState<SMCResult | null>(null)
  const [symbol, setSymbol] = useState("")
  const [loading, setLoading] = useState(false)

  const runScan = async () => {
    setLoading(true)
    try {
      const res = await api.scanner.scan({ asset_type: assetType === "all" ? undefined : assetType, limit: 50 })
      setResults(res)
    } finally { setLoading(false) }
  }

  const runSmc = async () => {
    if (!symbol) return
    setLoading(true)
    try {
      const res = await api.scanner.smc(symbol)
      setSmcResult(res)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Market Scanner</h1><p className="text-muted-foreground">Scan markets with technical filters</p></div>
      <Tabs defaultValue="scan">
        <TabsList><TabsTrigger value="scan">Technical Scanner</TabsTrigger><TabsTrigger value="smc">Smart Money Concepts</TabsTrigger></TabsList>
        <TabsContent value="scan">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                {["all", "forex", "crypto", "stocks"].map((t) => (
                  <Button key={t} variant={assetType === t ? "default" : "outline"} size="sm" onClick={() => setAssetType(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Button>
                ))}
                <Button onClick={runScan} disabled={loading} className="ml-auto"><Search className="h-4 w-4 mr-2" />{loading ? "Scanning..." : "Scan"}</Button>
              </div>
              {results.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-left py-2">Symbol</th><th className="text-right py-2">Price</th><th className="text-right py-2">Change</th><th className="text-right py-2">RSI</th><th className="text-right py-2">Volatility</th><th className="text-right py-2">Trend</th><th className="text-right py-2">Signals</th></tr></thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.symbol} className="border-b border-border hover:bg-secondary/50"><td className="py-2 font-medium">{r.symbol}<span className="text-xs text-muted-foreground ml-1">{r.asset_type}</span></td><td className="text-right py-2">{formatCurrency(r.price, r.price < 1 ? 4 : 2)}</td><td className={`text-right py-2 ${r.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPercent(r.change_pct)}</td><td className="text-right py-2"><Badge variant={r.rsi > 70 ? "warning" : r.rsi < 30 ? "destructive" : "secondary"}>{r.rsi.toFixed(1)}</Badge></td><td className="text-right py-2">{r.volatility.toFixed(1)}%</td><td className="text-right py-2"><Badge variant={r.trend === "bullish" ? "success" : r.trend === "bearish" ? "destructive" : "secondary"}>{r.trend}</Badge></td><td className="text-right py-2"><div className="flex gap-1 justify-end">{r.signals.slice(0, 3).map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="smc">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2"><input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Enter symbol (e.g., EURUSD=X)" className="flex-1 h-10 px-3 bg-secondary border border-border rounded-lg text-sm" /><Button onClick={runSmc} disabled={loading || !symbol}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}</Button></div>
              {smcResult && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-sm">Liquidity Sweeps</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{smcResult.liquidity_sweeps.length}</p></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-sm">Fair Value Gaps</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{smcResult.fair_value_gaps.length}</p></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-sm">Order Blocks</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{smcResult.order_blocks.length}</p></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-sm">Break of Structure</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{smcResult.break_of_structure.length}</p></CardContent></Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
