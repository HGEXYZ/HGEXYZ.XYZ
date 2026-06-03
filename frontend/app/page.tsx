"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  useEffect(() => { router.push(isAuthenticated ? "/dashboard" : "/login") }, [isAuthenticated, router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">AI Trading Platform</h1>
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  )
}
