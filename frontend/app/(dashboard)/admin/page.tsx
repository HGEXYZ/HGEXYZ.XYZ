"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "next/navigation"
import { Users, Activity, DollarSign, Cpu } from "lucide-react"
import type { AdminStats } from "@/types"

export default function AdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (user?.role !== "admin") { router.push("/dashboard"); return }
    api.admin.stats().then(setStats)
    api.admin.users(1).then((data: any) => setUsers(data.users || []))
  }, [user, router])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Admin Panel</h1><p className="text-muted-foreground">System administration and monitoring</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />Total Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats?.total_users || 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Active Subs</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats?.active_users || 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${(stats?.revenue?.total || 0).toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Cpu className="h-4 w-4" />AI Queries</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats?.total_ai_queries || 0}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Users</CardTitle></CardHeader>
        <CardContent>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="mb-4 max-w-sm" />
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2">Name</th><th className="text-left py-2">Email</th><th className="text-left py-2">Role</th><th className="text-left py-2">Plan</th><th className="text-left py-2">Status</th><th className="text-right py-2">Joined</th></tr></thead>
            <tbody>{users.map((u: any) => (
              <tr key={u.id} className="border-b border-border"><td className="py-2">{u.name}</td><td className="py-2">{u.email}</td><td className="py-2"><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></td><td className="py-2">{u.plan}</td><td className="py-2"><Badge variant={u.is_active ? "success" : "destructive"}>{u.is_active ? "Active" : "Inactive"}</Badge></td><td className="text-right py-2">{new Date(u.created_at).toLocaleDateString()}</td></tr>
            ))}</tbody></table></div>
        </CardContent>
      </Card>
    </div>
  )
}
