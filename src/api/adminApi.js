const API_BASE = '/api/admin'

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (data.success && data.token) {
    localStorage.setItem('adminToken', data.token)
  }
  return data
}

export function adminLogout() {
  const token = localStorage.getItem('adminToken')
  if (token) {
    fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    localStorage.removeItem('adminToken')
  }
}

export function isAdminAuthenticated() {
  return !!localStorage.getItem('adminToken')
}

export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export function getProductImageUrl(id, index) {
  return `${API_BASE}/products/${id}/image/${index}`
}

/** Fetches product image with auth and returns a blob URL (revoke with URL.revokeObjectURL when done) */
export async function getProductImageBlobUrl(id, index) {
  const token = localStorage.getItem('adminToken')
  const res = await fetch(getProductImageUrl(id, index), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) return null
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export async function createProduct(formData) {
  const token = localStorage.getItem('adminToken')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

export async function updateProduct(id, body) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete product')
  return res
}

export async function getOrders(status = 'CONFIRMED') {
  const res = await fetch(`${API_BASE}/orders?status=${status}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function downloadOrdersExcel() {
  const token = localStorage.getItem('adminToken')
  const res = await fetch(`${API_BASE}/orders/export/excel`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Failed to download')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'confirmed_orders.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}
