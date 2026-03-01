import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { image, name, price, id, sizeInventories } = product
  const { cart, addToCart, removeFromCart } = useCart()
  const allSoldOut = Array.isArray(sizeInventories) && sizeInventories.length > 0 && sizeInventories.every((s) => (s.quantity ?? 0) === 0)
  const cartIndex = cart.findIndex((item) => item.productId === id && item.size === 'M')
  const inCart = cartIndex >= 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (allSoldOut) return
    if (inCart) removeFromCart(cartIndex)
    else addToCart(id, 'M')
  }

  return (
    <div className="group flex flex-col text-center h-full w-full">
      <Link to={`/product/${id}`} className="flex-1 min-h-0 flex flex-col">
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-800 mb-3 flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          {allSoldOut && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[#E5E5E5] text-sm font-medium uppercase tracking-wide">
              Sold out
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-left mb-3 flex-shrink-0">
          <span className="text-[#D1C7B7] text-sm md:text-base font-normal truncate">
            {name}
          </span>
          <span className="text-[#D1C7B7] text-sm md:text-base font-normal flex-shrink-0">
            {price}
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={allSoldOut}
        aria-label={allSoldOut ? 'Sold out' : inCart ? 'Remove from cart (undo)' : 'Add to cart'}
        className={`w-full py-3 px-4 text-sm font-medium tracking-wide uppercase border transition-all duration-300 ease-out active:scale-[0.98] select-none flex-shrink-0 mt-auto ${
          allSoldOut
            ? 'border-[#555] text-[#666] bg-[#222] cursor-not-allowed'
            : inCart
              ? 'border-[#D1C7B7] bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90'
              : 'border-[#D1C7B7] text-[#D1C7B7] bg-transparent hover:bg-[#D1C7B7]/10'
        }`}
      >
        {allSoldOut ? 'SOLD OUT' : inCart ? 'ADDED TO CART' : 'ADD TO CART'}
      </button>
    </div>
  )
}

export default ProductCard
