"use client"

import { Button } from "@/components/ui/button"
import { 
  Droplets, 
  Shield, 
  CreditCard, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Zap,
  Lock,
  Smartphone,
  ArrowRight,
  Menu,
  X,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [activeSection, setActiveSection] = useState<string>("")
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Calculate scroll progress
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(Math.min(100, Math.max(0, progress)))
      
      // Check which sections are visible and determine active section
      const newVisibleSections = new Set<string>()
      let currentActive = ""
      
      // Check sections in order
      const sectionOrder = ['features', 'how-it-works', 'cta']
      
      sectionOrder.forEach((key) => {
        const element = sectionRefs.current[key]
        if (element) {
          const rect = element.getBoundingClientRect()
          const isVisible = rect.top < window.innerHeight * 0.6 && rect.bottom > 0
          if (isVisible) {
            newVisibleSections.add(key)
            // Set active section based on which is most centered
            if (rect.top <= window.innerHeight * 0.3 && rect.top >= 0) {
              currentActive = key
            }
          }
        }
      })
      
      // If no section is centered, use the first visible one
      if (!currentActive && newVisibleSections.size > 0) {
        currentActive = Array.from(newVisibleSections)[0]
      }
      
      setVisibleSections(newVisibleSections)
      setActiveSection(currentActive)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200/30'
      }`}>
        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 transition-all duration-300" style={{ width: `${scrollProgress}%` }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-all duration-300 group-hover:scale-125"></div>
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-blue-500/40 overflow-hidden">
                  <Image 
                    src="/logo.png" 
                    alt="Mutare City Council Logo" 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-contain transition-transform group-hover:scale-110 group-hover:rotate-12"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
                  Mutare City Council
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block group-hover:text-blue-600 transition-colors duration-300">Water Services</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {[
                { id: 'features', label: 'Features' },
                { id: 'how-it-works', label: 'How It Works' },
                { id: 'cta', label: 'Get Started' },
              ].map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative group overflow-hidden ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50 scale-105' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {/* Background glow effect */}
                    <span className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-100' : ''}`}></span>
                    
                    {/* Animated underline */}
                    <span 
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
                      style={{ width: isActive ? '100%' : '0%' }}
                    ></span>
                    {/* Hover underline - only show when not active */}
                    {!isActive && (
                      <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 w-0 group-hover:w-full transition-all duration-300"></span>
                    )}
                    
                    {/* Text with slide animation */}
                    <span className="relative z-10 flex items-center gap-2">
                      {item.label}
                      {isActive && (
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                      )}
                    </span>
                    
                    {/* Ripple effect on click */}
                    <span className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-active:opacity-20 group-active:scale-150 transition-all duration-500"></span>
                  </button>
                )
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="hidden md:inline-flex hover:bg-blue-50 transition-all duration-300 hover:scale-105 group relative overflow-hidden"
              >
                <Link href="/signup" className="relative z-10">
                  Sign Up
                  <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></span>
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-md group relative overflow-hidden"
              >
                <Link href="/login" className="relative z-10">
                  <span className="hidden sm:inline">Customer Login</span>
                  <span className="sm:hidden">Login</span>
                  <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></span>
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="hidden sm:inline-flex border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-md group relative overflow-hidden"
              >
                <Link href="/login/cashier" className="relative z-10 flex items-center">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="hidden sm:inline">Cashier</span>
                  <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></span>
                </Link>
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 relative overflow-hidden group"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="relative z-10 transition-transform duration-300 group-hover:rotate-90">
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </div>
                <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 rounded-md transition-opacity duration-300"></span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <nav className="flex flex-col gap-2 pb-4 border-t border-gray-200/50 mt-4 pt-4">
              {[
                { id: 'features', label: 'Features', icon: null },
                { id: 'how-it-works', label: 'How It Works', icon: null },
                { id: 'cta', label: 'Get Started', icon: ArrowRight },
              ].map((item, idx) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-300 relative group overflow-hidden ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 scale-[1.02] shadow-sm'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    style={{ 
                      animationDelay: `${idx * 50}ms`,
                      animation: isMobileMenuOpen ? 'slideInRight 0.3s ease-out forwards' : 'none'
                    }}
                  >
                    {/* Background gradient on hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-600"></span>
                    )}
                    
                    {/* Content */}
                    <span className="relative z-10 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {item.label}
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                        )}
                      </span>
                      {item.icon && (
                        <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                      )}
                    </span>
                    
                    {/* Ripple effect */}
                    <span className="absolute inset-0 bg-blue-600 rounded-lg opacity-0 group-active:opacity-10 group-active:scale-150 transition-all duration-500"></span>
                  </button>
                )
              })}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-200/50">
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start hover:bg-blue-50 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                  style={{ animationDelay: '150ms' }}
                >
                  <Link href="/signup" className="relative z-10 flex items-center gap-2">
                    Sign Up
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="justify-start border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                  style={{ animationDelay: '200ms' }}
                >
                  <Link href="/login/cashier" className="relative z-10 flex items-center gap-2">
                    <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    Cashier Login
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32 text-center">
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-6 sm:mb-8 border border-blue-200/50 animate-float hover:scale-105 transition-transform duration-300">
            <Zap className="w-4 h-4 animate-pulse" />
            <span>Fast & Secure Payment Portal</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 text-balance leading-tight">
            Pay Your Water Bills{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Online
            </span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 text-pretty px-2 max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and convenient water bill payments for Mutare residents. Access your account 24/7 from anywhere with our modern, user-friendly portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 group"
            >
              <Link href="/login" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 w-full sm:w-auto bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/80 transition-all duration-300 hover:scale-105"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={(el) => { sectionRefs.current['stats'] = el }}
        className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-16"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {[
            { icon: Users, value: "10K+", label: "Active Users", bgColor: "bg-blue-100", textColor: "text-blue-600" },
            { icon: TrendingUp, value: "99.9%", label: "Uptime", bgColor: "bg-emerald-100", textColor: "text-emerald-600" },
            { icon: Zap, value: "< 2s", label: "Payment Speed", bgColor: "bg-purple-100", textColor: "text-purple-600" },
            { icon: Lock, value: "100%", label: "Secure", bgColor: "bg-cyan-100", textColor: "text-cyan-600" },
          ].map((stat, idx) => (
            <div 
              key={idx}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:rotate-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                <stat.icon className={`w-6 h-7 sm:w-7 sm:h-8 ${stat.textColor} group-hover:scale-125 transition-transform duration-500`} />
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        ref={(el) => { sectionRefs.current['features'] = el }}
        className={`relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 transition-all duration-1000 ${
          visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Portal?
            </span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of water bill management with our comprehensive platform
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: CreditCard,
              title: "Easy Payments",
              description: "Pay your water bills instantly using multiple payment methods including mobile money and cards. Secure transactions guaranteed.",
              color: "blue",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              icon: FileText,
              title: "View Bills",
              description: "Access all your current and past water bills in one place with detailed consumption history and analytics.",
              color: "emerald",
              gradient: "from-emerald-500 to-emerald-600"
            },
            {
              icon: Clock,
              title: "24/7 Access",
              description: "Make payments and check your account anytime, anywhere, from any device. Never miss a payment deadline.",
              color: "purple",
              gradient: "from-purple-500 to-purple-600"
            },
            {
              icon: Smartphone,
              title: "Mobile Friendly",
              description: "Fully responsive design that works seamlessly on all devices - desktop, tablet, and mobile.",
              color: "cyan",
              gradient: "from-cyan-500 to-cyan-600"
            },
            {
              icon: Lock,
              title: "Bank-Level Security",
              description: "Your data and payments are protected with industry-leading encryption and security protocols.",
              color: "indigo",
              gradient: "from-indigo-500 to-indigo-600"
            },
            {
              icon: CheckCircle2,
              title: "Instant Receipts",
              description: "Receive immediate payment confirmation and downloadable receipts via email after every transaction.",
              color: "green",
              gradient: "from-green-500 to-green-600"
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-700 hover:-translate-y-3 hover:scale-105"
              style={{ 
                transitionDelay: `${(idx % 3) * 100}ms`,
                animation: visibleSections.has('features') ? 'fadeInUp 0.8s ease-out forwards' : 'none',
                animationDelay: `${(idx % 3) * 150}ms`,
                opacity: visibleSections.has('features') ? 1 : 0,
                transform: visibleSections.has('features') ? 'translateY(0)' : 'translateY(30px)'
              }}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section 
        id="how-it-works" 
        ref={(el) => { sectionRefs.current['how-it-works'] = el }}
        className={`relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 transition-all duration-1000 ${
          visibleSections.has('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50 rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 lg:p-16 border border-blue-100/50 shadow-xl">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Works
              </span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to manage your water bills efficiently
            </p>
          </div>
          
          {/* Animated Flow Container */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { step: "1", title: "Login", desc: "Sign in with your account credentials", icon: Shield },
                { step: "2", title: "View Bills", desc: "See all your water bills and consumption", icon: FileText },
                { step: "3", title: "Make Payment", desc: "Choose your preferred payment method", icon: CreditCard },
                { step: "4", title: "Get Receipt", desc: "Receive instant payment confirmation", icon: CheckCircle2 },
              ].map((item, idx) => (
                <div key={item.step} className="relative">
                  {/* Animated Connecting Arrow/Line - Desktop Only */}
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-[40px] left-full w-full h-0 z-0" style={{ transform: 'translateX(1rem)' }}>
                      {/* Animated Line */}
                      <div className="relative w-full h-0.5 bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-200 overflow-hidden">
                        {/* Animated Progress Bar */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-600 animate-flow-progress"
                          style={{ 
                            width: '100%',
                            animationDelay: `${idx * 0.8}s`,
                            animationDuration: '2s',
                            animationIterationCount: 'infinite'
                          }}
                        ></div>
                        {/* Moving Dot */}
                        <div 
                          className="absolute top-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-lg animate-flow-dot"
                          style={{ 
                            animationDelay: `${idx * 0.8}s`,
                            animationDuration: '2s',
                            animationIterationCount: 'infinite'
                          }}
                        ></div>
                      </div>
                      {/* Arrow Head */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-cyan-500 animate-pulse"></div>
                    </div>
                  )}

                  {/* Step Card */}
                  <div 
                    className="text-center group relative z-10"
                    style={{ 
                      transitionDelay: `${idx * 200}ms`,
                      opacity: visibleSections.has('how-it-works') ? 1 : 0,
                      transform: visibleSections.has('how-it-works') ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
                      animation: visibleSections.has('how-it-works') ? `stepPulse ${2 + idx * 0.5}s ease-in-out infinite` : 'none'
                    }}
                  >
                    <div className="relative mb-6 inline-block">
                      {/* Pulsing Ring Animation */}
                      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping-slow"></div>
                      
                      {/* Main Step Circle */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 animate-step-bounce">
                        {item.step}
                        {/* Success Checkmark Animation on Last Step */}
                        {idx === 3 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce-in" />
                          </div>
                        )}
                      </div>
                      
                      {/* Icon Badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-icon-float">
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:text-cyan-600 transition-colors" />
                      </div>
                    </div>
                    
                    {/* Title with Slide Animation */}
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-105">
                      {item.title}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.desc}</p>
                    
                    {/* Progress Indicator Line */}
                    <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-progress-fill"
                        style={{ 
                          animationDelay: `${idx * 0.3}s`,
                          animationDuration: '1.5s'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        id="cta" 
        ref={(el) => { sectionRefs.current['cta'] = el }}
        className={`relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 transition-all duration-1000 ${
          visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl shadow-blue-500/25 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-lg sm:text-xl text-blue-50 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Join thousands of Mutare residents who are already managing their water bills online. Sign up today and experience the convenience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-transparent border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Link href="/login">Login to Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200/50 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 backdrop-blur-sm mt-12 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 hover:scale-110 transition-transform duration-300 overflow-hidden">
                  <Image 
                    src="/logo.png" 
                    alt="Mutare City Council Logo" 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Mutare City Council</h4>
                  <p className="text-sm text-gray-600">Water Services</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Modern water bill management for Mutare residents. Pay your bills online with ease and convenience.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                  <Facebook className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                  <Twitter className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                  <Instagram className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                  <Linkedin className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Links</h5>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    How It Works
                  </button>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Customer Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h5>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <HelpCircle className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="mailto:support@mutare.co.zw" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <Mail className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    support@mutare.co.zw
                  </a>
                </li>
                <li>
                  <a href="tel:+263123456789" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <Phone className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    +263 123 456 789
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group">
                    <MapPin className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    Mutare, Zimbabwe
                  </a>
                </li>
              </ul>
            </div>

            {/* Get Started */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Get Started</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join thousands of residents managing their water bills online. Sign up today!
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105">
                  <Link href="/signup" className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 sm:pt-12 border-t border-gray-200/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 text-center sm:text-left">
                © 2025 Mutare City Council. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-600">
                <a href="#" className="hover:text-blue-600 transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-200">Terms of Service</a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
