"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type Customer = {
  id: string
  full_name: string
  account_number: string | null
}

export function CreateBillDialog({
  customers,
  open,
  onOpenChange,
}: {
  customers: Customer[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState("")
  const [billingPeriod, setBillingPeriod] = useState("")
  const [billingMonth, setBillingMonth] = useState("")
  const [previousReading, setPreviousReading] = useState("")
  const [currentReading, setCurrentReading] = useState("")
  const [ratePerUnit, setRatePerUnit] = useState("2.50")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const customer = customers.find((c) => c.id === customerId)
      if (!customer) throw new Error("Customer not found")

      const prev = Number.parseFloat(previousReading)
      const curr = Number.parseFloat(currentReading)
      const rate = Number.parseFloat(ratePerUnit)

      if (curr < prev) {
        throw new Error("Current reading must be greater than previous reading")
      }

      const consumption = curr - prev
      const amountDue = consumption * rate

      const { error: insertError } = await supabase.from("water_bills").insert({
        customer_id: customerId,
        account_number: customer.account_number,
        billing_period: billingPeriod,
        billing_month: billingMonth,
        previous_reading: prev,
        current_reading: curr,
        rate_per_unit: rate,
        amount_due: amountDue,
        due_date: dueDate,
        status: "unpaid",
        created_by: user.id,
      })

      if (insertError) throw insertError

      toast.success("Bill Created Successfully!", {
        description: `Water bill for ${billingPeriod} has been created. Amount due: $${amountDue.toFixed(2)}`,
      })

      onOpenChange(false)
      router.refresh()

      // Reset form
      setCustomerId("")
      setBillingPeriod("")
      setBillingMonth("")
      setPreviousReading("")
      setCurrentReading("")
      setRatePerUnit("2.50")
      setDueDate("")
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create bill"
      setError(errorMessage)
      toast.error("Failed to Create Bill", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const consumption =
    currentReading && previousReading ? Number.parseFloat(currentReading) - Number.parseFloat(previousReading) : 0

  const amountDue = consumption > 0 && ratePerUnit ? consumption * Number.parseFloat(ratePerUnit) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New Water Bill</DialogTitle>
          <DialogDescription className="text-gray-400">Generate a new water bill for a customer</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-950 border-red-800">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="customer" className="text-gray-200">
              Customer
            </Label>
            <Select value={customerId} onValueChange={setCustomerId} required>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id} className="text-white">
                    {customer.full_name} ({customer.account_number || "No account"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingPeriod" className="text-gray-200">
                Billing Period
              </Label>
              <Input
                id="billingPeriod"
                placeholder="e.g., January 2025"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingMonth" className="text-gray-200">
                Billing Month
              </Label>
              <Input
                id="billingMonth"
                type="date"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previousReading" className="text-gray-200">
                Previous Reading (m³)
              </Label>
              <Input
                id="previousReading"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={previousReading}
                onChange={(e) => setPreviousReading(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentReading" className="text-gray-200">
                Current Reading (m³)
              </Label>
              <Input
                id="currentReading"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ratePerUnit" className="text-gray-200">
                Rate per Unit ($)
              </Label>
              <Input
                id="ratePerUnit"
                type="number"
                step="0.01"
                value={ratePerUnit}
                onChange={(e) => setRatePerUnit(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-gray-200">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          {consumption > 0 && (
            <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Consumption:</span>
                <span className="font-semibold text-white">{consumption.toFixed(2)} m³</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Amount Due:</span>
                <span className="font-semibold text-emerald-400">${amountDue.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Bill"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
