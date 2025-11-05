"use client"

import type React from "react"

import { useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer, Receipt as ReceiptIcon, Building2, Calendar, CreditCard } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

type Payment = {
  id: string
  amount: number
  payment_method: string
  payment_status: string
  payment_reference: string | null
  created_at: string
  water_bills: {
    billing_period: string
    amount_due: number
    consumption: number
    previous_reading: number
    current_reading: number
    rate_per_unit: number
  }
}

type Profile = {
  full_name: string
  account_number: string | null
  email: string
  phone_number: string | null
  address: string | null
}

export function ReceiptDialog({
  payment,
  profile,
  open,
  onOpenChange,
}: {
  payment: Payment
  profile: Profile
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    if (!receiptRef.current) return

    // Create a new window for printing/downloading
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("Popup blocked", {
        description: "Please allow popups to download the receipt.",
      })
      return
    }

    const receiptContent = receiptRef.current.innerHTML
    const receiptTitle = `Payment_Receipt_${payment.id.slice(0, 8).toUpperCase()}_${new Date(payment.created_at).toISOString().split("T")[0]}.pdf`
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${receiptTitle}</title>
          <meta charset="utf-8">
          <style>
            @media print {
              @page { 
                margin: 15mm;
                size: A4;
              }
              body { margin: 0; }
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              color: #666;
              margin: 5px 0;
              font-size: 14px;
            }
            .receipt-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .info-section {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
            }
            .info-section h3 {
              color: #2563eb;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
              font-size: 16px;
              font-weight: 600;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              color: #6b7280;
              font-weight: 500;
              font-size: 14px;
            }
            .info-value {
              color: #111827;
              font-weight: 600;
              font-size: 14px;
            }
            .bill-details {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .bill-details h3 {
              color: #2563eb;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
              font-size: 16px;
              font-weight: 600;
            }
            .amount-section {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              padding: 30px;
              border-radius: 12px;
              margin: 30px 0;
              text-align: center;
              border: 2px solid #2563eb;
            }
            .amount-section .label {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 10px;
              font-weight: 500;
            }
            .amount-section .amount {
              font-size: 48px;
              font-weight: bold;
              color: #2563eb;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              background: #10b981;
              color: white;
            }
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 20px 0;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPaymentMethod = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5" />
            Payment Receipt
          </DialogTitle>
          <DialogDescription>View and download your payment receipt</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Content - Printable */}
          <div ref={receiptRef} className="bg-white p-8 rounded-lg border-2 border-gray-200">
            {/* Header */}
            <div className="text-center border-b-2 border-blue-600 pb-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-blue-600">Mutare City Council</h1>
              </div>
              <p className="text-gray-600 font-semibold">Water Services Department</p>
              <p className="text-sm text-gray-500">Payment Receipt</p>
            </div>

            {/* Receipt Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-blue-600 font-semibold border-b pb-2 mb-4">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-semibold text-gray-900">{profile.account_number || "N/A"}</span>
                  </div>
                  {profile.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-900">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold text-gray-900">{profile.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-blue-600 font-semibold border-b pb-2 mb-4">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt Number:</span>
                    <span className="font-semibold text-gray-900">#{payment.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-semibold text-gray-900">{formatDate(payment.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-900">{formatPaymentMethod(payment.payment_method)}</span>
                  </div>
                  {payment.payment_reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-semibold text-gray-900">{payment.payment_reference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      {payment.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div className="border-t pt-6 mb-6">
              <h3 className="text-blue-600 font-semibold border-b pb-2 mb-4">Bill Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Period:</span>
                  <span className="font-semibold text-gray-900">{payment.water_bills.billing_period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous Reading:</span>
                  <span className="font-semibold text-gray-900">{payment.water_bills.previous_reading.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Reading:</span>
                  <span className="font-semibold text-gray-900">{payment.water_bills.current_reading.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consumption:</span>
                  <span className="font-semibold text-gray-900">{payment.water_bills.consumption.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate per Unit:</span>
                  <span className="font-semibold text-gray-900">${payment.water_bills.rate_per_unit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">Bill Amount:</span>
                  <span className="font-bold text-gray-900 text-base">${payment.water_bills.amount_due.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="bg-blue-50 p-6 rounded-lg text-center my-6">
              <p className="text-gray-600 text-sm mb-2">Amount Paid</p>
              <p className="text-4xl font-bold text-blue-600">${payment.amount.toFixed(2)}</p>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-xs text-gray-500">
              <p>This is an official receipt from Mutare City Council</p>
              <p className="mt-2">Receipt ID: {payment.id}</p>
              <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

