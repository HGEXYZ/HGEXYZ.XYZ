'use client'

import { useState } from 'react'
import LiveAlerts from '@/components/LiveAlerts'
import { Calendar, ChevronLeft, ChevronRight, Landmark, Filter, Sparkles } from 'lucide-react'

const COUNTRIES: Record<string, { flag: string; cur: string }> = {
  US: { flag: '\u{1F1FA}\u{1F1F8}', cur: 'USD' },
  EU: { flag: '\u{1F1EA}\u{1F1FA}', cur: 'EUR' },
  UK: { flag: '\u{1F1EC}\u{1F1E7}', cur: 'GBP' },
  JP: { flag: '\u{1F1EF}\u{1F1F5}', cur: 'JPY' },
  AU: { flag: '\u{1F1E6}\u{1F1FA}', cur: 'AUD' },
  CA: { flag: '\u{1F1E8}\u{1F1E6}', cur: 'CAD' },
  DE: { flag: '\u{1F1E9}\u{1F1EA}', cur: 'EUR' },
  NZ: { flag: '\u{1F1F3}\u{1F1FF}', cur: 'NZD' },
  CH: { flag: '\u{1F1E8}\u{1F1ED}', cur: 'CHF' },
}

const impactColors: Record<string, string> = { high: '#ef4444', medium: '#a855f7', low: '#94a3b8' }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const CB_RATES: { cur: string; rate: string; flag: string }[] = [
  { cur: 'USD', rate: '3.75%', flag: '\u{1F1FA}\u{1F1F8}' },
  { cur: 'EUR', rate: '2.15%', flag: '\u{1F1EA}\u{1F1FA}' },
  { cur: 'GBP', rate: '3.75%', flag: '\u{1F1EC}\u{1F1E7}' },
  { cur: 'JPY', rate: '0.50%', flag: '\u{1F1EF}\u{1F1F5}' },
  { cur: 'AUD', rate: '4.35%', flag: '\u{1F1E6}\u{1F1FA}' },
  { cur: 'CAD', rate: '2.25%', flag: '\u{1F1E8}\u{1F1E6}' },
  { cur: 'NZD', rate: '2.25%', flag: '\u{1F1F3}\u{1F1FF}' },
  { cur: 'CHF', rate: '1.00%', flag: '\u{1F1E8}\u{1F1ED}' },
]

interface CalendarEvent {
  day: number; time: string; event: string; country: string; impact: 'high' | 'medium' | 'low'; previous: string; forecast: string
}

