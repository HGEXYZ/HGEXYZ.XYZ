import { NextResponse } from 'next/server'

const SYMBOLS = [
  { symbol: '^GSPC', name: 'S&P 500', group: 'indices' },
  { symbol: '^IXIC', name: 'NASDAQ', group: 'indices' },
  { symbol: '^DJI', name: 'DOW JONES', group: 'indices' },
  { symbol: 'DX-Y.NYB', name: 'DOLLAR INDEX', group: 'indices' },
  { symbol: 'GC=F', name: 'GOLD', group: 'commodities' },
  { symbol: 'CL=F', name: 'CRUDE OIL', group: 'commodities' },
  { symbol: 'SI=F', name: 'SILVER', group: 'commodities' },
  { symbol: 'BTC-USD', name: 'BITCOIN', group: 'crypto' },
  { symbol: 'ETH-USD', name: 'ETHEREUM', group: 'crypto' },
]

async function fetchYahoo(symbol: string) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, next: { revalidate: 10 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null
    const meta = result.meta
    const quotes = result.indicators?.quote?.[0]
    const closes = result.indicators?.adjclose?.[0]?.adjclose || quotes?.close
    const prevClose = closes?.[closes.length - 2] ?? meta.previousClose
    const price = meta.regularMarketPrice ?? closes?.[closes.length - 1]
    if (!price) return null
    const change = prevClose ? price - prevClose : 0
    const changePercent = prevClose ? (change / prevClose) * 100 : 0
    return {
      price: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      positive: change >= 0,
    }
  } catch {
    return null
  }
}

export async function GET() {
  const results = await Promise.all(
    SYMBOLS.map(async (s) => {
      const data = await fetchYahoo(s.symbol)
      return {
        symbol: s.symbol,
        name: s.name,
        group: s.group,
        price: data?.price ?? '—',
        change: data?.change ?? '0.00',
        changePercent: data?.changePercent ?? '0.00',
        positive: data?.positive ?? true,
      }
    })
  )

  return NextResponse.json({
    markets: results,
    timestamp: new Date().toISOString(),
  })
}
