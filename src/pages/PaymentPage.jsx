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
  const { cart } = useCart()
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

  return (
    <>
      <Navbar />
      <div className="w-full bg-[#0d0d0d] text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-2">
            CHECKOUT VARIANT
          </h1>
          <p className="text-sm text-[#E5E5E5] mb-10">
            <span className="text-[#E5E5E5]/50">INFORMATION</span>
            <span className="text-[#E5E5E5]/50 mx-2">&gt;</span>
            <span className="text-[#E5E5E5]">PAYMENT</span>
          </p>

          {/* Order summary: cart items in a row */}
          <div className="flex flex-wrap gap-6 md:gap-8 pb-8 mb-8 border-b border-[#333]">
            {cartItemsWithProduct.map((item) => {
              const p = item.product
              return (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4 items-start min-w-0 flex-1">
                  <div className="w-20 h-24 md:w-24 md:h-28 flex-shrink-0 overflow-hidden bg-neutral-800">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E5E5E5] uppercase">{p.name}</p>
                    <p className="text-xs text-[#E5E5E5]/70 uppercase mt-0.5">{p.brand}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs border border-[#E5E5E5]/40 text-[#E5E5E5] px-2 py-1">
                        SIZE : {item.size}
                      </span>
                      <span className="text-xs border border-[#E5E5E5]/40 text-[#E5E5E5] px-2 py-1">
                        QTY : {item.quantity}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#E5E5E5] flex-shrink-0">{p.price}</p>
                </div>
              )
            })}
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Left: Payment method */}
            <div className="lg:col-span-2">
              <h2 className="font-cormorant font-medium text-xl uppercase text-[#E5E5E5] mb-6">
                CHOOSE PAYMENT METHOD
              </h2>
              <div className="space-y-4">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="w-4 h-4 rounded border border-[#E5E5E5]/60 bg-transparent text-[#D1C7B7] focus:ring-[#D1C7B7]"
                    />
                    <span className="text-sm text-[#E5E5E5] group-hover:text-[#D1C7B7] transition-colors">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-10">
                <Link
                  to="/checkout"
                  className="text-sm font-medium tracking-wide uppercase text-[#E5E5E5] hover:text-[#D1C7B7] transition-colors"
                >
                  RETURN TO INFORMATION
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

            {/* Right: Price details */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-8">
                <p className="text-xs uppercase tracking-wide text-[#E5E5E5] mb-4">
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
                <div className="flex justify-between text-base font-medium text-[#E5E5E5]">
                  <span>TOTAL AMOUNT</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PaymentPage
