import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function ReturnsRefundPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Exchange &amp; Return Policy
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            Please read our Exchange and Return policies carefully before placing an order.
          </p>

          <div className="space-y-8 text-sm md:text-base text-[#E5E5E5]/85 leading-relaxed max-w-3xl">
            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Exchange Policy
              </h2>
              <ul className="list-decimal list-inside space-y-2 text-[#E5E5E5]/80">
                <li>Free exchange available within 7 days of delivery.</li>
                <li>No additional charges for exchange orders.</li>
                <li>International orders are not eligible for exchange.</li>
                <li>If the new product is of lower value, the balance amount will be issued as a gift voucher.</li>
                <li>Size exchange is subject to product availability.</li>
                <li>Products without the original price tag will not be accepted for exchange.</li>
                <li>No exchange available on customized sizes.</li>
                <li>An unboxing video is required in case a wrong product is received.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Return Policy
              </h2>
              <ul className="list-decimal list-inside space-y-2 text-[#E5E5E5]/80">
                <li>Returns are accepted within 7 days of delivery.</li>
                <li>Product must be unused and in its original condition.</li>
                <li>Product must have the original price tag attached.</li>
                <li>International orders are not eligible for return.</li>
                <li>No return available on customized sizes.</li>
                <li>Refunds will be issued only in the form of a gift card.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ReturnsRefundPage

