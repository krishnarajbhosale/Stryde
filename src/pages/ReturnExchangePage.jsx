import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { submitReturnRequest } from '../api/returnsApi'
import { getMyOrders } from '../api/ordersApi'
import { isCustomerLoggedIn, requestCustomerOtp, verifyCustomerOtp } from '../api/customerAuthApi'

const inputClass =
  'w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm'

function ReturnExchangePage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authStep, setAuthStep] = useState('email')
  const [authEmail, setAuthEmail] = useState(localStorage.getItem('customerEmail') || '')
  const [authOtp, setAuthOtp] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authDevOtp, setAuthDevOtp] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [orders, setOrders] = useState([])

  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    email: '',
    orderId: '',
    issueText: '',
  })
  const [videoFile, setVideoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!isCustomerLoggedIn()) {
      setAuthOpen(true)
      setAuthStep('email')
    } else {
      loadOrdersAndAutofill()
    }
  }, [])

  const loadOrdersAndAutofill = async () => {
    try {
      const data = await getMyOrders()
      const list = Array.isArray(data) ? data : []
      setOrders(list)
      const latest = list[0]
      const email = localStorage.getItem('customerEmail') || ''
      setForm((p) => ({
        ...p,
        email: String(email || p.email || '').trim(),
        name: latest?.customerName ? String(latest.customerName) : p.name,
        contactNumber: latest?.customerMobile ? String(latest.customerMobile) : p.contactNumber,
        orderId: latest?.id != null ? String(latest.id) : p.orderId,
      }))
    } catch {
      // ignore; user might have no orders yet
      const email = localStorage.getItem('customerEmail') || ''
      if (email) setForm((p) => ({ ...p, email }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')
    try {
      const data = await requestCustomerOtp(authEmail.trim())
      setAuthStep('otp')
      setAuthDevOtp(data.devOtp || '')
      setAuthMessage('A 6-digit code has been sent to your email.')
    } catch (err) {
      setAuthMessage(err.message || 'Failed to send OTP')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')
    try {
      await verifyCustomerOtp(authEmail.trim(), authOtp.trim())
      setAuthOpen(false)
      setAuthOtp('')
      setAuthDevOtp('')
      await loadOrdersAndAutofill()
    } catch (err) {
      setAuthMessage(err.message || 'Invalid OTP')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isCustomerLoggedIn()) {
      setAuthOpen(true)
      setAuthStep('email')
      return
    }
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await submitReturnRequest({ ...form, videoFile })
      setMessage('Request submitted successfully. Confirmation email has been triggered.')
      setForm({ name: '', contactNumber: '', email: '', orderId: '', issueText: '' })
      setVideoFile(null)
    } catch (err) {
      setError(err.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Return & Exchange Request
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            Submit your return/exchange issue with product video proof.
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className={inputClass} required />
            <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" className={inputClass} required />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email ID" className={inputClass} required disabled={isCustomerLoggedIn()} />
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#D1C7B7] mb-2">Order ID</label>
              <select
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                className="w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] py-2 px-2 text-sm"
                required
              >
                <option value="">Select your order</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber || `Order ${o.id}`} (₹{Number(o.totalAmount || 0).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
              {orders.length === 0 && (
                <p className="text-xs text-[#E5E5E5]/60 mt-2">No orders found for this account.</p>
              )}
            </div>
            <textarea
              name="issueText"
              value={form.issueText}
              onChange={handleChange}
              placeholder="Issue with the product"
              className="w-full min-h-[120px] bg-transparent border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] px-3 py-2.5 text-sm focus:outline-none focus:border-[#D1C7B7]"
              required
            />
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#D1C7B7] mb-2">Product Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile((e.target.files || [])[0] || null)}
                className="text-sm text-[#E5E5E5] file:mr-2 file:py-1.5 file:px-3 file:border file:border-[#D1C7B7] file:bg-transparent file:text-[#D1C7B7]"
              />
            </div>

            {message && <p className="text-sm text-[#D1C7B7]">{message}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 text-sm uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </form>
        </div>
      </div>
      <Footer />

      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-[#111] border border-[#E5E5E5]/30 rounded shadow-xl">
            <div className="px-4 py-3 border-b border-[#E5E5E5]/20 flex items-center justify-between">
              <p className="text-sm uppercase tracking-wide text-[#E5E5E5]">Sign in required</p>
              <button
                type="button"
                onClick={() => setAuthOpen(false)}
                className="text-[#E5E5E5] text-lg leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-[#E5E5E5]/70 mb-4">
                Please sign in with your email to submit a return/exchange request. This ensures only you can access your orders.
              </p>

              {authStep === 'email' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Email"
                    className={inputClass}
                    required
                  />
                  {authMessage && <p className="text-xs text-[#E5E5E5]/80">{authMessage}</p>}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60"
                  >
                    {authLoading ? 'Sending…' : 'Send 6-digit code'}
                  </button>
                </form>
              )}

              {authStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input
                    type="text"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className={inputClass}
                    required
                  />
                  {authMessage && <p className="text-xs text-[#E5E5E5]/80">{authMessage}</p>}
                  {authDevOtp && (
                    <p className="text-xs text-[#D1C7B7]/90">
                      Dev code: <span className="font-mono">{authDevOtp}</span>
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex-1 py-3 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60"
                    >
                      {authLoading ? 'Verifying…' : 'Verify'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthStep('email'); setAuthOtp(''); setAuthMessage('') }}
                      className="flex-1 py-3 text-sm font-medium tracking-wide uppercase border border-[#D1C7B7] text-[#D1C7B7]"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ReturnExchangePage

