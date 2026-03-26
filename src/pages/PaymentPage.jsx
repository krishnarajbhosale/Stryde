import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { fetchProducts, PRICE_ADD_ON } from '../api/productsApi'
import { createOrder } from '../api/ordersApi'
import { isCustomerLoggedIn, requestCustomerOtp, verifyCustomerOtp } from '../api/customerAuthApi'
import { initiateEasebuzzPayment } from '../api/easebuzzApi'
import { getMyWallet } from '../api/walletApi'

const DISCOUNT_PER_ORDER = 0
// GST disabled for now
const GST_RATE = 0
const SHIPPING_FEE = 100
const COD_CHARGE = 150

/** Easebuzz hosted checkout: /pay/<access_token> — token is alphanumeric, never JS source. */
function isEasebuzzCheckoutRedirectUrl(url) {
  return typeof url === 'string'
    && /^https:\/\/(pay|testpay)\.easebuzz\.in\/pay\/[a-zA-Z0-9_-]{16,128}$/.test(url.trim())
}

const ALL_PAYMENT_OPTIONS = [
  { id: 'cod', label: 'CASH ON DELIVERY' },
  { id: 'upi', label: 'UPI (PAY VIA ANY APP)' },
  { id: 'card', label: 'CREDIT / DEBIT CARD' },
  { id: 'netbanking', label: 'NET BANKING' },
]

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, promo, removeFromCart, clearCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const checkoutForm = location.state?.checkoutForm

  const [authOpen, setAuthOpen] = useState(false)
  const [authStep, setAuthStep] = useState('email')
  const [authEmail, setAuthEmail] = useState(localStorage.getItem('customerEmail') || checkoutForm?.email || '')
  const [authOtp, setAuthOtp] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authDevOtp, setAuthDevOtp] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [walletBalance, setWalletBalance] = useState(0)
  /** Rupees from wallet user asked to apply (capped against balance and pre-wallet total). */
  const [walletUse, setWalletUse] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((data) => { if (!cancelled) setProducts(data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const getProductById = (id) => products.find((p) => String(p.id) === String(id))

  const cartItemsWithProduct = cart.map((item) => ({
    ...item,
    product: getProductById(item.productId),
  })).filter((item) => item.product)
  const hasCustomSize = cart.some((item) => item.customSizeId != null)
  const paymentOptions = hasCustomSize ? ALL_PAYMENT_OPTIONS.filter((o) => o.id !== 'cod') : ALL_PAYMENT_OPTIONS

  const totalQty = cartItemsWithProduct.reduce((s, item) => s + item.quantity, 0)
  const totalMRP = cartItemsWithProduct.reduce(
    (sum, item) => sum + (item.product?.actualPrice ?? 0) * item.quantity,
    0
  )
  const totalMRPStrikethrough = totalMRP + PRICE_ADD_ON * totalQty
  const discount = cartItemsWithProduct.length > 0 ? DISCOUNT_PER_ORDER : 0
  const subtotal = totalMRP - discount
  const promoDiscount = promo?.discountAmount ? Number(promo.discountAmount) : 0
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount)
  const gstAmount = Math.round(discountedSubtotal * GST_RATE)
  const shippingFee = cartItemsWithProduct.length > 0 ? SHIPPING_FEE : 0
  const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0
  const preWalletTotal = discountedSubtotal + gstAmount + shippingFee + codCharge
  const maxWalletUse = isCustomerLoggedIn()
    ? Math.min(Number(walletBalance) || 0, preWalletTotal)
    : 0
  const effectiveWallet = Math.min(Math.max(0, walletUse), maxWalletUse)
  const payableTotal = Math.round((preWalletTotal - effectiveWallet) * 100) / 100

  useEffect(() => {
    setWalletUse((w) => Math.min(Math.max(0, w), maxWalletUse))
  }, [maxWalletUse])

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      setWalletBalance(0)
      return
    }
    let cancelled = false
    getMyWallet()
      .then((d) => {
        if (!cancelled) setWalletBalance(Number(d.balance) || 0)
      })
      .catch(() => {
        if (!cancelled) setWalletBalance(0)
      })
    return () => { cancelled = true }
  }, [authOpen])

  useEffect(() => {
    if (cart.length === 0) navigate('/cart', { replace: true })
  }, [cart.length, navigate])

  useEffect(() => {
    if (!loading && cart.length > 0 && !checkoutForm) {
      navigate('/checkout', { replace: true })
    }
  }, [loading, cart.length, checkoutForm, navigate])

  useEffect(() => {
    if (!isCustomerLoggedIn() && cart.length > 0) {
      setAuthOpen(true)
      setAuthStep('email')
    }
  }, [cart.length])

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')
    try {
      const data = await requestCustomerOtp(authEmail.trim())
      setAuthStep('otp')
      setAuthDevOtp(data.devOtp || '')
      setAuthMessage('A 6-digit code has been sent to your email.')
    } catch (err) {
      setAuthMessage(err.message || 'Failed to send OTP')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')
    try {
      await verifyCustomerOtp(authEmail.trim(), authOtp.trim())
      setAuthOpen(false)
      setAuthOtp('')
      setAuthDevOtp('')
    } catch (err) {
      setAuthMessage(err.message || 'Invalid OTP')
    } finally {
      setAuthLoading(false)
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!isCustomerLoggedIn()) {
      setAuthOpen(true)
      setAuthStep('email')
      return
    }
    if (!paymentMethod || cartItemsWithProduct.length === 0 || !checkoutForm) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const customerName = [checkoutForm.firstName, checkoutForm.lastName].filter(Boolean).join(' ') || 'Customer'
      const payload = {
        customerEmail: String(checkoutForm.email || 'guest@strydeeva.com').trim(),
        customerMobile: String(checkoutForm.mobile || '').trim(),
        customerName: String(customerName).trim(),
        shippingAddress: String(checkoutForm.address || '').trim(),
        city: String(checkoutForm.city || '').trim(),
        pinCode: String(checkoutForm.pinCode || '').trim(),
        promoCode: promo?.code || '',
        promoDiscount: Number(promoDiscount || 0),
        shippingFee: Number(shippingFee || 0),
        codCharge: Number(codCharge || 0),
        gstAmount: Number(gstAmount || 0),
        walletDiscount: Number(effectiveWallet.toFixed(2)),
        totalAmount: Number(payableTotal.toFixed(2)),
        items: cartItemsWithProduct.map((item) => {
          const obj = {
            productId: Number(item.productId),
            productName: String(item.product?.name || '').trim(),
            sizeName: String(item.size || '').trim(),
            quantity: Math.max(1, Number(item.quantity)),
            unitPrice: Number(item.product?.actualPrice) || 0,
          }
          if (item.customSizeId != null) obj.customSizeId = Number(item.customSizeId)
          return obj
        }),
      }

      const finishConfirmedOrder = async (order) => {
        if (order?.id && order?.invoiceToken) {
          try {
            const res = await fetch(`/api/orders/${order.id}/invoice.pdf?token=${encodeURIComponent(order.invoiceToken)}`)
            if (res.ok) {
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `invoice-${order.orderNumber || order.id}.pdf`
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            }
          } catch {
            // ignore invoice download errors here; user can download again on success page
          }
        }
        clearCart()
        navigate('/order-success', { state: { orderNumber: order.orderNumber, orderId: order.id, invoiceToken: order.invoiceToken } })
      }

      // Fully covered by wallet: confirm via same path as COD (no gateway amount).
      if (payableTotal <= 0 && effectiveWallet > 0) {
        const order = await createOrder(payload)
        await finishConfirmedOrder(order)
        return
      }

      if (paymentMethod === 'cod') {
        const order = await createOrder(payload)
        await finishConfirmedOrder(order)
        return
      }

      // Online payment: backend S2S initiate → Easebuzz returns access key → open hosted checkout
      const init = await initiateEasebuzzPayment(payload, paymentMethod)
      const redirectUrl = init.redirectUrl
      if (redirectUrl && isEasebuzzCheckoutRedirectUrl(redirectUrl)) {
        window.location.assign(redirectUrl)
        return
      }
      if (redirectUrl) {
        throw new Error('Invalid payment redirect URL from server. Deploy the latest backend and try again.')
      }
      // Legacy: form POST to initiateLink (older docs)
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = init.paymentUrl
      const fields = init.fields || {}
      Object.keys(fields).forEach((k) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = k
        input.value = String(fields[k] ?? '')
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      setSubmitError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) return null

  const OrderSummaryBlock = () => (
    <>
      <h2 className="text-sm font-medium tracking-wide uppercase text-[#E5E5E5] mb-4">
        RETURN TO BAG
      </h2>
      <div className="space-y-0">
        {cartItemsWithProduct.map((item, index) => {
          const p = item.product
          return (
            <div key={`${item.productId}-${item.size}-${index}`}>
              <div className="flex gap-3 md:gap-4 items-start py-4 md:py-5 relative">
                <div className="w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 overflow-hidden bg-neutral-800 rounded-sm">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-sm font-medium text-[#E5E5E5] uppercase">{p.name}</p>
                  <p className="text-xs text-[#E5E5E5]/70 uppercase mt-0.5">{p.brand}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs uppercase bg-[#E8E4DF] text-[#333] px-2.5 py-1.5 rounded-sm">
                      SIZE: {item.size}
                    </span>
                    <span className="text-xs uppercase bg-[#E8E4DF] text-[#333] px-2.5 py-1.5 rounded-sm">
                      QTY: {item.quantity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#E5E5E5] mt-2">
                    {p.priceStrikethrough && <span className="line-through text-[#E5E5E5]/60 mr-2">{p.priceStrikethrough}</span>}
                    <span>{p.price}</span>
                  </p>
                  <p className="text-[10px] text-[#E5E5E5]/70 uppercase mt-0.5">
                    7 DAYS RETURN AVAILABLE
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(index)}
                  className="absolute top-0 right-0 text-[#E5E5E5] hover:opacity-80 p-1"
                  aria-label="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {index < cartItemsWithProduct.length - 1 && (
                <div className="h-px bg-[#E5E5E5]/30 w-full" />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs uppercase tracking-wide text-[#E5E5E5] mt-6 mb-2">
        PRICE DETAILS :
      </p>
      <div className="space-y-2 text-sm text-[#E5E5E5]">
        <div className="flex justify-between">
          <span>MRP</span>
          <span className="line-through text-[#E5E5E5]/70">₹{totalMRPStrikethrough.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Price</span>
          <span>₹{totalMRP.toLocaleString('en-IN')}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>DISCOUNT ON MRP</span>
            <span>- ₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        {promoDiscount > 0 && promo?.code && (
          <div className="flex justify-between">
            <span>PROMO ({promo.code})</span>
            <span>- ₹{Number(promoDiscount).toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shippingFee.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>COD Charges</span>
          <span>{codCharge ? `₹${codCharge.toLocaleString('en-IN')}` : '—'}</span>
        </div>
        {isCustomerLoggedIn() && maxWalletUse > 0 && (
          <div className="pt-3 mt-3 border-t border-[#E5E5E5]/15 space-y-2">
            <div className="flex justify-between text-xs uppercase tracking-wide text-[#E5E5E5]/80">
              <span>Wallet balance</span>
              <span>₹{Number(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="wallet-use" className="text-xs uppercase tracking-wide text-[#E5E5E5]/80 sr-only">
                Use from wallet (₹)
              </label>
              <input
                id="wallet-use"
                type="number"
                min={0}
                max={maxWalletUse}
                step={1}
                value={walletUse === 0 ? '' : walletUse}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === '') {
                    setWalletUse(0)
                    return
                  }
                  const n = Number(raw)
                  if (Number.isNaN(n)) return
                  setWalletUse(Math.min(Math.max(0, n), maxWalletUse))
                }}
                placeholder="0"
                className="w-28 bg-transparent border border-[#E5E5E5]/30 text-[#E5E5E5] text-sm px-2 py-1.5 rounded-sm"
              />
              <button
                type="button"
                onClick={() => setWalletUse(maxWalletUse)}
                className="text-xs uppercase tracking-wide text-[#D1C7B7] hover:opacity-90"
              >
                Use max
              </button>
            </div>
            <p className="text-[10px] text-[#E5E5E5]/55">Up to ₹{maxWalletUse.toLocaleString('en-IN')} can be applied to this order.</p>
          </div>
        )}
        {effectiveWallet > 0 && (
          <div className="flex justify-between pt-2">
            <span>Wallet</span>
            <span>- ₹{effectiveWallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>
      <div className="h-px bg-[#E5E5E5]/20 my-4" />
      <div className="flex justify-between text-base font-medium text-[#E5E5E5] mb-4">
        <span>TOTAL AMOUNT</span>
        <span>₹{payableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <p className="text-[10px] text-[#E5E5E5]/70 leading-relaxed">
        BY PLACING THE ORDER, YOU AGREE TO STRYDEEVA&apos;S TERMS OF USE AND PRIVACY POLICY.
      </p>
    </>
  )

  const PaymentOptions = () => (
    <>
      <h2 className="text-sm font-medium tracking-wide uppercase text-[#E5E5E5] mb-4">
        CHOOSE PAYMENT METHOD
      </h2>
      <div className="space-y-4">
        {paymentOptions.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span className="relative flex-shrink-0">
              <input
                type="radio"
                name="paymentMethod"
                value={opt.id}
                checked={paymentMethod === opt.id}
                onChange={() => setPaymentMethod(opt.id)}
                className="sr-only peer"
                aria-label={opt.label}
              />
              <span
                className="block w-4 h-4 rounded border-2 border-[#E5E5E5]/70 bg-transparent peer-focus:ring-2 peer-focus:ring-[#D1C7B7]/50 peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/20 flex items-center justify-center"
                aria-hidden
              >
                <span className="w-2 h-2 rounded-sm bg-[#D4AF37] opacity-0 peer-checked:opacity-100 transition-opacity" />
              </span>
            </span>
            <span className="text-xs md:text-sm text-[#E5E5E5] uppercase tracking-wide group-hover:text-[#D1C7B7] transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h1 className="font-cormorant font-medium text-2xl md:text-3xl uppercase text-[#E5E5E5] mb-1">
            CHECKOUT VARIANT
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5] mb-8 md:mb-10">
            <span className="text-[#E5E5E5]/50">INFORMATION</span>
            <span className="text-[#E5E5E5]/50 mx-2">&gt;</span>
            <span className="font-medium text-[#E5E5E5]">PAYMENT</span>
          </p>

          {submitError && (
            <p className="text-red-400 text-sm mb-4">{submitError}</p>
          )}

          {/* Mobile: single column — payment options, then order summary, then button */}
          <div className="block lg:hidden">
            <form onSubmit={handlePlaceOrder}>
              <section className="mb-8">
                <PaymentOptions />
              </section>

              <div className="border-t border-[#E5E5E5]/20 pt-6">
                <OrderSummaryBlock />
              </div>

              <button
                type="submit"
                disabled={!paymentMethod || submitting}
                className="w-full mt-8 py-3.5 px-4 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'PLACING ORDER…' : 'PLACE YOUR ORDER'}
              </button>
            </form>
          </div>

          {/* Laptop: two columns — left: payment + actions; right: order summary */}
          <form onSubmit={handlePlaceOrder} className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">
            <div>
              <section className="mb-8">
                <PaymentOptions />
              </section>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]/20">
                <Link
                  to="/checkout"
                  className="text-sm font-medium tracking-wide uppercase text-[#E5E5E5] hover:text-[#D1C7B7] transition-colors"
                >
                  RETURN TO BAG
                </Link>
                <button
                  type="submit"
                  disabled={!paymentMethod || submitting}
                  className="py-3 px-8 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'PLACING ORDER…' : 'PLACE YOUR ORDER'}
                </button>
              </div>
            </div>

            <div className="lg:border-l lg:border-[#E5E5E5]/20 lg:pl-8 lg:sticky lg:top-24">
              <OrderSummaryBlock />
            </div>
          </form>
        </div>
      </div>
      <Footer />

      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-[#111] border border-[#E5E5E5]/30 rounded shadow-xl">
            <div className="px-4 py-3 border-b border-[#E5E5E5]/20 flex items-center justify-between">
              <p className="text-sm uppercase tracking-wide text-[#E5E5E5]">Sign in to place order</p>
              <button
                type="button"
                onClick={() => setAuthOpen(false)}
                className="text-[#E5E5E5] text-lg leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-[#E5E5E5]/70 mb-4">
                Please sign in with your email to place an order. This ensures your orders, wallet and returns are linked to your account.
              </p>

              {authStep === 'email' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide"
                    required
                  />
                  {authMessage && <p className="text-xs text-[#E5E5E5]/80">{authMessage}</p>}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60"
                  >
                    {authLoading ? 'Sending…' : 'Send 6-digit code'}
                  </button>
                </form>
              )}

              {authStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input
                    type="text"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide"
                    required
                  />
                  {authMessage && <p className="text-xs text-[#E5E5E5]/80">{authMessage}</p>}
                  {authDevOtp && (
                    <p className="text-xs text-[#D1C7B7]/90">
                      Dev code: <span className="font-mono">{authDevOtp}</span>
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex-1 py-3 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60"
                    >
                      {authLoading ? 'Verifying…' : 'Verify'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthStep('email'); setAuthOtp(''); setAuthMessage('') }}
                      className="flex-1 py-3 text-sm font-medium tracking-wide uppercase border border-[#D1C7B7] text-[#D1C7B7]"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PaymentPage

