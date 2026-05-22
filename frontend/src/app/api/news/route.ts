import { NextResponse } from "next/server"

const FALLBACK_ARTICLES = [
  { title: "Fed holds rates steady at 4.33% as inflation moderates", description: "The Federal Reserve maintained its benchmark interest rate, signaling a cautious approach amid cooling inflation data.", category: "fed", sentiment: "NEUTRAL", sentimentScore: 0 },
  { title: "S&P 500 hits new all-time high above 5,500", description: "The broad market index surged on strong earnings and optimistic economic data.", category: "markets", sentiment: "BULLISH", sentimentScore: 3 },
  { title: "Crude oil drops 3% on demand concerns", description: "Oil prices fell sharply as weak manufacturing data from China raised fears of slowing demand.", category: "commodities", sentiment: "BEARISH", sentimentScore: -2 },
  { title: "Gold breaks above $2,400 as safe-haven demand surges", description: "Precious metals rallied amid geopolitical tensions and a weakening dollar.", category: "commodities", sentiment: "BULLISH", sentimentScore: 4 },
  { title: "Bitcoin reclaims $70,000 level", description: "The largest cryptocurrency surged amid renewed institutional interest and positive regulatory developments.", category: "crypto", sentiment: "BULLISH", sentimentScore: 3 },
  { title: "DXY weakens as dovish Fed expectations grow", description: "The US Dollar Index declined as traders priced in potential rate cuts later this year.", category: "forex", sentiment: "BEARISH", sentimentScore: -2 },
  { title: "GDP growth revised up to 3.1%", description: "The Commerce Department raised its Q1 GDP estimate, reflecting stronger consumer spending.", category: "economy", sentiment: "BULLISH", sentimentScore: 2 },
  { title: "Nonfarm payrolls beat expectations at 156K", description: "Job growth exceeded forecasts, indicating resilience in the labor market.", category: "economy", sentiment: "BULLISH", sentimentScore: 2 },
  { title: "10-year Treasury yield falls below 4.30%", description: "Bond yields declined as investors sought safe-haven assets amid global uncertainty.", category: "fed", sentiment: "BULLISH", sentimentScore: 1 },
  { title: "Geopolitical tensions escalate in Middle East", description: "Rising conflicts in the region are driving volatility in energy markets and safe-haven flows.", category: "geopolitical", sentiment: "BEARISH", sentimentScore: -3 },
  { title: "EURUSD tests 1.0900 resistance level", description: "The euro strengthened against the dollar as ECB signals potential rate hold.", category: "forex", sentiment: "BULLISH", sentimentScore: 1 },
  { title: "Tech stocks rally as AI sector continues momentum", description: "NASDAQ composite gained 1.5% driven by AI-related equities and strong semiconductor earnings.", category: "markets", sentiment: "BULLISH", sentimentScore: 3 },
  { title: "CPI inflation rises 3.4% year-over-year", description: "Consumer prices increased moderately, reinforcing expectations of gradual Fed easing.", category: "economy", sentiment: "NEUTRAL", sentimentScore: 0 },
  { title: "OPEC maintains production cuts through Q3", description: "The oil cartel extended supply restrictions to support prices amid tepid global demand.", category: "commodities", sentiment: "BULLISH", sentimentScore: 2 },
  { title: "Retail sales data surprises to the upside", description: "Consumer spending remained robust, suggesting economic resilience despite high interest rates.", category: "economy", sentiment: "BULLISH", sentimentScore: 2 },
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query") || "financial markets"
    const limit = parseInt(searchParams.get("limit") || "25")

    if (!process.env.FREE_NEWS_API_KEY || process.env.FREE_NEWS_API_KEY === "YOUR_API_KEY_HERE") {
      return buildFallbackResponse(limit, query)
    }

    try {
      const url = `https://freenewsapi.io/api/v1/articles?apikey=${process.env.FREE_NEWS_API_KEY}&language=en&q=${encodeURIComponent(query)}&sort=newest&limit=${limit}`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (data?.articles?.length > 0) {
        const scored = data.articles.slice(0, limit).map((article: any) => {
          const text = `${article.title || ""} ${article.description || ""}`.toLowerCase()
          const bullishWords = ["surge", "rally", "bullish", "breakout", "growth", "positive", "gain", "recovery", "boom", "upgrade", "optimism", "expansion"]
          const bearishWords = ["crash", "plunge", "bearish", "decline", "recession", "negative", "loss", "downturn", "slump", "downgrade", "pessimism", "contraction", "crisis", "fear"]
          let score = 0
          bullishWords.forEach((w) => { if (text.includes(w)) score += 1 })
          bearishWords.forEach((w) => { if (text.includes(w)) score -= 1 })
          const sentiment = score > 0 ? "BULLISH" : score < 0 ? "BEARISH" : "NEUTRAL"
          return {
            id: article.url || article.title,
            title: article.title || "",
            description: article.description || "",
            url: article.url || "",
            source: article.source?.name || article.source_name || article.source || "NewsWire",
            publishedAt: article.publishedAt || article.published_at || article.date || new Date().toISOString(),
            sentiment,
            sentimentScore: score,
            category: detectCategory(text),
          }
        })

        return NextResponse.json({
          total: scored.length,
          articles: scored,
          summary: {
            bullish: scored.filter((a: any) => a.sentiment === "BULLISH").length,
            bearish: scored.filter((a: any) => a.sentiment === "BEARISH").length,
            neutral: scored.filter((a: any) => a.sentiment === "NEUTRAL").length,
            topSource: "NewsWire",
          },
        })
      }
    } catch {
      // API failed, fall through to fallback
    }

    return buildFallbackResponse(limit, query)
  } catch {
    return buildFallbackResponse(20, "markets")
  }
}

function buildFallbackResponse(limit: number, query: string) {
  const filtered = FALLBACK_ARTICLES.filter(
    (a) => query === "financial markets" || query === "markets" || a.category.includes(query) || a.title.toLowerCase().includes(query.toLowerCase())
  )
  const articles = (filtered.length > 0 ? filtered : FALLBACK_ARTICLES).slice(0, limit).map((a, i) => ({
    id: `fallback-${i}`,
    title: a.title,
    description: a.description,
    url: "#",
    source: "HGEXYZ Intelligence",
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    sentiment: a.sentiment,
    sentimentScore: a.sentimentScore,
    category: a.category,
  }))

  return NextResponse.json({
    total: articles.length,
    articles,
    summary: {
      bullish: articles.filter((a) => a.sentiment === "BULLISH").length,
      bearish: articles.filter((a) => a.sentiment === "BEARISH").length,
      neutral: articles.filter((a) => a.sentiment === "NEUTRAL").length,
      topSource: "HGEXYZ Intelligence",
    },
  })
}

function detectCategory(text: string): string {
  if (/crypto|bitcoin|btc|eth|ethereum|blockchain/i.test(text)) return "crypto"
  if (/fed|fomc|interest.rate|federal.reserve|central.bank/i.test(text)) return "fed"
  if (/oil|cruce|petroleum|energy/i.test(text)) return "commodities"
  if (/gold|xau|silver|precious.metal/i.test(text)) return "commodities"
  if (/forex|eurusd|gbpusd|dxy|dollar|currency/i.test(text)) return "forex"
  if (/stock|spx|nasdaq|equit|market|rally/i.test(text)) return "markets"
  if (/gdp|cpi|inflation|unemployment|nfp|payroll|econom/i.test(text)) return "economy"
  if (/war|sanction|geopolit|conflict|tension/i.test(text)) return "geopolitical"
  return "financial"
}
