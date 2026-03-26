export async function initiateEasebuzzPayment(orderPayload, paymentMethod) {
  const res = await fetch('/api/payments/easebuzz/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod, order: orderPayload }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error || data.message || 'Failed to start payment'
    throw new Error(typeof msg === 'string' ? msg : 'Failed to start payment')
  }
  return data
}

