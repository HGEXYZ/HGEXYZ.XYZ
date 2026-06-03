"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { Play, History, Download, TrendingUp, TrendingDown } from "lucide-react"
import type { BacktestResult } from "@/types"

export default function BacktestPage() {
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [assetType, setAssetType] = useState("forex")
  const [timeframe, setTimeframe] = useState("1h")
  const [capital, setCapital] = useState("10000")
  const [strategy, setStrategy] = useState("")
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [history, setHistory] = useState<BacktestResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.backtest.history().then(setHistory) }, [])

  const runBacktest = async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString().split("T")[0]
      const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0]
      const res = await api.backtest.run({
        name: name || `${symbol} Backtest`, symbol: symbol.toUpperCase(), asset_type: assetType,
        timeframe, start_date: startDate, end_date: endDate, initial_capital: parseFloat(capital),
        strategy: strategy || "sma_cross_20_50",
      })
      setResult(res)
      api.backtest.history().then(setHistory)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Backtesting Engine</h1><p className="text-muted-foreground">Test strategies against historical data</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Run Backtest</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Strategy name" />
            <div className="grid grid-cols-2 gap-4">
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol (EURUSD=X)" />
              <Select value={assetType} onChange={(e) => setAssetType(e.target.value)} options={[{ value: "forex", label: "Forex" }, { value: "crypto", label: "Crypto" }, { value: "stock", label: "Stocks" }]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} options={[{ value: "1h", label: "1 Hour" }, { value: "4h", label: "4 Hours" }, { value: "1d", label: "Daily" }]} />
              <Input value={capital} onChange={(e) => setCapital(e.target.value)} type="number" placeholder="Initial capital" />
            </div>
            <textarea value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="Strategy description (or leave empty for default SMA crossover)" className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-lg text-sm resize-none" />
            <Button onClick={runBacktest} disabled={loading || !symbol} className="w-full"><Play className="h-4 w-4 mr-2" />{loading ? "Running..." : "Run Backtest"}</Button>
          </CardContent>
        </Card>
        {result && (
          <Card>
            <CardHeader><CardTitle>Results</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Total Return</p><p className={`text-xl font-bold ${(result.return_pct || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPercent(result.return_pct || 0)}</p></div>
                <div><p className="text-sm text-muted-foreground">Win Rate</p><p className="text-xl font-bold">{result.win_rate?.toFixed(1)}%</p></div>
                <div><p className="text-sm text-muted-foreground">Profit Factor</p><p className="text-xl font-bold">{result.profit_factor?.toFixed(2)}</p></div>
                <div><p className="text-sm text-muted-foreground">Max Drawdown</p><p className="text-xl font-bold text-red-400">{result.max_drawdown?.toFixed(1)}%</p></div>
                <div><p className="text-sm text-muted-foreground">Sharpe Ratio</p><p className="text-xl font-bold">{result.sharpe_ratio?.toFixed(2)}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Trades</p><p className="text-xl font-bold">{result.total_trades}</p></div>
              </div>
              {result.trades && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-1">Side</th><th className="text-right py-1">Entry</th><th className="text-right py-1">Exit</th><th className="text-right py-1">PnL</th></tr></thead>
                    <tbody>{result.trades.slice(0, 10).map((t: any, i: number) => (
                      <tr key={i} className="border-b border-border"><td className="py-1">{t.side === "long" ? <TrendingUp className="h-3 w-3 text-green-400 inline" /> : <TrendingDown className="h-3 w-3 text-red-400 inline" />}</td><td className="text-right py-1">{formatCurrency(t.entry_price)}</td><td className="text-right py-1">{formatCurrency(t.exit_price)}</td><td className={`text-right py-1 ${t.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(t.pnl)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4" />Backtest History</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2">Name</th><th className="text-left py-2">Symbol</th><th className="text-right py-2">Return</th><th className="text-right py-2">Win Rate</th><th className="text-right py-2">Trades</th><th className="text-right py-2">Status</th></tr></thead>
              <tbody>{history.map((bt) => (
                <tr key={bt.id} className="border-b border-border hover:bg-secondary/50"><td className="py-2">{bt.name}</td><td className="py-2">{bt.symbol}</td><td className={`text-right py-2 ${(bt.return_pct || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPercent(bt.return_pct || 0)}</td><td className="text-right py-2">{bt.win_rate?.toFixed(1)}%</td><td className="text-right py-2">{bt.total_trades}</td><td className="text-right py-2"><Badge variant={bt.status === "completed" ? "success" : bt.status === "running" ? "warning" : "destructive"}>{bt.status}</Badge></td></tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
