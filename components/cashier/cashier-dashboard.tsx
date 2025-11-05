"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, LogOut, DollarSign, Users, FileText, AlertCircle, TrendingUp, Activity, Calendar } from "lucide-react"
import { CreateBillDialog } from "./create-bill-dialog"
import { GenerateMonthlyBillsDialog } from "./generate-monthly-bills-dialog"
import { ProcessPaymentDialog } from "./process-payment-dialog"
import { CustomersTable } from "./customers-table"
import { BillsTable } from "./bills-table"
import { PaymentsTable } from "./payments-table"
import { ActivityLogTable } from "./activity-log-table"
import { DueBillsSection } from "./due-bills-section"

type Profile = {
  id: string
  email: string
  full_name: string
  role: string
}

type Customer = {
  id: string
  email: string
  full_name: string
  account_number: string | null
  phone_number: string | null
  address: string | null
  created_at: string
}

type Bill = {
  id: string
  customer_id: string
  billing_period: string
  billing_month: string
  consumption: number
  amount_due: number
  amount_paid: number
  balance: number
  status: string
  due_date: string
  created_at: string
  profiles: {
    full_name: string
    account_number: string | null
  }
}

type Payment = {
  id: string
  amount: number
  payment_method: string
  payment_status: string
  payment_reference: string | null
  created_at: string
  processed_by?: string | null
  water_bills: {
    billing_period: string
  }
  profiles: {
    full_name: string
  }
  processed_by_profile?: {
    full_name: string
  } | null
}

type Activity = {
  id: string
  type: "bill_created" | "payment_processed" | "customer_created"
  description: string
  user_name: string
  amount?: number
  created_at: string
  metadata?: {
    billing_period?: string
    customer_name?: string
    payment_method?: string
  }
}

type Stats = {
  totalRevenue: number
  totalOutstanding: number
  totalCustomers: number
  unpaidBillsCount: number
}

export function CashierDashboard({
  profile,
  customers,
  bills,
  payments,
  stats,
  activities,
}: {
  profile: Profile
  customers: Customer[]
  bills: Bill[]
  payments: Payment[]
  stats: Stats
  activities: Activity[]
}) {
  const router = useRouter()
  const [showCreateBill, setShowCreateBill] = useState(false)
  const [showGenerateMonthlyBills, setShowGenerateMonthlyBills] = useState(false)
  const [showProcessPayment, setShowProcessPayment] = useState(false)

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login/cashier")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mutare City Council</h1>
              <p className="text-xs text-gray-400">Cashier Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-sm font-semibold text-white">{profile.full_name}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-900/50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>All time</span>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-900/50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Outstanding</p>
            <p className="text-3xl font-bold text-white">${stats.totalOutstanding.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">{stats.unpaidBillsCount} unpaid bills</p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-white">{stats.totalCustomers}</p>
            <p className="text-sm text-gray-500 mt-2">Active accounts</p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Bills</p>
            <p className="text-3xl font-bold text-white">{bills.length}</p>
            <p className="text-sm text-gray-500 mt-2">All time</p>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-slate-800 border-slate-700">
          <Tabs defaultValue="bills" className="w-full">
            <div className="border-b border-slate-700 px-6 pt-6">
              <TabsList className="bg-slate-900">
                <TabsTrigger value="bills">Bills</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="bills" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Water Bills</h3>
                  <p className="text-sm text-gray-400">Manage all customer water bills</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowGenerateMonthlyBills(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Monthly Bills
                  </Button>
                  <Button onClick={() => setShowCreateBill(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Create New Bill
                  </Button>
                </div>
              </div>
              
              {/* Due Bills Section */}
              <DueBillsSection bills={bills} />
              
              <BillsTable bills={bills} />
            </TabsContent>

            <TabsContent value="customers" className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Customers</h3>
                <p className="text-sm text-gray-400">View and manage customer accounts</p>
              </div>
              <CustomersTable customers={customers} />
            </TabsContent>

            <TabsContent value="payments" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">All Payments</h3>
                  <p className="text-sm text-gray-400">View payment history and transactions</p>
                </div>
                <Button onClick={() => setShowProcessPayment(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Process Payment
                </Button>
              </div>
              <PaymentsTable payments={payments} />
            </TabsContent>

            <TabsContent value="activity" className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xl font-bold text-white">Activity Log</h3>
                </div>
                <p className="text-sm text-gray-400">Recent system activity and transactions</p>
              </div>
              <ActivityLogTable activities={activities} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Create Bill Dialog */}
      <CreateBillDialog customers={customers} open={showCreateBill} onOpenChange={setShowCreateBill} />

      {/* Generate Monthly Bills Dialog */}
      <GenerateMonthlyBillsDialog
        customers={customers}
        existingBills={bills}
        open={showGenerateMonthlyBills}
        onOpenChange={setShowGenerateMonthlyBills}
      />

      {/* Process Payment Dialog */}
      <ProcessPaymentDialog
        customers={customers}
        bills={bills}
        open={showProcessPayment}
        onOpenChange={setShowProcessPayment}
      />
    </div>
  )
}
