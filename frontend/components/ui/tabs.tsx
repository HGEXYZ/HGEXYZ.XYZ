"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType { activeTab: string; setActiveTab: (v: string) => void }
const TabsContext = React.createContext<TabsContextType>({ activeTab: "", setActiveTab: () => {} })

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}><div className={className}>{children}</div></TabsContext.Provider>
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-secondary p-1 text-muted-foreground", className)}>{children}</div>
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext)
  return <button onClick={() => setActiveTab(value)} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all", activeTab === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground", className)}>{children}</button>
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { activeTab } = React.useContext(TabsContext)
  if (activeTab !== value) return null
  return <div className={cn("mt-2", className)}>{children}</div>
}
