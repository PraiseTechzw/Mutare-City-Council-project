import { CashierLoginForm } from "@/components/auth/cashier-login-form"
import { Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CashierLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-2xl mb-4 overflow-hidden bg-white/10 backdrop-blur-sm">
            <Image 
              src="/logo.png" 
              alt="Mutare City Council Logo" 
              width={128} 
              height={128} 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mutare City Council</h1>
          <p className="text-gray-400">Cashier Portal</p>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">Cashier Login</h2>
            <p className="text-sm text-gray-400">Access the administrative dashboard</p>
          </div>

          <CashierLoginForm />

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-gray-400">
              Are you a customer?{" "}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">Authorized personnel only</p>
      </div>
    </div>
  )
}
