'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, LineStyle, LineWidth, CandlestickSeriesPartialOptions } from 'lightweight-charts'

interface OHLCV { time: number; open: number; high: number; low: number; close: number; volume: number }

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d']
const COMMON_SYMBOLS = [
  { s: '^GSPC', n: 'S&P 500' },
  { s: '^IXIC', n: 'NASDAQ' },
  { s: '^DJI', n: 'DOW JONES' },
  { s: 'BTC-USD', n: 'BITCOIN' },
  { s: 'ETH-USD', n: 'ETHEREUM' },
  { s: 'GC=F', n: 'GOLD' },
  { s: 'CL=F', n: 'CRUDE OIL' },
  { s: 'DX-Y.NYB', n: 'DXY' },
]

const C = {
  bg: '#07010f', text: '#94a3b8', grid: '#2a2e3940',
  up: '#10b981', down: '#ef4444',
  wickUp: '#10b98180', wickDown: '#ef444480',
  line: '#a855f7', areaTop: '#a855f730', areaBottom: '#a855f700',
  sma7: '#c084fc', sma25: '#7c3aed', sma99: '#10b981',
  ema7: '#ef4444', ema25: '#a78bfa', ema99: '#22d3ee',
  bb: '#a855f780', rsi: '#c084fc',
  macd: '#a855f7', macdSignal: '#7c3aed', macdHist: '#4a1d96',
}

const IR: Record<string, string> = { '1m': '1d', '5m': '5d', '15m': '5d', '1h': '1mo', '4h': '3mo', '1d': '6mo' }
const REFRESH_INTERVALS: Record<string, number> = { '1m': 15, '5m': 30, '15m': 60, '1h': 120, '4h': 300, '1d': 600 }

function calcSMA(data: OHLCV[], period: number) {
  return data.map((d, i) => {
    if (i < period - 1) return null
    let s = 0; for (let j = i - period + 1; j <= i; j++) s += data[j].close
    return { time: d.time, value: s / period }
  }).filter(Boolean) as { time: number; value: number }[]
}

function calcEMA(data: OHLCV[], period: number): { time: number; value: number }[] {
  const k = 2 / (period + 1)
  const result: { time: number; value: number }[] = []
  let prevEma = data[0]?.close ?? 0
  data.forEach((d, i) => {
    if (i === 0) {
      result.push({ time: d.time, value: d.close })
      return
    }
    const val = d.close * k + prevEma * (1 - k)
    prevEma = val
    if (i >= period - 1) result.push({ time: d.time, value: val })
  })
  return result
}

function calcBB(data: OHLCV[], period = 20, stdDev = 2) {
  return data.map((d, i) => {
    if (i < period - 1) return null
    let s = 0; for (let j = i - period + 1; j <= i; j++) s += data[j].close
    const ma = s / period
    let sq = 0; for (let j = i - period + 1; j <= i; j++) sq += (data[j].close - ma) ** 2
    const sd = Math.sqrt(sq / period)
    return { time: d.time, ma, upper: ma + stdDev * sd, lower: ma - stdDev * sd }
  }).filter(Boolean) as { time: number; ma: number; upper: number; lower: number }[]
}

function calcRSI(data: OHLCV[], period = 14) {
  return data.map((d, i) => {
    if (i < period) return null
    let gains = 0, losses = 0
    for (let j = i - period + 1; j <= i; j++) {
      const diff = data[j].close - data[j - 1].close
      if (diff >= 0) gains += diff; else losses -= diff
    }
    const rs = gains / period / (losses / period || 0.001)
    return { time: d.time, value: 100 - 100 / (1 + rs) }
  }).filter(Boolean) as { time: number; value: number }[]
}

