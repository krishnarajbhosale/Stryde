import { useState, useEffect } from 'react'
import {
  getProducts,
  getProductImageBlobUrl,
  deleteProduct,
  updateProduct,
  uploadProductImages,
} from '../../api/adminApi'

function AdminProductImage({ productId, alt }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let blobUrl = null
    getProductImageBlobUrl(productId, 0).then((url) => {
      blobUrl = url
      setSrc(url)
    })
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [productId])
  if (!src) return <div className="w-full h-full flex items-center justify-center text-[#E5E5E5]/50 text-xs">Loading</div>
  return <img src={src} alt={alt} className="w-full h-full object-cover" />
}

export default function AdminInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', basicPrice: '', category: '', description: '', sizeInventories: [] })
  const [imageFiles, setImageFiles] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (e) {
      setError(e.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setError(e.message || 'Delete failed')
    }
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setImageFiles([])
    setEditForm({
      name: p.name,
      basicPrice: String(p.basicPrice),
      category: p.category || '',
      description: p.description || '',
      sizeInventories: (p.sizeInventories || []).map((s) => ({ sizeName: s.sizeName, quantity: s.quantity })),
    })
  }

  const handleUploadImages = async () => {
    if (!editingId || !imageFiles.length) return
    setUploadingImages(true)
    try {
      await uploadProductImages(editingId, imageFiles)
      setImageFiles([])
      await loadProducts()
    } catch (e) {
      setError(e.message || 'Image upload failed')
    } finally {
      setUploadingImages(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setImageFiles([])
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      await updateProduct(editingId, {
        name: editForm.name,
        basicPrice: editForm.basicPrice,
        category: editForm.category,
        description: editForm.description,
        sizeInventories: editForm.sizeInventories,
      })
      setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...editForm, basicPrice: parseFloat(editForm.basicPrice) } : p)))
      setEditingId(null)
    } catch (e) {
      setError(e.message || 'Update failed')
    }
  }

  const updateEdit = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateEditSize = (index, field, value) => {
    setEditForm((prev) => {
      const next = [...(prev.sizeInventories || [])]
      next[index] = { ...next[index], [field]: field === 'quantity' ? parseInt(value, 10) || 0 : value }
      return { ...prev, sizeInventories: next }
    })
  }

  if (loading) return <p className="text-[#E5E5E5]">Loading inventory…</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <>
      <h2 className="font-cormorant text-xl uppercase text-[#E5E5E5] mb-6">Inventory</h2>
      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-[#E5E5E5]/70">No products yet. Add one from Add Product.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="border border-[#E5E5E5]/30 p-4 flex flex-wrap items-start gap-4"
            >
              <div className="w-20 h-24 bg-neutral-800 flex-shrink-0 overflow-hidden rounded-sm">
                {p.imageUrls && p.imageUrls.length > 0 ? (
                  <AdminProductImage productId={p.id} alt={p.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#E5E5E5]/50 text-xs">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editingId === p.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => updateEdit('name', e.target.value)}
                      className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-1.5 px-2 text-sm"
                    />
                    <input
                      type="number"
                      value={editForm.basicPrice}
                      onChange={(e) => updateEdit('basicPrice', e.target.value)}
                      className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-1.5 px-2 text-sm"
                    />
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => updateEdit('category', e.target.value)}
                      className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-1.5 px-2 text-sm"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => updateEdit('description', e.target.value)}
                      className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-1.5 px-2 text-sm min-h-[60px]"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {(editForm.sizeInventories || []).map((s, i) => (
                        <div key={i} className="flex gap-1 items-center">
                          <span className="text-sm text-[#E5E5E5]/80 w-8 uppercase">{s.sizeName}</span>
                          <input
                            type="number"
                            min="0"
                            value={s.quantity}
                            onChange={(e) => updateEditSize(i, 'quantity', e.target.value)}
                            className="w-14 bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-1 px-1 text-sm"
                            placeholder="Qty"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-[#E5E5E5]/80 mb-1">
                        Product images (max 3). Current: {products.find((p) => p.id === editingId)?.imageUrls?.length ?? 0}/3
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                          className="text-sm text-[#E5E5E5] file:mr-2 file:py-1 file:px-2 file:border file:border-[#D1C7B7] file:bg-transparent file:text-[#D1C7B7] file:text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleUploadImages}
                          disabled={uploadingImages || imageFiles.length === 0}
                          className="py-1.5 px-3 text-sm bg-[#D1C7B7] text-[#1a1a1a] disabled:opacity-50"
                        >
                          {uploadingImages ? 'Uploading…' : 'Upload images'}
                        </button>
                        {imageFiles.length > 0 && (
                          <span className="text-xs text-[#E5E5E5]/70">{imageFiles.length} file(s) selected</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="py-1.5 px-3 text-sm bg-[#D1C7B7] text-[#1a1a1a]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="py-1.5 px-3 text-sm border border-[#E5E5E5]/40 text-[#E5E5E5]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-[#E5E5E5]">{p.name}</p>
                    <p className="text-sm text-[#E5E5E5]/80">₹{p.basicPrice} · {p.category || '—'}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="text-xs uppercase py-1 px-2 border border-[#D1C7B7] text-[#D1C7B7] hover:bg-[#D1C7B7]/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-xs uppercase py-1 px-2 border border-red-400/60 text-red-400 hover:bg-red-400/10"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
