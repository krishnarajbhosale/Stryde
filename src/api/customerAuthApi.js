const API_BASE = '/api/auth'

function getToken() {
  return localStorage.getItem('customerToken') || ''
}

export async function requestCustomerOtp(email) {
  const res = await fetch(`${API_BASE}/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const text = await res.text().catch(() => '')
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = {} }
  if (!res.ok || data.success === false) {
    throw new Error(data.message || text || 'Failed to send OTP')
  }
  return data
}

export async function verifyCustomerOtp(email, otp) {
  const res = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  const text = await res.text().catch(() => '')
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = {} }
  if (!res.ok || !data.success || !data.token) throw new Error(data.message || text || 'Invalid OTP')
  localStorage.setItem('customerToken', data.token)
  localStorage.setItem('customerEmail', String(email || '').trim().toLowerCase())
  return data
}

export async function customerLogout() {
  const token = getToken()
  if (token) {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
  localStorage.removeItem('customerToken')
  localStorage.removeItem('customerEmail')
}

export function isCustomerLoggedIn() {
  return !!getToken()
}

export function getCustomerAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

