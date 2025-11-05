"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AlertCircle, Calendar, Clock, CheckCircle2 } from "lucide-react"

type Bill = {
  id: string
  billing_period: string
  billing_month: string
  consumption: number
  amount_due: number
  amount_paid: number
  balance: number
  status: string
  due_date: string
  profiles: {
    full_name: string
    account_number: string | null
  }
}

export function DueBillsSection({ bills }: { bills: Bill[] }) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Categorize bills
  const overdueBills = bills.filter((bill) => {
    const dueDate = new Date(bill.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < now && (bill.status === "unpaid" || bill.status === "partial")
  })

  const dueSoonBills = bills.filter((bill) => {
    const dueDate = new Date(bill.due_date)
    dueDate.setHours(0, 0, 0, 0)
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return (
      daysUntilDue >= 0 &&
      daysUntilDue <= 7 &&
      dueDate >= now &&
      (bill.status === "unpaid" || bill.status === "partial")
    )
  })

  const totalOverdue = overdueBills.reduce((sum, bill) => sum + bill.balance, 0)
  const totalDueSoon = dueSoonBills.reduce((sum, bill) => sum + bill.balance, 0)

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diff = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (overdueBills.length === 0 && dueSoonBills.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">No Due Bills</h3>
            <p className="text-sm text-gray-400">All bills are up to date!</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Overdue Bills */}
      {overdueBills.length > 0 && (
        <Card className="bg-red-900/20 border-red-700">
          <div className="p-4 border-b border-red-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Overdue Bills</h3>
                  <p className="text-sm text-red-300">
                    {overdueBills.length} bill{overdueBills.length !== 1 ? "s" : ""} • Total: ${totalOverdue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {overdueBills.map((bill) => {
              const daysOverdue = getDaysOverdue(bill.due_date)
              return (
                <div
                  key={bill.id}
                  className="bg-slate-900 rounded-lg p-4 border border-red-700/50 hover:border-red-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-1">{bill.profiles.full_name}</h4>
                      <p className="text-sm text-gray-400">
                        {bill.billing_period} • {bill.profiles.account_number || "No Account"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-red-900/50 text-red-300 border-red-700">
                          {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue
                        </Badge>
                        <Badge className="bg-amber-900/50 text-amber-300 border-amber-700">
                          {bill.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-400">${bill.balance.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">Balance</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Due Soon Bills */}
      {dueSoonBills.length > 0 && (
        <Card className="bg-amber-900/20 border-amber-700">
          <div className="p-4 border-b border-amber-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Due Soon (Next 7 Days)</h3>
                  <p className="text-sm text-amber-300">
                    {dueSoonBills.length} bill{dueSoonBills.length !== 1 ? "s" : ""} • Total: ${totalDueSoon.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {dueSoonBills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.due_date)
              return (
                <div
                  key={bill.id}
                  className="bg-slate-900 rounded-lg p-4 border border-amber-700/50 hover:border-amber-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-1">{bill.profiles.full_name}</h4>
                      <p className="text-sm text-gray-400">
                        {bill.billing_period} • {bill.profiles.account_number || "No Account"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-amber-900/50 text-amber-300 border-amber-700">
                          Due in {daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""}
                        </Badge>
                        <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
                          {bill.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-400">${bill.balance.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">Balance</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

