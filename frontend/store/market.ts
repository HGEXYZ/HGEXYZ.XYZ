import { create } from "zustand"
import type { MarketQuote, MarketMovers, ScannerResult } from "@/types"

interface MarketState {
  quotes: Record<string, MarketQuote>; movers: MarketMovers | null; scanResults: ScannerResult[]
  setQuote: (symbol: string, quote: MarketQuote) => void; setMovers: (m: MarketMovers) => void; setScanResults: (r: ScannerResult[]) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  quotes: {}, movers: null, scanResults: [],
  setQuote: (symbol, quote) => set((s) => ({ quotes: { ...s.quotes, [symbol]: quote } })),
  setMovers: (movers) => set({ movers }),
  setScanResults: (scanResults) => set({ scanResults }),
}))
