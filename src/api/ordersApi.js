/**
 * Public API to create an order (after successful payment). No auth.
 */

const API_BASE = '/api/orders'

/**
 * @param {{
 *   customerEmail: string
 *   customerName: string
 *   shippingAddress: string
 *   city: string
 *   pinCode: string
 *   totalAmount: number
 *   items: Array<{ productId: number; productName: string; sizeName: string; quantity: number; unitPrice: number }>
 * }} payload
 * @returns {Promise<{ id: number; orderNumber: string }>}
 */
export async function createOrder(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let message = 'Failed to place order'
    const text = await res.text()
    if (text) {
      try {
        const body = JSON.parse(text)
        if (body.message) message = body.message
      } catch {
        message = text
      }
    }
    throw new Error(message)
  }
  return res.json()
}
