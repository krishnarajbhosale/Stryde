import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function OrderSuccessPage() {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber || '—'

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#D1C7B7] mb-4">
            Thank you
          </h1>
          <p className="text-[#E5E5E5] mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-[#E5E5E5]/90 text-sm mb-8">
            Order number: <span className="font-medium text-[#D1C7B7]">{orderNumber}</span>
          </p>
          <Link
            to="/"
            className="inline-block py-3 px-6 text-sm font-medium tracking-wide uppercase bg-[#D1C7B7] text-[#1a1a1a] hover:bg-[#D1C7B7]/90 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default OrderSuccessPage
