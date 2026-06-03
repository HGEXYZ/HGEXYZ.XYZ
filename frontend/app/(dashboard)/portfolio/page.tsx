"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { api } from "@/lib/api"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { Plus, TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react"
import type { PortfolioData } from "@/types"

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [showTrade, setShowTrade] = useState(false)
  const [tradeForm, setTradeForm] = useState({ symbol: "", side: "long", quantity: "0", entry_price: "0" })

  useEffect(() => { api.portfolio.get().then(setPortfolio) }, [])

  const addTrade = async () => {
    await api.portfolio.addTrade({ ...tradeForm, quantity: parseFloat(tradeForm.quantity), entry_price: parseFloat(tradeForm.entry_price), asset_type: "forex" })
    api.portfolio.get().then(setPortfolio)
    setShowTrade(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Portfolio</h1><p className="text-muted-foreground">Track your positions and performance</p></div><Button onClick={() => setShowTrade(!showTrade)}><Plus className="h-4 w-4 mr-2" />New Trade</Button></div>
      {showTrade && (
        <Card><CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input value={tradeForm.symbol} onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value })} placeholder="Symbol" />
            <Select value={tradeForm.side} onChange={(e) => setTradeForm({ ...tradeForm, side: e.target.value })} options={[{ value: "long", label: "Long" }, { value: "short", label: "Short" }]} />
            <Input value={tradeForm.quantity} onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })} type="number" placeholder="Quantity" />
            <Input value={tradeForm.entry_price} onChange={(e) => setTradeForm({ ...tradeForm, entry_price: e.target.value })} type="number" placeholder="Entry price" />
          </div>
          <Button onClick={addTrade}>Open Position</Button>
        </CardContent></Card>
      )}
      {portfolio && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Balance</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(portfolio.balance)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total PnL</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${portfolio.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(portfolio.total_pnl)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Exposure</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(portfolio.exposure)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sharpe Ratio</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{portfolio.sharpe_ratio.toFixed(2)}</p></CardContent></Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Open Positions</CardTitle></CardHeader><CardContent><div className="space-y-3">{portfolio.positions.map((pos) => (
              <div key={pos.id} className="flex items-center justify-between border-b border-border pb-2">
                <div><p className="font-medium">{pos.symbol}</p><p className="text-xs text-muted-foreground">{pos.side} • {pos.quantity} units</p></div>
                <div className="text-right"><p className="font-medium">{formatCurrency(pos.entry_price)}</p><p className={`text-xs ${pos.unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(pos.unrealized_pnl)}</p></div>
              </div>
            ))}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Recent Trades</CardTitle></CardHeader><CardContent><div className="space-y-3">{portfolio.recent_trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between border-b border-border pb-2">
                <div><p className="font-medium">{trade.symbol}</p><p className="text-xs text-muted-foreground">{trade.side} • {new Date(trade.opened_at).toLocaleDateString()}</p></div>
                <div className="text-right"><p className={`font-medium ${trade.net_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(trade.net_pnl)}</p><p className={`text-xs ${trade.return_pct >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPercent(trade.return_pct)}</p></div>
              </div>
            ))}</div></CardContent></Card>
          </div>
        </>
      )}
    </div>
  )
}
