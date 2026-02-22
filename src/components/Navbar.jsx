import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StrydeevaLogo from '../assets/whitelogo.png'
import { useCart } from '../context/CartContext'

const SCROLL_THRESHOLD = 50

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" aria-hidden>
      <path d="M19 7L5 7.00002M19 12H5M19 17H5" stroke="#E5E5E5" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { cart } = useCart()
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 h-14 md:h-16 border-b border-[#D1C7B7] transition-colors duration-300 ${
          scrolled ? 'bg-transparent' : 'bg-[#1a1a1a]'
        }`}
        aria-label="Main navigation"
      >
        {/* Left: Hamburger (mobile) or Nav links (desktop) */}
        <div className="flex items-center gap-8 min-w-0 md:min-w-[140px]">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-md text-[#E5E5E5] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#E5E5E5]/50 transition-colors"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <HamburgerIcon />
          </button>
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/collection"
              className="text-[#E5E5E5] text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Collection
            </Link>
            <Link
              to="/about"
              className="text-[#E5E5E5] text-sm font-medium hover:opacity-80 transition-opacity"
            >
              About
            </Link>
          </div>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img
              src={StrydeevaLogo}
              alt="Strydeeva"
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Right: Icon buttons (mobile: search + cart only; desktop: all) */}
        <div className="flex items-center gap-1 min-w-0 md:min-w-[140px] justify-end">
        <button
          type="button"
          className="p-2 rounded-md text-[#E5E5E5] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#E5E5E5]/50 transition-colors"
          aria-label="Search"
        >
          <svg
            viewBox="1274 34 20 20"
            fill="none"
            className="w-6 h-6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          >
            <path d="M1287.94 47.4585L1292 51.5M1283 38.5C1285.21 38.5 1287 40.2909 1287 42.5M1290 42.5C1290 38.634 1286.87 35.5 1283 35.5C1279.13 35.5 1276 38.634 1276 42.5C1276 46.366 1279.13 49.5 1283 49.5C1286.87 49.5 1290 46.366 1290 42.5Z" />
          </svg>
        </button>
        <button
          type="button"
          className="hidden md:block p-2 rounded-md text-[#E5E5E5] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#E5E5E5]/50 transition-colors"
          aria-label="Account"
        >
          <svg
            viewBox="1318 32 36 26"
            fill="none"
            className="w-6 h-6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          >
            <path d="M1336 45.5C1332.54 45.5 1329.63 47.84 1328.76 51.0229C1328.47 52.0886 1329.4 53 1330.5 53H1341.5C1342.6 53 1343.53 52.0886 1343.24 51.0229C1342.37 47.84 1339.46 45.5 1336 45.5Z" />
            <path d="M1339.5 39C1339.5 40.933 1337.93 42.5 1336 42.5C1334.07 42.5 1332.5 40.933 1332.5 39C1332.5 37.067 1334.07 35.5 1336 35.5C1337.93 35.5 1339.5 37.067 1339.5 39Z" />
          </svg>
        </button>
        <Link
          to="/cart"
          className="relative p-2 rounded-md text-[#E5E5E5] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#E5E5E5]/50 transition-colors"
          aria-label={`Cart${cartCount ? ` (${cartCount} items)` : ''}`}
        >
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#D1C7B7] text-[#1a1a1a] text-xs font-medium">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
          <svg
            viewBox="1377 35 22 20"
            fill="none"
            className="w-6 h-6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          >
            <path d="M1379 37L1380.87 37.6238C1381.57 37.8557 1382.08 38.4494 1382.21 39.1711L1383.31 45.3501C1383.48 46.3046 1384.31 47 1385.28 47H1392.9C1393.79 47 1394.57 46.4109 1394.82 45.5551L1396.26 40.5551C1396.63 39.2762 1395.67 38 1394.34 38H1385M1386 50.5C1386 51.3284 1385.33 52 1384.5 52C1383.67 52 1383 51.3284 1383 50.5C1383 49.6716 1383.67 49 1384.5 49C1385.33 49 1386 49.6716 1386 50.5ZM1394 50.5C1394 51.3284 1393.33 52 1392.5 52C1391.67 52 1391 51.3284 1391 50.5C1391 49.6716 1391.67 49 1392.5 49C1393.33 49 1394 49.6716 1394 50.5Z" />
          </svg>
        </Link>
      </div>
    </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden
        />
      )}
      <div
        className={`fixed top-0 left-0 z-40 w-full max-w-xs h-full bg-[#1a1a1a] border-r border-[#D1C7B7] shadow-xl transform transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-modal="true"
        aria-label="Navigation menu"
        role="dialog"
      >
        <div className="flex flex-col pt-20 px-6 gap-6">
          <Link
            to="/collection"
            className="text-[#E5E5E5] text-base font-medium hover:text-[#D1C7B7] transition-colors py-2"
            onClick={closeMenu}
          >
            Collection
          </Link>
          <Link
            to="/about"
            className="text-[#E5E5E5] text-base font-medium hover:text-[#D1C7B7] transition-colors py-2"
            onClick={closeMenu}
          >
            About
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar
