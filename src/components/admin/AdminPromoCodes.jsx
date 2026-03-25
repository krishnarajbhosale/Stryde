import { useEffect, useState } from 'react'
import { createPromoCode, deletePromoCode, getPromoCodes } from '../../api/adminApi'

const inputClass =
  'w-full bg-black border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2 px-2 text-sm focus:outline-none focus:border-[#D1C7B7]'

export default function AdminPromoCodes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    code: '',
    percentOff: '',
    minOrderValue: '',
    maxDiscount: '',
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPromoCodes()
      setRows(data || [])
    } catch (e) {
      setError(e.message || 'Failed to load promo codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await createPromoCode({
        code: form.code,
        percentOff: Number(form.percentOff),
        minOrderValue: Number(form.minOrderValue),
        maxDiscount: Number(form.maxDiscount),
      })
      setMessage('Promo code saved.')
      setForm({ code: '', percentOff: '', minOrderValue: '', maxDiscount: '' })
      await load()
    } catch (e) {
      setError(e.message || 'Failed to save promo code')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return
    setError('')
    try {
      await deletePromoCode(id)
      await load()
    } catch (e) {
      setError(e.message || 'Delete failed')
    }
  }

  if (loading) return <p className="text-[#E5E5E5]">Loading promo codes…</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <>
      <h2 className="font-cormorant text-xl uppercase text-[#E5E5E5] mb-6">Promo Codes</h2>

      <form onSubmit={onSubmit} className="max-w-xl space-y-3 mb-10 border border-[#E5E5E5]/25 p-4">
        <p className="text-xs uppercase tracking-wide text-[#D1C7B7]">Add promo code</p>
        <input name="code" value={form.code} onChange={onChange} placeholder="Code (e.g. STRY10)" className={inputClass} required />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input name="percentOff" value={form.percentOff} onChange={onChange} placeholder="% off" className={inputClass} type="number" min="1" max="100" required />
          <input name="minOrderValue" value={form.minOrderValue} onChange={onChange} placeholder="Min order value" className={inputClass} type="number" min="0" required />
          <input name="maxDiscount" value={form.maxDiscount} onChange={onChange} placeholder="Max discount" className={inputClass} type="number" min="1" required />
        </div>
        {message && <p className="text-sm text-[#D1C7B7]">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="py-2.5 px-4 text-sm uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Add'}
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="text-[#E5E5E5]/70">No promo codes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#E5E5E5]/40">
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Code</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Percent</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Min order</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Max discount</th>
                <th className="py-2 text-[#E5E5E5]/80 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#E5E5E5]/20">
                  <td className="py-3 pr-4 text-[#E5E5E5]">{r.code}</td>
                  <td className="py-3 pr-4 text-[#E5E5E5]/80">{r.percentOff}%</td>
                  <td className="py-3 pr-4 text-[#E5E5E5]/80">₹{Number(r.minOrderValue || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-[#E5E5E5]/80">₹{Number(r.maxDiscount || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 text-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      className="text-xs uppercase py-1 px-2 border border-red-400/60 text-red-400 hover:bg-red-400/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

