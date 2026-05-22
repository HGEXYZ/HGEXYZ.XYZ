import MarketsOverview from '@/components/MarketsOverview'
import FedPanel from '@/components/FedPanel'
import LiveAlerts from '@/components/LiveAlerts'
import Link from 'next/link'
import { BrainCircuit, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">
          Welcome back, <span className="gradient-text">Trader</span>
        </h1>
        <p className="text-[#94a3b8] text-sm mt-1.5 font-mono">
          AI-powered market intelligence dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <MarketsOverview />
        </div>
        <div className="space-y-5">
          <FedPanel />
          <LiveAlerts />
        </div>
      </div>

      <Link href="/ai-terminal" className="block group">
        <div className="glass-card p-5 flex items-center justify-between group-hover:border-[#a855f7]/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
              <BrainCircuit size={24} className="text-[#a855f7]" />
            </div>
            <div>
              <h3 className="text-white font-display font-semibold text-lg">AI Terminal</h3>
              <p className="text-[#94a3b8] text-sm font-mono">
                Institutional trading intelligence via OpenRouter
              </p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-2xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-sm transition-all shadow-[0_0_40px_rgba(168,85,247,0.45)] flex items-center gap-2">
            <Zap size={16} />
            Open Terminal
          </button>
        </div>
      </Link>
    </div>
  )
}
