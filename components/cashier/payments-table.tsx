"use client"

import { Badge } from "@/components/ui/badge"
import { Receipt, CreditCard } from "lucide-react"

type Payment = {
  id: string
  amount: number
  payment_method: string
  payment_status: string
  payment_reference: string | null
  created_at: string
  water_bills: {
    billing_period: string
  }
  profiles: {
    full_name: string
  }
}

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-900/50 text-emerald-300 border-emerald-700"
      case "pending":
        return "bg-amber-900/50 text-amber-300 border-amber-700"
      case "failed":
        return "bg-red-900/50 text-red-300 border-red-700"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-700"
    }
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No payments found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-white mb-1 truncate">{payment.profiles.full_name}</h4>
                <p className="text-xs sm:text-sm text-gray-400">
                  {payment.water_bills.billing_period} • {payment.payment_method.replace("_", " ")}
                </p>
                {payment.payment_reference && (
                  <p className="text-xs text-gray-500 mt-1 truncate">Ref: {payment.payment_reference}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-2">
              <p className="text-lg sm:text-xl font-bold text-white">${payment.amount.toFixed(2)}</p>
              <div className="flex flex-col sm:flex-col items-end gap-2">
                <Badge className={getStatusColor(payment.payment_status)}>{payment.payment_status}</Badge>
                <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
