import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const inputUnderline =
  'w-full bg-transparent border-0 border-b border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] py-2.5 focus:outline-none focus:border-[#D1C7B7] transition-colors text-sm uppercase tracking-wide'

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Hook into backend or email service later
  }

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Contact Us
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-10 max-w-xl">
            For any questions about your order, sizing, or our pieces, leave us a note below and the
            Strydeeva team will get back to you within 1–2 business days.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] gap-10 lg:gap-16 items-start">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={inputUnderline}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className={inputUnderline}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Order, sizing, styling…"
                  className={inputUnderline}
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Share as many details as you can so we can assist you quickly."
                  className="w-full bg-transparent border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] px-3 py-3 text-sm uppercase tracking-wide focus:outline-none focus:border-[#D1C7B7] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
              >
                Submit
              </button>
            </form>

            <div className="space-y-6 text-sm text-[#E5E5E5]/80">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                  Email
                </p>
                <p>care@strydeeva.com</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                  Support Hours
                </p>
                <p>Monday – Friday, 10:00 AM to 7:00 PM IST</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#D1C7B7] mb-2">
                  Response Time
                </p>
                <p>We aim to respond within 24–48 hours on business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ContactPage

