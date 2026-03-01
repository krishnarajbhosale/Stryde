import { useState } from 'react'
import { createProduct } from '../../api/adminApi'

const MAX_IMAGES = 3
const inputClass =
  'w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 px-3 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm'

const defaultSizes = [
  { sizeName: 'XS', quantity: 0 },
  { sizeName: 'S', quantity: 0 },
  { sizeName: 'M', quantity: 0 },
  { sizeName: 'L', quantity: 0 },
  { sizeName: 'XL', quantity: 0 },
]

export default function AdminProductForm() {
  const [name, setName] = useState('')
  const [basicPrice, setBasicPrice] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [sizes, setSizes] = useState(defaultSizes)
  const [images, setImages] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = (index, value) => {
    setSizes((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], quantity: parseInt(value, 10) || 0 }
      return next
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES)
    setImages(files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('basicPrice', basicPrice.trim())
      formData.append('category', category.trim())
      formData.append('description', description.trim())
      formData.append('sizeInventories', JSON.stringify(sizes))
      images.forEach((file) => formData.append('images', file))
      await createProduct(formData)
      setMessage({ type: 'success', text: 'Product created successfully.' })
      setName('')
      setBasicPrice('')
      setCategory('')
      setDescription('')
      setSizes(defaultSizes.map((s) => ({ ...s })))
      setImages([])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create product.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="font-cormorant text-xl uppercase text-[#E5E5E5] mb-6">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/80 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/80 mb-1">Basic Price (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={basicPrice}
            onChange={(e) => setBasicPrice(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/80 mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
            placeholder="e.g. Blazers, Dresses"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/80 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} min-h-[100px] resize-y`}
            rows={4}
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/80 mb-1">
            Quantity per size (XS, S, M, L, XL)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {sizes.map((s, i) => (
              <div key={s.sizeName} className="flex flex-col gap-1">
                <span className="text-sm text-[#E5E5E5]/80 uppercase">{s.sizeName}</span>
                <input
                  type="number"
                  min="0"
                  value={s.quantity}
                  onChange={(e) => handleQuantityChange(i, e.target.value)}
                  className={inputClass}
                  placeholder="Qty"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/80 mb-1">
            Images (max {MAX_IMAGES})
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full text-sm text-[#E5E5E5] file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-[#D1C7B7] file:text-[#1a1a1a] file:uppercase file:tracking-wide"
          />
          {images.length > 0 && (
            <p className="text-xs text-[#E5E5E5]/70 mt-1">
              {images.length} file(s) selected (max {MAX_IMAGES})
            </p>
          )}
        </div>
        {message.text && (
          <p className={message.type === 'success' ? 'text-[#D1C7B7]' : 'text-red-400'}>{message.text}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 text-sm font-medium uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Saving…' : 'Save Product'}
        </button>
      </form>
    </>
  )
}
