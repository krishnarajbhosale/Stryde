import { useState } from 'react'
import ProductCard from './ProductCard'
import { PRODUCTS } from '../data/products'

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="w-4 h-4 flex-shrink-0"
      aria-hidden
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="14" y1="18" x2="20" y2="18" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

const INITIAL_COUNT = 3

function CuratedSelection({ products = PRODUCTS, showAllProducts = false }) {
  const [expanded, setExpanded] = useState(false)
  const visibleProducts = showAllProducts ? products : (expanded ? products : products.slice(0, INITIAL_COUNT))
  const hasMore = !showAllProducts && products.length > INITIAL_COUNT

  return (
    <section
      className="w-full bg-[#1a1a1a] py-12 md:py-16"
      aria-labelledby="curated-heading"
    >
      <div className="max-w-[1430px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12">
          <div>
            <h2
              id="curated-heading"
              className="font-cormorant font-medium text-[#E5E5E5] text-3xl md:text-4xl leading-[100%] tracking-normal uppercase"
            >
              CURATED SELECTION
            </h2>
            <p className="text-[#E5E5E5] text-sm mt-1 text-opacity-90">
              Featured Collections
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-[#E5E5E5] text-sm font-normal tracking-wide hover:opacity-80 transition-opacity self-start sm:self-auto"
            aria-label="Filter products"
          >
            <FilterIcon />
            Filter
          </button>
        </div>

        {/* Product grid: 2 cols mobile, 3 cols laptop */}
        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0 m-0">
          {visibleProducts.map((product) => (
            <li key={product.id ?? product.name}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        {/* Chevron: click to show remaining products */}
        {hasMore && (
          <div className="flex justify-center mt-10 md:mt-14">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-[#E5E5E5] opacity-80 hover:opacity-100 transition-opacity p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#E5E5E5]/50"
              aria-label={expanded ? 'Show less' : `Show ${products.length - INITIAL_COUNT} more products`}
            >
              <span className={expanded ? 'inline-block rotate-180' : ''}>
                <ChevronDownIcon />
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default CuratedSelection
export { PRODUCTS }
