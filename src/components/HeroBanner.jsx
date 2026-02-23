import { Link } from 'react-router-dom'
import heroImage from '../assets/HeroBanner.jpg'

function ScrollIndicator() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-5 text-white animate-bounce" aria-hidden>
      <path d="M12 5v14" />
    </svg>
  )
}

function HeroBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-900"
      aria-label="Hero banner"
    >
      <div className="relative w-full max-w-[1550px] mx-auto aspect-[1470/840] min-h-[100vh] lg:min-h-0">
        <img
          src={heroImage}
          alt="Modern elegance — professional style in a contemporary setting"
          className="absolute inset-0 w-full h-full object-cover object-center grayscale lg:grayscale-0"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent lg:from-black/40 lg:via-transparent lg:to-transparent"
          aria-hidden
        />
        {/* Mobile & tablet (iPad) only: text + button in one block — hidden on laptop/PC (lg and up) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 pt-14 pb-20 sm:pt-16 sm:pb-24 lg:hidden w-full h-full">
          <div className="flex flex-col items-center justify-center w-full max-w-[92%]">
            <div className="text-center text-white font-cormorant font-medium uppercase w-full">
              <p className="leading-[1.15] tracking-[0.02em]" style={{ fontSize: 'clamp(1.5rem, 7.5vh, 4rem)', animation: 'hero-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards' }}>NOT JUST</p>
              <p className="leading-[1.15] tracking-[0.02em] mt-0.5" style={{ fontSize: 'clamp(1.5rem, 7.5vh, 4rem)', animation: 'hero-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.25s forwards' }}>CLOTHING.</p>
              <p className="leading-[1.15] tracking-[0.02em] mt-2" style={{ fontSize: 'clamp(1.25rem, 6vh, 3rem)', animation: 'hero-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards' }}>A</p>
              <p className="leading-[1.15] tracking-[0.02em] mt-0.5" style={{ fontSize: 'clamp(1.5rem, 7.5vh, 4rem)', animation: 'hero-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.55s forwards' }}>MOVEMENT.</p>
            </div>
            <Link
              to="/collection"
              className="mt-3 min-w-[260px] sm:min-w-[300px] w-full max-w-[320px] px-14 sm:px-16 py-3 sm:py-3.5 text-[11px] sm:text-xs font-normal tracking-[0.2em] uppercase bg-[#D9D9D9] text-[#333333] hover:bg-[#cfcfcf] transition-colors rounded-sm text-center"
              style={{ animation: 'hero-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards' }}
            >
              SHOP COLLECTION
            </Link>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center">
            <ScrollIndicator />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
