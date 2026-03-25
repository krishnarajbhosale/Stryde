const API_BASE = '/api/promocodes'

export async function validatePromoCode(code, baseCartValue) {
  const qs = new URLSearchParams({
    code: String(code || ''),
    baseCartValue: String(baseCartValue || 0),
  })
  const res = await fetch(`${API_BASE}/validate?${qs.toString()}`)
  if (!res.ok) throw new Error('Failed to validate promo code')
  return res.json()
}

