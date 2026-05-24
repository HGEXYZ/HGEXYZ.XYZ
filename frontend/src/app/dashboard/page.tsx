'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BrainCircuit, TrendingUp, BarChart3, Landmark, Newspaper, Zap, ArrowRight,
  Activity, DollarSign, Globe, Shield, Clock, Sparkles
} from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import MarketsOverview from '@/components/MarketsOverview'
import FedPanel from '@/components/FedPanel'
import LiveAlerts from '@/components/LiveAlerts'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] animate-spin" />
          <span className="text-sm text-[#94a3b8] font-mono">Loading your terminal...</span>
        </div>
      </div>
    )
  }

  const quickLinks = [
    { href: '/markets', label: 'Markets', icon: BarChart3, desc: 'Live prices & charts' },
    { href: '/ai-terminal', label: 'AI Terminal', icon: BrainCircuit, desc: 'AI-powered analysis' },
    { href: '/fed-monitor', label: 'Fed Monitor', icon: Landmark, desc: 'Central bank data' },
    { href: '/intel-feed', label: 'Intel Feed', icon: Newspaper, desc: 'News intelligence' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="animate-slide-up"
      >
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">
          Welcome back, <span className="gradient-text">{user.username}</span>
        </h1>
        <p className="text-[#94a3b8] text-sm mt-1.5 font-mono">
          AI-powered market intelligence terminal &middot;{' '}
          <span className="text-[#a855f7]">{user.subscriptionPlan}</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: 'Signal Strength', value: '87%', color: '#10b981' },
          { icon: Clock, label: 'Market Status', value: 'LIVE', color: '#10b981' },
          { icon: Globe, label: 'Assets Covered', value: '8', color: '#a855f7' },
          { icon: Shield, label: 'Account Status', value: 'Active', color: '#c084fc' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
                <Icon size={18} className="text-[#a855f7]" />
              </div>
              <div>
                <div className="text-xs font-mono text-[#94a3b8]">{stat.label}</div>
                <div className="text-lg font-display font-semibold text-white">{stat.value}</div>
              </div>
            </div>
          )
        })}
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href}>
              <div className="glass-card p-4 flex flex-col items-center text-center gap-2 hover:border-[#a855f7]/30 transition-all duration-300 cursor-pointer h-full">
                <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center">
                  <Icon size={18} className="text-[#a855f7]" />
                </div>
                <div>
                  <div className="text-sm font-display font-semibold text-white">{link.label}</div>
                  <div className="text-xs text-[#94a3b8] font-mono">{link.desc}</div>
                </div>
              </div>
            </Link>
          )
        })}
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
