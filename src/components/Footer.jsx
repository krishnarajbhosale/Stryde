import whiteLogo from '../assets/whitelogo.png'

function Footer() {
  return (
    <footer className="w-full bg-black text-[#E5E5E5]">
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

          {/* POLICIES */}
          <div>
            <h3 className="text-[#E5E5E5] text-sm font-medium tracking-wide uppercase mb-4">
              POLICIES
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {[
                { label: 'Terms & Condition', href: '/terms-and-condition' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Shipping Policy', href: '/shipping-policy' },
                { label: 'Returns & Refund Policy', href: '/return-and-refund' },
                { label: 'Law of Jurisdiction', href: '/law-of-jurisdiction' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#B0B0B0] text-sm hover:text-[#E5E5E5] transition-colors"
                  >
                    {item.label}
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
              {['Contact Us', 'Track Order'].map((label) => (
                <li key={label}>
                  <a
                    href={`/${label.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                    className="text-[#B0B0B0] text-sm hover:text-[#E5E5E5] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/return-exchange" className="text-[#B0B0B0] text-sm hover:text-[#E5E5E5] transition-colors">
                  Return / Exchange Request
                </a>
              </li>
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
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-5 flex items-center justify-center">
          <p className="text-[#808080] text-xs text-center">
            © 2026 STRYDEEVA. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
