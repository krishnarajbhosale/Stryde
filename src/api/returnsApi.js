const API_BASE = '/api/returns'

export async function submitReturnRequest(payload) {
  const formData = new FormData()
  formData.append('name', payload.name || '')
  formData.append('contactNumber', payload.contactNumber || '')
  formData.append('email', payload.email || '')
  formData.append('orderId', payload.orderId || '')
  formData.append('issueText', payload.issueText || '')
  if (payload.videoFile) formData.append('video', payload.videoFile)

  const res = await fetch(API_BASE, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to submit request')
  return data
}

