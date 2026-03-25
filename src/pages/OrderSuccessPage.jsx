import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function OrderSuccessPage() {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber || '—'
  const orderId = location.state?.orderId
  const invoiceToken = location.state?.invoiceToken
  const downloadedRef = useRef(false)
  const [invoiceError, setInvoiceError] = useState('')

  useEffect(() => {
    if (!orderId || !invoiceToken || downloadedRef.current) return
    downloadedRef.current = true
    setInvoiceError('')
    fetch(`/api/orders/${orderId}/invoice.pdf?token=${encodeURIComponent(invoiceToken)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Invoice download failed')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${orderNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      })
      .catch((e) => setInvoiceError(e.message || 'Invoice download failed'))
  }, [orderId, invoiceToken, orderNumber])

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#D1C7B7] mb-4">
            Thank you
          </h1>
          <p className="text-[#E5E5E5] mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-[#E5E5E5]/90 text-sm mb-8">
            Order number: <span className="font-medium text-[#D1C7B7]">{orderNumber}</span>
          </p>
          {invoiceError && (
            <p className="text-xs text-red-400 mb-4">
              {invoiceError}
            </p>
          )}
          {orderId && invoiceToken && (
            <a
              href={`/api/orders/${orderId}/invoice.pdf?token=${encodeURIComponent(invoiceToken)}`}
              className="inline-block mb-5 text-xs uppercase border border-[#D1C7B7] text-[#D1C7B7] px-4 py-2 hover:bg-[#D1C7B7]/10 transition-colors"
            >
              Download invoice
            </a>
          )}
          <Link
            to="/"
            className="inline-block py-3 px-6 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default OrderSuccessPage
