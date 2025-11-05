"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail } from "lucide-react"
import { toast } from "sonner"

export function CustomerSignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (password !== confirmPassword) {
      const errorMsg = "Passwords do not match"
      setError(errorMsg)
      toast.error("Validation Error", {
        description: errorMsg,
      })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      const errorMsg = "Password must be at least 6 characters"
      setError(errorMsg)
      toast.error("Validation Error", {
        description: errorMsg,
      })
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "customer",
            phone_number: phoneNumber,
            address: address,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          const errorMsg = "An account with this email already exists"
          setError(errorMsg)
          toast.error("Signup Failed", {
            description: errorMsg,
          })
        } else {
          // Check if email confirmation is required
          const confirmationRequired = data.user && !data.session

          if (confirmationRequired) {
            setNeedsConfirmation(true)
            toast.success("Account Created!", {
              description: "Please check your email to confirm your account before signing in.",
              duration: 6000,
              icon: <Mail className="w-4 h-4" />,
            })
            setError(null)
            // Clear form fields except email
            setPassword("")
            setConfirmPassword("")
            setFullName("")
            setPhoneNumber("")
            setAddress("")
          } else {
            toast.success("Welcome!", {
              description: "Your account has been created successfully.",
            })
            router.push("/customer")
            router.refresh()
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during signup"
      setError(errorMessage)
      toast.error("Signup Failed", {
        description: errorMessage,
      })
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
    <Card>
      <CardHeader>
        <CardTitle>Customer Registration</CardTitle>
        <CardDescription>Create your account to manage water bills</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+263771234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main Street, Mutare"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || needsConfirmation}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          {needsConfirmation && (
            <div className="space-y-2 pt-2 border-t">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox.
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendConfirmation}
                disabled={resendLoading}
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
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
