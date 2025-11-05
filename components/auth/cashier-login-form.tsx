"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock } from "lucide-react"
import { toast } from "sonner"

export function CashierLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Check if user is a cashier
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profileError) throw profileError

      if (profile.role !== "cashier") {
        await supabase.auth.signOut()
        throw new Error("Unauthorized. This portal is for cashiers only.")
      }

      toast.success("Welcome back!", {
        description: `Signed in as ${data.user.email}`,
      })

      router.push("/cashier")
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in"
      setError(errorMessage)
      
      // Check if it's an email confirmation error
      if (errorMessage.includes("Email not confirmed") || errorMessage.includes("confirm")) {
        toast.error("Email Not Confirmed", {
          description: "Please check your email and confirm your account before signing in.",
          duration: 6000,
        })
      } else {
        toast.error("Login Failed", {
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-950 border-red-800">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-200">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            id="email"
            type="email"
            placeholder="cashier@mutare.co.zw"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-200">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
