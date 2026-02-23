import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { getProductById, parsePrice } from '../data/products'

const PLATFORM_FEE = 50
const DISCOUNT_PER_ORDER = 500

const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'CASH ON DELIVERY' },
  { id: 'upi', label: 'UPI (PAY VIA ANY APP)' },
  { id: 'card', label: 'CREDIT / DEBIT CARD' },
  { id: 'netbanking', label: 'NET BANKING' },
]

function PaymentPage() {
  const navigate = useNavigate()
  const { cart, removeFromCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('')

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

  const handlePlaceOrder = (e) => {
    e.preventDefault()
    if (!paymentMethod) return
    // Optional: submit to backend, then redirect to success/thank-you
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
                  <p className="text-sm font-medium text-[#E5E5E5] mt-2">{p.price}</p>
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
      <div className="flex justify-between text-base font-medium text-[#E5E5E5] mb-4">
        <span>TOTAL AMOUNT</span>
        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
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
        {PAYMENT_OPTIONS.map((opt) => (
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
              <span className="block w-4 h-4 rounded border-2 border-[#E5E5E5]/70 bg-transparent peer-focus:ring-2 peer-focus:ring-[#D1C7B7]/50 group-has-[:checked]:border-[#D1C7B7] group-has-[:checked]:bg-[#D1C7B7]/20" aria-hidden />
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
                disabled={!paymentMethod}
                className="w-full mt-8 py-3.5 px-4 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                PLACE YOUR ORDER
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
                  disabled={!paymentMethod}
                  className="py-3 px-8 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </>
  )
}

export default PaymentPage
