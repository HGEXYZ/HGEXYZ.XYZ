'use client'

import { useState, useMemo } from 'react'

interface EconomicEvent {
  id: string
  date: Date
  time: string
  event: string
  country: string
  impact: 'high' | 'medium' | 'low'
  previous: string
  forecast: string
  actual?: string
}

const COUNTRIES: Record<string, { flag: string; label: string; cur: string }> = {
  US: { flag: '\u{1F1FA}\u{1F1F8}', label: 'United States', cur: 'USD' },
  EU: { flag: '\u{1F1EA}\u{1F1FA}', label: 'Eurozone', cur: 'EUR' },
  UK: { flag: '\u{1F1EC}\u{1F1E7}', label: 'United Kingdom', cur: 'GBP' },
  JP: { flag: '\u{1F1EF}\u{1F1F5}', label: 'Japan', cur: 'JPY' },
  CN: { flag: '\u{1F1E8}\u{1F1F3}', label: 'China', cur: 'CNY' },
  CH: { flag: '\u{1F1E8}\u{1F1ED}', label: 'Switzerland', cur: 'CHF' },
  AU: { flag: '\u{1F1E6}\u{1F1FA}', label: 'Australia', cur: 'AUD' },
  CA: { flag: '\u{1F1E8}\u{1F1E6}', label: 'Canada', cur: 'CAD' },
  NZ: { flag: '\u{1F1F3}\u{1F1FF}', label: 'New Zealand', cur: 'NZD' },
  DE: { flag: '\u{1F1E9}\u{1F1EA}', label: 'Germany', cur: 'EUR' },
}

const COUNTRY_LIST = ['US', 'JP', 'EU', 'UK', 'CN', 'CA', 'AU', 'DE', 'CH', 'NZ']
const COUNTRY_ORDER = ['US', 'JP', 'EU', 'UK', 'CN', 'CA', 'AU', 'DE', 'CH', 'NZ']

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function d(y: number, m: number, day: number): Date { return new Date(y, m, day) }

