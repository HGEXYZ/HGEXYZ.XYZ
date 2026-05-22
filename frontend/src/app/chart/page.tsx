'use client'

import { Suspense } from 'react'
import FullScreenChart from './FullScreenChart'

export default function ChartPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#060b18]">
        <div className="flex items-center gap-2.5 text-xs font-mono text-[#475569]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff8800] animate-pulse" />
          LOADING CHART...
        </div>
      </div>
    }>
      <FullScreenChart />
    </Suspense>
  )
}
