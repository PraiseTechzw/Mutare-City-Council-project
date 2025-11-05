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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Bill = {
  id: string
  billing_period: string
  amount_due: number
  amount_paid: number
  balance: number
  customer_id: string
  profiles: {
    full_name: string
    account_number: string | null
  }
}

type Customer = {
  id: string
  full_name: string
  account_number: string | null
}

export function ProcessPaymentDialog({
  customers,
  bills,
  open,
  onOpenChange,
}: {
  customers: Customer[]
  bills: Bill[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedBillId, setSelectedBillId] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter bills by selected customer
  const customerBills = selectedCustomerId
    ? bills.filter((bill) => bill.customer_id === selectedCustomerId && bill.balance > 0)
    : []

  // Update amount when bill changes
  useEffect(() => {
    if (selectedBillId) {
      const bill = bills.find((b) => b.id === selectedBillId)
      if (bill) {
        setAmount(bill.balance.toString())
      }
    }
  }, [selectedBillId, bills])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedCustomerId("")
      setSelectedBillId("")
      setAmount("")
      setPaymentMethod("cash")
      setReference("")
      setError(null)
    }
  }, [open])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      // Get current user (cashier)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Not authenticated")

      if (!selectedBillId || !selectedCustomerId) {
        throw new Error("Please select a customer and bill")
      }

      const paymentAmount = Number.parseFloat(amount)
      const selectedBill = bills.find((b) => b.id === selectedBillId)

      if (!selectedBill) {
        throw new Error("Bill not found")
      }

      if (paymentAmount <= 0) {
        throw new Error("Payment amount must be greater than 0")
      }

      if (paymentAmount > selectedBill.balance) {
        throw new Error(`Payment amount cannot exceed balance of $${selectedBill.balance.toFixed(2)}`)
      }

      // Create payment record - trigger will automatically update bill status
      const { error: paymentError } = await supabase.from("payments").insert({
        bill_id: selectedBillId,
        customer_id: selectedCustomerId,
        amount: paymentAmount,
        payment_method: paymentMethod,
        payment_reference: reference || null,
        payment_status: "completed",
        processed_by: user.id, // Record who processed the payment
      })

      if (paymentError) throw paymentError

      toast.success("Payment Processed!", {
        description: `Payment of $${paymentAmount.toFixed(2)} has been recorded successfully.`,
      })

      // Reset form
      setSelectedCustomerId("")
      setSelectedBillId("")
      setAmount("")
      setReference("")
      onOpenChange(false)
      router.refresh()
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
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
    { value: "card", label: "Debit/Credit Card", icon: CreditCard },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>Record a payment for a customer</DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePayment} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="customer">Select Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} required>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.full_name} ({customer.account_number || "No Account"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCustomerId && customerBills.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="bill">Select Bill</Label>
              <Select value={selectedBillId} onValueChange={setSelectedBillId} required>
                <SelectTrigger id="bill">
                  <SelectValue placeholder="Choose a bill" />
                </SelectTrigger>
                <SelectContent>
                  {customerBills.map((bill) => (
                    <SelectItem key={bill.id} value={bill.id}>
                      {bill.billing_period} - Balance: ${bill.balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedCustomerId && customerBills.length === 0 && (
            <Alert>
              <AlertDescription>This customer has no outstanding bills.</AlertDescription>
            </Alert>
          )}

          {selectedBillId && (
            <>
              {(() => {
                const selectedBill = bills.find((b) => b.id === selectedBillId)
                if (!selectedBill) return null
                return (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-semibold text-gray-900">{selectedBill.profiles.full_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bill Period:</span>
                      <span className="font-semibold text-gray-900">{selectedBill.billing_period}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Due:</span>
                      <span className="font-semibold text-gray-900">${selectedBill.amount_due.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Already Paid:</span>
                      <span className="font-semibold text-emerald-600">${selectedBill.amount_paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-semibold text-red-600">${selectedBill.balance.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {(() => {
                  const selectedBill = bills.find((b) => b.id === selectedBillId)
                  if (!selectedBill) return null
                  return <p className="text-xs text-gray-500">Maximum: ${selectedBill.balance.toFixed(2)}</p>
                })()}
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
                  placeholder="e.g., Receipt number, Transaction ID"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </>
          )}

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
            <Button type="submit" className="flex-1" disabled={loading || !selectedBillId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Process Payment`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

