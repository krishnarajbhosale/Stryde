import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { image, name, price, id } = product
  const { cart, addToCart, removeFromCart } = useCart()
  const cartIndex = cart.findIndex((item) => item.productId === id && item.size === 'M')
  const inCart = cartIndex >= 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) removeFromCart(cartIndex)
    else addToCart(id, 'M')
  }

  return (
    <div className="group block text-center">
      <Link to={`/product/${id}`} className="block">
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-800 mb-3">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex items-center justify-between text-left mb-3">
          <span className="text-[#D1C7B7] text-sm md:text-base font-normal">
            {name}
          </span>
          <span className="text-[#D1C7B7] text-sm md:text-base font-normal">
            {price}
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={handleAddToCart}
        aria-label={inCart ? 'Remove from cart (undo)' : 'Add to cart'}
        className={`w-full py-3 px-4 text-sm font-medium tracking-wide uppercase border border-[#D1C7B7] transition-all duration-300 ease-out active:scale-[0.98] select-none ${
          inCart
            ? 'bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90'
            : 'text-[#D1C7B7] bg-transparent hover:bg-[#D1C7B7]/10'
        }`}
      >
        {inCart ? 'ADDED TO CART' : 'ADD TO CART'}
      </button>
    </div>
  )
}

export default ProductCard
