import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

function PaymentReturnPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [secondsLeft, setSecondsLeft] = useState(6)

  const paymentResult = useMemo(() => {
    const qs = new URLSearchParams(location.search)
    const status = (qs.get('status') || '').toLowerCase()
    const orderId = qs.get('orderId')
    const orderNumber = qs.get('orderNumber')
    const invoiceToken = qs.get('invoiceToken')
    const hash = (qs.get('hash') || '').toLowerCase()
    return { status, orderId, orderNumber, invoiceToken, hash }
  }, [location.search])

  const isSuccess = paymentResult.status === 'success'

  useEffect(() => {
    if (isSuccess) {
      clearCart()
    }
  }, [isSuccess, clearCart])

  useEffect(() => {
    setSecondsLeft(6)
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [location.search])

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/', { replace: true })
    }
  }, [secondsLeft, navigate])

  const title = isSuccess ? 'Payment successful' : 'Payment failed'
  const subtitle = isSuccess
    ? 'Thank you. Your payment was processed successfully.'
    : 'Your payment could not be completed. If money was deducted, it will be auto-reversed as per bank/gateway timelines.'

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="border border-[#E5E5E5]/20 bg-[#0b0b0b] rounded-sm p-6 md:p-8">
            <p className="text-xs uppercase tracking-wide text-[#E5E5E5]/70">Payment status</p>
            <h1 className={`mt-2 text-2xl md:text-3xl font-medium uppercase ${isSuccess ? 'text-[#D1C7B7]' : 'text-red-400'}`}>
              {title}
            </h1>
            <p className="mt-3 text-sm text-[#E5E5E5]/80 leading-relaxed">{subtitle}</p>

            <div className="mt-6 space-y-2 text-sm text-[#E5E5E5]">
              {paymentResult.orderNumber && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#E5E5E5]/70">Order</span>
                  <span className="font-mono">{paymentResult.orderNumber}</span>
                </div>
              )}
              {paymentResult.orderId && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#E5E5E5]/70">Order ID</span>
                  <span className="font-mono">{paymentResult.orderId}</span>
                </div>
              )}
              {paymentResult.hash === 'invalid' && (
                <p className="text-xs text-red-400 mt-2">
                  Warning: gateway hash validation failed. Please contact support with your order id.
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="py-3 px-6 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
              >
                Go to home
              </Link>
              <Link
                to="/track-order"
                className="py-3 px-6 text-sm font-medium tracking-wide uppercase border border-[#E5E5E5]/30 text-[#E5E5E5] hover:border-[#D1C7B7] hover:text-[#D1C7B7] transition-colors"
              >
                Track order
              </Link>
              {isSuccess && paymentResult.orderId && paymentResult.invoiceToken && (
                <a
                  href={`/api/orders/${paymentResult.orderId}/invoice.pdf?token=${encodeURIComponent(paymentResult.invoiceToken)}`}
                  className="py-3 px-6 text-sm font-medium tracking-wide uppercase border border-[#E5E5E5]/30 text-[#E5E5E5] hover:border-[#D1C7B7] hover:text-[#D1C7B7] transition-colors"
                >
                  Download invoice
                </a>
              )}
            </div>

            <p className="mt-6 text-[11px] text-[#E5E5E5]/60">
              Redirecting to home in {secondsLeft}s…
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PaymentReturnPage

