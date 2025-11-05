import { Button } from "@/components/ui/button"
import { Droplets, Shield, CreditCard, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mutare City Council</h1>
              <p className="text-xs text-gray-600">Water Services</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Customer Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login/cashier">
                <Shield className="w-4 h-4 mr-2" />
                Cashier Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 text-balance">Pay Your Water Bills Online</h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty">
            Fast, secure, and convenient water bill payments for Mutare residents. Access your account 24/7 from
            anywhere.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Our Portal?</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Easy Payments</h4>
            <p className="text-gray-600">
              Pay your water bills instantly using multiple payment methods including mobile money and cards.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">View Bills</h4>
            <p className="text-gray-600">
              Access all your current and past water bills in one place with detailed consumption history.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">24/7 Access</h4>
            <p className="text-gray-600">Make payments and check your account anytime, anywhere, from any device.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-white/50 rounded-3xl my-12">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { step: "1", title: "Login", desc: "Sign in with your account credentials" },
            { step: "2", title: "View Bills", desc: "See all your water bills and consumption" },
            { step: "3", title: "Make Payment", desc: "Choose your preferred payment method" },
            { step: "4", title: "Get Receipt", desc: "Receive instant payment confirmation" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2025 Mutare City Council. All rights reserved.</p>
            <p className="text-sm">
              For support, contact:{" "}
              <a href="mailto:support@mutare.co.zw" className="text-blue-600 hover:text-blue-700">
                support@mutare.co.zw
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
