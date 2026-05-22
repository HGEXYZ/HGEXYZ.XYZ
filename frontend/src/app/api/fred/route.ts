import { NextResponse } from "next/server"

const FRED_BASE = "https://api.stlouisfed.org/fred"

const FALLBACK: Record<string, { name: string; value: number; prev: number }> = {
  FEDFUNDS: { name: "Federal Funds Rate", value: 4.33, prev: 4.50 },
  CPIAUCSL: { name: "CPI All Urban Consumers", value: 315.5, prev: 314.8 },
  GDP: { name: "Gross Domestic Product", value: 29300, prev: 29100 },
  UNRATE: { name: "Unemployment Rate", value: 4.1, prev: 4.2 },
  PAYEMS: { name: "Nonfarm Payrolls", value: 156000, prev: 142000 },
  DGS10: { name: "10-Year Treasury Yield", value: 4.28, prev: 4.15 },
  DGS2: { name: "2-Year Treasury Yield", value: 4.62, prev: 4.55 },
  T10YIE: { name: "10-Year Breakeven Inflation", value: 2.38, prev: 2.35 },
  PPIFIS: { name: "PPI Finished Goods", value: 143.2, prev: 142.8 },
  M2SL: { name: "M2 Money Supply", value: 20900, prev: 20850 },
  T5YIE: { name: "5-Year Breakeven Inflation", value: 2.42, prev: 2.40 },
  DGS30: { name: "30-Year Treasury Yield", value: 4.52, prev: 4.45 },
  DFF: { name: "Effective Federal Funds Rate", value: 4.33, prev: 4.50 },
  T10Y2Y: { name: "10Y-2Y Treasury Spread", value: -0.34, prev: -0.40 },
  INDPRO: { name: "Industrial Production", value: 102.5, prev: 102.1 },
  CPIENGSL: { name: "CPI Energy", value: 280.3, prev: 278.9 },
}

function getFallback(seriesId: string, start: string, limit: number) {
  const fb = FALLBACK[seriesId]
  if (!fb) return null
  const obs = Array.from({ length: limit }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000 * 30).toISOString().split("T")[0],
    value: i === 0 ? fb.value : fb.value - (fb.value - fb.prev) * (i / limit),
  }))
  return {
    series: seriesId,
    name: fb.name,
    units: "",
    observations: obs.map((o) => ({ ...o, value: Math.round(o.value * 100) / 100 })),
    latest: { date: obs[0]?.date || "", value: fb.value },
    previous: { date: obs[1]?.date || "", value: fb.prev },
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const seriesId = searchParams.get("series_id")?.toUpperCase()
    const observationStart = searchParams.get("start") || "2024-01-01"
    const limit = parseInt(searchParams.get("limit") || "30")

    if (!process.env.FRED_API_KEY || process.env.FRED_API_KEY === "YOUR_API_KEY_HERE") {
      if (seriesId && seriesId !== "ALL") {
        const fb = getFallback(seriesId, observationStart, limit)
        if (fb) return NextResponse.json(fb)
      }
      const results: any = {}
      for (const key of Object.keys(FALLBACK)) {
        results[key] = getFallback(key, observationStart, 5)
      }
      return NextResponse.json(results)
    }

    if (seriesId && seriesId !== "ALL") {
      const info = FALLBACK[seriesId] || { name: seriesId }
      const url = `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${process.env.FRED_API_KEY}&file_type=json&observation_start=${observationStart}&sort_order=desc&limit=${limit}`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      const data = await res.json()

      if (data.error_code) throw new Error(data.error_message)

      const observations = (data.observations || [])
        .filter((o: any) => o.value !== ".")
        .map((o: any) => ({ date: o.date, value: parseFloat(o.value) }))

      return NextResponse.json({
        series: seriesId,
        name: info.name || seriesId,
        units: data.units || "",
        observations,
        latest: observations[0] || null,
        previous: observations[1] || null,
      })
    }

    const results: any = {}
    for (const key of Object.keys(FALLBACK)) {
      try {
        const url = `${FRED_BASE}/series/observations?series_id=${key}&api_key=${process.env.FRED_API_KEY}&file_type=json&observation_start=2024-01-01&sort_order=desc&limit=5`
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        const data = await res.json()
        if (data.observations) {
          const obs = data.observations.filter((o: any) => o.value !== ".").map((o: any) => ({ date: o.date, value: parseFloat(o.value) }))
          results[key] = { name: FALLBACK[key]?.name || key, latest: obs[0] || null, previous: obs[1] || null, observations: obs }
        } else {
          results[key] = getFallback(key, observationStart, 5)
        }
      } catch {
        results[key] = getFallback(key, observationStart, 5)
      }
    }
    return NextResponse.json(results)
  } catch {
    // Final fallback
    const { searchParams } = new URL(req.url)
    const seriesId = searchParams.get("series_id")?.toUpperCase()
    if (seriesId && seriesId !== "ALL") {
      const fb = getFallback(seriesId, "2024-01-01", 30)
      return NextResponse.json(fb || { error: "unknown series" })
    }
    const results: any = {}
    for (const key of Object.keys(FALLBACK)) {
      results[key] = getFallback(key, "2024-01-01", 5)
    }
    return NextResponse.json(results)
  }
}
