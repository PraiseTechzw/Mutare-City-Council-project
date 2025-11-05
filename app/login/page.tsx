import { CustomerLoginForm } from "@/components/auth/customer-login-form"
import { Droplets } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mutare City Council</h1>
          <p className="text-gray-600">Water Bill Payment Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Customer Login</h2>
            <p className="text-sm text-gray-600">Sign in to view and pay your water bills</p>
          </div>

          <CustomerLoginForm />

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Are you a cashier?{" "}
              <Link href="/login/cashier" className="text-blue-600 hover:text-blue-700 font-medium">
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-4">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact support at{" "}
          <a href="mailto:support@mutare.co.zw" className="text-blue-600 hover:text-blue-700">
            support@mutare.co.zw
          </a>
        </p>
      </div>
    </div>
  )
}
