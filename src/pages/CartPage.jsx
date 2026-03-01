import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { fetchProducts, PRICE_ADD_ON } from '../api/productsApi'

const PLATFORM_FEE = 50
const DISCOUNT_PER_ORDER = 0

function CartPage() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, updateSize } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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
  const totalAmount = totalMRP - discount + PLATFORM_FEE

  const similarProducts = (loading || cartItemsWithProduct.length === 0)
    ? products.slice(0, 3)
    : products.filter((p) => String(p.id) !== String(cartItemsWithProduct[0].productId)).slice(0, 3)

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-10">
            CART
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: ITEM SELECTED — match reference: light grey, line under brand, beige SIZE/QTY buttons */}
            <div className="lg:col-span-2">
              <h2 className="text-base md:text-sm font-medium tracking-wide uppercase text-[#E5E5E5] mb-6">
                ITEM SELECTED
              </h2>

              {cartItemsWithProduct.length === 0 ? (
                <>
                  <p className="text-[#E5E5E5]/80 mb-4">Your cart is empty.</p>
                  <Link to="/collection" className="text-[#E5E5E5] underline">
                    Continue shopping
                  </Link>
                </>
              ) : (
                <div className="space-y-0">
                  {cartItemsWithProduct.map((item, index) => {
                    const p = item.product
                    return (
                      <div key={`${item.productId}-${item.size}-${index}`}>
                        <div className="flex gap-3 md:gap-6 items-start py-5 md:py-6">
                          <div className="w-5 h-5 border border-[#E5E5E5] rounded flex-shrink-0 mt-2" aria-hidden />
                          <div className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 flex-shrink-0 overflow-hidden bg-neutral-800">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                          <div className="flex-1 min-w-0 relative pr-8 md:pr-10">
                            <p className="text-xs uppercase tracking-wide text-[#E5E5E5] mb-1.5">
                              {p.brand}
                            </p>
                            <div className="h-px w-full max-w-[85%] bg-[#E5E5E5]/40 mb-3" aria-hidden />
                            <div className="flex flex-wrap gap-2 mb-2">
                              {item.size === 'Custom' || item.customSizeId ? (
                                <span className="text-xs uppercase bg-[#E8E4DF] text-[#333] px-2.5 py-2 rounded-sm border border-[#444]">
                                  SIZE : Custom
                                </span>
                              ) : (
                                <select
                                  value={item.size}
                                  onChange={(e) => updateSize(index, e.target.value)}
                                  className="text-xs uppercase bg-[#E8E4DF] border border-[#444] text-[#333] px-2.5 py-2 focus:outline-none focus:border-[#666] rounded-sm"
                                >
                                  {p.sizes.map((s) => (
                                    <option key={s} value={s} className="bg-[#E8E4DF] text-[#333]">
                                      SIZE : {s}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <select
                                value={item.quantity}
                                onChange={(e) => updateQuantity(index, Number(e.target.value))}
                                className="text-xs uppercase bg-[#E8E4DF] border border-[#444] text-[#333] px-2.5 py-2 focus:outline-none focus:border-[#666] rounded-sm"
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n} className="bg-[#E8E4DF] text-[#333]">
                                    QTY : {n}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <p className="text-sm font-medium text-[#E5E5E5]">
                              {p.priceStrikethrough && <span className="line-through text-[#E5E5E5]/60 mr-2">{p.priceStrikethrough}</span>}
                              <span>{p.price}</span>
                            </p>
                            <p className="text-xs text-[#E5E5E5]/80 mt-0.5">
                              INCLUSIVE OF ALL TAXES
                            </p>
                            <p className="text-xs text-[#E5E5E5]/80 mt-0.5">
                              7 DAYS RETURN AVAILABLE
                            </p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(index)}
                              className="absolute top-0 right-0 text-[#E5E5E5] hover:opacity-80 p-1"
                              aria-label="Remove item"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {index < cartItemsWithProduct.length - 1 && (
                          <div className="h-px bg-[#E5E5E5]/30 w-full" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: BILLING */}
            <div className="lg:pl-8 lg:border-l border-[#D1C7B7]/30">
              <h2 className="text-sm font-medium tracking-wide uppercase text-[#D1C7B7] mb-6">
                BILLING
              </h2>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-[#D1C7B7] mb-3">
                  PRICE DETAILS :
                </p>
                <div className="flex justify-between text-sm text-[#D1C7B7]">
                  <span>MRP</span>
                  <span className="line-through text-[#D1C7B7]/70">₹{totalMRPStrikethrough.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-[#D1C7B7]">
                  <span>Price</span>
                  <span>₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-[#D1C7B7]">
                    <span>DISCOUNT ON MRP</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#D1C7B7]">
                  <span>PLATFORM FEE</span>
                  <span>₹{PLATFORM_FEE}</span>
                </div>
                <div className="h-px bg-[#D1C7B7]/30 my-4" />
                <div className="flex justify-between text-base font-medium text-[#D1C7B7]">
                  <span>TOTAL AMOUNT</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-xs text-[#D1C7B7]/80 mt-6 leading-relaxed">
                BY PLACING THE ORDER, YOU AGREE TO STRYDEEVA'S TERMS OF USE AND PRIVACY POLICY.
              </p>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 py-3 px-4 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cartItemsWithProduct.length === 0}
              >
                PLACE YOUR ORDER
              </button>
            </div>
          </div>

          {/* YOU MAY ALSO LIKE */}
          <section className="mt-16 pt-12 border-t border-[#333]">
            <h2 className="font-cormorant font-medium text-2xl md:text-3xl uppercase text-[#D1C7B7] mb-8">
              YOU MAY ALSO LIKE
            </h2>
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0 m-0">
              {similarProducts.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CartPage
