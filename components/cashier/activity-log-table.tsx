"use client"

import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, User, Calendar, Clock } from "lucide-react"

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

export function ActivityLogTable({ activities }: { activities: Activity[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bill_created":
        return <FileText className="w-4 h-4" />
      case "payment_processed":
        return <DollarSign className="w-4 h-4" />
      case "customer_created":
        return <User className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "bill_created":
        return "bg-blue-900/50 text-blue-300 border-blue-700"
      case "payment_processed":
        return "bg-emerald-900/50 text-emerald-300 border-emerald-700"
      case "customer_created":
        return "bg-purple-900/50 text-purple-300 border-purple-700"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-700"
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No activity found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type).split(" ")[0]}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-white font-semibold mb-1">{activity.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{activity.user_name}</span>
                    </span>
                    {activity.metadata?.customer_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{activity.metadata.customer_name}</span>
                      </span>
                    )}
                    {activity.metadata?.billing_period && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{activity.metadata.billing_period}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  {activity.amount && (
                    <p className="text-base sm:text-lg font-bold text-white mb-1">${activity.amount.toFixed(2)}</p>
                  )}
                  <Badge className={getActivityColor(activity.type)}>{activity.type.replace("_", " ")}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{formatTime(activity.created_at)}</span>
                {activity.metadata?.payment_method && (
                  <>
                    <span>•</span>
                    <span>{activity.metadata.payment_method.replace("_", " ")}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

