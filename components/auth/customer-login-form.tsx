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

export function CustomerLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResendButton, setShowResendButton] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

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

      // Check if user is a customer
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profileError) throw profileError

      if (profile.role !== "customer") {
        await supabase.auth.signOut()
        throw new Error("Invalid credentials. Please use the cashier login.")
      }

      toast.success("Welcome back!", {
        description: `Signed in as ${data.user.email}`,
      })

      router.push("/customer")
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in"
      setError(errorMessage)
      
      // Check if it's an email confirmation error
      const isConfirmationError = errorMessage.includes("Email not confirmed") || 
                                   errorMessage.includes("confirm") ||
                                   errorMessage.toLowerCase().includes("email not verified")
      
      if (isConfirmationError) {
        setShowResendButton(true)
        toast.error("Email Not Confirmed", {
          description: "Please check your email and confirm your account before signing in.",
          duration: 6000,
        })
      } else {
        setShowResendButton(false)
        toast.error("Login Failed", {
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error("Error", {
        description: "Email address is required to resend confirmation.",
      })
      return
    }

    setResendLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (resendError) throw resendError

      toast.success("Confirmation Email Sent!", {
        description: "Please check your email for the confirmation link.",
        icon: <Mail className="w-4 h-4" />,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend confirmation email"
      toast.error("Resend Failed", {
        description: errorMessage,
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      {showResendButton && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendConfirmation}
          disabled={resendLoading || !email}
        >
          {resendLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend Confirmation Email
            </>
          )}
        </Button>
      )}

      <div className="text-center mt-4">
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
          Forgot your password?
        </a>
      </div>
    </form>
  )
}
