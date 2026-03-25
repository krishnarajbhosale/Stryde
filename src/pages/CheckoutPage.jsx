import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { fetchProducts, PRICE_ADD_ON } from '../api/productsApi'
import { isCustomerLoggedIn, requestCustomerOtp, verifyCustomerOtp } from '../api/customerAuthApi'

const DISCOUNT_PER_ORDER = 0
const GST_RATE = 0.12
const SHIPPING_FEE = 200

const inputUnderline =
  'w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide'

function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, promo, removeFromCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [authStep, setAuthStep] = useState('email')
  const [authEmail, setAuthEmail] = useState(localStorage.getItem('customerEmail') || '')
  const [authOtp, setAuthOtp] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authDevOtp, setAuthDevOtp] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [pendingProceed, setPendingProceed] = useState(false)
  const [form, setForm] = useState({
    email: '',
    mobile: '',
    gstNumber: '',
    keepUpdated: false,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    pinCode: '',
  })

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
  const totalAmount = discountedSubtotal + gstAmount + shippingFee

  useEffect(() => {
    if (cart.length === 0) navigate('/cart', { replace: true })
  }, [cart.length, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

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

  const proceedToPayment = () => {
    // Keep checkout email in sync with signed-in email
    const signedInEmail = localStorage.getItem('customerEmail') || authEmail
    const nextForm = { ...form, email: String(signedInEmail || form.email || '').trim() }
    setForm(nextForm)
    navigate('/checkout/payment', { state: { checkoutForm: nextForm } })
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
      if (pendingProceed) {
        setPendingProceed(false)
        proceedToPayment()
      }
    } catch (err) {
      setAuthMessage(err.message || 'Invalid OTP')
    } finally {
      setAuthLoading(false)
    }
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault()
    if (!isCustomerLoggedIn()) {
      setPendingProceed(true)
      setAuthOpen(true)
      setAuthStep('email')
      return
    }
    proceedToPayment()
  }

  if (cart.length === 0 && cartItemsWithProduct.length === 0) return null

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
          <span>GST (12%)</span>
          <span>₹{gstAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shippingFee.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="h-px bg-[#E5E5E5]/20 my-4" />
      <div className="flex justify-between text-base font-medium text-[#E5E5E5] mb-4">
        <span>TOTAL AMOUNT</span>
        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
      </div>
      <p className="text-[10px] text-[#E5E5E5]/70 leading-relaxed">
        BY PLACING THE ORDER, YOU AGREE TO STRYDEEVA&apos;S TERMS OF USE AND PRIVACY POLICY.
      </p>
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
            <span className="font-medium text-[#E5E5E5]">INFORMATION</span>
            <span className="text-[#E5E5E5]/50 mx-2">&gt;</span>
            <span className="text-[#E5E5E5]/50">PAYMENT</span>
          </p>

          {/* Mobile: single column — forms first, then RETURN TO BAG + products + price + disclaimer + button */}
          <div className="block lg:hidden">
            <form onSubmit={handlePlaceOrder}>
              <section className="mb-8">
                <h2 className="text-xs md:text-sm font-medium tracking-wide uppercase text-[#E5E5E5] mb-4">
                  CONTACT INFORMATION
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email ID"
                    className={inputUnderline}
                    aria-label="Email ID"
                    required
                  />
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Mobile Number"
                    className={inputUnderline}
                    aria-label="Mobile number"
                    required
                  />
                </div>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="keepUpdated"
                    checked={form.keepUpdated}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border border-[#E5E5E5]/60 bg-transparent text-[#D1C7B7] focus:ring-[#D1C7B7]"
                  />
                  <span className="text-xs text-[#E5E5E5] uppercase">KEEP ME UPDATED ON NEW ARRIVALS</span>
                </label>
              </section>

              <section className="mb-8">
                <h2 className="text-xs md:text-sm font-medium tracking-wide uppercase text-[#E5E5E5] mb-4">
                  SHIPPING ADDRESS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className={inputUnderline}
                    aria-label="First name"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className={inputUnderline}
                    aria-label="Last name"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className={`${inputUnderline} mb-4`}
                  aria-label="Address"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={inputUnderline}
                    aria-label="City"
                    required
                  />
                  <input
                    type="text"
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="Pin Code"
                    className={inputUnderline}
                    aria-label="Pin code"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="GST Number (optional)"
                  className={inputUnderline}
                  aria-label="GST Number"
                />
              </section>

              <div className="border-t border-[#E5E5E5]/20 pt-6">
                <OrderSummaryBlock />
              </div>

              <button
                type="submit"
                className="w-full mt-8 py-3.5 px-4 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
              >
                PLACE YOUR ORDER
              </button>
            </form>
          </div>

          {/* Laptop: two columns — left: forms + actions; right: order summary */}
          <form onSubmit={handlePlaceOrder} className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">
            <div>
              <section className="mb-8">
                <h2 className="text-sm font-medium tracking-wide uppercase text-[#E5E5E5] mb-4">
                  CONTACT INFORMATION
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email ID"
                    className={inputUnderline}
                    aria-label="Email ID"
                    required
                  />
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Mobile Number"
                    className={inputUnderline}
                    aria-label="Mobile number"
                    required
                  />
                </div>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="keepUpdated"
                    checked={form.keepUpdated}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border border-[#E5E5E5]/60 bg-transparent text-[#D1C7B7] focus:ring-[#D1C7B7]"
                  />
                  <span className="text-sm text-[#E5E5E5]">KEEP ME UPDATED ON NEW ARRIVALS</span>
                </label>
              </section>

              <section className="mb-8">
                <h2 className="text-sm font-medium tracking-wide uppercase text-[#E5E5E5] mb-4">
                  SHIPPING ADDRESS
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className={inputUnderline}
                    aria-label="First name"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className={inputUnderline}
                    aria-label="Last name"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className={`${inputUnderline} mb-4`}
                  aria-label="Address"
                  required
                />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={inputUnderline}
                    aria-label="City"
                    required
                  />
                  <input
                    type="text"
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="Pin Code"
                    className={inputUnderline}
                    aria-label="Pin code"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="GST Number (optional)"
                  className={inputUnderline}
                  aria-label="GST Number"
                />
              </section>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]/20">
                <Link
                  to="/cart"
                  className="text-sm font-medium tracking-wide uppercase text-[#E5E5E5] hover:text-[#D1C7B7] transition-colors"
                >
                  RETURN TO BAG
                </Link>
                <button
                  type="submit"
                  className="py-3 px-8 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
                >
                  PLACE YOUR ORDER
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
              <p className="text-sm uppercase tracking-wide text-[#E5E5E5]">Sign in to continue</p>
              <button
                type="button"
                onClick={() => { setAuthOpen(false); setPendingProceed(false) }}
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
                    className={inputUnderline}
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
                    className={inputUnderline}
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

export default CheckoutPage

