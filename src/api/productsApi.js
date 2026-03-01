/**
 * Storefront product API – fetches products (photo + price) from the backend.
 * All endpoints are public (no auth).
 */

const API_BASE = '/api/products'

function formatPrice(num) {
  if (num == null || Number.isNaN(num)) return '₹0'
  return '₹' + Number(num).toLocaleString('en-IN')
}

/** Normalize backend product to frontend shape: { id, name, price, image, images, brand, description, materialCare, sizes, sizeInventories } */
function normalizeProduct(p) {
  if (!p) return null
  const id = p.id != null ? String(p.id) : p.id
  const basicPrice = p.basicPrice != null ? Number(p.basicPrice) : 0
  const imageUrls = p.imageUrls || []
  const firstImage = imageUrls[0] || ''
  const sizeInventories = (p.sizeInventories || []).map((s) => ({
    sizeName: s.sizeName || '',
    quantity: s.quantity != null ? Number(s.quantity) : 0,
  })).filter((s) => s.sizeName)
  const sizes = sizeInventories.length ? sizeInventories.map((s) => s.sizeName) : ['XS', 'S', 'M', 'L', 'XL']
  return {
    id,
    name: p.name || '',
    price: formatPrice(basicPrice),
    image: firstImage,
    images: imageUrls,
    brand: 'STRYDEEVA',
    description: p.description || '',
    materialCare: p.category || '',
    sizes,
    sizeInventories: sizeInventories.length ? sizeInventories : sizes.map((sizeName) => ({ sizeName, quantity: 1 })),
  }
}

export async function fetchProducts() {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error('Failed to fetch products')
  const data = await res.json()
  return (data || []).map(normalizeProduct).filter(Boolean)
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/${id}`)
  if (!res.ok) return null
  const data = await res.json()
  return normalizeProduct(data)
}

/** Parse price string or number to number for calculations */
export function parsePrice(priceStrOrNum) {
  if (priceStrOrNum == null) return 0
  if (typeof priceStrOrNum === 'number' && !Number.isNaN(priceStrOrNum)) return priceStrOrNum
  const num = String(priceStrOrNum).replace(/[₹,\s]/g, '')
  return parseInt(num, 10) || 0
}
