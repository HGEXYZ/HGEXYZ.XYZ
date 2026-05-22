import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const assets = body.assets || ["SPX", "NASDAQ", "DXY", "XAUUSD"]

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://hgexyz.com",
        "X-Title": "HGEXYZ",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct",
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are HGEXYZ institutional AI — elite hedge fund analyst, smart money concepts expert, forex strategist, macro analyst.

Return a JSON object with an "assets" array. Every asset requested MUST appear.

Schema:
{
  "assets": [
    {
      "name": string,
      "bias": "BUY" | "SELL" | "HOLD",
      "confidence": number (1-10),
      "risk": "LOW" | "MEDIUM" | "HIGH",
      "analysis": string (2-3 sentences using smart money concepts like order flow, liquidity sweeps, market structure, SMT divergence),
      "entry_zone": string (e.g. "5450-5520"),
      "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL"
    }
  ]
}

Include ALL assets from the user's request. Do not skip any.`,
          },
          {
            role: "user",
            content: `Analyze these assets: ${assets.join(", ")}. Return JSON with ALL of them.`,
          },
        ],
      }),
    })

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({
        error: "Empty AI response",
        assets: assets.map((a: string) => fallbackEntry(a)),
      })
    }

    let parsed

    try {
      parsed = JSON.parse(content)
    } catch {
      return NextResponse.json({
        error: "Failed to parse AI response as JSON",
        raw: content.substring(0, 2000),
        assets: assets.map((a: string) => fallbackEntry(a)),
      })
    }

    if (parsed?.assets && Array.isArray(parsed.assets)) {
      const normalize = (s: string) => s.toUpperCase().replace(/[\s-]/g, "")
      const returned = parsed.assets.map((a: any) => normalize(a.name || ""))
      for (const name of assets) {
        if (!returned.includes(normalize(name))) {
          parsed.assets.push(fallbackEntry(name))
        }
      }
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "AI request failed" }, { status: 500 })
  }
}

function fallbackEntry(name: string) {
  return {
    name,
    bias: "HOLD",
    confidence: 5,
    risk: "MEDIUM",
    analysis: "Analysis unavailable",
    entry_zone: "N/A",
    sentiment: "NEUTRAL",
  }
}
