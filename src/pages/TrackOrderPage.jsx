import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  requestCustomerOtp,
  verifyCustomerOtp,
  isCustomerLoggedIn,
  customerLogout,
} from '../api/customerAuthApi'
import { getMyOrders } from '../api/ordersApi'
import { getMyWallet } from '../api/walletApi'

const inputUnderline =
  'w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide'

function TrackOrderPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersError, setOrdersError] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] })

  useEffect(() => {
    window.scrollTo(0, 0)
    if (isCustomerLoggedIn()) {
      setStep('orders')
      loadOrders()
      loadWallet()
    }
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    setOrdersError('')
    try {
      const data = await getMyOrders()
      setOrders(data || [])
    } catch (e) {
      setOrdersError(e.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const loadWallet = async () => {
    try {
      const data = await getMyWallet()
      setWallet(data || { balance: 0, transactions: [] })
    } catch {
      setWallet({ balance: 0, transactions: [] })
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const data = await requestCustomerOtp(email.trim())
      setStep('otp')
      setDevOtp(data.devOtp || '')
      setMessage('A 6-digit code has been sent to your email.')
    } catch (e) {
      setMessage(e.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await verifyCustomerOtp(email.trim(), otp.trim())
      setStep('orders')
      setOtp('')
      setDevOtp('')
      await loadOrders()
      await loadWallet()
    } catch (e) {
      setMessage(e.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await customerLogout()
    setStep('email')
    setOrders([])
    setEmail('')
    setOtp('')
    setMessage('')
  }

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            My Orders
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-10 max-w-xl">
            Sign in using your email and 6-digit code to view only your own orders and purchases.
          </p>
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="max-w-xl space-y-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={inputUnderline}
                  required
                />
              </div>
              {message && <p className="text-xs text-[#E5E5E5]/80">{message}</p>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send 6-Digit Code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="max-w-xl space-y-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className={inputUnderline}
                  required
                />
              </div>
              {message && <p className="text-xs text-[#E5E5E5]/80">{message}</p>}
              {devOtp && (
                <p className="text-xs text-[#D1C7B7]/90">
                  Dev code: <span className="font-mono">{devOtp}</span>
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setMessage('') }}
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium tracking-wide uppercase border border-[#D1C7B7] text-[#D1C7B7]"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {step === 'orders' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#E5E5E5]/80">Signed in as {localStorage.getItem('customerEmail') || 'customer'}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs uppercase border border-[#D1C7B7] text-[#D1C7B7] px-3 py-1.5"
                >
                  Logout
                </button>
              </div>
              {ordersError && <p className="text-red-400 text-sm">{ordersError}</p>}
              {loading ? (
                <p className="text-[#E5E5E5]/80">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-[#E5E5E5]/70">No orders found for this account.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="border border-[#E5E5E5]/25 p-4">
                      <p className="text-sm uppercase text-[#D1C7B7]">{o.orderNumber}</p>
                      <p className="text-xs text-[#E5E5E5]/70 mt-1">Status: {o.status}</p>
                      <p className="text-xs text-[#E5E5E5]/70">Total: Rs. {o.totalAmount}</p>
                      <div className="mt-2 space-y-1">
                        {(o.items || []).map((it, idx) => (
                          <p key={`${o.id}-${idx}`} className="text-xs text-[#E5E5E5]/80">
                            {it.productName} - {it.sizeName} x {it.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border border-[#E5E5E5]/25 p-4 mt-6">
                <p className="text-xs uppercase text-[#D1C7B7]">Wallet Balance</p>
                <p className="text-xl text-[#E5E5E5] mt-1">Rs. {Number(wallet.balance || 0).toLocaleString('en-IN')}</p>
                {(wallet.transactions || []).length > 0 && (
                  <div className="mt-3 space-y-1">
                    {(wallet.transactions || []).slice(0, 5).map((tx) => (
                      <p key={tx.id} className="text-xs text-[#E5E5E5]/75">
                        Order #{tx.orderId}: + Rs. {Number(tx.amount || 0).toLocaleString('en-IN')}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TrackOrderPage

