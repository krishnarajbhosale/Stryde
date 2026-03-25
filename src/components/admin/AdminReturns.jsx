import { useEffect, useState } from 'react'
import { getReturnRequests, getReturnVideoUrl } from '../../api/adminApi'

export default function AdminReturns() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getReturnRequests()
      setRows(data || [])
    } catch (e) {
      setError(e.message || 'Failed to load return requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <p className="text-[#E5E5E5]">Loading return requests…</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-cormorant text-xl uppercase text-[#E5E5E5]">Return &amp; Exchange</h2>
        <button
          type="button"
          onClick={load}
          className="py-2 px-4 text-sm font-medium uppercase border border-[#D1C7B7] text-[#D1C7B7] hover:bg-[#D1C7B7]/10 transition-colors"
        >
          Refresh
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-[#E5E5E5]/70">No return/exchange requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#E5E5E5]/40">
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Date</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Customer</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Order ID</th>
                <th className="py-2 pr-4 text-[#E5E5E5]/80 uppercase tracking-wide">Video</th>
                <th className="py-2 text-[#E5E5E5]/80 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#E5E5E5]/20">
                  <td className="py-3 pr-4 text-[#E5E5E5]/80">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-3 pr-4 text-[#E5E5E5]">
                    {r.customerName || '—'}
                    <br />
                    <span className="text-[#E5E5E5]/70">{r.email || '—'}</span>
                    {r.contactNumber && (
                      <>
                        <br />
                        <span className="text-[#E5E5E5]/70">{r.contactNumber}</span>
                      </>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-[#E5E5E5]">{r.orderId || '—'}</td>
                  <td className="py-3 pr-4 text-[#E5E5E5]/80">{r.hasVideo ? 'Yes' : '—'}</td>
                  <td className="py-3 text-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="text-xs uppercase py-1 px-2 border border-[#D1C7B7] text-[#D1C7B7] hover:bg-[#D1C7B7]/10"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#111] border border-[#E5E5E5]/40 max-w-3xl w-full max-h-[90vh] overflow-auto rounded shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]/30">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#E5E5E5]">
                Return Request #{selected.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[#E5E5E5] hover:opacity-80 text-lg leading-none px-2"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-[#E5E5E5]/90">
              <p><span className="text-[#E5E5E5]/60">Name:</span> {selected.customerName || '—'}</p>
              <p><span className="text-[#E5E5E5]/60">Email:</span> {selected.email || '—'}</p>
              <p><span className="text-[#E5E5E5]/60">Contact:</span> {selected.contactNumber || '—'}</p>
              <p><span className="text-[#E5E5E5]/60">Order ID:</span> {selected.orderId || '—'}</p>
              <p><span className="text-[#E5E5E5]/60">Issue:</span> {selected.issueText || '—'}</p>

              {selected.hasVideo && (
                <div className="pt-2 border-t border-[#E5E5E5]/20">
                  <p className="text-xs uppercase tracking-wide text-[#E5E5E5]/60 mb-2">Video</p>
                  <video
                    controls
                    className="w-full max-h-[60vh] bg-black"
                    src={getReturnVideoUrl(selected.id)}
                  />
                  <a
                    href={getReturnVideoUrl(selected.id)}
                    className="inline-block mt-2 text-xs uppercase border border-[#D1C7B7] text-[#D1C7B7] px-3 py-1.5"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open video
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

