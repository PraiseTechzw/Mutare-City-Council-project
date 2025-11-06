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
import Image from "next/image"
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
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="Mutare City Council Logo" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Mutare City Council</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Customer Portal</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex-shrink-0">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.full_name}</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage your water bills and payments</p>
        </div>

        {/* Account Info Card */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-lg">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm mb-1">Account Number</p>
              <p className="text-xl sm:text-2xl font-bold break-all">{profile.account_number || "N/A"}</p>
            </div>
            <div className="space-y-2 sm:space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              {profile.phone_number && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{profile.phone_number}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-start gap-2 text-xs sm:text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{profile.address}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Outstanding</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">${totalOutstanding.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">{unpaidBills.length} unpaid bills</p>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Bills</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{bills.length}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">All time</p>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Last Payment</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">${recentPayments[0]?.amount.toFixed(2) || "0.00"}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {recentPayments[0] ? new Date(recentPayments[0].created_at).toLocaleDateString() : "No payments yet"}
            </p>
          </Card>
        </div>

        {/* Bills Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Your Water Bills</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {bills.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600">No bills found</p>
              </Card>
            ) : (
              bills.map((bill) => (
                <Card key={bill.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900">{bill.billing_period}</h4>
                          <Badge className={getStatusColor(bill.status)}>{bill.status.toUpperCase()}</Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Consumption</p>
                            <p className="font-semibold text-gray-900">{bill.consumption.toFixed(2)} m³</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Amount Due</p>
                            <p className="font-semibold text-gray-900">${bill.amount_due.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Amount Paid</p>
                            <p className="font-semibold text-emerald-600">${bill.amount_paid.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Balance</p>
                            <p className="font-semibold text-red-600">${bill.balance.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-gray-600">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Due: {new Date(bill.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {bill.balance > 0 && (
                      <Button onClick={() => handlePayBill(bill)} className="w-full sm:w-auto sm:self-end" size="sm">
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment History</h3>
            <Card className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2 sm:px-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{payment.water_bills.billing_period}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()} • {payment.payment_method.replace("_", " ")}
                        </p>
                        {payment.payment_reference && (
                          <p className="text-xs text-gray-400 mt-1 truncate">Ref: {payment.payment_reference}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-sm sm:text-base text-gray-900">${payment.amount.toFixed(2)}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
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
                        className="flex-shrink-0"
                      >
                        <Receipt className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Receipt</span>
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