function calcMACD(data: OHLCV[], fast = 12, slow = 26, signal = 9) {
  const emaFast = calcEMA(data, fast)
  const emaSlow = calcEMA(data, slow)
  const macdLine = emaFast.map((f, i) => {
    if (!emaSlow[i]) return null
    return { time: f.time, value: f.value - emaSlow[i].value }
  }).filter(Boolean) as { time: number; value: number }[]
  const macdVals = macdLine.map((m) => m.value)
  const signalLine = macdLine.map((m, i) => {
    if (i < signal - 1) return null
    let s = 0; for (let j = i - signal + 1; j <= i; j++) s += macdVals[j]
    return { time: m.time, value: s / signal }
  }).filter(Boolean) as { time: number; value: number }[]
  const histogram = macdLine.map((m, i) => {
    const sig = signalLine.find((s) => s.time === m.time)
    if (!sig) return null
    return { time: m.time, value: m.value - sig.value, color: m.value >= sig.value ? '#10b98140' : '#ef444440' }
  }).filter(Boolean) as { time: number; value: number; color: string }[]
  return { macdLine, signalLine, histogram }
}

export default function FullScreenChart() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [symbol, setSymbol] = useState(searchParams.get('s') || '^GSPC')
  const [name, setName] = useState(searchParams.get('n') || 'S&P 500')

  const chartRef = useRef<HTMLDivElement>(null)
  const rsiRef = useRef<HTMLDivElement>(null)
  const macdRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<IChartApi | null>(null)
  const rsiChartInstance = useRef<IChartApi | null>(null)
  const macdChartInstance = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'> | null>(null)

  const [interval, setInterval] = useState('5m')
  const [chartType, setChartType] = useState<'CANDLES' | 'LINE' | 'AREA'>('CANDLES')
  const [showSMA, setShowSMA] = useState(false)
  const [showEMA, setShowEMA] = useState(false)
  const [showBB, setShowBB] = useState(false)
  const [showRSI, setShowRSI] = useState(false)
  const [showMACD, setShowMACD] = useState(false)
  const [showVolume, setShowVolume] = useState(true)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<OHLCV[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [drawMode, setDrawMode] = useState<'NONE' | 'TREND' | 'HORIZ' | 'FIB'>('NONE')
  const [drawingLines, setDrawingLines] = useState<{ id: string; type: string; series: ISeriesApi<'Line'> }[]>([])
  const [crosshairMode, setCrosshairMode] = useState(true)

  const updateSymbol = useCallback((s: string, n: string) => {
    setSymbol(s); setName(n)
    router.replace(`/chart?s=${encodeURIComponent(s)}&n=${encodeURIComponent(n)}`, { scroll: false })
  }, [router])

  const fetchData = useCallback(async (sym: string, int: string) => {
    setLoading(true)
    try {
      const scope = IR[int] || '5d'
      const res = await fetch(`/api/chart?symbol=${encodeURIComponent(sym)}&interval=${int}&range=${scope}`)
      const json = await res.json()
      if (json?.data?.length) { setData(json.data); setMeta(json.meta) }
      else { setData([]); setMeta(null) }
    } catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData(symbol, interval) }, [symbol, interval, fetchData])

  useEffect(() => {
    if (!['1m', '5m'].includes(interval)) return
    const secs = REFRESH_INTERVALS[interval] * 1000
    const timer = window.setInterval(() => fetchData(symbol, interval), secs)
    return () => clearInterval(timer)
  }, [symbol, interval, fetchData])

  const makeChart = useCallback((el: HTMLDivElement) => {
    return createChart(el, {
      layout: { background: { type: ColorType.Solid, color: C.bg }, textColor: C.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
      grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } },
      width: el.clientWidth, height: el.clientHeight,
      crosshair: {
        mode: crosshairMode ? CrosshairMode.Normal : CrosshairMode.Magnet,
        vertLine: { color: '#a855f740', width: 1, style: 2 as LineStyle, labelBackgroundColor: '#a855f7' },
        horzLine: { color: '#a855f740', width: 1, style: 2 as LineStyle, labelBackgroundColor: '#a855f7' },
      },
      timeScale: { borderColor: '#ffffff15', timeVisible: true, secondsVisible: false, fixLeftEdge: true, fixRightEdge: true, borderVisible: true },
      rightPriceScale: { borderColor: '#ffffff15', borderVisible: true, scaleMargins: { top: 0.05, bottom: 0.12 } },
      watermark: { visible: true, text: symbol, color: '#ffffff05', fontSize: 72, horzAlign: 'center', vertAlign: 'center' },
    })
  }, [symbol, crosshairMode])

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return
    if (chartInstance.current) chartInstance.current.remove()
    const chart = makeChart(chartRef.current)

    if (chartType === 'CANDLES') {
      const cs = chart.addCandlestickSeries({
        upColor: C.up, downColor: C.down, borderUpColor: C.up, borderDownColor: C.down,
        wickUpColor: C.wickUp, wickDownColor: C.wickDown,
      } as CandlestickSeriesPartialOptions)
      cs.setData(data as any)
      seriesRef.current = cs as any
    } else if (chartType === 'LINE') {
      const ls = chart.addLineSeries({ color: C.line, lineWidth: 2 })
      ls.setData(data.map((d) => ({ time: d.time as any, value: d.close })))
      seriesRef.current = ls as any
    } else {
      const as = chart.addAreaSeries({ lineColor: C.line, topColor: C.areaTop, bottomColor: C.areaBottom, lineWidth: 2 })
      as.setData(data.map((d) => ({ time: d.time as any, value: d.close })))
      seriesRef.current = as as any
    }

    if (showSMA) {
      const s7 = calcSMA(data, 7); const s25 = calcSMA(data, 25); const s99 = calcSMA(data, 99)
      if (s7.length) chart.addLineSeries({ color: C.sma7, lineWidth: 1 }).setData(s7 as any)
      if (s25.length) chart.addLineSeries({ color: C.sma25, lineWidth: 1 }).setData(s25 as any)
      if (s99.length) chart.addLineSeries({ color: C.sma99, lineWidth: 1 }).setData(s99 as any)
    }

    if (showEMA) {
      const e7 = calcEMA(data, 7); const e25 = calcEMA(data, 25); const e99 = calcEMA(data, 99)
      if (e7.length) chart.addLineSeries({ color: C.ema7, lineWidth: 1, lineStyle: 2 as LineStyle }).setData(e7 as any)
      if (e25.length) chart.addLineSeries({ color: C.ema25, lineWidth: 1, lineStyle: 2 as LineStyle }).setData(e25 as any)
      if (e99.length) chart.addLineSeries({ color: C.ema99, lineWidth: 1, lineStyle: 2 as LineStyle }).setData(e99 as any)
    }

    if (showBB) {
      const bb = calcBB(data)
      if (bb.length) {
        chart.addLineSeries({ color: C.bb, lineWidth: 1, lineStyle: 2 as LineStyle }).setData(bb.map((b) => ({ time: b.time as any, value: b.upper })))
        chart.addLineSeries({ color: C.bb, lineWidth: 1, lineStyle: 2 as LineStyle }).setData(bb.map((b) => ({ time: b.time as any, value: b.lower })))
      }
    }

    if (showVolume) {
      const vs = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'vol' })
      vs.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
      vs.setData(data.map((d) => ({ time: d.time as any, value: d.volume, color: d.close >= d.open ? '#10b98118' : '#ef444418' })) as any)
    }

    chart.timeScale().fitContent()
    const handleResize = () => { if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight }) }
    window.addEventListener('resize', handleResize)
    chartInstance.current = chart
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); chartInstance.current = null }
  }, [data, chartType, showSMA, showEMA, showBB, showVolume, makeChart])

  useEffect(() => {
    if (!rsiRef.current || data.length === 0 || !showRSI) {
      if (rsiChartInstance.current) { rsiChartInstance.current.remove(); rsiChartInstance.current = null }
      return
    }
    if (rsiChartInstance.current) rsiChartInstance.current.remove()
    const chart = createChart(rsiRef.current, {
      layout: { background: { type: ColorType.Solid, color: C.bg }, textColor: C.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 10 },
      grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } },
      width: rsiRef.current.clientWidth, height: rsiRef.current.clientHeight,
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: '#a855f740', width: 1, style: 2 as LineStyle, labelBackgroundColor: '#a855f7' } },
      timeScale: { borderColor: '#ffffff15', visible: false },
      rightPriceScale: { borderColor: '#ffffff15', scaleMargins: { top: 0.1, bottom: 0.1 } },
    })
    const rsi = calcRSI(data)
    if (rsi.length) {
      chart.addLineSeries({ color: C.rsi, lineWidth: 2 }).setData(rsi as any)
      chart.addLineSeries({ color: '#ef444440', lineWidth: 1, lineStyle: 2 as LineStyle }).setData(rsi.map((r) => ({ time: r.time as any, value: 70 })))
      chart.addLineSeries({ color: '#10b98140', lineWidth: 1, lineStyle: 2 as LineStyle }).setData(rsi.map((r) => ({ time: r.time as any, value: 30 })))
    }
    chart.timeScale().fitContent()
    rsiChartInstance.current = chart
    return () => { chart.remove(); rsiChartInstance.current = null }
  }, [data, showRSI])

  useEffect(() => {
    if (!macdRef.current || data.length === 0 || !showMACD) {
      if (macdChartInstance.current) { macdChartInstance.current.remove(); macdChartInstance.current = null }
      return
    }
    if (macdChartInstance.current) macdChartInstance.current.remove()
    const chart = createChart(macdRef.current, {
      layout: { background: { type: ColorType.Solid, color: C.bg }, textColor: C.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 10 },
      grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } },
      width: macdRef.current.clientWidth, height: macdRef.current.clientHeight,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#ffffff15', visible: false },
      rightPriceScale: { borderColor: '#ffffff15', scaleMargins: { top: 0.15, bottom: 0.15 } },
    })
    const macd = calcMACD(data)
    if (macd.macdLine.length) {
      chart.addLineSeries({ color: C.macd, lineWidth: 2 }).setData(macd.macdLine as any)
      chart.addLineSeries({ color: C.macdSignal, lineWidth: 1 }).setData(macd.signalLine as any)
      chart.addHistogramSeries({ priceFormat: { type: 'volume' } } as any).setData(macd.histogram as any)
    }
    chart.timeScale().fitContent()
    macdChartInstance.current = chart
    return () => { chart.remove(); macdChartInstance.current = null }
  }, [data, showMACD])

  const latest = data[data.length - 1]
  const prev = data[data.length - 2]
  const chg = latest && meta?.previousClose ? ((latest.close - meta.previousClose) / meta.previousClose * 100).toFixed(2) : null
  const isUp = latest && meta?.previousClose ? latest.close >= meta.previousClose : false
  const fmt = (n: number, d = 2) => n?.toLocaleString?.('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) ?? '—'

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07010f]">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#ffffff10] bg-[#0f0a1a] shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => router.push('/')} className="text-[#94a3b8] hover:text-white p-1 rounded-xl hover:bg-[#ffffff08] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          </button>
          <div className="flex items-center gap-0.5 overflow-x-auto max-w-[300px] scrollbar-none">
            {COMMON_SYMBOLS.map((s) => (
              <button key={s.s} onClick={() => updateSymbol(s.s, s.n)}
                className={`text-xs font-mono px-2.5 py-1 rounded-xl transition-colors shrink-0 ${
                  symbol === s.s ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20' : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff06]'
                }`}
              >{s.n}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {meta?.regularMarketPrice && (
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-mono font-bold tabular-nums ${isUp ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{fmt(meta.regularMarketPrice)}</span>
              {chg && <span className={`text-xs font-mono font-semibold tabular-nums px-1.5 py-0.5 rounded ${isUp ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>{isUp ? '+' : ''}{chg}%</span>}
            </div>
          )}
          <div className="w-px h-3 bg-[#ffffff15]" />
          {latest && prev && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-[#94a3b8]">
              <span>O <span className="text-white font-semibold tabular-nums">{fmt(latest.open)}</span></span>
              <span>H <span className="text-[#10b981] font-semibold tabular-nums">{fmt(latest.high)}</span></span>
              <span>L <span className="text-[#ef4444] font-semibold tabular-nums">{fmt(latest.low)}</span></span>
              <span>C <span className="text-white font-semibold tabular-nums">{fmt(latest.close)}</span></span>
              <span>Vol <span className="text-white font-semibold tabular-nums">{(latest.volume / 1000000).toFixed(1)}M</span></span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1 border-b border-[#ffffff10] bg-[#0f0a1a]/80 shrink-0 flex-wrap gap-y-0.5">
        <div className="flex items-center gap-px">
          {TIMEFRAMES.map((tf) => (
            <button key={tf} onClick={() => setInterval(tf)}
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded transition-colors ${
                interval === tf ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20' : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff05]'
              }`}
            >{tf.toUpperCase()}</button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 flex-wrap">
          {(['CANDLES', 'LINE', 'AREA'] as const).map((ct) => (
            <button key={ct} onClick={() => setChartType(ct)}
              className={`text-xs font-mono px-2 py-1 rounded-xl transition-colors ${chartType === ct ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20' : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff06]'}`}
            >{ct}</button>
          ))}
          <span className="w-px h-3 bg-[#ffffff15] mx-0.5" />
          <ToggleBtn label="SMA" active={showSMA} onToggle={() => { setShowSMA(!showSMA); if (!showSMA) setShowEMA(false) }} color="#c084fc" />
          <ToggleBtn label="EMA" active={showEMA} onToggle={() => { setShowEMA(!showEMA); if (!showEMA) setShowSMA(false) }} color="#ef4444" />
          <ToggleBtn label="BB" active={showBB} onToggle={() => setShowBB(!showBB)} color="#a855f7" />
          <ToggleBtn label="RSI" active={showRSI} onToggle={() => setShowRSI(!showRSI)} color="#c084fc" />
          <ToggleBtn label="MACD" active={showMACD} onToggle={() => setShowMACD(!showMACD)} color="#a855f7" />
          <span className="w-px h-3 bg-[#ffffff15] mx-0.5" />
          <button onClick={() => setCrosshairMode(!crosshairMode)}
            className={`text-xs font-mono px-2 py-1 rounded-xl transition-colors ${crosshairMode ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20' : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff06]'}`}
          >{crosshairMode ? 'CROSS' : 'MAGNET'}</button>
          <button onClick={() => setShowVolume(!showVolume)}
            className={`text-xs font-mono px-2 py-1 rounded-xl transition-colors ${showVolume ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20' : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff06]'}`}
          >VOL</button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#07010f]/80">
              <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
                <div className="w-4 h-4 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] animate-spin" />
                Loading {symbol}...
              </div>
            </div>
          )}
          <div ref={chartRef} className="flex-1" />
          {!loading && data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[#94a3b8]">NO DATA</div>
          )}
          {showRSI && (
            <div className="h-[80px] border-t border-[#ffffff10] shrink-0 relative">
              <div ref={rsiRef} className="w-full h-full" />
              <span className="absolute right-2 bottom-1.5 text-[9px] font-mono text-[#c084fc] font-semibold">RSI(14)</span>
            </div>
          )}
          {showMACD && (
            <div className="h-[80px] border-t border-[#ffffff10] shrink-0 relative">
              <div ref={macdRef} className="w-full h-full" />
              <span className="absolute right-2 bottom-1.5 text-[9px] font-mono text-[#a855f7] font-semibold">MACD(12,26,9)</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#ffffff10] bg-[#0f0a1a] text-xs font-mono text-[#94a3b8] shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#10b981]" /> LIVE</span>
          <span>{symbol}</span>
          <span className="hidden sm:inline">{interval.toUpperCase()}</span>
          <span className="hidden sm:inline">{data.length} bars</span>
        </div>
        <div className="flex items-center gap-1.5">
          {showSMA && <><span className="text-[#c084fc]">\u25CF</span> SMA7/25/99</>}
          {showEMA && <><span className="text-[#ef4444]">\u25CF</span> EMA7/25/99</>}
          {showBB && <span className="text-[#a855f7]">\u25CF BB(20,2)</span>}
          {showRSI && <span className="text-[#c084fc]">\u25CF RSI(14)</span>}
          {showMACD && <span className="text-[#a855f7]">\u25CF MACD</span>}
        </div>
      </div>
    </div>
  )
}

function ToggleBtn({ label, active, onToggle, color }: { label: string; active: boolean; onToggle: () => void; color: string }) {
  return (
    <button onClick={onToggle}
      className={`text-xs font-mono px-2 py-1 rounded-xl transition-colors ${active ? 'text-white bg-[#a855f7]/15 border border-[#a855f7]/20' : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff06] border border-transparent'}`}
      style={active ? { backgroundColor: `${color}15` } : {}}
    >
      {label}
    </button>
  )
}