const EVENTS: CalendarEvent[] = [
  { day: 1, time: '15:00', event: 'S&P Global Manufacturing PMI', country: 'US', impact: 'medium', previous: '52.4', forecast: '52.1' },
  { day: 1, time: '09:45', event: 'S&P Global Manufacturing PMI', country: 'CA', impact: 'low', previous: '51.8', forecast: '51.5' },
  { day: 1, time: '03:30', event: 'Jibun Bank Manufacturing PMI', country: 'JP', impact: 'medium', previous: '49.8', forecast: '50.1' },
  { day: 1, time: '10:00', event: 'Unemployment Rate', country: 'EU', impact: 'medium', previous: '6.5%', forecast: '6.4%' },
  { day: 1, time: '09:30', event: 'SNB Interest Rate Decision', country: 'CH', impact: 'high', previous: '1.25%', forecast: '1.00%' },
  { day: 2, time: '21:30', event: 'Caixin Manufacturing PMI', country: 'CN', impact: 'medium', previous: '51.2', forecast: '50.8' },
  { day: 2, time: '08:30', event: 'Building Permits (MoM)', country: 'US', impact: 'low', previous: '+1.5%', forecast: '+1.2%' },
  { day: 2, time: '03:30', event: 'GDP (QoQ)', country: 'AU', impact: 'high', previous: '+0.6%', forecast: '+0.4%' },
  { day: 3, time: '10:00', event: 'Factory Orders (MoM)', country: 'US', impact: 'medium', previous: '+0.8%', forecast: '+0.5%' },
  { day: 3, time: '08:30', event: 'Trade Balance', country: 'US', impact: 'medium', previous: '-$68.4B', forecast: '-$70.1B' },
  { day: 3, time: '14:00', event: 'Fed Chair Powell Speaks', country: 'US', impact: 'high', previous: '—', forecast: '—' },
  { day: 3, time: '10:00', event: 'JOLTS Job Openings', country: 'US', impact: 'medium', previous: '8.76M', forecast: '8.50M' },
  { day: 4, time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '231K', forecast: '225K' },
  { day: 4, time: '08:30', event: 'Continuing Claims', country: 'US', impact: 'medium', previous: '1.872M', forecast: '1.860M' },
  { day: 4, time: '10:00', event: 'ISM Services PMI', country: 'US', impact: 'medium', previous: '54.1', forecast: '53.6' },
  { day: 4, time: '04:30', event: 'RBA Interest Rate Decision', country: 'AU', impact: 'high', previous: '4.35%', forecast: '4.35%' },
  { day: 5, time: '08:30', event: 'Non-Farm Payrolls', country: 'US', impact: 'high', previous: '228K', forecast: '195K' },
  { day: 5, time: '08:30', event: 'Unemployment Rate', country: 'US', impact: 'high', previous: '4.1%', forecast: '4.1%' },
  { day: 5, time: '08:30', event: 'Average Hourly Earnings (MoM)', country: 'US', impact: 'high', previous: '+0.3%', forecast: '+0.2%' },
  { day: 5, time: '08:30', event: 'Employment Change', country: 'CA', impact: 'medium', previous: '31.0K', forecast: '25.0K' },
  { day: 6, time: '03:30', event: 'BOJ Interest Rate Decision', country: 'JP', impact: 'high', previous: '0.50%', forecast: '0.50%' },
  { day: 6, time: '07:00', event: 'BOJ Press Conference', country: 'JP', impact: 'high', previous: '—', forecast: '—' },
  { day: 6, time: '10:00', event: 'Retail Sales (MoM)', country: 'EU', impact: 'medium', previous: '+0.4%', forecast: '+0.3%' },
  { day: 7, time: '09:00', event: 'Industrial Production (MoM)', country: 'DE', impact: 'medium', previous: '+0.3%', forecast: '+0.1%' },
  { day: 7, time: '15:00', event: 'Consumer Credit Change', country: 'US', impact: 'low', previous: '+$19.5B', forecast: '+$16.0B' },
  { day: 7, time: '07:00', event: 'Halifax HPI (MoM)', country: 'UK', impact: 'low', previous: '+0.3%', forecast: '+0.2%' },
  { day: 8, time: '08:30', event: 'NY Empire State Manufacturing', country: 'US', impact: 'low', previous: '3.2', forecast: '5.0' },
  { day: 8, time: '10:30', event: 'API Crude Oil Inventory', country: 'US', impact: 'low', previous: '-2.1M', forecast: '-1.5M' },
  { day: 9, time: '10:00', event: 'Wholesale Inventories (MoM)', country: 'US', impact: 'low', previous: '+0.3%', forecast: '+0.2%' },
  { day: 9, time: '14:00', event: 'FOMC Waller Speaks', country: 'US', impact: 'medium', previous: '—', forecast: '—' },
  { day: 9, time: '02:30', event: 'CPI (YoY)', country: 'CN', impact: 'medium', previous: '+0.1%', forecast: '+0.3%' },
  { day: 9, time: '08:00', event: 'GDP (MoM)', country: 'UK', impact: 'medium', previous: '+0.1%', forecast: '+0.2%' },
  { day: 10, time: '08:30', event: 'CPI (MoM)', country: 'US', impact: 'high', previous: '+0.2%', forecast: '+0.3%' },
  { day: 10, time: '08:30', event: 'CPI (YoY)', country: 'US', impact: 'high', previous: '3.1%', forecast: '3.0%' },
  { day: 10, time: '08:30', event: 'Core CPI (MoM)', country: 'US', impact: 'high', previous: '+0.3%', forecast: '+0.3%' },
  { day: 10, time: '08:30', event: 'Core CPI (YoY)', country: 'US', impact: 'high', previous: '3.6%', forecast: '3.4%' },
  { day: 11, time: '08:30', event: 'PPI (MoM)', country: 'US', impact: 'medium', previous: '+0.3%', forecast: '+0.2%' },
  { day: 11, time: '08:30', event: 'PPI (YoY)', country: 'US', impact: 'medium', previous: '2.1%', forecast: '1.9%' },
  { day: 11, time: '08:30', event: 'Core PPI (MoM)', country: 'US', impact: 'medium', previous: '+0.3%', forecast: '+0.2%' },
  { day: 12, time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '225K', forecast: '220K' },
  { day: 12, time: '15:00', event: 'ECB Interest Rate Decision', country: 'EU', impact: 'high', previous: '3.75%', forecast: '3.50%' },
  { day: 12, time: '15:45', event: 'ECB Press Conference', country: 'EU', impact: 'high', previous: '—', forecast: '—' },
  { day: 13, time: '10:00', event: 'Michigan Consumer Sentiment', country: 'US', impact: 'medium', previous: '79.4', forecast: '80.1' },
  { day: 13, time: '10:00', event: 'Michigan 1-Yr Inflation Exp', country: 'US', impact: 'medium', previous: '3.2%', forecast: '3.1%' },
  { day: 14, time: '16:00', event: 'Treasury TIC Net Flows', country: 'US', impact: 'low', previous: '-$58.2B', forecast: '—' },
  { day: 15, time: '08:30', event: 'Retail Sales (MoM)', country: 'US', impact: 'high', previous: '+0.6%', forecast: '+0.4%' },
  { day: 15, time: '08:30', event: 'Retail Sales Control Group', country: 'US', impact: 'medium', previous: '+0.5%', forecast: '+0.3%' },
  { day: 16, time: '08:30', event: 'Building Permits (MoM)', country: 'US', impact: 'medium', previous: '+1.2%', forecast: '+1.0%' },
  { day: 16, time: '08:30', event: 'Housing Starts (MoM)', country: 'US', impact: 'medium', previous: '+1.5%', forecast: '+1.1%' },
  { day: 16, time: '09:15', event: 'Industrial Production (MoM)', country: 'US', impact: 'medium', previous: '+0.1%', forecast: '+0.3%' },
  { day: 16, time: '07:00', event: 'CPI (YoY)', country: 'UK', impact: 'high', previous: '3.4%', forecast: '3.2%' },
  { day: 17, time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '220K', forecast: '218K' },
  { day: 17, time: '10:00', event: 'Existing Home Sales', country: 'US', impact: 'medium', previous: '4.22M', forecast: '4.30M' },
  { day: 17, time: '13:45', event: 'BOE Interest Rate Decision', country: 'UK', impact: 'high', previous: '5.25%', forecast: '5.00%' },
  { day: 18, time: '10:00', event: 'ECB Current Account', country: 'EU', impact: 'low', previous: '€32.5B', forecast: '€30.0B' },
  { day: 18, time: '07:00', event: 'Retail Sales (MoM)', country: 'UK', impact: 'medium', previous: '+0.2%', forecast: '+0.4%' },
  { day: 19, time: '10:30', event: 'Dallas Fed Manufacturing', country: 'US', impact: 'low', previous: '-8.3', forecast: '-6.0' },
  { day: 19, time: '08:30', event: 'CPI (MoM)', country: 'CA', impact: 'medium', previous: '+0.3%', forecast: '+0.2%' },
  { day: 21, time: '08:30', event: 'Philly Fed Manufacturing', country: 'US', impact: 'medium', previous: '7.5', forecast: '8.2' },
  { day: 21, time: '10:00', event: 'CB Consumer Confidence', country: 'US', impact: 'medium', previous: '106.7', forecast: '108.2' },
  { day: 21, time: '14:00', event: 'FOMC Minutes', country: 'US', impact: 'high', previous: '—', forecast: '—' },
  { day: 22, time: '10:00', event: 'New Home Sales', country: 'US', impact: 'medium', previous: '715K', forecast: '730K' },
  { day: 22, time: '02:00', event: 'RBNZ Interest Rate Decision', country: 'NZ', impact: 'high', previous: '5.50%', forecast: '5.25%' },
  { day: 23, time: '08:30', event: 'GDP (QoQ) Annualized', country: 'US', impact: 'high', previous: '2.4%', forecast: '2.1%' },
  { day: 23, time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '218K', forecast: '215K' },
  { day: 24, time: '08:30', event: 'Durable Goods Orders (MoM)', country: 'US', impact: 'high', previous: '+1.2%', forecast: '+0.8%' },
  { day: 24, time: '08:30', event: 'Core Durable Goods (MoM)', country: 'US', impact: 'high', previous: '+0.4%', forecast: '+0.3%' },
  { day: 28, time: '08:30', event: 'PCE Price Index (MoM)', country: 'US', impact: 'high', previous: '+0.2%', forecast: '+0.3%' },
  { day: 28, time: '08:30', event: 'Core PCE Price Index (MoM)', country: 'US', impact: 'high', previous: '+0.3%', forecast: '+0.3%' },
  { day: 28, time: '08:30', event: 'PCE Price Index (YoY)', country: 'US', impact: 'high', previous: '2.5%', forecast: '2.4%' },
  { day: 28, time: '08:30', event: 'Core PCE Price Index (YoY)', country: 'US', impact: 'high', previous: '2.8%', forecast: '2.7%' },
  { day: 28, time: '08:30', event: 'Personal Income (MoM)', country: 'US', impact: 'medium', previous: '+0.4%', forecast: '+0.4%' },
  { day: 29, time: '10:00', event: 'CB Consumer Confidence', country: 'US', impact: 'medium', previous: '107.5', forecast: '108.0' },
  { day: 29, time: '07:00', event: 'German CPI (YoY) (Prelim)', country: 'DE', impact: 'high', previous: '2.4%', forecast: '2.3%' },
  { day: 30, time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '215K', forecast: '212K' },
  { day: 30, time: '10:00', event: 'Pending Home Sales (MoM)', country: 'US', impact: 'low', previous: '+1.5%', forecast: '+0.8%' },
  { day: 31, time: '07:00', event: 'GDP (QoQ) (Final)', country: 'UK', impact: 'high', previous: '0.3%', forecast: '0.2%' },
  { day: 31, time: '09:00', event: 'CPI (YoY) (Flash)', country: 'EU', impact: 'high', previous: '2.6%', forecast: '2.5%' },
  { day: 31, time: '09:00', event: 'Core CPI (YoY) (Flash)', country: 'EU', impact: 'high', previous: '2.9%', forecast: '2.8%' },
  { day: 31, time: '09:00', event: 'GDP (QoQ)', country: 'EU', impact: 'medium', previous: '0.3%', forecast: '0.2%' },
]

