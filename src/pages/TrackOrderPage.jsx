import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const inputUnderline =
  'w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide'

function TrackOrderPage() {
  const [form, setForm] = useState({ orderId: '', emailOrPhone: '' })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Hook into real tracking API later
  }

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Track Order
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-10 max-w-xl">
            Enter your order ID and the email or mobile number used at checkout to view the latest
            status of your order.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                Order ID
              </label>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                placeholder="e.g. STRY1234"
                className={inputUnderline}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                Email / Mobile Number
              </label>
              <input
                type="text"
                name="emailOrPhone"
                value={form.emailOrPhone}
                onChange={handleChange}
                placeholder="As used during checkout"
                className={inputUnderline}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
            >
              Track Order
            </button>

            <p className="text-xs text-[#E5E5E5]/70 leading-relaxed max-w-xl">
              You&apos;ll also find tracking links in your shipping confirmation email. If you need
              further assistance, reach out via our Contact Us page.
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TrackOrderPage

