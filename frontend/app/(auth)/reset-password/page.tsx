"use client"
import { useState } from "react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Reset Password</h1>
          <p className="text-muted-foreground mt-2">{sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}</p>
        </div>
        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm font-medium">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90">Send Reset Link</button>
          </form>
        )}
        <div className="text-center"><Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Back to sign in</Link></div>
      </div>
    </div>
  )
}
