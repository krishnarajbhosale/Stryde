/** Must match backend InvoicePdfService.formatInvoiceId (Asia/Kolkata date + padded order id). */

const INVOICE_TZ = 'Asia/Kolkata'

/**
 * @param {{ id?: number, createdAt?: string, invoiceNumber?: string, invoice_number?: string }} order
 * @returns {string}
 */
export function formatOrderInvoiceNumber(order) {
  if (!order) return '—'
  const raw =
    order.invoiceNumber ??
    order.invoice_number ??
    order.invoiceId ??
    order.invoice_id
  if (raw != null && String(raw).trim() !== '') return String(raw).trim()

  const id = order.id
  if (id == null || id === '') return '—'
  const idPart = String(Number(id)).padStart(6, '0')

  let datePart = 'NA'
  if (order.createdAt) {
    const d = new Date(order.createdAt)
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: INVOICE_TZ,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const parts = fmt.formatToParts(d)
    const day = parts.find((p) => p.type === 'day')?.value
    const month = parts.find((p) => p.type === 'month')?.value
    const year = parts.find((p) => p.type === 'year')?.value
    if (day && month && year) datePart = `${day}${month}${year}`
  }
  return `INV-${datePart}-${idPart}`
}
