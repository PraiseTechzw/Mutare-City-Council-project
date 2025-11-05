import { Button } from "@/components/ui/button"
import { Droplets, Shield, CreditCard, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Mutare City Council</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Water Services</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                <Link href="/login" className="hidden sm:inline">Customer Login</Link>
                <Link href="/login" className="sm:hidden">Login</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/login/cashier">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cashier</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 text-balance">Pay Your Water Bills Online</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 text-pretty px-2">
            Fast, secure, and convenient water bill payments for Mutare residents. Access your account 24/7 from
            anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 bg-transparent w-full sm:w-auto">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">Why Choose Our Portal?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Easy Payments</h4>
            <p className="text-sm sm:text-base text-gray-600">
              Pay your water bills instantly using multiple payment methods including mobile money and cards.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">View Bills</h4>
            <p className="text-sm sm:text-base text-gray-600">
              Access all your current and past water bills in one place with detailed consumption history.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">24/7 Access</h4>
            <p className="text-sm sm:text-base text-gray-600">Make payments and check your account anytime, anywhere, from any device.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 bg-white/50 rounded-2xl sm:rounded-3xl my-8 sm:my-12">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">How It Works</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {[
            { step: "1", title: "Login", desc: "Sign in with your account credentials" },
            { step: "2", title: "View Bills", desc: "See all your water bills and consumption" },
            { step: "3", title: "Make Payment", desc: "Choose your preferred payment method" },
            { step: "4", title: "Get Receipt", desc: "Receive instant payment confirmation" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                {item.step}
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{item.title}</h4>
              <p className="text-gray-600 text-xs sm:text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2 text-sm sm:text-base">© 2025 Mutare City Council. All rights reserved.</p>
            <p className="text-xs sm:text-sm">
              For support, contact:{" "}
              <a href="mailto:support@mutare.co.zw" className="text-blue-600 hover:text-blue-700 break-all">
                support@mutare.co.zw
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
