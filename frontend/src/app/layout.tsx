import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthContext'
import AppShell from '@/components/AppShell'
import AnimatedCursor from '@/components/AnimatedCursor'
import ParticlesBackground from '@/components/ParticlesBackground'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'HGEXYZ — Next Generation AI Trading Ecosystem',
  description: 'Advanced AI-powered trading tools, analytics, automation, and smart execution in one platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#050505] text-white">
        <AnimatedCursor />
        <ParticlesBackground />
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
