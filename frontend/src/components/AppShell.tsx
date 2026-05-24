'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isLanding = pathname === '/'
  const isAuth = pathname === '/login' || pathname === '/signup'

  if (isLanding) return <>{children}</>

  if (isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07010f]">
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="px-5 py-5">
          {children}
        </main>
      </div>
    </div>
  )
}
