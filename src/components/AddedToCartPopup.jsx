import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const AUTO_DISMISS_MS = 4500

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 flex-shrink-0 text-[#D1C7B7]"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function AddedToCartPopup() {
  const { showAddedToCart, dismissAddedToCart } = useCart()

  useEffect(() => {
    if (!showAddedToCart) return
    const t = setTimeout(dismissAddedToCart, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [showAddedToCart, dismissAddedToCart])

  if (!showAddedToCart) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[99] bg-black/25 added-to-cart-backdrop-enter"
        aria-hidden
        onClick={dismissAddedToCart}
      />

      <div
        role="dialog"
        aria-live="polite"
        aria-label="Added to cart"
        className="fixed bottom-8 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm added-to-cart-popup-enter"
      >
        <div className="bg-[#0d0d0d] border border-[#D1C7B7]/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Gold accent line */}
          <div className="h-px w-full bg-[#D1C7B7]/60" aria-hidden />

          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {/* Message */}
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#D1C7B7]/50 bg-[#D1C7B7]/5 flex-shrink-0">
                <CheckIcon />
              </span>
              <p className="font-cormorant font-medium text-lg text-[#E5E5E5] tracking-wide">
                Added to cart
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E5E5E5]/10 max-w-[80%] mb-4" aria-hidden />

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={dismissAddedToCart}
                className="text-xs font-normal tracking-[0.2em] uppercase text-[#E5E5E5]/70 hover:text-[#D1C7B7] transition-colors duration-200"
              >
                Continue shopping
              </button>
              <Link
                to="/cart"
                onClick={dismissAddedToCart}
                className="inline-flex items-center justify-center w-full sm:w-auto min-w-[140px] py-3 px-5 text-xs font-medium tracking-[0.2em] uppercase bg-[#D1C7B7] text-[#0d0d0d] hover:bg-[#D1C7B7]/90 transition-colors duration-200 border border-[#D1C7B7]"
              >
                View cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddedToCartPopup
