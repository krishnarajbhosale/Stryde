import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Routes, Route, Link, Navigate } from 'react-router-dom'
import { adminLogin, isAdminAuthenticated, adminLogout } from '../api/adminApi'
import AdminProductForm from '../components/admin/AdminProductForm'
import AdminInventory from '../components/admin/AdminInventory'
import AdminOrders from '../components/admin/AdminOrders'

const inputClass =
  'w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 px-3 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide'

function AdminLoginForm({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminLogin(username, password)
      if (data.success) onSuccess()
      else setError('Invalid username or password.')
    } catch {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-[#D1C7B7]/50 p-8">
        <h1 className="font-cormorant text-2xl uppercase text-[#E5E5E5] mb-2 text-center">Admin Panel</h1>
        <p className="text-xs text-[#E5E5E5]/70 uppercase tracking-wide text-center mb-6">Sign in</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={inputClass}
            required
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AdminNavbar({ onLogout }) {
  const location = useLocation()
  const base = '/adminlogin/101'
  const linkClass = (path) =>
    `text-sm font-medium uppercase tracking-wide ${location.pathname === path ? 'text-[#D1C7B7]' : 'text-[#E5E5E5] hover:text-[#D1C7B7]'}`
  return (
    <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 h-14 border-b border-[#D1C7B7] bg-black">
      <div className="flex items-center gap-6">
        <Link to={`${base}/add-product`} className={linkClass(`${base}/add-product`)}>
          Add Product
        </Link>
        <Link to={`${base}/inventory`} className={linkClass(`${base}/inventory`)}>
          Inventory
        </Link>
        <Link to={`${base}/orders`} className={linkClass(`${base}/orders`)}>
          Orders
        </Link>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="text-sm uppercase text-[#E5E5E5] hover:text-[#D1C7B7] transition-colors"
      >
        Logout
      </button>
    </nav>
  )
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated())
    setChecking(false)
  }, [])

  useEffect(() => {
    if (checking) return
    if (authenticated) {
      // Logged in: ensure we're on a panel route, not the bare /adminlogin/101
      if (location.pathname === '/adminlogin/101' || location.pathname === '/adminlogin/101/') {
        navigate('/adminlogin/101/add-product', { replace: true })
      }
    } else {
      // Not logged in: show login only; redirect any subpath to base URL so login page is the only view
      if (location.pathname !== '/adminlogin/101' && location.pathname.startsWith('/adminlogin/101')) {
        navigate('/adminlogin/101', { replace: true })
      }
    }
  }, [authenticated, checking, location.pathname, navigate])

  const handleLoginSuccess = () => {
    setAuthenticated(true)
    navigate('/adminlogin/101/add-product', { replace: true })
  }

  const handleLogout = () => {
    adminLogout()
    setAuthenticated(false)
    navigate('/adminlogin/101', { replace: true })
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#E5E5E5]">
        Loading…
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLoginForm onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-black text-[#E5E5E5]">
      <AdminNavbar onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route index element={<Navigate to="add-product" replace />} />
          <Route path="add-product" element={<AdminProductForm />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
        </Routes>
      </main>
    </div>
  )
}
