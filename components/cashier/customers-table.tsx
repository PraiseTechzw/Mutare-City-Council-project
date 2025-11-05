"use client"

import { Badge } from "@/components/ui/badge"
import { User, Phone, MapPin, Calendar } from "lucide-react"

type Customer = {
  id: string
  email: string
  full_name: string
  account_number: string | null
  phone_number: string | null
  address: string | null
  created_at: string
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No customers found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <div
          key={customer.id}
          className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">{customer.full_name}</h4>
              <p className="text-sm text-gray-400">{customer.email}</p>
            </div>
            <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
              {customer.account_number || "No Account"}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {customer.phone_number && (
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{customer.phone_number}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{customer.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
