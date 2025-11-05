"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type Customer = {
  id: string
  full_name: string
  account_number: string | null
}

type Bill = {
  id: string
  customer_id: string
  billing_month: string
  current_reading: number
}

export function GenerateMonthlyBillsDialog({
  customers,
  existingBills,
  open,
  onOpenChange,
}: {
  customers: Customer[]
  existingBills: Bill[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [billingMonth, setBillingMonth] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  })
  const [ratePerUnit, setRatePerUnit] = useState("2.50")
  const [defaultReadingIncrease, setDefaultReadingIncrease] = useState("50")
  const [daysUntilDue, setDaysUntilDue] = useState("30")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    total: number
    processed: number
    created: number
    skipped: number
  } | null>(null)

  const selectedMonthLabel = billingMonth
    ? new Date(billingMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : ""

  // Get customers who already have bills for selected month
  const customersWithBills = new Set(
    existingBills
      .filter((bill) => {
        const billDate = new Date(bill.billing_month)
        const billMonthKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, "0")}`
        return billMonthKey === billingMonth
      })
      .map((bill) => bill.customer_id)
  )

  const eligibleCustomers = customers.filter((c) => !customersWithBills.has(c.id) && c.account_number)

  const handleGenerate = async () => {
    if (eligibleCustomers.length === 0) {
      toast.error("No Eligible Customers", {
        description: "All customers already have bills for this month.",
      })
      return
    }

    setLoading(true)
    setError(null)
    setProgress({ total: eligibleCustomers.length, processed: 0, created: 0, skipped: 0 })

    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const rate = Number.parseFloat(ratePerUnit)
      const defaultIncrease = Number.parseFloat(defaultReadingIncrease)
      const dueDays = Number.parseInt(daysUntilDue)

      if (rate <= 0) throw new Error("Rate per unit must be greater than 0")
      if (defaultIncrease < 0) throw new Error("Default reading increase cannot be negative")

      // Calculate billing period and due date
      const [year, month] = billingMonth.split("-")
      const billingPeriod = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      const billingMonthDate = `${year}-${month}-01`
      const dueDate = new Date(parseInt(year), parseInt(month) - 1 + 1, dueDays)

      let created = 0
      let skipped = 0

      // Process each customer
      for (let i = 0; i < eligibleCustomers.length; i++) {
        const customer = eligibleCustomers[i]
        
        try {
          // Get customer's most recent bill to use as previous reading
          const { data: lastBill } = await supabase
            .from("water_bills")
            .select("current_reading")
            .eq("customer_id", customer.id)
            .order("billing_month", { ascending: false })
            .limit(1)
            .single()

          const previousReading = lastBill?.current_reading || 0
          const currentReading = previousReading + defaultIncrease
          const consumption = currentReading - previousReading
          const amountDue = consumption * rate

          // Create bill
          const { error: insertError } = await supabase.from("water_bills").insert({
            customer_id: customer.id,
            account_number: customer.account_number!,
            billing_period: billingPeriod,
            billing_month: billingMonthDate,
            previous_reading: previousReading,
            current_reading: currentReading,
            rate_per_unit: rate,
            amount_due: amountDue,
            due_date: dueDate.toISOString().split("T")[0],
            status: "unpaid",
            created_by: user.id,
          })

          if (insertError) {
            console.error(`Error creating bill for ${customer.full_name}:`, insertError)
            skipped++
          } else {
            created++
          }
        } catch (err) {
          console.error(`Error processing ${customer.full_name}:`, err)
          skipped++
        }

        setProgress({
          total: eligibleCustomers.length,
          processed: i + 1,
          created,
          skipped,
        })
      }

      toast.success("Monthly Bills Generated!", {
        description: `Created ${created} bills for ${billingPeriod}. ${skipped} skipped.`,
      })

      onOpenChange(false)
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate monthly bills"
      setError(errorMessage)
      toast.error("Generation Failed", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Monthly Bills</DialogTitle>
          <DialogDescription>
            Automatically create bills for all customers for the selected month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {progress && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Processing: {progress.processed} / {progress.total} customers • Created: {progress.created} • Skipped: {progress.skipped}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billingMonth">Billing Month</Label>
              <Input
                id="billingMonth"
                type="month"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                required
                disabled={loading}
              />
              {billingMonth && (
                <p className="text-sm text-gray-500">Generating bills for: {selectedMonthLabel}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ratePerUnit">Rate per Unit ($)</Label>
                <Input
                  id="ratePerUnit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultReadingIncrease">Default Reading Increase (m³)</Label>
                <Input
                  id="defaultReadingIncrease"
                  type="number"
                  step="0.01"
                  min="0"
                  value={defaultReadingIncrease}
                  onChange={(e) => setDefaultReadingIncrease(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Applied if no previous bill exists
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daysUntilDue">Days Until Due Date</Label>
              <Input
                id="daysUntilDue"
                type="number"
                min="1"
                value={daysUntilDue}
                onChange={(e) => setDaysUntilDue(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Due date will be set to {daysUntilDue} days after the billing month starts
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Summary</span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• Eligible customers: {eligibleCustomers.length}</p>
                <p>• Customers with existing bills: {customersWithBills.size}</p>
                <p>• Bills will use previous month's reading as base</p>
                <p>• Default consumption: {defaultReadingIncrease} m³ (if no previous bill)</p>
              </div>
            </div>
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
            <Button
              type="button"
              onClick={handleGenerate}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || eligibleCustomers.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Generate {eligibleCustomers.length} Bills
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

