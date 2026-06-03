"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { BarChart3, MessageSquare, Search, Workflow, LineChart, PieChart, Newspaper, Code2, Settings, Shield, LogOut, Menu, X, Bell, TrendingUp, GanttChartSquare } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/scanner", label: "Market Scanner", icon: Search },
  { href: "/backtest", label: "Backtesting", icon: GanttChartSquare },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/strategies", label: "Strategies", icon: Code2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { if (!isAuthenticated) router.push("/login") }, [isAuthenticated, router])

  const handleLogout = () => { logout(); router.push("/login") }

  return (
    <div className="min-h-screen bg-background">
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-sidebar border-r border-border transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="font-bold gradient-text">Trading Pro</span>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors", pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors", pathname === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">{user?.name?.charAt(0)}</div>
              <div><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-muted-foreground">{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 text-muted-foreground hover:text-foreground"><Bell className="h-5 w-5" /><span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" /></button>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
