import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'HGEXYZ — AI Trading Intelligence Platform',
  description: 'Revolutionizing the Future of Trading Intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <Navbar />
            <main className="px-5 py-5">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
