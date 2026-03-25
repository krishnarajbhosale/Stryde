const API_BASE = '/api'

function getCustomerToken() {
  return localStorage.getItem('customerToken') || ''
}

function getAdminToken() {
  return localStorage.getItem('adminToken') || ''
}

export async function getMyWallet() {
  const token = getCustomerToken()
  const res = await fetch(`${API_BASE}/wallet/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (res.status === 401) throw new Error('Please sign in to view your wallet')
  if (!res.ok) throw new Error('Failed to fetch wallet')
  return res.json()
}

export async function getWalletCustomers() {
  const token = getAdminToken()
  const res = await fetch('/api/admin/wallet/customers', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Failed to fetch customers')
  return res.json()
}

export async function getWalletOrdersByCustomer(email) {
  const token = getAdminToken()
  const res = await fetch(`/api/admin/wallet/orders?email=${encodeURIComponent(email || '')}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Failed to fetch customer orders')
  return res.json()
}

export async function adminCreditWallet(orderId, amount) {
  const token = getAdminToken()
  const res = await fetch('/api/admin/wallet/credit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ orderId, amount }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to credit wallet')
  return data
}

