import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CashierDashboard } from "@/components/cashier/cashier-dashboard"

export default async function CashierPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login/cashier")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "cashier") {
    redirect("/login/cashier")
  }

  // Get all customers
  const { data: customers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })

  // Get all bills first (without join to avoid RLS issues)
  // Order by billing_month to ensure proper month grouping
  const { data: billsData, error: billsError } = await supabase
    .from("water_bills")
    .select("*")
    .order("billing_month", { ascending: false })
    .order("created_at", { ascending: false })

  // Log error if bills query fails
  if (billsError) {
    console.error("Error fetching bills:", billsError)
  }

  // Debug: Log bills count
  console.log("Bills fetched:", billsData?.length || 0)

  // Get customer IDs from bills
  const customerIds = billsData?.map((b) => b.customer_id).filter(Boolean) || []
  const uniqueCustomerIds = [...new Set(customerIds)]

  // Fetch customer profiles separately
  let customerProfilesMap: Record<string, { full_name: string; account_number: string | null }> = {}
  if (uniqueCustomerIds.length > 0) {
    const { data: customerProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, account_number")
      .in("id", uniqueCustomerIds)

    if (customerProfiles) {
      customerProfiles.forEach((cp) => {
        customerProfilesMap[cp.id] = {
          full_name: cp.full_name,
          account_number: cp.account_number,
        }
      })
    }
  }

  // Combine bills with profile data
  const bills = billsData?.map((bill) => {
    // Check if bill should be marked as overdue
    const dueDate = new Date(bill.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    // Update status to overdue if due date has passed and bill is unpaid/partial
    if (dueDate < today && (bill.status === "unpaid" || bill.status === "partial") && bill.balance > 0) {
      // Update in database (async, don't wait)
      supabase
        .from("water_bills")
        .update({ status: "overdue", updated_at: new Date().toISOString() })
        .eq("id", bill.id)
        .then(() => {
          // Status updated in background
        })
        .catch((err) => {
          console.error("Error updating overdue status:", err)
        })
      
      // Update local status for immediate display
      bill.status = "overdue"
    }
    
    return {
      ...bill,
      profiles: customerProfilesMap[bill.customer_id] || {
        full_name: "Unknown Customer",
        account_number: null,
      },
    }
  }) || []

  // Get all payments (no limit - cashiers need to see all)
  const { data: payments } = await supabase
    .from("payments")
    .select("*, water_bills(billing_period), profiles!payments_customer_id_fkey(full_name)")
    .order("created_at", { ascending: false })

  // Build activity log from bills and payments
  const activities: any[] = []

  // Get unique creator IDs from bills
  const creatorIds = bills?.filter((b) => b.created_by).map((b) => b.created_by) || []
  const uniqueCreatorIds = [...new Set(creatorIds)]
  
  // Batch fetch creator profiles
  const creatorProfiles: Record<string, string> = {}
  if (uniqueCreatorIds.length > 0) {
    const { data: creators } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", uniqueCreatorIds)
    
    if (creators) {
      creators.forEach((c) => {
        creatorProfiles[c.id] = c.full_name
      })
    }
  }

  // Get unique processor IDs from payments
  const processorIds = payments?.filter((p) => p.processed_by).map((p) => p.processed_by) || []
  const uniqueProcessorIds = [...new Set(processorIds)]
  
  // Batch fetch processor profiles
  const processorProfiles: Record<string, string> = {}
  if (uniqueProcessorIds.length > 0) {
    const { data: processors } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", uniqueProcessorIds)
    
    if (processors) {
      processors.forEach((p) => {
        processorProfiles[p.id] = p.full_name
      })
    }
  }

  // Add bill creation activities
  if (bills) {
    for (const bill of bills.slice(0, 30)) {
      const creatorName = bill.created_by ? (creatorProfiles[bill.created_by] || "System") : "System"

      activities.push({
        id: `bill-${bill.id}`,
        type: "bill_created",
        description: `Bill created for ${bill.profiles.full_name}`,
        user_name: creatorName,
        amount: bill.amount_due,
        created_at: bill.created_at,
        metadata: {
          billing_period: bill.billing_period,
          customer_name: bill.profiles.full_name,
        },
      })
    }
  }

  // Add payment activities
  if (payments) {
    for (const payment of payments.slice(0, 30)) {
      const processorName = payment.processed_by
        ? (processorProfiles[payment.processed_by] || "Cashier")
        : (payment.profiles.full_name || "Customer")
      
      activities.push({
        id: `payment-${payment.id}`,
        type: "payment_processed",
        description: `Payment processed for ${payment.profiles.full_name}`,
        user_name: processorName,
        amount: payment.amount,
        created_at: payment.created_at,
        metadata: {
          billing_period: payment.water_bills.billing_period,
          customer_name: payment.profiles.full_name,
          payment_method: payment.payment_method,
        },
      })
    }
  }

  // Sort activities by date (most recent first) and limit to 50
  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const recentActivities = activities.slice(0, 50)

  // Calculate stats
  const totalRevenue = payments?.reduce((sum, p) => (p.payment_status === "completed" ? sum + p.amount : sum), 0) || 0
  const unpaidBills = bills?.filter((b) => b.status === "unpaid" || b.status === "partial") || []
  const totalOutstanding = unpaidBills.reduce((sum, bill) => sum + bill.balance, 0)

  return (
    <CashierDashboard
      profile={profile}
      customers={customers || []}
      bills={bills || []}
      payments={payments || []}
      activities={recentActivities}
      stats={{
        totalRevenue,
        totalOutstanding,
        totalCustomers: customers?.length || 0,
        unpaidBillsCount: unpaidBills.length,
      }}
    />
  )
}