export default function CalendarPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [minRisk, setMinRisk] = useState(0)

  const nav = (dir: number) => {
    let m = viewMonth + dir, y = viewYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setViewYear(y); setViewMonth(m); setSelectedDay(1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startDow = new Date(viewYear, viewMonth, 1).getDay()
  const selectedKey = `${viewYear}-${viewMonth}-${selectedDay}`
  const dayEvents = EVENTS.filter((ev) => ev.day === selectedDay)
  const dayDate = new Date(viewYear, viewMonth, selectedDay)
  const dayLabel = selectedDay === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
    ? '\u{25B6} TODAY'
    : dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const goToday = () => {
    setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDay(today.getDate())
  }

  return (
    <div className="animate-fade-in flex gap-5">
      <div className="hidden lg:flex flex-col gap-4 w-[280px] shrink-0">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-[#a855f7]" />
            <span className="text-white font-display font-semibold">Economic Calendar</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => nav(-1)} className="w-7 h-7 rounded-xl bg-[#ffffff08] border border-[#ffffff10] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#ffffff15] transition-all">
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-display font-bold text-white">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={() => nav(1)} className="w-7 h-7 rounded-xl bg-[#ffffff08] border border-[#ffffff10] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#ffffff15] transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px text-center">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-xs font-mono text-[#94a3b8] py-1">{d}</div>
            ))}
            {Array.from({ length: startDow }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate()
              const isSel = day === selectedDay
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className={`text-sm font-mono w-full py-1.5 rounded-xl transition-all ${
                    isToday ? (isSel ? 'bg-[#a855f7] text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]' : 'bg-[#a855f7]/20 text-[#a855f7] font-bold') :
                    isSel ? 'bg-[#a855f7]/15 text-[#a855f7]' : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff08]'
                  }`}
                >{day}</button>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-[#ffffff08]">
            <button onClick={goToday} className="text-xs font-mono text-[#a855f7] hover:text-[#c084fc] transition-colors">
              Today
            </button>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Landmark size={16} className="text-[#c084fc]" />
            <span className="text-white font-display font-semibold">Central Bank Rates</span>
          </div>
          <div className="space-y-2">
            {CB_RATES.map((cb) => (
              <div key={cb.cur} className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-[#ffffff04] transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cb.flag}</span>
                  <span className="text-sm font-mono text-[#94a3b8]">{cb.cur}</span>
                </div>
                <span className="text-sm font-mono text-white font-semibold">{cb.rate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-[#a855f7]" />
            <span className="text-white font-display font-semibold">News Filter</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {[{ label: 'ALL', value: 0 }, { label: 'HIGH', value: 8 }, { label: 'MEDIUM', value: 6 }, { label: 'LOW', value: 4 }].map((f) => (
              <button
                key={f.value}
                onClick={() => setMinRisk(f.value)}
                className={`text-sm font-mono text-left px-3 py-2 rounded-xl transition-all ${
                  minRisk === f.value
                    ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#ffffff08]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-5 animate-slide-up">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            {dayLabel}
          </h1>
          <p className="text-[#94a3b8] text-sm font-mono mt-1">
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <div className="glass-card overflow-hidden">
              {dayEvents.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar size={32} className="mx-auto text-[#94a3b8] mb-3" />
                  <p className="text-sm text-[#94a3b8] font-mono">No events scheduled for this day</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[90px_50px_1fr_100px_100px_100px] gap-0 border-b border-[#ffffff08] bg-[#ffffff04]">
                    {['TIME', 'CUR', 'EVENT', 'FCST', 'PREV', 'IMPACT'].map((h) => (
                      <div key={h} className="px-3 py-3 text-xs font-mono text-[#94a3b8] tracking-wider uppercase">{h}</div>
                    ))}
                  </div>
                  <div className="max-h-[540px] overflow-y-auto">
                    {dayEvents.map((ev, i) => {
                      const c = COUNTRIES[ev.country] || { flag: '\u{1F310}', cur: ev.country }
                      return (
                        <div key={i} className={`grid grid-cols-[90px_50px_1fr_100px_100px_100px] gap-0 items-center hover:bg-[#ffffff04] transition-colors border-b border-[#ffffff08] ${i % 2 === 0 ? 'bg-[#ffffff02]' : ''}`}>
                          <div className="px-3 py-3.5 text-sm font-mono text-[#94a3b8] tabular-nums">{ev.time}</div>
                          <div className="px-1 py-3.5 text-lg flex items-center justify-center">{c.flag}</div>
                          <div className="px-3 py-3.5 flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.impact === 'high' ? 'bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.4)]' : ev.impact === 'medium' ? 'bg-[#a855f7]' : 'bg-[#94a3b8]'}`} />
                            <span className="text-sm font-mono text-white/90 truncate">{ev.event}</span>
                          </div>
                          <div className="px-3 py-3.5 text-sm font-mono text-[#a855f7] text-right tabular-nums">{ev.forecast}</div>
                          <div className="px-3 py-3.5 text-sm font-mono text-[#94a3b8] text-right tabular-nums">{ev.previous}</div>
                          <div className="px-3 py-3.5 text-right">
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-xl ${
                              ev.impact === 'high' ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20' :
                              ev.impact === 'medium' ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20' :
                              'bg-[#94a3b8]/15 text-[#94a3b8] border border-[#94a3b8]/20'
                            }`}>{ev.impact.toUpperCase()}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="animate-slide-up stagger-3">
              <LiveAlerts key={selectedKey} minRisk={minRisk} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
