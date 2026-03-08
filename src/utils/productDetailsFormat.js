/**
 * Structured product details: "Label: Value" per line, stored in product.description.
 * Keys shown in two-column layout; "Care instructions" and "Pack contains" full-width.
 */

export const PRODUCT_DETAIL_KEYS = [
  'Material',
  'Pattern',
  'Occasion',
  'Fit',
  'Neckline',
  'Closure',
  'Sleeve Style',
  'Dress Shape',
  'Pack Size',
]

export const FULL_WIDTH_KEYS = ['Care instructions', 'Pack contains']

/** Parse description string into { label: value } (only "Label: Value" lines). */
export function parseProductDetails(description) {
  if (!description || typeof description !== 'string') return {}
  const out = {}
  const lines = description.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const label = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (label && value) out[label] = value
    }
  }
  return out
}

/** Build description string from { label: value }. Skips empty values. */
export function buildProductDetails(obj) {
  if (!obj || typeof obj !== 'object') return ''
  const allKeys = [...PRODUCT_DETAIL_KEYS, ...FULL_WIDTH_KEYS]
  return allKeys
    .filter((key) => obj[key] != null && String(obj[key]).trim() !== '')
    .map((key) => `${key}: ${String(obj[key]).trim()}`)
    .join('\n')
}

/** Default empty fields for admin form */
export function getDefaultProductDetails() {
  const keys = [...PRODUCT_DETAIL_KEYS, ...FULL_WIDTH_KEYS]
  return Object.fromEntries(keys.map((k) => [k, '']))
}
