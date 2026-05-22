import { NextRequest, NextResponse } from 'next/server'

const INTERVAL_RANGES: Record<string, string> = {
  '1m': '1d',
  '5m': '5d',
  '15m': '5d',
  '1h': '1mo',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') || '^GSPC'
  const interval = searchParams.get('interval') || '5m'
  const range = searchParams.get('range') || INTERVAL_RANGES[interval] || '5d'

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 10 } }
    )
    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`)
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) throw new Error('No data')

    const quotes = result.indicators?.quote?.[0]
    const timestamps: number[] = result.timestamp || []

    const ohlcv = timestamps
      .map((t: number, i: number) => ({
        time: (t as number) as any,
        open: quotes?.open?.[i] ?? 0,
        high: quotes?.high?.[i] ?? 0,
        low: quotes?.low?.[i] ?? 0,
        close: quotes?.close?.[i] ?? 0,
        volume: quotes?.volume?.[i] ?? 0,
      }))
      .filter((d: any) => d.open && d.close)

    return NextResponse.json({
      symbol: result.meta?.symbol || symbol,
      interval,
      data: ohlcv,
      meta: {
        currency: result.meta?.currency || 'USD',
        regularMarketPrice: result.meta?.regularMarketPrice,
        previousClose: result.meta?.previousClose,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, data: [] }, { status: 200 })
  }
}
