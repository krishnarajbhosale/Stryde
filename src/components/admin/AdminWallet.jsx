import { useEffect, useState } from 'react'
import { adminCreditWallet, getWalletCustomers, getWalletOrdersByCustomer } from '../../api/walletApi'

export default function AdminWallet() {
  const [customers, setCustomers] = useState([])
  const [selectedEmail, setSelectedEmail] = useState('')
  const [orders, setOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const list = await getWalletCustomers()
        setCustomers(list || [])
      } catch (e) {
        setError(e.message || 'Failed to load customers')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedEmail) {
      setOrders([])
      setSelectedOrderId('')
      return
    }
    const loadOrders = async () => {
      setError('')
      try {
        const data = await getWalletOrdersByCustomer(selectedEmail)
        setOrders(data || [])
        setSelectedOrderId(data?.[0]?.id ? String(data[0].id) : '')
      } catch (e) {
        setError(e.message || 'Failed to load orders')
      }
    }
    loadOrders()
  }, [selectedEmail])

  const handleCredit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminCreditWallet(Number(selectedOrderId), Number(amount))
      setMessage('Wallet credited successfully.')
      setAmount('')
    } catch (e) {
      setError(e.message || 'Failed to credit wallet')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[#E5E5E5]">Loading wallet module...</p>

  return (
    <>
      <h2 className="font-cormorant text-xl uppercase text-[#E5E5E5] mb-6">Wallet Refunds</h2>
      <form onSubmit={handleCredit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-xs uppercase text-[#D1C7B7] mb-1">Select User</label>
          <select
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-2 px-2 text-sm"
            required
          >
            <option value="">Choose customer</option>
            {customers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase text-[#D1C7B7] mb-1">Select Order</label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-2 px-2 text-sm"
            required
          >
            <option value="">Choose order</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber || `Order ${o.id}`} - Rs. {Number(o.totalAmount || 0).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase text-[#D1C7B7] mb-1">Amount</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-2 px-2 text-sm"
            required
          />
        </div>

        {message && <p className="text-sm text-[#D1C7B7]">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="py-2.5 px-4 text-sm uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60"
        >
          {saving ? 'Processing...' : 'Credit Wallet'}
        </button>
      </form>
    </>
  )
}

