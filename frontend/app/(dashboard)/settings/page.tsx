"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth"
import { CreditCard, Bell, Shield, Palette } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuthStore()
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Manage your account and preferences</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Subscription</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">You are on the <strong>Free</strong> plan. Upgrade to access premium features.</p><Button className="mt-3" variant="outline">View Plans</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Configure your trading alerts and notification preferences.</p><Button className="mt-3" variant="outline">Configure</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" />Security</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Change password, enable 2FA, and manage sessions.</p><Button className="mt-3" variant="outline">Manage</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-4 w-4" />Appearance</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Customize the platform theme and layout preferences.</p><Button className="mt-3" variant="outline">Customize</Button></CardContent></Card>
      </div>
    </div>
  )
}
