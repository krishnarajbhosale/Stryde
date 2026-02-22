import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { getProductById, parsePrice } from '../data/products'

const PLATFORM_FEE = 50
const DISCOUNT_PER_ORDER = 500

const inputUnderline =
  'w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors'

function CheckoutPage() {
  const navigate = useNavigate()
  const { cart } = useCart()
  const [form, setForm] = useState({
    emailOrMobile: '',
    keepUpdated: false,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    pinCode: '',
  })

  const cartItemsWithProduct = cart.map((item) => ({
    ...item,
    product: getProductById(item.productId),
  })).filter((item) => item.product)

  const totalMRP = cartItemsWithProduct.reduce(
    (sum, item) => sum + parsePrice(item.product?.price) * item.quantity,
    0
  )
  const discount = cartItemsWithProduct.length > 0 ? DISCOUNT_PER_ORDER : 0
  const totalAmount = totalMRP - discount + PLATFORM_FEE

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (cart.length === 0) navigate('/cart', { replace: true })
  }, [cart.length, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault()
    navigate('/checkout/payment')
  }

  if (cart.length === 0 && cartItemsWithProduct.length === 0) return null

  return (
    <>
      <Navbar />
      <div className="w-full bg-[#0d0d0d] text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-2">
            CHECKOUT VARIANT
          </h1>
          <p className="text-sm text-[#E5E5E5] mb-10">
            <span className="text-[#E5E5E5]">INFORMATION</span>
            <span className="text-[#E5E5E5]/50 mx-2">&gt;</span>
            <span className="text-[#E5E5E5]/50">PAYMENT</span>
          </p>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Left: Contact & Shipping */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="font-cormorant font-medium text-xl uppercase text-[#E5E5E5] mb-6">
                  CONTACT INFORMATION
                </h2>
                <input
                  type="text"
                  name="emailOrMobile"
                  value={form.emailOrMobile}
                  onChange={handleChange}
                  placeholder="Email Or Mobile Number"
                  className={inputUnderline}
                  aria-label="Email or mobile number"
                />
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="keepUpdated"
                    checked={form.keepUpdated}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border border-[#E5E5E5]/60 bg-transparent text-[#D1C7B7] focus:ring-[#D1C7B7]"
                  />
                  <span className="text-sm text-[#E5E5E5]">KEEP ME UPDATED ON NEW ARRIVALS.</span>
                </label>
              </section>

              <section>
                <h2 className="font-cormorant font-medium text-xl uppercase text-[#E5E5E5] mb-6">
                  SHIPPING ADDRESS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className={inputUnderline}
                    aria-label="First name"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className={inputUnderline}
                    aria-label="Last name"
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className={`${inputUnderline} mb-6`}
                  aria-label="Address"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={inputUnderline}
                    aria-label="City"
                  />
                  <input
                    type="text"
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="Pin Code"
                    className={inputUnderline}
                    aria-label="Pin code"
                  />
                </div>
              </section>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
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

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-8">
                <div className="space-y-6 mb-6">
                  {cartItemsWithProduct.map((item) => {
                    const p = item.product
                    return (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                        <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-neutral-800">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#E5E5E5] uppercase">
                            {p.name}
                          </p>
                          <p className="text-xs text-[#E5E5E5]/70 uppercase mt-0.5">
                            {p.brand}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs border border-[#E5E5E5]/40 text-[#E5E5E5] px-2 py-1">
                              SIZE: {item.size}
                            </span>
                            <span className="text-xs border border-[#E5E5E5]/40 text-[#E5E5E5] px-2 py-1">
                              QTY: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[#E5E5E5] flex-shrink-0">
                          {p.price}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs uppercase tracking-wide text-[#E5E5E5] mb-3">
                  PRICE DETAILS:
                </p>
                <div className="space-y-2 text-sm text-[#E5E5E5]">
                  <div className="flex justify-between">
                    <span>TOTAL MRP</span>
                    <span>₹{totalMRP.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DISCOUNT ON MRP</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PLATFORM FEE</span>
                    <span>₹{PLATFORM_FEE}</span>
                  </div>
                </div>
                <div className="h-px bg-[#E5E5E5]/20 my-4" />
                <div className="flex justify-between text-base font-medium text-[#E5E5E5] mb-6">
                  <span>TOTAL AMOUNT</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-[#E5E5E5]/70 leading-relaxed">
                  BY PLACING THE ORDER, YOU AGREE TO STRYDEEVA'S TERMS OF USE AND PRIVACY POLICY.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CheckoutPage
