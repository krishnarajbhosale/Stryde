import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductById, fetchProducts } from '../api/productsApi'
import { createCustomSize } from '../api/customSizesApi'
import ProductCard from './ProductCard'
import { useCart } from '../context/CartContext'

function getSimilarFromList(currentId, allProducts, limit = 3) {
  const idStr = String(currentId)
  return allProducts.filter((p) => String(p.id) !== idStr).slice(0, limit)
}

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { cart, addToCart, removeFromCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('M')
  const [mainImage, setMainImage] = useState(0)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [customSizeModalOpen, setCustomSizeModalOpen] = useState(false)
  const [customSizeForm, setCustomSizeForm] = useState({
    bust: '', waist: '', hip: '', shoulder: '', armhole: '', sleeveLength: '', sleeveRoundBicep: '', height: '',
  })
  const [customSizeSubmitting, setCustomSizeSubmitting] = useState(false)
  const [customSizeError, setCustomSizeError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setProduct(null)
    setSimilarProducts([])
    if (!id) {
      setLoading(false)
      return
    }
    Promise.all([fetchProductById(id), fetchProducts()])
      .then(([p, all]) => {
        if (cancelled) return
        setProduct(p || null)
        setSimilarProducts(p ? getSimilarFromList(p.id, all || [], 3) : [])
      })
      .catch((e) => { if (!cancelled) setError(e.message || 'Failed to load product') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const cartIndex = product ? cart.findIndex((item) => String(item.productId) === String(product.id) && item.size === selectedSize) : -1
  const inCart = cartIndex >= 0

  const inventories = product?.sizeInventories?.length ? product.sizeInventories : (product?.sizes || []).map((sizeName) => ({ sizeName, quantity: 1 }))
  const selectedInv = inventories.find((s) => s.sizeName === selectedSize)
  const selectedSoldOut = selectedInv && (selectedInv.quantity ?? 0) === 0

  useEffect(() => {
    if (!product || !inventories.length) return
    const current = inventories.find((s) => s.sizeName === selectedSize)
    if ((current?.quantity ?? 0) === 0) {
      const inStock = inventories.find((s) => (s.quantity ?? 0) > 0)
      if (inStock) setSelectedSize(inStock.sizeName)
    }
  }, [product?.id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <p className="text-[#D1C7B7]">Loading…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <p className="text-[#D1C7B7]">{error}</p>
        <Link to="/" className="ml-4 text-[#D1C7B7] underline">Back to home</Link>
      </div>
    )
  }
  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <p className="text-[#D1C7B7]">Product not found.</p>
        <Link to="/" className="ml-4 text-[#D1C7B7] underline">Back to home</Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [product.image]
  return (
    <div className="w-full bg-black text-[#D1C7B7] min-h-screen">
      <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 lg:items-start">
          {/* Left: Gallery — fixed height, does not grow when right accordion expands */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_160px] lg:gap-4 lg:items-stretch lg:sticky lg:top-24">
            {/* Main image: fixed aspect on desktop so height doesn't change */}
            <div className="relative w-full aspect-[4/5] lg:aspect-[4/5] lg:max-h-[min(80vh,700px)] overflow-hidden bg-neutral-800">
              <img
                src={images[mainImage]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Thumbnails: mobile = horizontal row; laptop = vertical stack on right, each ~half main height */}
            <div className="flex flex-row gap-2 lg:flex-col lg:gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMainImage(i)}
                  className={`w-20 h-24 flex-shrink-0 lg:w-full lg:flex-1 lg:min-h-0 overflow-hidden rounded border-2 ${
                    mainImage === i ? 'border-[#D1C7B7]' : 'border-[#333]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div>
            <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#D1C7B7] mb-1">
              {product.name.toUpperCase()}
            </h1>
            <p className="text-sm uppercase tracking-wide text-[#D1C7B7] mb-2">
              {product.brand}
            </p>
            <p className="text-2xl md:text-3xl font-medium text-[#D1C7B7] mb-1">
              {product.price}
            </p>
            <p className="text-xs uppercase text-[#D1C7B7]/90 mb-6">
              INCLUSIVE OF ALL TAXES
            </p>

            <div className="w-24 h-px bg-[#D1C7B7] mb-6" />

            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-sm font-medium uppercase tracking-wide text-[#D1C7B7]">
                SIZES
              </p>
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="text-sm uppercase tracking-wide text-[#D1C7B7] hover:underline underline-offset-2"
              >
                Size chart
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {(() => {
                const inventories = product.sizeInventories?.length ? product.sizeInventories : (product.sizes || []).map((sizeName) => ({ sizeName, quantity: 1 }))
                const withCustom = []
                for (const inv of inventories) {
                  if (inv.sizeName === 'XL') withCustom.push({ isCustomize: true })
                  withCustom.push(inv)
                }
                if (!inventories.some((i) => i.sizeName === 'XL')) withCustom.push({ isCustomize: true })
                return withCustom.map((item, idx) => {
                  if (item.isCustomize) {
                    return (
                      <button
                        key="customize-size"
                        type="button"
                        onClick={() => setCustomSizeModalOpen(true)}
                        className="min-w-[3rem] h-12 px-3 border border-[#D1C7B7] text-[#D1C7B7] bg-transparent hover:bg-[#D1C7B7]/10 text-sm font-medium uppercase transition-colors"
                      >
                        <span className="block text-[10px] leading-tight">Customize</span>
                        <span className="block text-[10px] leading-tight">size</span>
                      </button>
                    )
                  }
                  const inv = item
                  const isSoldOut = (inv.quantity ?? 0) === 0
                  const isSelected = selectedSize === inv.sizeName
                  return (
                    <button
                      key={inv.sizeName}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => !isSoldOut && setSelectedSize(inv.sizeName)}
                      className={`min-w-[3rem] h-12 px-3 border text-sm font-medium uppercase transition-colors ${
                        isSoldOut
                          ? 'border-[#666] text-[#666] cursor-not-allowed bg-[#222]'
                          : isSelected
                            ? 'bg-[#D1C7B7] text-[#1a1a1a] border-[#D1C7B7]'
                            : 'border-[#D1C7B7] text-[#D1C7B7] bg-transparent hover:bg-[#D1C7B7]/10'
                      }`}
                    >
                      <span className="block">{inv.sizeName}</span>
                      {isSoldOut && <span className="block text-[10px] font-normal opacity-80">SOLD OUT</span>}
                    </button>
                  )
                })
              })()}
            </div>

            <div className="w-24 h-px bg-[#D1C7B7] mb-6" />

            {(() => {
              const inventories = product.sizeInventories?.length ? product.sizeInventories : (product.sizes || []).map((sizeName) => ({ sizeName, quantity: 1 }))
              const selectedInv = inventories.find((s) => s.sizeName === selectedSize)
              const selectedSoldOut = selectedInv && (selectedInv.quantity ?? 0) === 0
              return (
            <div className="flex flex-col gap-3 mb-6">
              {selectedSoldOut ? (
                <p className="py-3 px-4 text-sm font-medium uppercase border border-[#666] text-[#666] bg-[#222]">
                  This size is sold out
                </p>
              ) : (
              <button
                type="button"
                onClick={() => inCart ? removeFromCart(cartIndex) : addToCart(product.id, selectedSize)}
                aria-label={inCart ? 'Remove from cart (undo)' : 'Add to cart'}
                className={`w-full max-w-md py-3 px-4 text-sm font-medium tracking-wide uppercase border border-[#D1C7B7] transition-all duration-300 ease-out active:scale-[0.98] select-none ${
                  inCart
                    ? 'bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90'
                    : 'text-[#D1C7B7] bg-transparent hover:bg-[#D1C7B7]/10'
                }`}
              >
                {inCart ? 'ADDED TO CART' : 'ADD TO CART'}
              </button>
              )}
              <button
                type="button"
                disabled={selectedSoldOut}
                className={`w-full max-w-md py-3 px-4 text-sm font-medium tracking-wide uppercase transition-colors ${
                  selectedSoldOut
                    ? 'bg-[#444] text-[#666] cursor-not-allowed border border-[#444]'
                    : 'bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90'
                }`}
              >
                {selectedSoldOut ? 'SOLD OUT' : 'BUY NOW'}
              </button>
            </div>
              )
            })()}

            {/* Accordion: Description, Shipping & Returns, Manufacturing */}
            <div className="border-t border-[#D1C7B7]/30 pt-6 mt-6">
              {[
                {
                  id: 'description',
                  title: 'DESCRIPTION',
                  content: (
                    <div className="space-y-4 text-sm text-[#D1C7B7]/95 leading-relaxed">
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-[#D1C7B7] mb-1">Product Details</p>
                        <p>{product.description || 'No description available.'}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-[#D1C7B7] mb-1">Material & Care</p>
                        <p>{product.materialCare || 'No material & care information available.'}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  id: 'shipping',
                  title: 'SHIPPING RETURNS & EXCHANGE',
                  content: (
                    <div className="space-y-4 text-sm text-[#D1C7B7]/95 leading-relaxed">
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-[#D1C7B7] mb-2">SHIPPING –</p>
                        <ul className="list-none space-y-1.5 pl-0">
                          <li>Same day and Next day delivery available for select pincodes.</li>
                          <li>Free shipping for domestic & international orders.</li>
                          <li>Products are dispatched from our warehouse within 2–5 working days.</li>
                          <li>The order will be delivered in 3–10 working days depending on the pincode.</li>
                          <li>You will receive an order tracking number as soon as we ship your order.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-[#D1C7B7] mb-2">EXCHANGE –</p>
                        <ul className="list-none space-y-1.5 pl-0">
                          <li>Free exchange within 7 days.</li>
                          <li>There is no additional charge for any exchange orders.</li>
                          <li>International orders are not eligible for exchange.</li>
                          <li>For new orders of lower price, the balance amount will be refunded as a gift voucher.</li>
                          <li>Size exchange is subject to availability.</li>
                          <li>Please share the package unboxing video for wrong product received.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-[#D1C7B7] mb-2">RETURNS –</p>
                        <ul className="list-none space-y-1.5 pl-0">
                          <li>We have a 7-day return policy.</li>
                          <li>Please ensure that the products you return are unused, unworn and the original tags are intact.</li>
                          <li>International orders are not eligible for return.</li>
                          <li>Customer has to self-ship the product if the pincode is out of serviceable area with reverse logistics.</li>
                          <li>All orders will be refunded via gift cards, as payouts are currently on hold in compliance with RBI guidelines.</li>
                        </ul>
                      </div>
                    </div>
                  ),
                },
                {
                  id: 'manufacturing',
                  title: 'MANUFACTURING',
                  content: (
                    <div className="text-sm text-[#D1C7B7]/95 leading-relaxed">
                      <p>Our products are crafted with attention to quality and sustainability. Each piece is designed and manufactured to meet our standards for fit, finish and durability. For specific manufacturing or origin details of this product, please contact our support team.</p>
                    </div>
                  ),
                },
              ].map((section) => {
                const isOpen = openAccordion === section.id
                return (
                  <div key={section.id} className="border-b border-[#D1C7B7]/30 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                      className="w-full flex items-center justify-between py-4 text-left text-sm font-medium uppercase tracking-wide text-[#D1C7B7] hover:opacity-90 transition-opacity"
                      aria-expanded={isOpen}
                    >
                      <span>{section.title}</span>
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-lg" aria-hidden>
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-4 pr-8">
                        {section.content}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Size Chart modal */}
        {sizeChartOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setSizeChartOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
          >
            <div
              className="bg-[#1a1a1a] border border-[#D1C7B7]/40 max-w-2xl w-full max-h-[90vh] overflow-auto rounded shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[#D1C7B7]/30">
                <h2 id="size-chart-title" className="text-lg font-medium uppercase tracking-wide text-[#D1C7B7]">
                  Size chart
                </h2>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(false)}
                  className="text-[#D1C7B7] hover:opacity-80 p-1"
                  aria-label="Close size chart"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
              <div className="p-4 md:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-[#D1C7B7]/40">
                        <th className="w-40 py-2.5 pr-4 text-[#D1C7B7] font-medium uppercase tracking-wide text-left">Size</th>
                        <th className="py-2.5 px-2 text-[#D1C7B7] font-medium uppercase tracking-wide text-center">XS</th>
                        <th className="py-2.5 px-2 text-[#D1C7B7] font-medium uppercase tracking-wide text-center">S</th>
                        <th className="py-2.5 px-2 text-[#D1C7B7] font-medium uppercase tracking-wide text-center">M</th>
                        <th className="py-2.5 px-2 text-[#D1C7B7] font-medium uppercase tracking-wide text-center">L</th>
                        <th className="py-2.5 px-2 text-[#D1C7B7] font-medium uppercase tracking-wide text-center">XL</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#D1C7B7]/90">
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium">Bust</td><td className="py-2.5 px-2 text-center">32</td><td className="py-2.5 px-2 text-center">34</td><td className="py-2.5 px-2 text-center">36</td><td className="py-2.5 px-2 text-center">38</td><td className="py-2.5 px-2 text-center">40</td></tr>
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium">Waist</td><td className="py-2.5 px-2 text-center">24</td><td className="py-2.5 px-2 text-center">26</td><td className="py-2.5 px-2 text-center">28</td><td className="py-2.5 px-2 text-center">30</td><td className="py-2.5 px-2 text-center">32</td></tr>
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium">Hip</td><td className="py-2.5 px-2 text-center">34</td><td className="py-2.5 px-2 text-center">36</td><td className="py-2.5 px-2 text-center">38</td><td className="py-2.5 px-2 text-center">40</td><td className="py-2.5 px-2 text-center">42</td></tr>
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium">Shoulder</td><td className="py-2.5 px-2 text-center">13</td><td className="py-2.5 px-2 text-center">13.5</td><td className="py-2.5 px-2 text-center">14</td><td className="py-2.5 px-2 text-center">14.5</td><td className="py-2.5 px-2 text-center">15</td></tr>
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium">Armhole</td><td className="py-2.5 px-2 text-center">15</td><td className="py-2.5 px-2 text-center">16</td><td className="py-2.5 px-2 text-center">17</td><td className="py-2.5 px-2 text-center">18</td><td className="py-2.5 px-2 text-center">19</td></tr>
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium">Sleeve Length</td><td className="py-2.5 px-2 text-center">22</td><td className="py-2.5 px-2 text-center">22.5</td><td className="py-2.5 px-2 text-center">23</td><td className="py-2.5 px-2 text-center">23.5</td><td className="py-2.5 px-2 text-center">24</td></tr>
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium">Sleeve Round (Bicep)</td><td className="py-2.5 px-2 text-center">10.5</td><td className="py-2.5 px-2 text-center">11.5</td><td className="py-2.5 px-2 text-center">12.5</td><td className="py-2.5 px-2 text-center">13.5</td><td className="py-2.5 px-2 text-center">14.5</td></tr>
                      <tr className="border-b border-[#D1C7B7]/20"><td className="py-2.5 pr-4 font-medium text-[#D1C7B7]/80">Mention your height</td><td className="py-2.5 px-2 text-center" colSpan={5}>—</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-[#D1C7B7]/80 mt-4">Mention your height for a better fit.</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom size form modal */}
        {customSizeModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => !customSizeSubmitting && setCustomSizeModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-size-title"
          >
            <div
              className="bg-[#1a1a1a] border border-[#D1C7B7]/40 max-w-md w-full max-h-[90vh] overflow-auto rounded shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[#D1C7B7]/30">
                <h2 id="custom-size-title" className="text-lg font-medium uppercase tracking-wide text-[#D1C7B7]">
                  Customize size
                </h2>
                <button
                  type="button"
                  onClick={() => !customSizeSubmitting && setCustomSizeModalOpen(false)}
                  className="text-[#D1C7B7] hover:opacity-80 p-1"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
              <form
                className="p-4 md:p-6"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setCustomSizeError('')
                  setCustomSizeSubmitting(true)
                  try {
                    const res = await createCustomSize(customSizeForm)
                    addToCart(product.id, 'Custom', res.id)
                    setCustomSizeModalOpen(false)
                    setCustomSizeForm({ bust: '', waist: '', hip: '', shoulder: '', armhole: '', sleeveLength: '', sleeveRoundBicep: '', height: '' })
                  } catch (err) {
                    setCustomSizeError(err.message || 'Failed to save')
                  } finally {
                    setCustomSizeSubmitting(false)
                  }
                }}
              >
                {customSizeError && <p className="text-red-400 text-sm mb-4">{customSizeError}</p>}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { name: 'bust', label: 'Bust' },
                    { name: 'waist', label: 'Waist' },
                    { name: 'hip', label: 'Hip' },
                    { name: 'shoulder', label: 'Shoulder' },
                    { name: 'armhole', label: 'Armhole' },
                    { name: 'sleeveLength', label: 'Sleeve Length' },
                    { name: 'sleeveRoundBicep', label: 'Sleeve Round (Bicep)' },
                  ].map(({ name, label }) => (
                    <div key={name}>
                      <label className="block text-xs uppercase tracking-wide text-[#D1C7B7]/90 mb-1">{label}</label>
                      <input
                        type="text"
                        value={customSizeForm[name]}
                        onChange={(e) => setCustomSizeForm((f) => ({ ...f, [name]: e.target.value }))}
                        className="w-full bg-transparent border border-[#D1C7B7]/40 text-[#D1C7B7] px-3 py-2 text-sm focus:outline-none focus:border-[#D1C7B7]"
                        placeholder="—"
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wide text-[#D1C7B7]/90 mb-1">Height</label>
                  <input
                    type="text"
                    value={customSizeForm.height}
                    onChange={(e) => setCustomSizeForm((f) => ({ ...f, height: e.target.value }))}
                    className="w-full bg-transparent border border-[#D1C7B7]/40 text-[#D1C7B7] px-3 py-2 text-sm focus:outline-none focus:border-[#D1C7B7]"
                    placeholder="Mention your height"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomSizeModalOpen(false)}
                    className="flex-1 py-2.5 px-4 text-sm font-medium uppercase border border-[#D1C7B7] text-[#D1C7B7] hover:bg-[#D1C7B7]/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={customSizeSubmitting}
                    className="flex-1 py-2.5 px-4 text-sm font-medium uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-50 transition-colors"
                  >
                    {customSizeSubmitting ? 'Saving…' : 'Add to cart'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#333]">
            <h2 className="font-cormorant font-medium text-2xl md:text-3xl uppercase text-[#D1C7B7] mb-8">
              SIMILAR PRODUCTS
            </h2>
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0 m-0">
              {similarProducts.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
