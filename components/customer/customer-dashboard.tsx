"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Droplets,
  LogOut,
  CreditCard,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  Phone,
  MapPin,
  Receipt,
} from "lucide-react"
import { PaymentDialog } from "./payment-dialog"
import { ReceiptDialog } from "./receipt-dialog"

type Profile = {
  id: string
  email: string
  full_name: string
  account_number: string | null
  phone_number: string | null
  address: string | null
}

type Bill = {
  id: string
  billing_period: string
  billing_month: string
  previous_reading: number
  current_reading: number
  consumption: number
  rate_per_unit: number
  amount_due: number
  amount_paid: number
  balance: number
  status: string
  due_date: string
}

type Payment = {
  id: string
  amount: number
  payment_method: string
  payment_status: string
  payment_reference: string | null
  created_at: string
  water_bills: {
    billing_period: string
    amount_due: number
    consumption: number
    previous_reading: number
    current_reading: number
    rate_per_unit: number
  }
}

export function CustomerDashboard({
  profile,
  bills,
  recentPayments,
}: {
  profile: Profile
  bills: Bill[]
  recentPayments: Payment[]
}) {
  const router = useRouter()
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const unpaidBills = bills.filter((b) => b.status === "unpaid" || b.status === "partial")
  const totalOutstanding = unpaidBills.reduce((sum, bill) => sum + bill.balance, 0)

  const handlePayBill = (bill: Bill) => {
    setSelectedBill(bill)
    setShowPaymentDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "unpaid":
        return "bg-red-100 text-red-700 border-red-200"
      case "partial":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "overdue":
        return "bg-rose-100 text-rose-700 border-rose-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mutare City Council</h1>
              <p className="text-xs text-gray-600">Customer Portal</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.full_name}</h2>
          <p className="text-gray-600">Manage your water bills and payments</p>
        </div>

        {/* Account Info Card */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Account Number</p>
              <p className="text-2xl font-bold">{profile.account_number || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              {profile.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone_number}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold text-gray-900">${totalOutstanding.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">{unpaidBills.length} unpaid bills</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Bills</p>
            <p className="text-3xl font-bold text-gray-900">{bills.length}</p>
            <p className="text-sm text-gray-500 mt-2">All time</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Last Payment</p>
            <p className="text-3xl font-bold text-gray-900">${recentPayments[0]?.amount.toFixed(2) || "0.00"}</p>
            <p className="text-sm text-gray-500 mt-2">
              {recentPayments[0] ? new Date(recentPayments[0].created_at).toLocaleDateString() : "No payments yet"}
            </p>
          </Card>
        </div>

        {/* Bills Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Your Water Bills</h3>
          </div>

          <div className="space-y-4">
            {bills.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bills found</p>
              </Card>
            ) : (
              bills.map((bill) => (
                <Card key={bill.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{bill.billing_period}</h4>
                        <Badge className={getStatusColor(bill.status)}>{bill.status.toUpperCase()}</Badge>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Consumption</p>
                          <p className="font-semibold text-gray-900">{bill.consumption.toFixed(2)} m³</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount Due</p>
                          <p className="font-semibold text-gray-900">${bill.amount_due.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount Paid</p>
                          <p className="font-semibold text-emerald-600">${bill.amount_paid.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Balance</p>
                          <p className="font-semibold text-red-600">${bill.balance.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(bill.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {bill.balance > 0 && (
                      <Button onClick={() => handlePayBill(bill)} className="md:w-auto w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Payments History */}
        {recentPayments.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h3>
            <Card className="p-6">
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{payment.water_bills.billing_period}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()} • {payment.payment_method.replace("_", " ")}
                        </p>
                        {payment.payment_reference && (
                          <p className="text-xs text-gray-400 mt-1">Ref: {payment.payment_reference}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${payment.amount.toFixed(2)}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {payment.payment_status}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setShowReceiptDialog(true)
                        }}
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      {selectedBill && (
        <PaymentDialog bill={selectedBill} open={showPaymentDialog} onOpenChange={setShowPaymentDialog} />
      )}

      {/* Receipt Dialog */}
      {selectedPayment && (
        <ReceiptDialog
          payment={selectedPayment}
          profile={profile}
          open={showReceiptDialog}
          onOpenChange={setShowReceiptDialog}
        />
      )}
    </div>
  )
}