function generateMonthEvents(year: number, month: number): EconomicEvent[] {
  const events: EconomicEvent[] = []
  const push = (e: Omit<EconomicEvent, 'id'>) => events.push({ ...e, id: `${e.event}-${e.date.getTime()}-${Math.random()}` })

  push({ date: d(year, month, 1), time: '15:00', event: 'S&P Global Manufacturing PMI', country: 'US', impact: 'medium', previous: '52.4', forecast: '52.1' })
  push({ date: d(year, month, 1), time: '09:45', event: 'S&P Global Manufacturing PMI', country: 'CA', impact: 'low', previous: '51.8', forecast: '51.5' })
  push({ date: d(year, month, 1), time: '03:30', event: 'Jibun Bank Manufacturing PMI', country: 'JP', impact: 'medium', previous: '49.8', forecast: '50.1' })
  push({ date: d(year, month, 1), time: '10:00', event: 'Unemployment Rate', country: 'EU', impact: 'medium', previous: '6.5%', forecast: '6.4%' })
  push({ date: d(year, month, 1), time: '09:00', event: 'HCOB Manufacturing PMI', country: 'EU', impact: 'medium', previous: '47.8', forecast: '48.1' })
  push({ date: d(year, month, 1), time: '09:30', event: 'SNB Interest Rate Decision', country: 'CH', impact: 'high', previous: '1.25%', forecast: '1.00%' })
  push({ date: d(year, month, 2), time: '21:30', event: 'Caixin Manufacturing PMI', country: 'CN', impact: 'medium', previous: '51.2', forecast: '50.8' })
  push({ date: d(year, month, 2), time: '08:30', event: 'Building Permits (MoM)', country: 'US', impact: 'low', previous: '+1.5%', forecast: '+1.2%' })
  push({ date: d(year, month, 2), time: '03:30', event: 'GDP (QoQ)', country: 'AU', impact: 'high', previous: '+0.6%', forecast: '+0.4%' })
  push({ date: d(year, month, 3), time: '10:00', event: 'Factory Orders (MoM)', country: 'US', impact: 'medium', previous: '+0.8%', forecast: '+0.5%' })
  push({ date: d(year, month, 3), time: '08:30', event: 'Trade Balance', country: 'US', impact: 'medium', previous: '-$68.4B', forecast: '-$70.1B' })
  push({ date: d(year, month, 3), time: '14:00', event: 'Fed Chair Powell Speaks', country: 'US', impact: 'high', previous: '—', forecast: '—' })
  push({ date: d(year, month, 3), time: '10:00', event: 'JOLTS Job Openings', country: 'US', impact: 'medium', previous: '8.76M', forecast: '8.50M' })
  push({ date: d(year, month, 4), time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '231K', forecast: '225K' })
  push({ date: d(year, month, 4), time: '08:30', event: 'Continuing Claims', country: 'US', impact: 'medium', previous: '1.872M', forecast: '1.860M' })
  push({ date: d(year, month, 4), time: '10:00', event: 'ISM Services PMI', country: 'US', impact: 'medium', previous: '54.1', forecast: '53.6' })
  push({ date: d(year, month, 4), time: '04:30', event: 'RBA Interest Rate Decision', country: 'AU', impact: 'high', previous: '4.35%', forecast: '4.35%' })
  push({ date: d(year, month, 5), time: '08:30', event: 'Non-Farm Payrolls', country: 'US', impact: 'high', previous: '228K', forecast: '195K' })
  push({ date: d(year, month, 5), time: '08:30', event: 'Unemployment Rate', country: 'US', impact: 'high', previous: '4.1%', forecast: '4.1%' })
  push({ date: d(year, month, 5), time: '08:30', event: 'Average Hourly Earnings (MoM)', country: 'US', impact: 'high', previous: '+0.3%', forecast: '+0.2%' })
  push({ date: d(year, month, 5), time: '08:30', event: 'Participation Rate', country: 'US', impact: 'medium', previous: '62.7%', forecast: '62.7%' })
  push({ date: d(year, month, 5), time: '08:30', event: 'Employment Change', country: 'CA', impact: 'medium', previous: '31.0K', forecast: '25.0K' })
  push({ date: d(year, month, 5), time: '08:30', event: 'Unemployment Rate', country: 'CA', impact: 'medium', previous: '6.2%', forecast: '6.3%' })
  push({ date: d(year, month, 6), time: '03:30', event: 'BOJ Interest Rate Decision', country: 'JP', impact: 'high', previous: '0.50%', forecast: '0.50%' })
  push({ date: d(year, month, 6), time: '07:00', event: 'BOJ Press Conference', country: 'JP', impact: 'high', previous: '—', forecast: '—' })
  push({ date: d(year, month, 6), time: '10:00', event: 'Retail Sales (MoM)', country: 'EU', impact: 'medium', previous: '+0.4%', forecast: '+0.3%' })
  push({ date: d(year, month, 7), time: '09:00', event: 'Industrial Production (MoM)', country: 'DE', impact: 'medium', previous: '+0.3%', forecast: '+0.1%' })
  push({ date: d(year, month, 7), time: '15:00', event: 'Consumer Credit Change', country: 'US', impact: 'low', previous: '+$19.5B', forecast: '+$16.0B' })
  push({ date: d(year, month, 7), time: '07:00', event: 'Halifax HPI (MoM)', country: 'UK', impact: 'low', previous: '+0.3%', forecast: '+0.2%' })
  push({ date: d(year, month, 8), time: '08:30', event: 'NY Empire State Manufacturing', country: 'US', impact: 'low', previous: '3.2', forecast: '5.0' })
  push({ date: d(year, month, 8), time: '11:00', event: 'EIA Short-Term Energy Outlook', country: 'US', impact: 'medium', previous: '—', forecast: '—' })
  push({ date: d(year, month, 8), time: '10:30', event: 'API Crude Oil Inventory', country: 'US', impact: 'low', previous: '-2.1M', forecast: '-1.5M' })
  push({ date: d(year, month, 9), time: '10:00', event: 'Wholesale Inventories (MoM)', country: 'US', impact: 'low', previous: '+0.3%', forecast: '+0.2%' })
  push({ date: d(year, month, 9), time: '14:00', event: 'FOMC Waller Speaks', country: 'US', impact: 'medium', previous: '—', forecast: '—' })
  push({ date: d(year, month, 9), time: '02:30', event: 'CPI (YoY)', country: 'CN', impact: 'medium', previous: '+0.1%', forecast: '+0.3%' })
  push({ date: d(year, month, 9), time: '08:00', event: 'GDP (MoM)', country: 'UK', impact: 'medium', previous: '+0.1%', forecast: '+0.2%' })
  push({ date: d(year, month, 10), time: '08:30', event: 'CPI (MoM)', country: 'US', impact: 'high', previous: '+0.2%', forecast: '+0.3%' })
  push({ date: d(year, month, 10), time: '08:30', event: 'CPI (YoY)', country: 'US', impact: 'high', previous: '3.1%', forecast: '3.0%' })
  push({ date: d(year, month, 10), time: '08:30', event: 'Core CPI (MoM)', country: 'US', impact: 'high', previous: '+0.3%', forecast: '+0.3%' })
  push({ date: d(year, month, 10), time: '08:30', event: 'Core CPI (YoY)', country: 'US', impact: 'high', previous: '3.6%', forecast: '3.4%' })
  push({ date: d(year, month, 10), time: '13:00', event: '10-Yr Note Auction Yield', country: 'US', impact: 'medium', previous: '4.28%', forecast: '4.15%' })
  push({ date: d(year, month, 11), time: '08:30', event: 'PPI (MoM)', country: 'US', impact: 'medium', previous: '+0.3%', forecast: '+0.2%' })
  push({ date: d(year, month, 11), time: '08:30', event: 'PPI (YoY)', country: 'US', impact: 'medium', previous: '2.1%', forecast: '1.9%' })
  push({ date: d(year, month, 11), time: '08:30', event: 'Core PPI (MoM)', country: 'US', impact: 'medium', previous: '+0.3%', forecast: '+0.2%' })
  push({ date: d(year, month, 11), time: '13:00', event: '30-Yr Bond Auction Yield', country: 'US', impact: 'low', previous: '4.42%', forecast: '4.30%' })
  push({ date: d(year, month, 12), time: '08:30', event: 'Import Price Index (MoM)', country: 'US', impact: 'low', previous: '+0.4%', forecast: '+0.2%' })
  push({ date: d(year, month, 12), time: '14:00', event: 'Federal Budget Balance', country: 'US', impact: 'low', previous: '-$347B', forecast: '-$310B' })
  push({ date: d(year, month, 12), time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '225K', forecast: '220K' })
  push({ date: d(year, month, 12), time: '15:00', event: 'ECB Interest Rate Decision', country: 'EU', impact: 'high', previous: '3.75%', forecast: '3.50%' })
  push({ date: d(year, month, 12), time: '15:45', event: 'ECB Press Conference', country: 'EU', impact: 'high', previous: '—', forecast: '—' })
  push({ date: d(year, month, 13), time: '10:00', event: 'Michigan Consumer Sentiment', country: 'US', impact: 'medium', previous: '79.4', forecast: '80.1' })
  push({ date: d(year, month, 13), time: '10:00', event: 'Michigan 1-Yr Inflation Exp', country: 'US', impact: 'medium', previous: '3.2%', forecast: '3.1%' })
  push({ date: d(year, month, 13), time: '08:30', event: 'Export Price Index (MoM)', country: 'US', impact: 'low', previous: '+0.3%', forecast: '+0.1%' })
  push({ date: d(year, month, 14), time: '16:00', event: 'Treasury TIC Net Flows', country: 'US', impact: 'low', previous: '-$58.2B', forecast: '—' })
  push({ date: d(year, month, 14), time: '08:30', event: 'PPI (MoM)', country: 'DE', impact: 'low', previous: '+0.4%', forecast: '+0.2%' })
  push({ date: d(year, month, 15), time: '08:30', event: 'Empire State Manufacturing', country: 'US', impact: 'low', previous: '5.0', forecast: '6.5' })
  push({ date: d(year, month, 15), time: '08:30', event: 'Retail Sales (MoM)', country: 'US', impact: 'high', previous: '+0.6%', forecast: '+0.4%' })
  push({ date: d(year, month, 15), time: '08:30', event: 'Retail Sales Control Group', country: 'US', impact: 'medium', previous: '+0.5%', forecast: '+0.3%' })
  push({ date: d(year, month, 15), time: '10:00', event: 'Business Inventories', country: 'US', impact: 'low', previous: '+0.2%', forecast: '+0.1%' })
  push({ date: d(year, month, 15), time: '10:00', event: 'NAHB Housing Market Index', country: 'US', impact: 'low', previous: '48', forecast: '49' })
  push({ date: d(year, month, 16), time: '08:30', event: 'Building Permits (MoM)', country: 'US', impact: 'medium', previous: '+1.2%', forecast: '+1.0%' })
  push({ date: d(year, month, 16), time: '08:30', event: 'Housing Starts (MoM)', country: 'US', impact: 'medium', previous: '+1.5%', forecast: '+1.1%' })
  push({ date: d(year, month, 16), time: '09:15', event: 'Industrial Production (MoM)', country: 'US', impact: 'medium', previous: '+0.1%', forecast: '+0.3%' })
  push({ date: d(year, month, 16), time: '09:15', event: 'Capacity Utilization', country: 'US', impact: 'medium', previous: '78.7%', forecast: '78.9%' })
  push({ date: d(year, month, 16), time: '07:00', event: 'CPI (YoY)', country: 'UK', impact: 'high', previous: '3.4%', forecast: '3.2%' })
  push({ date: d(year, month, 17), time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '220K', forecast: '218K' })
  push({ date: d(year, month, 17), time: '10:00', event: 'Existing Home Sales', country: 'US', impact: 'medium', previous: '4.22M', forecast: '4.30M' })
  push({ date: d(year, month, 17), time: '10:00', event: 'Leading Index (MoM)', country: 'US', impact: 'medium', previous: '-0.1%', forecast: '-0.1%' })
  push({ date: d(year, month, 17), time: '13:45', event: 'BOE Interest Rate Decision', country: 'UK', impact: 'high', previous: '5.25%', forecast: '5.00%' })
  push({ date: d(year, month, 18), time: '10:00', event: 'ECB Current Account', country: 'EU', impact: 'low', previous: '€32.5B', forecast: '€30.0B' })
  push({ date: d(year, month, 18), time: '07:00', event: 'Retail Sales (MoM)', country: 'UK', impact: 'medium', previous: '+0.2%', forecast: '+0.4%' })
  push({ date: d(year, month, 19), time: '10:30', event: 'Dallas Fed Manufacturing', country: 'US', impact: 'low', previous: '-8.3', forecast: '-6.0' })
  push({ date: d(year, month, 19), time: '08:30', event: 'CPI (MoM)', country: 'CA', impact: 'medium', previous: '+0.3%', forecast: '+0.2%' })
  push({ date: d(year, month, 21), time: '08:30', event: 'Philly Fed Manufacturing', country: 'US', impact: 'medium', previous: '7.5', forecast: '8.2' })
  push({ date: d(year, month, 21), time: '10:00', event: 'CB Consumer Confidence', country: 'US', impact: 'medium', previous: '106.7', forecast: '108.2' })
  push({ date: d(year, month, 21), time: '10:00', event: 'Richmond Fed Manufacturing', country: 'US', impact: 'low', previous: '2', forecast: '3' })
  push({ date: d(year, month, 21), time: '14:00', event: 'FOMC Minutes', country: 'US', impact: 'high', previous: '—', forecast: '—' })
  push({ date: d(year, month, 21), time: '10:00', event: 'Consumer Confidence (Prelim)', country: 'EU', impact: 'medium', previous: '-13.8', forecast: '-13.0' })
  push({ date: d(year, month, 22), time: '10:00', event: 'New Home Sales', country: 'US', impact: 'medium', previous: '715K', forecast: '730K' })
  push({ date: d(year, month, 22), time: '10:30', event: 'EIA Crude Oil Inventories', country: 'US', impact: 'medium', previous: '-2.5M', forecast: '-1.8M' })
  push({ date: d(year, month, 22), time: '02:00', event: 'RBNZ Interest Rate Decision', country: 'NZ', impact: 'high', previous: '5.50%', forecast: '5.25%' })
  push({ date: d(year, month, 23), time: '08:30', event: 'GDP (QoQ) Annualized', country: 'US', impact: 'high', previous: '2.4%', forecast: '2.1%' })
  push({ date: d(year, month, 23), time: '08:30', event: 'GDP Price Index (QoQ)', country: 'US', impact: 'high', previous: '2.1%', forecast: '2.0%' })
  push({ date: d(year, month, 23), time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '218K', forecast: '215K' })
  push({ date: d(year, month, 23), time: '10:00', event: 'Pending Home Sales (MoM)', country: 'US', impact: 'low', previous: '+2.1%', forecast: '+1.5%' })
  push({ date: d(year, month, 24), time: '08:30', event: 'Durable Goods Orders (MoM)', country: 'US', impact: 'high', previous: '+1.2%', forecast: '+0.8%' })
  push({ date: d(year, month, 24), time: '08:30', event: 'Core Durable Goods (MoM)', country: 'US', impact: 'high', previous: '+0.4%', forecast: '+0.3%' })
  push({ date: d(year, month, 24), time: '10:00', event: 'Michigan Sentiment (Final)', country: 'US', impact: 'medium', previous: '80.1', forecast: '80.5' })
  push({ date: d(year, month, 24), time: '14:00', event: 'Fed Monetary Policy Report', country: 'US', impact: 'high', previous: '—', forecast: '—' })
  push({ date: d(year, month, 28), time: '08:30', event: 'PCE Price Index (MoM)', country: 'US', impact: 'high', previous: '+0.2%', forecast: '+0.3%' })
  push({ date: d(year, month, 28), time: '08:30', event: 'Core PCE Price Index (MoM)', country: 'US', impact: 'high', previous: '+0.3%', forecast: '+0.3%' })
  push({ date: d(year, month, 28), time: '08:30', event: 'PCE Price Index (YoY)', country: 'US', impact: 'high', previous: '2.5%', forecast: '2.4%' })
  push({ date: d(year, month, 28), time: '08:30', event: 'Core PCE Price Index (YoY)', country: 'US', impact: 'high', previous: '2.8%', forecast: '2.7%' })
  push({ date: d(year, month, 28), time: '08:30', event: 'Personal Income (MoM)', country: 'US', impact: 'medium', previous: '+0.4%', forecast: '+0.4%' })
  push({ date: d(year, month, 28), time: '08:30', event: 'Personal Spending (MoM)', country: 'US', impact: 'medium', previous: '+0.5%', forecast: '+0.4%' })
  push({ date: d(year, month, 28), time: '08:30', event: 'Chicago PMI', country: 'US', impact: 'low', previous: '45.6', forecast: '47.2' })
  push({ date: d(year, month, 29), time: '10:00', event: 'CB Consumer Confidence', country: 'US', impact: 'medium', previous: '107.5', forecast: '108.0' })
  push({ date: d(year, month, 29), time: '07:00', event: 'German CPI (YoY) (Prelim)', country: 'DE', impact: 'high', previous: '2.4%', forecast: '2.3%' })
  push({ date: d(year, month, 30), time: '08:30', event: 'Initial Jobless Claims', country: 'US', impact: 'high', previous: '215K', forecast: '212K' })
  push({ date: d(year, month, 30), time: '08:30', event: 'GDP (QoQ) (Final)', country: 'US', impact: 'high', previous: '2.4%', forecast: '2.2%' })
  push({ date: d(year, month, 30), time: '10:00', event: 'Pending Home Sales (MoM)', country: 'US', impact: 'low', previous: '+1.5%', forecast: '+0.8%' })
  push({ date: d(year, month, 30), time: '13:00', event: 'BOE Financial Stability', country: 'UK', impact: 'medium', previous: '—', forecast: '—' })
  push({ date: d(year, month, 31), time: '07:00', event: 'GDP (QoQ) (Final)', country: 'UK', impact: 'high', previous: '0.3%', forecast: '0.2%' })
  push({ date: d(year, month, 31), time: '07:00', event: 'Current Account', country: 'UK', impact: 'medium', previous: '-£18.4B', forecast: '-£20.0B' })
  push({ date: d(year, month, 31), time: '09:00', event: 'CPI (YoY) (Flash)', country: 'EU', impact: 'high', previous: '2.6%', forecast: '2.5%' })
  push({ date: d(year, month, 31), time: '09:00', event: 'Core CPI (YoY) (Flash)', country: 'EU', impact: 'high', previous: '2.9%', forecast: '2.8%' })
  push({ date: d(year, month, 31), time: '09:00', event: 'GDP (QoQ)', country: 'EU', impact: 'medium', previous: '0.3%', forecast: '0.2%' })
  push({ date: d(year, month, 31), time: '10:30', event: 'EIA Crude Oil Inventories', country: 'US', impact: 'medium', previous: '-1.8M', forecast: '-2.1M' })

  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

const impactDotColors: Record<string, string> = { high: '#ff4444', medium: '#ff8800', low: '#94a3b8' }

export default function EconomicCalendar({ initialDate }: { initialDate?: string }) {
  const today = new Date()
  const initDate = initialDate ? new Date(initialDate + 'T12:00:00') : today
  const [viewYear, setViewYear] = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())
  const [selectedDate, setSelectedDate] = useState(initDate.toDateString())
  const [impactFilter, setImpactFilter] = useState<string[]>([])
  const [countryFilter, setCountryFilter] = useState<string[]>([])

  const events = useMemo(() => generateMonthEvents(viewYear, viewMonth), [viewYear, viewMonth])

  const filtered = events.filter((e) => {
    if (impactFilter.length > 0 && !impactFilter.includes(e.impact)) return false
    if (countryFilter.length > 0 && !countryFilter.includes(e.country)) return false
    return true
  })

  const groupedByDate: Record<string, EconomicEvent[]> = {}
  filtered.forEach((ev) => {
    const key = ev.date.toDateString()
    if (!groupedByDate[key]) groupedByDate[key] = []
    groupedByDate[key].push(ev)
  })

  const dates = Object.keys(groupedByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const selectedEvents = selectedDate ? groupedByDate[selectedDate] || [] : []
  const groupedByCountry = selectedEvents.reduce<Record<string, EconomicEvent[]>>((acc, ev) => {
    if (!acc[ev.country]) acc[ev.country] = []
    acc[ev.country].push(ev); return acc
  }, {})
  const sortedCountries = Object.keys(groupedByCountry).sort((a, b) => COUNTRY_ORDER.indexOf(a) - COUNTRY_ORDER.indexOf(b))

  const toggleImpact = (v: string) => setImpactFilter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])
  const toggleCountry = (v: string) => setCountryFilter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

  const nav = (dir: number) => {
    let m = viewMonth + dir, y = viewYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setViewYear(y); setViewMonth(m)
  }

  const goToday = () => {
    setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(today.toDateString())
  }

  const todayStr = today.toDateString()

  return (
    <div className="animate-fade-in">
        <div className="pro-panel px-5 py-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => nav(-1)} className="text-[#475569] hover:text-[#94a3b8] p-1 rounded-lg hover:bg-[#ffffff08] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="text-[#f1f5f9] text-lg font-mono font-bold">{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={() => nav(1)} className="text-[#475569] hover:text-[#94a3b8] p-1 rounded-lg hover:bg-[#ffffff08] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              {(viewMonth !== today.getMonth() || viewYear !== today.getFullYear()) && (
                <button onClick={goToday} className="text-base font-mono text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-3 py-1 rounded hover:bg-[#00ff88]/20 transition-colors">
                  TODAY
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-base font-mono text-[#475569]">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" /> {filtered.length}
              {(impactFilter.length > 0 || countryFilter.length > 0) && (
                <button onClick={() => { setImpactFilter([]); setCountryFilter([]) }} className="text-base text-[#00d4ff] hover:underline ml-1">CLEAR</button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['high', 'medium', 'low'].map((imp) => (
              <button key={imp} onClick={() => toggleImpact(imp)}
                className={`text-base font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  impactFilter.includes(imp) ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'bg-transparent border-[#1e293b]/60 text-[#475569] hover:text-[#94a3b8]'
                }`}
              >
                <span className="flex items-center gap-1">
                  {[1, 2, 3].map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${i < (imp === 'high' ? 3 : imp === 'medium' ? 2 : 1) ? impactDotColors[imp] : 'bg-[#1e293b]'}`} />
                  ))}
                  <span className="ml-1">{imp.toUpperCase()}</span>
                </span>
              </button>
            ))}
            <div className="w-px h-5 bg-[#1e293b] mx-1" />
            {COUNTRY_LIST.map((cc) => {
              const c = COUNTRIES[cc]
              return (
                <button key={cc} onClick={() => toggleCountry(cc)}
                  className={`text-xl px-1.5 py-1 rounded-lg border transition-all cursor-pointer leading-none ${
                    countryFilter.includes(cc) ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-transparent border-[#1e293b]/60 hover:border-[#334155]'
                  } ${countryFilter.includes(cc) ? '' : 'opacity-50 hover:opacity-100'}`}
                ><span>{c.flag}</span></button>
              )
            })}
          </div>
        </div>

        {selectedEvents.length > 0 && (
          <div className="pro-panel p-4 mb-4 border-l-2 border-l-[#00ff88]/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-mono font-bold text-[#00ff88]">{selectedDate === todayStr ? '\u{25B6} TODAY' : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="text-sm font-mono text-[#475569] bg-[#ffffff08] px-2 py-0.5 rounded">{selectedEvents.length} EVENT{selectedEvents.length !== 1 ? 'S' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {sortedCountries.map((cc) => {
                const countryEvents = groupedByCountry[cc]
                const c = COUNTRIES[cc] || { flag: '\u{1F310}', cur: cc }
                return (
                  <div key={cc} className="min-w-[180px]">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-base">{c.flag}</span>
                      <span className="text-base font-mono font-semibold text-[#f1f5f9]">{c.cur}</span>
                      <span className="text-sm font-mono text-[#475569]">({countryEvents.length})</span>
                    </div>
                    {countryEvents.map((ev) => (
                      <div key={ev.id} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#ffffff08]">
                        <div className={`w-1 h-5 rounded-full shrink-0 ${impactDotColors[ev.impact] === '#ff4444' ? 'bg-[#ff4444]' : impactDotColors[ev.impact] === '#ff8800' ? 'bg-[#ff8800]' : 'bg-[#94a3b8]'}`} />
                        <span className="text-sm font-mono text-[#94a3b8] tabular-nums">{ev.time}</span>
                        <span className="text-base font-mono text-[#e2e8f0] truncate">{ev.event}</span>
                        <span className="text-sm font-mono text-[#00d4ff] ml-auto tabular-nums">{ev.forecast}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="pro-panel overflow-hidden">
          <div className="grid grid-cols-[90px_55px_1fr_125px_125px_125px_40px] gap-0 border-b border-[#1e293b]/40 bg-[#ffffff03]">
            <div className="px-3 py-3 text-base font-mono text-[#475569] tracking-widest">TIME</div>
            <div className="px-1 py-3 text-base font-mono text-[#475569] tracking-widest">CUR</div>
            <div className="px-3 py-3 text-base font-mono text-[#475569] tracking-widest">EVENT</div>
            <div className="px-2 py-3 text-base font-mono text-[#475569] tracking-widest text-right">ACTUAL</div>
            <div className="px-2 py-3 text-base font-mono text-[#475569] tracking-widest text-right">FCST</div>
            <div className="px-2 py-3 text-base font-mono text-[#475569] tracking-widest text-right">PREV</div>
            <div className="px-1 py-3" />
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {dates.length === 0 && (
              <div className="text-center py-12 text-base font-mono text-[#475569]">No events match your filters</div>
            )}

            {dates.map((dateKey) => {
              const dayEvents = groupedByDate[dateKey]
              const isToday = dateKey === todayStr

              return (
                <div key={dateKey}>
                  <button
                    onClick={() => setSelectedDate(dateKey)}
                    className={`w-full text-left px-3 py-3 flex items-center gap-2 border-b border-[#1e293b]/20 transition-colors cursor-pointer ${
                      isToday ? 'bg-[#00ff88]/8' : 'bg-[#ffffff05]'
                    } ${selectedDate === dateKey ? 'bg-[#00ff88]/12' : ''} hover:bg-[#00ff88]/10`}
                  >
                    <span className={`text-base font-mono font-bold tracking-wider ${isToday ? 'text-[#00ff88]' : 'text-[#64748b]'}`}>
                      {isToday ? '\u{25B6} TODAY' : new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm font-mono text-[#475569]">({dayEvents.length})</span>
                    {isToday && <span className="text-sm font-mono text-[#00ff88]/60 ml-auto">UP NEXT \u{2192}</span>}
                  </button>

                  {dayEvents.map((ev) => {
                    const c = COUNTRIES[ev.country] || { flag: '\u{1F310}', cur: '—' }
                    const dotCount = ev.impact === 'high' ? 3 : ev.impact === 'medium' ? 2 : 1
                    const dotCol = impactDotColors[ev.impact]
                    const actBetter = ev.actual && ev.forecast !== '—' && parseFloat(ev.actual.replace(/[^0-9.-]/g, '')) > parseFloat(ev.forecast.replace(/[^0-9.-]/g, ''))

                    return (
                      <div key={ev.id} className="grid grid-cols-[90px_55px_1fr_125px_125px_125px_40px] gap-0 items-center hover:bg-[#ffffff05] transition-colors border-b border-[#1e293b]/10">
                        <div className="px-3 py-3 text-base font-mono text-[#94a3b8] tabular-nums">{ev.time}</div>
                        <div className="px-1 py-3 text-lg flex items-center justify-center">{c.flag}</div>
                        <div className="px-3 py-3 flex items-center gap-2 min-w-0">
                          <div className="flex gap-px shrink-0">
                            {[0, 1, 2].map((i) => (
                              <span key={i} className={`w-1.5 h-2.5 rounded-[1px] ${i < dotCount ? '' : 'bg-[#1e293b]'}`} style={i < dotCount ? { backgroundColor: dotCol } : {}} />
                            ))}
                          </div>
                          <span className="text-base font-mono text-[#e2e8f0] truncate">{ev.event}</span>
                        </div>
                        <div className="px-2 py-3 text-base font-mono text-right tabular-nums">
                          {ev.actual
                            ? <span className={actBetter ? 'text-[#00ff88] font-semibold' : 'text-[#ff4444] font-semibold'}>{ev.actual}</span>
                            : <span className="text-[#1e293b]">—</span>}
                        </div>
                        <div className="px-2 py-3 text-base font-mono text-[#00d4ff] text-right tabular-nums">{ev.forecast}</div>
                        <div className="px-2 py-3 text-base font-mono text-[#64748b] text-right tabular-nums">{ev.previous}</div>
                        <div className="px-1 py-3 text-sm text-[#475569] flex justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div className="px-3 py-3 border-t border-[#1e293b]/40 flex items-center gap-3 text-sm font-mono text-[#475569]">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> LIVE</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ff4444]" /> HIGH</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ff8800]" /> MED</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" /> LOW</span>
            <span className="flex items-center gap-1 ml-auto"><span className="text-[#00ff88]">\u25B2</span> BETTER &nbsp; <span className="text-[#ff4444]">\u25BC</span> WORSE</span>
          </div>
        </div>
    </div>
  )
}
