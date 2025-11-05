"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Smartphone, Building2, Banknote } from "lucide-react"
import { toast } from "sonner"

type Bill = {
  id: string
  billing_period: string
  amount_due: number
  balance: number
  customer_id: string
}

export function PaymentDialog({
  bill,
  open,
  onOpenChange,
}: {
  bill: Bill
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  // Reset amount when bill changes
  const [amount, setAmount] = useState(bill.balance.toString())
  
  // Update amount when bill changes
  useEffect(() => {
    if (open) {
      setAmount(bill.balance.toString())
      setError(null)
      setSuccess(false)
    }
  }, [bill.balance, open])
  const [paymentMethod, setPaymentMethod] = useState("mobile_money")
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()
      
      // Get current user to ensure we have the correct customer_id
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Not authenticated")

      const paymentAmount = Number.parseFloat(amount)

      if (paymentAmount <= 0) {
        throw new Error("Payment amount must be greater than 0")
      }

      if (paymentAmount > bill.balance) {
        throw new Error(`Payment amount cannot exceed balance of $${bill.balance.toFixed(2)}`)
      }

      // Create payment record - trigger will automatically update bill status
      const { error: paymentError } = await supabase.from("payments").insert({
        bill_id: bill.id,
        customer_id: user.id, // Use authenticated user ID
        amount: paymentAmount,
        payment_method: paymentMethod,
        payment_reference: reference || null,
        payment_status: "completed", // In production, this would be 'pending' until confirmed
      })

      if (paymentError) throw paymentError

      toast.success("Payment Successful!", {
        description: `Your payment of $${paymentAmount.toFixed(2)} has been processed successfully.`,
      })

      setSuccess(true)
      
      // Wait a moment for the trigger to update the bill, then refresh
      setTimeout(() => {
        onOpenChange(false)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to process payment"
      setError(errorMessage)
      toast.error("Payment Failed", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
    { value: "card", label: "Debit/Credit Card", icon: CreditCard },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
    { value: "cash", label: "Cash (Pay at Office)", icon: Banknote },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>Pay your water bill for {bill.billing_period}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Your payment has been processed.</p>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Due:</span>
                <span className="font-semibold text-gray-900">${bill.amount_due.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Balance:</span>
                <span className="font-semibold text-red-600">${bill.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={bill.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Maximum: ${bill.balance.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.value}
                    className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50"
                  >
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Label htmlFor={method.value} className="flex items-center gap-2 cursor-pointer flex-1">
                      <method.icon className="w-4 h-4 text-gray-600" />
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Payment Reference (Optional)</Label>
              <Input
                id="reference"
                type="text"
                placeholder="e.g., Transaction ID"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${Number.parseFloat(amount || "0").toFixed(2)}`
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
