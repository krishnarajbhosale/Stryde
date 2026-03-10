import { useState, useEffect } from 'react'
import { getOrders, downloadOrdersExcel, getCustomSizeById } from '../../api/adminApi'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedCustomSize, setSelectedCustomSize] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getOrders('CONFIRMED')
      setOrders(data)
    } catch (e) {
      setError(e.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const openOrderDetails = async (order) => {
    setSelectedOrder(order)
    setSelectedCustomSize(null)
    const firstCustomItem = order.items?.find((i) => i.customSizeId)
    if (!firstCustomItem) return
    setDetailsLoading(true)
    try {
      const cs = await getCustomSizeById(firstCustomItem.customSizeId)
      setSelectedCustomSize(cs)
    } catch (e) {
      setSelectedCustomSize({ error: e.message || 'Failed to load custom size' })
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeOrderDetails = () => {
    setSelectedOrder(null)
    setSelectedCustomSize(null)
    setDetailsLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleDownloadExcel = async () => {
    setDownloading(true)
    try {
      await downloadOrdersExcel()
    } catch (e) {
      setError(e.message || 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <p className="text-[#E5E5E5]">Loading orders…</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="font-cormorant text-xl uppercase text-[#E5E5E5]">Confirmed Orders</h2>
        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={downloading || orders.length === 0}
          className="py-2 px-4 text-sm font-medium uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-50 transition-colors"
        >
          {downloading ? 'Downloading…' : 'Download Excel'}
        </button>
      </div>
      {orders.length === 0 ? (
        <p className="text-[#E5E5E5]/70">No confirmed orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#E5E5E5]/40">
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Order #</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Customer</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Amount</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Date</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Items</th>
                <th className="py-2 text-[#E5E5E5]/80 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[#E5E5E5]/20">
                  <td className="py-3 pr-4 text-[#E5E5E5]">{o.orderNumber || o.id}</td>
                  <td className="py-3 pr-4 text-[#E5E5E5]">
                    {o.customerName || '—'}<br />
                    <span className="text-[#E5E5E5]/70">{o.customerEmail || '—'}</span>
                  </td>
                  <td className="py-3 pr-4 text-[#E5E5E5]">₹{o.totalAmount != null ? Number(o.totalAmount).toLocaleString('en-IN') : '—'}</td>
                  <td className="py-3 pr-4 text-[#E5E5E5]/80">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-3 pr-4 text-[#E5E5E5]/80">
                    {o.items && o.items.length > 0
                      ? o.items.map((i, idx) => (
                          <span key={idx}>
                            {i.productName} ({i.sizeName}) × {i.quantity}
                            {i.customSizeId ? ' [Custom]' : ''}
                            {idx < o.items.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      : '—'}
                  </td>
                  <td className="py-3 text-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={() => openOrderDetails(o)}
                      className="text-xs uppercase py-1 px-2 border border-[#D1C7B7] text-[#D1C7B7] hover:bg-[#D1C7B7]/10"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#111] border border-[#E5E5E5]/40 max-w-3xl w-full max-h-[90vh] overflow-auto rounded shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]/30">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#E5E5E5]">
                Order Details #{selectedOrder.orderNumber || selectedOrder.id}
              </h3>
              <button
                type="button"
                onClick={closeOrderDetails}
                className="text-[#E5E5E5] hover:opacity-80 text-lg leading-none px-2"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm text-[#E5E5E5]/90">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#E5E5E5]/60 mb-1">Customer</p>
                  <p className="font-medium text-[#E5E5E5]">{selectedOrder.customerName || '—'}</p>
                  <p className="text-[#E5E5E5]/70">{selectedOrder.customerEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#E5E5E5]/60 mb-1">Order Info</p>
                  <p>Status: <span className="uppercase">{selectedOrder.status}</span></p>
                  <p>
                    Date:{' '}
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString()
                      : '—'}
                  </p>
                  <p>Total: ₹{selectedOrder.totalAmount != null ? Number(selectedOrder.totalAmount).toLocaleString('en-IN') : '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[#E5E5E5]/60 mb-1">Shipping address</p>
                <p>{selectedOrder.shippingAddress || '—'}</p>
                <p>
                  {selectedOrder.city || '—'} {selectedOrder.pinCode ? `- ${selectedOrder.pinCode}` : ''}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[#E5E5E5]/60 mb-2">Items</p>
                <ul className="space-y-1 list-none p-0 m-0">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx}>
                      <span className="font-medium text-[#E5E5E5]">{item.productName}</span>{' '}
                      <span className="uppercase">({item.sizeName})</span>{' '}
                      × {item.quantity} — ₹
                      {item.unitPrice != null ? Number(item.unitPrice).toLocaleString('en-IN') : '0'}
                      {item.customSizeId ? ' [Custom]' : ''}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedOrder.items?.some((i) => i.customSizeId) && (
                <div className="border-t border-[#E5E5E5]/20 pt-3 mt-2">
                  <p className="text-xs uppercase tracking-wide text-[#E5E5E5]/60 mb-2">
                    Custom size details
                  </p>
                  {detailsLoading && <p className="text-xs text-[#E5E5E5]/70">Loading custom size…</p>}
                  {!detailsLoading && selectedCustomSize && !selectedCustomSize.error && (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs md:text-sm">
                      <p>Bust: <span className="text-[#E5E5E5]">{selectedCustomSize.bust || '—'}</span></p>
                      <p>Waist: <span className="text-[#E5E5E5]">{selectedCustomSize.waist || '—'}</span></p>
                      <p>Hip: <span className="text-[#E5E5E5]">{selectedCustomSize.hip || '—'}</span></p>
                      <p>Shoulder: <span className="text-[#E5E5E5]">{selectedCustomSize.shoulder || '—'}</span></p>
                      <p>Armhole: <span className="text-[#E5E5E5]">{selectedCustomSize.armhole || '—'}</span></p>
                      <p>Sleeve length: <span className="text-[#E5E5E5]">{selectedCustomSize.sleeveLength || '—'}</span></p>
                      <p>Sleeve round (bicep): <span className="text-[#E5E5E5]">{selectedCustomSize.sleeveRoundBicep || '—'}</span></p>
                      <p>Height: <span className="text-[#E5E5E5]">{selectedCustomSize.height || '—'}</span></p>
                      <p className="col-span-2 mt-2">
                        Remark:{' '}
                        <span className="text-[#E5E5E5]">
                          {selectedCustomSize.remark || '—'}
                        </span>
                      </p>
                    </div>
                  )}
                  {!detailsLoading && selectedCustomSize && selectedCustomSize.error && (
                    <p className="text-xs text-red-400">{selectedCustomSize.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
