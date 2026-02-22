import whiteLogo from '../assets/whitelogo.png'

function Footer() {
  return (
    <footer className="w-full bg-[#0d0d0d] text-[#E5E5E5]">
      {/* Line above footer */}
      <div className="h-px w-full bg-[#D1C7B7]" aria-hidden />

      <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="flex flex-col">
            <a href="/" className="inline-block mb-4">
              <img
                src={whiteLogo}
                alt="Strydeeva"
                className="h-8 w-auto object-contain"
              />
            </a>
            <h3 className="text-[#E5E5E5] text-sm font-medium tracking-wide uppercase mb-2">
              About Us
            </h3>
            <p className="text-[#B0B0B0] text-sm leading-relaxed max-w-xs">
              Where sharp urban lines meet high-fashion artistry. A statement of power and restraint.
            </p>
          </div>

          {/* SHOP */}
          <div>
            <h3 className="text-[#E5E5E5] text-sm font-medium tracking-wide uppercase mb-4">
              SHOP
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {['New Collection', 'Limited Collection', 'All Products'].map((label) => (
                <li key={label}>
                  <a
                    href={`/${label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-[#B0B0B0] text-sm hover:text-[#E5E5E5] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-[#E5E5E5] text-sm font-medium tracking-wide uppercase mb-4">
              SUPPORT
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {['Contact Us', 'Track Order', 'Return & Refund', 'Terms & Condition'].map((label) => (
                <li key={label}>
                  <a
                    href={`/${label.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                    className="text-[#B0B0B0] text-sm hover:text-[#E5E5E5] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-[#E5E5E5] text-sm font-medium tracking-wide uppercase mb-4">
              NEWSLETTER
            </h3>
            <p className="text-[#B0B0B0] text-sm mb-4 max-w-xs">
              Subscribe For Exclusive Access and Updates
            </p>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                className="w-full max-w-sm px-4 py-3 text-sm bg-transparent border border-[#E5E5E5]/40 text-[#E5E5E5] placeholder:text-[#808080] focus:outline-none focus:border-[#E5E5E5]/70 transition-colors"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="w-full max-w-sm px-4 py-3 text-sm font-medium tracking-wide uppercase bg-[#E5E5E5] text-[#1a1a1a] hover:bg-[#d0d0d0] transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#333]">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[#808080] text-xs">
            © 2026 STRYDEEVA. All rights reserved
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-[#808080] text-xs hover:text-[#E5E5E5] transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-[#808080] text-xs hover:text-[#E5E5E5] transition-colors">
              Terms
            </a>
            <a href="/conditions" className="text-[#808080] text-xs hover:text-[#E5E5E5] transition-colors">
              Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
