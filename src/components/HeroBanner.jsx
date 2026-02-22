import { Link } from 'react-router-dom'
import heroImage from '../assets/HeroBanner.jpg'

function ScrollIndicator() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6 text-[#E5E5E5] animate-bounce" aria-hidden>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  )
}

function HeroBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-900"
      aria-label="Hero banner"
    >
      <div className="relative w-full max-w-[1550px] mx-auto aspect-[1470/840] min-h-[60vh] md:min-h-0">
        <img
          src={heroImage}
          alt="Modern elegance — professional style in a contemporary setting"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent md:from-black/40 md:via-transparent md:to-transparent"
          aria-hidden
        />
        {/* Mobile-only overlay: serif display type + CTA + scroll */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-12 md:hidden">
          <div className="text-center text-[#E8E8E8] font-cormorant font-medium uppercase max-w-[90%]">
            <p className="text-[2.25rem] leading-[1.35] tracking-[0.02em]">NOT JUST</p>
            <p className="text-[2.25rem] leading-[1.35] tracking-[0.02em] mt-4">CLOTHING.</p>
            <p className="text-[1.75rem] leading-[1.35] tracking-[0.02em] mt-5">A</p>
            <p className="text-[2.25rem] leading-[1.35] tracking-[0.02em] mt-2">MOVEMENT.</p>
          </div>
          <Link
            to="/collection"
            className="mt-10 px-12 py-3.5 text-xs font-normal tracking-[0.25em] uppercase bg-[#D9D9D9] text-[#333333] hover:bg-[#cfcfcf] transition-colors border-0 rounded-none"
          >
            SHOP COLLECTION
          </Link>
          <div className="mt-10 flex justify-center">
            <ScrollIndicator />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
