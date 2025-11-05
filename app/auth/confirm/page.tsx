"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    const confirmEmail = async () => {
      const supabase = getSupabaseBrowserClient()
      const token_hash = searchParams.get("token_hash")
      const token = searchParams.get("token")
      const type = searchParams.get("type")

      // Handle both token_hash (older format) and token (newer format)
      const confirmationToken = token_hash || token

      if (confirmationToken && type) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: confirmationToken,
            type: type as any,
          })

          if (error) throw error

          if (data.user) {
            // Get user profile to determine redirect
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.user.id)
              .single()

            // If profile doesn't exist, that's okay - user was just created
            if (profileError && profileError.code !== 'PGRST116') {
              console.warn("Profile fetch error:", profileError)
            }

            setStatus("success")
            setMessage("Your email has been confirmed successfully!")
            
            toast.success("Email Confirmed!", {
              description: "Your account is now active. Redirecting...",
            })

            // Redirect based on role
            setTimeout(() => {
              if (profile?.role === "cashier") {
                router.push("/cashier")
              } else {
                router.push("/customer")
              }
            }, 2000)
          }
        } catch (err: any) {
          setStatus("error")
          const errorMsg = err.message || "Failed to confirm email. The link may have expired."
          setMessage(errorMsg)
          toast.error("Confirmation Failed", {
            description: errorMsg,
          })
          console.error("Confirmation error:", err)
        }
      } else {
        // Check if this might be a callback redirect (code parameter)
        const code = searchParams.get("code")
        if (code) {
          // This should be handled by /auth/callback route, but in case user lands here
          setStatus("loading")
          setMessage("Processing confirmation...")
          // Redirect to callback route
          router.push(`/auth/callback?code=${code}`)
        } else {
          setStatus("error")
          setMessage("Invalid confirmation link. Please check your email for a valid link.")
        }
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            )}
            {status === "error" && <XCircle className="w-16 h-16 text-red-600 mx-auto" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Confirming Your Email"}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <p className="text-center text-sm text-gray-600">Please wait...</p>
          )}
          {status === "success" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">You will be redirected shortly...</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/customer">Go to Dashboard</Link>
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Please check your email for a new confirmation link or contact support.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    disabled={resendLoading}
                  />
                  <Button
                    className="w-full"
                    onClick={async () => {
                      if (!resendEmail) {
                        toast.error("Error", {
                          description: "Please enter your email address.",
                        })
                        return
                      }

                      setResendLoading(true)
                      try {
                        const supabase = getSupabaseBrowserClient()
                        const { error: resendError } = await supabase.auth.resend({
                          type: "signup",
                          email: resendEmail,
                          options: {
                            emailRedirectTo: `${window.location.origin}/auth/confirm`,
                          },
                        })

                        if (resendError) throw resendError

                        toast.success("Confirmation Email Sent!", {
                          description: "Please check your email for the confirmation link.",
                          icon: <Mail className="w-4 h-4" />,
                        })
                      } catch (err: any) {
                        toast.error("Resend Failed", {
                          description: err.message || "Failed to resend confirmation email",
                        })
                      } finally {
                        setResendLoading(false)
                      }
                    }}
                    disabled={resendLoading || !resendEmail}
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
                <div className="space-y-2 pt-2 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/signup">Try Signing Up Again</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
              </div>
              <CardTitle className="text-2xl">Confirming Your Email</CardTitle>
              <CardDescription className="mt-2">Please wait...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  )
}

