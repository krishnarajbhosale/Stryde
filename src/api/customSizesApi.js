/**
 * Create a custom size and store in DB. Returns { id }.
 */

const API_BASE = '/api/custom-sizes'

export async function createCustomSize(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    let message = 'Failed to save custom size'
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
