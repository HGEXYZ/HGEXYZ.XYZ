export interface User {
  id: string; email: string; name: string; role: "user" | "admin"
  avatar_url?: string; is_verified: boolean; created_at: string
}
export interface AuthResponse { user: User; access_token: string; refresh_token: string; token_type: string }
export interface Conversation { id: string; title?: string; created_at: string; updated_at: string; message_count: number }
export interface Message { id: string; role: "user" | "assistant" | "system"; content: string; created_at: string; metadata?: string }
export interface ChatResponse { conversation_id: string; message: Message }
export interface MarketQuote { symbol: string; price: number; change: number; change_pct: number; volume?: number; high_24h?: number; low_24h?: number; timestamp: string }
export interface OHLCV { timestamp: string; open: number; high: number; low: number; close: number; volume: number }
export interface MarketMovers { gainers: MarketQuote[]; losers: MarketQuote[] }
export interface ScannerResult { symbol: string; asset_type: string; price: number; change_pct: number; volume: number; rsi: number; macd: number; macd_signal_line: number; volatility: number; trend: string; signals: string[] }
export interface SMCResult { symbol: string; timeframe: string; liquidity_sweeps: any[]; fair_value_gaps: any[]; order_blocks: any[]; break_of_structure: any[]; change_of_character: any[] }
export interface BacktestResult { id: string; name: string; symbol: string; status: string; initial_capital: number; final_capital?: number; total_return?: number; return_pct?: number; win_rate?: number; profit_factor?: number; max_drawdown?: number; sharpe_ratio?: number; total_trades: number; equity_curve?: any[]; trades?: any[] }
export interface PortfolioData { id: string; name: string; balance: number; total_pnl: number; sharpe_ratio: number; max_drawdown: number; exposure: number; positions: PositionData[]; recent_trades: TradeData[] }
export interface PositionData { id: string; symbol: string; asset_type: string; side: string; quantity: number; entry_price: number; current_price?: number; unrealized_pnl: number; stop_loss?: number; take_profit?: number; opened_at: string }
export interface TradeData { id: string; symbol: string; asset_type: string; side: string; status: string; entry_price: number; exit_price?: number; quantity: number; gross_pnl: number; net_pnl: number; return_pct: number; opened_at: string; closed_at?: string }
export interface NewsArticle { id: string; title: string; source: string; url: string; summary?: string; sentiment?: string; sentiment_score?: number; impact?: string; symbols?: string; published_at: string }
export interface EconomicEvent { id: string; title: string; country: string; date: string; impact: string; previous?: number; forecast?: number; actual?: number; category: string }
export interface SubscriptionPlan { price: number; features: string[]; limits: Record<string, number> }
export interface SubscriptionData { id: string; plan: string; status: string; current_period_start?: string; current_period_end?: string; created_at: string }
export interface AdminStats { total_users: number; active_users: number; total_conversations: number; total_ai_queries: number; total_subscriptions: Record<string, number>; revenue: Record<string, number>; ai_costs: Record<string, number> }
