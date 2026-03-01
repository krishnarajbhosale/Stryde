import { useState, useEffect } from 'react'
import { getOrders, downloadOrdersExcel } from '../../api/adminApi'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

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
                <th className="py-2 text-[#E5E5E5]/80 uppercase tracking-wide">Items</th>
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
                  <td className="py-3 text-[#E5E5E5]/80">
                    {o.items && o.items.length > 0
                      ? o.items.map((i, idx) => (
                          <span key={idx}>
                            {i.productName} ({i.sizeName}) × {i.quantity}
                            {idx < o.items.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
