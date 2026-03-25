import { useEffect, useMemo, useState } from 'react'
import { getOrders, getTrackingOrder, setTrackingAwb } from '../../api/adminApi'

export default function AdminTracking() {
  const [orderId, setOrderId] = useState('')
  const [awb, setAwb] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [ordersList, setOrdersList] = useState([])

  useEffect(() => {
    // Helpful dropdown of existing orders (best-effort)
    getOrders('ALL').then(setOrdersList).catch(() => setOrdersList([]))
  }, [])

  const options = useMemo(
    () =>
      (ordersList || [])
        .slice(0, 300)
        .map((o) => ({
          id: o.id,
          label: `${o.id} — ${o.orderNumber || ''} — ${o.customerName || ''}`,
        })),
    [ordersList],
  )

  const handleSearch = async (e) => {
    e.preventDefault()
    const id = String(orderId || '').trim()
    if (!id) return
    setLoading(true)
    setError('')
    setMessage('')
    setOrder(null)
    try {
      const data = await getTrackingOrder(id)
      setOrder(data)
      setAwb(data.awbNumber || '')
    } catch (err) {
      setError(err.message || 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!order?.id) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await setTrackingAwb(order.id, awb)
      setMessage('AWB saved.')
      setOrder((prev) => ({ ...(prev || {}), awbNumber: res.awbNumber || '' }))
    } catch (err) {
      setError(err.message || 'Failed to save AWB')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="font-cormorant text-xl uppercase text-[#E5E5E5] mb-6">Tracking</h2>

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/70 mb-2">
            Order ID
          </label>
          <input
            list="orderIds"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Type order id (e.g. 26)"
            className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 px-3 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide"
          />
          <datalist id="orderIds">
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </datalist>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-2.5 px-4 text-sm font-medium uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      {message && <p className="text-[#D1C7B7] text-sm mt-4">{message}</p>}

      {order && (
        <div className="mt-6 border border-[#E5E5E5]/25 p-4 space-y-3">
          <div className="text-sm text-[#E5E5E5]/90">
            <p>
              <span className="text-[#E5E5E5]/60">Order:</span> {order.orderNumber || order.id}
            </p>
            <p>
              <span className="text-[#E5E5E5]/60">Customer:</span> {order.customerName || '—'}{' '}
              <span className="text-[#E5E5E5]/60">({order.customerEmail || '—'})</span>
            </p>
            <p>
              <span className="text-[#E5E5E5]/60">Status:</span> {order.status || '—'}
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[#E5E5E5]/70 mb-2">
              AWB Number (DTDC)
            </label>
            <input
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter AWB number"
              className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 px-3 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="py-2.5 px-4 text-sm font-medium uppercase border border-[#D1C7B7] text-[#D1C7B7] hover:bg-[#D1C7B7]/10 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save AWB'}
            </button>
            <a
              href="https://www.dtdc.in/trace.asp"
              target="_blank"
              rel="noreferrer"
              className="text-xs uppercase text-[#D1C7B7] hover:opacity-80"
            >
              Open DTDC tracking site
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

