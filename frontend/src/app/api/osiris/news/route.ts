import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://osirisai.live/api/news', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 15 },
    })
    if (!res.ok) throw new Error(`osirisai.live returned ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { news: [], total: 0, timestamp: new Date().toISOString(), error: 'Failed to fetch from osirisai.live' },
      { status: 200 }
    )
  }
}
