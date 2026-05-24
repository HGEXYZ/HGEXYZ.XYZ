'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, Shield, Zap, Globe, BarChart3, BrainCircuit, ArrowRight, Menu, X } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'

const stats = [
  { label: 'Assets Tracked', value: '8+' },
  { label: 'AI Models', value: '12' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Latency', value: '<15ms' },
]

const features = [
  { icon: BrainCircuit, title: 'AI-Powered Analysis', desc: '12 specialized AI engines analyzing markets, macro data, and news in real-time.' },
  { icon: TrendingUp, title: 'Smart Execution', desc: 'Automated trading strategies with intelligent risk management and position sizing.' },
  { icon: Shield, title: 'Institutional Security', desc: 'Bank-grade encryption, secure authentication, and real-time threat monitoring.' },
  { icon: Globe, title: 'Global Market Coverage', desc: 'Forex, indices, commodities, and crypto — all in one unified terminal.' },
  { icon: Zap, title: 'Real-Time Intelligence', desc: 'Sub-15ms latency with live price feeds, news, and economic data integration.' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Professional-grade charts with 50+ indicators, pattern recognition, and signal fusion.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }),
}

export default function LandingPage() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden">

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#050505dd] backdrop-blur-2xl border-b border-[#ffffff08]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <span className="text-white text-sm font-bold font-mono">H</span>
            </span>
            <span className="text-white font-bold font-display text-lg tracking-tight">
              HG<span className="text-[#a855f7]">EXYZ</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Features</a>
            <a href="#stats" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Stats</a>
            {user ? (
              <Link href="/dashboard" className="px-5 py-2 rounded-2xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-sm font-semibold transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Sign In</Link>
                <Link href="/signup" className="px-5 py-2 rounded-2xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-sm font-semibold transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  Get Started
                </Link>
              </>
            )}
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-[#0a0a0a] border-b border-[#ffffff10] px-6 py-4 space-y-4">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm text-[#94a3b8] hover:text-white">Features</a>
            <a href="#stats" onClick={() => setMenuOpen(false)} className="block text-sm text-[#94a3b8] hover:text-white">Stats</a>
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-white font-semibold">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-sm text-[#94a3b8] hover:text-white">Sign In</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="block text-sm text-[#a855f7] font-semibold">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </motion.header>

      <section className="relative min-h-screen flex items-center pt-20 pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#a855f7]/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/5 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#a855f7]/3 blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-xs text-[#a855f7] font-mono mb-8">
                <span className="w-2 h-2 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.5)] animate-pulse" />
                AI Trading Intelligence Platform
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-white">Next Generation</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed]">
                AI Trading Ecosystem
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Advanced AI-powered trading tools, analytics, automation, and smart execution in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center gap-4 flex-wrap"
            >
              {user ? (
                <Link
                  href="/dashboard"
                  className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-semibold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] hover:scale-105 flex items-center gap-2"
                >
                  Launch Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-semibold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] hover:scale-105 flex items-center gap-2"
                  >
                    Create Account
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 rounded-2xl border border-[#ffffff15] text-white font-semibold text-lg transition-all duration-300 hover:bg-white/5 hover:border-[#a855f7]/30 flex items-center gap-2"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-16 relative"
            >
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#a855f7]/20 via-transparent to-transparent blur-3xl" />
                <div className="relative glass rounded-3xl overflow-hidden border border-[#ffffff10]">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ffffff08] bg-[#ffffff03]">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                    <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                    <span className="text-xs text-[#94a3b8] font-mono ml-3">hgexyz/terminal</span>
                  </div>
                  <div className="p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'NASDAQ', value: '19,842.3', change: '+1.24%', up: true },
                      { label: 'XAUUSD', value: '2,341.8', change: '+0.87%', up: true },
                      { label: 'DXY', value: '104.23', change: '-0.32%', up: false },
                      { label: 'BTCUSD', value: '67,891', change: '+2.14%', up: true },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#ffffff05] rounded-2xl p-4 border border-[#ffffff08]">
                        <div className="text-xs font-mono text-[#94a3b8] mb-1">{item.label}</div>
                        <div className="text-lg font-display font-bold text-white">${item.value}</div>
                        <div className={`text-sm font-mono mt-1 ${item.up ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                          {item.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="stats" className="relative py-24 border-t border-[#ffffff08]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] to-[#c084fc] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-[#94a3b8] font-mono">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Everything a Modern Trader Needs
            </h2>
            <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
              Institutional-grade tools designed for the next generation of trading intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="glass-card p-6 group hover:border-[#a855f7]/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
                    <Icon size={20} className="text-[#a855f7]" />
                  </div>
                  <h3 className="text-white font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-[#94a3b8] text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 border-t border-[#ffffff08]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-lg text-[#94a3b8] max-w-xl mx-auto mb-10">
              Join the future of AI-powered trading intelligence.
            </p>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-semibold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] hover:scale-105"
              >
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-semibold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] hover:scale-105"
              >
                Get Started Free <ArrowRight size={20} />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-[#ffffff08]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold font-mono">H</span>
            </span>
            <span className="text-sm text-[#94a3b8] font-mono">HGEXYZ &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-[#94a3b8] font-mono">AI Trading Intelligence Platform</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
