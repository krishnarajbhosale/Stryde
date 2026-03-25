export async function initiateEasebuzzPayment(orderPayload, paymentMethod) {
  const res = await fetch('/api/payments/easebuzz/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod, order: orderPayload }),
  })
  if (!res.ok) {
    let msg = 'Failed to start payment'
    const text = await res.text().catch(() => '')
    if (text) msg = text
    throw new Error(msg)
  }
  return res.json()
}

