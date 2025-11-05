"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Droplets, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

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

export function BillsTable({ bills }: { bills: Bill[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-900/50 text-emerald-300 border-emerald-700"
      case "unpaid":
        return "bg-red-900/50 text-red-300 border-red-700"
      case "partial":
        return "bg-amber-900/50 text-amber-300 border-amber-700"
      case "overdue":
        return "bg-rose-900/50 text-rose-300 border-rose-700"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-700"
    }
  }

  // Group bills by month
  const billsByMonth = useMemo(() => {
    const grouped: Record<string, Bill[]> = {}
    
    bills.forEach((bill) => {
      const billDate = new Date(bill.billing_month)
      const monthKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = billDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(bill)
    })

    // Sort months descending (newest first)
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
  }, [bills])

  // Get unique months for filter dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    bills.forEach((bill) => {
      const billDate = new Date(bill.billing_month)
      const monthKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = billDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      months.add(`${monthKey}|${monthLabel}`)
    })
    return Array.from(months).sort().reverse()
  }, [bills])

  // Filter bills based on selected month
  const filteredBillsByMonth = useMemo(() => {
    if (selectedMonth === "all") {
      return billsByMonth
    }
    
    const [monthKey] = selectedMonth.split("|")
    return billsByMonth.filter(([key]) => key === monthKey)
  }, [billsByMonth, selectedMonth])

  // Calculate monthly totals
  const calculateMonthTotals = (monthBills: Bill[]) => {
    return {
      totalBills: monthBills.length,
      totalAmountDue: monthBills.reduce((sum, b) => sum + b.amount_due, 0),
      totalPaid: monthBills.reduce((sum, b) => sum + b.amount_paid, 0),
      totalBalance: monthBills.reduce((sum, b) => sum + b.balance, 0),
      paidCount: monthBills.filter((b) => b.status === "paid").length,
      unpaidCount: monthBills.filter((b) => b.status === "unpaid" || b.status === "partial").length,
    }
  }

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey)
    } else {
      newExpanded.add(monthKey)
    }
    setExpandedMonths(newExpanded)
  }

  if (bills.length === 0) {
    return (
      <div className="text-center py-12">
        <Droplets className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No bills found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs sm:text-sm text-gray-400">Filter by Month:</span>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-[200px] bg-slate-900 border-slate-700 text-white">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {availableMonths.map((month) => {
              const [, label] = month.split("|")
              return (
                <SelectItem key={month} value={month}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Bills grouped by month */}
      {filteredBillsByMonth.map(([monthKey, monthBills]) => {
        const [year, month] = monthKey.split("-")
        const monthLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
        const isExpanded = expandedMonths.has(monthKey) || expandedMonths.size === 0
        const totals = calculateMonthTotals(monthBills)

        return (
          <Card key={monthKey} className="bg-slate-900 border-slate-700">
            {/* Month Header */}
            <div
              className="p-3 sm:p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => toggleMonth(monthKey)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-white">{monthLabel}</h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {totals.totalBills} bill{totals.totalBills !== 1 ? "s" : ""} • {totals.paidCount} paid • {totals.unpaidCount} unpaid
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-400">Total Due</p>
                      <p className="font-semibold text-white text-xs sm:text-sm">${totals.totalAmountDue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Paid</p>
                      <p className="font-semibold text-emerald-400 text-xs sm:text-sm">${totals.totalPaid.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Balance</p>
                      <p className="font-semibold text-red-400 text-xs sm:text-sm">${totals.totalBalance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Month Bills */}
            {isExpanded && (
              <div className="border-t border-slate-700 p-3 sm:p-4 space-y-3">
                {monthBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">{bill.profiles.full_name}</h4>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {bill.billing_period} • {bill.profiles.account_number || "No Account"}
                        </p>
                      </div>
                      <Badge className={getStatusColor(bill.status)}>{bill.status.toUpperCase()}</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Consumption</p>
                        <p className="font-semibold text-white">{bill.consumption.toFixed(2)} m³</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Amount Due</p>
                        <p className="font-semibold text-white">${bill.amount_due.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Paid</p>
                        <p className="font-semibold text-emerald-400">${bill.amount_paid.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Balance</p>
                        <p className="font-semibold text-red-400">${bill.balance.toFixed(2)}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-gray-500 mb-1">Due Date</p>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="text-xs">{new Date(bill.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
