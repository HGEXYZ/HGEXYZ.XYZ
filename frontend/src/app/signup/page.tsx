'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2, Check, X } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signup } = useAuth()

  const passwordChecks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!passwordChecks.every((c) => c.pass)) {
      setError('Password does not meet requirements')
      return
    }

    setLoading(true)
    const result = await signup(username, email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 border border-[#ffffff10]"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <span className="text-white text-sm font-bold font-mono">H</span>
            </span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white">Create your account</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Start your AI trading journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-mono text-[#94a3b8] mb-1.5">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your trading alias"
              className="w-full bg-[#ffffff08] border border-[#ffffff10] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/40 focus:bg-[#ffffff10] transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-mono text-[#94a3b8] mb-1.5">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@example.com"
              className="w-full bg-[#ffffff08] border border-[#ffffff10] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/40 focus:bg-[#ffffff10] transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono text-[#94a3b8] mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full bg-[#ffffff08] border border-[#ffffff10] rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/40 focus:bg-[#ffffff10] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs font-mono">
                  {check.pass ? (
                    <Check size={12} className="text-[#10b981]" />
                  ) : (
                    <X size={12} className="text-[#94a3b8]" />
                  )}
                  <span className={check.pass ? 'text-[#10b981]' : 'text-[#94a3b8]'}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-mono text-[#94a3b8] mb-1.5">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-[#ffffff08] border border-[#ffffff10] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/40 focus:bg-[#ffffff10] transition-all"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[#ef4444] font-mono bg-[#ef4444]/10 rounded-xl px-4 py-2 border border-[#ef4444]/20"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#94a3b8]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#a855f7] hover:text-[#c084fc] transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
