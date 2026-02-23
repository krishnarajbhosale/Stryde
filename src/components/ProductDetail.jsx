import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById, getSimilarProducts } from '../data/products'
import ProductCard from './ProductCard'
import { useCart } from '../context/CartContext'

function ProductDetail() {
  const { id } = useParams()
  const product = getProductById(id)
  const { cart, addToCart, removeFromCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('M')
  const [mainImage, setMainImage] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const cartIndex = product ? cart.findIndex((item) => item.productId === product.id && item.size === selectedSize) : -1
  const inCart = cartIndex >= 0

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <p className="text-[#D1C7B7]">Product not found.</p>
        <Link to="/" className="ml-4 text-[#D1C7B7] underline">Back to home</Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [product.image]
  const similarProducts = getSimilarProducts(product.id, 3)

  return (
    <div className="w-full bg-black text-[#D1C7B7] min-h-screen">
      <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: Gallery — mobile: main full width top, thumbnails row below; laptop: main large left, thumbnails stacked right */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_160px] lg:gap-4 lg:items-stretch">
            {/* Main image: full width on mobile; laptop = large left (full height) */}
            <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:min-h-[520px] overflow-hidden bg-neutral-800">
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

            <p className="text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
              SIZES
            </p>
            <div className="flex gap-2 mb-6">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border text-sm font-medium uppercase transition-colors ${
                    selectedSize === size
                      ? 'bg-[#D1C7B7] text-[#1a1a1a] border-[#D1C7B7]'
                      : 'border-[#D1C7B7] text-[#D1C7B7] bg-transparent hover:bg-[#D1C7B7]/10'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="w-24 h-px bg-[#D1C7B7] mb-6" />

            <div className="flex flex-col gap-3 mb-6">
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
              <button
                type="button"
                className="w-full max-w-md py-3 px-4 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
              >
                BUY NOW
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#D1C7B7] mb-1">
                  Product Details :
                </p>
                <p className="text-sm text-[#D1C7B7]/95 leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#D1C7B7] mb-1">
                  Material & Care :
                </p>
                <p className="text-sm text-[#D1C7B7]/95 leading-relaxed">
                  {product.materialCare}
                </p>
              </div>
            </div>
          </div>
        </div>

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
