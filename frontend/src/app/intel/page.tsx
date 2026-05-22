import IntelFeed from '@/components/IntelFeed'
import LiveAlerts from '@/components/LiveAlerts'
import { Shield, Sparkles } from 'lucide-react'

export default function IntelPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">
          Intelligence &amp; <span className="gradient-text">Alerts</span>
        </h1>
        <p className="text-[#94a3b8] text-sm mt-1.5 font-mono">
          SIGINT / OSINT — Real-time global monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <IntelFeed />
        </div>
        <div className="xl:col-span-1">
          <LiveAlerts />
        </div>
      </div>
    </div>
  )
}
