import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"

export default async function CustomerPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "customer") {
    redirect("/login")
  }

  // Get bills
  const { data: bills } = await supabase
    .from("water_bills")
    .select("*")
    .eq("customer_id", user.id)
    .order("billing_month", { ascending: false })

  // Get all payments with bill details for receipts
  const { data: payments } = await supabase
    .from("payments")
    .select("*, water_bills(billing_period, amount_due, consumption, previous_reading, current_reading, rate_per_unit)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  return <CustomerDashboard profile={profile} bills={bills || []} recentPayments={payments || []} />
}
