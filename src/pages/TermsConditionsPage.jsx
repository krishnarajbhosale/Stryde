import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function TermsConditionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            Please read these terms and conditions carefully before using this website or placing an order.
          </p>

          <div className="space-y-4 text-sm md:text-base text-[#E5E5E5]/85 leading-relaxed max-w-3xl">
            <p>1. By accessing and using this website, you agree to comply with all the terms and conditions stated here.</p>
            <p>2. All products listed on the website are subject to availability.</p>
            <p>3. Prices of products may change without prior notice.</p>
            <p>4. We strive to display product colors and images as accurately as possible; however, slight variations may occur due to screen settings.</p>
            <p>5. Orders will be processed only after successful payment confirmation.</p>
            <p>6. The company reserves the right to cancel or refuse any order at its discretion.</p>
            <p>7. Customers are responsible for providing accurate shipping and contact information at the time of placing an order.</p>
            <p>8. Delivery timelines may vary depending on location and external factors.</p>
            <p>9. All returns and exchanges are subject to the policies mentioned on the website.</p>
            <p>10. We reserve the right to update or modify these terms and conditions at any time without prior notice.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TermsConditionsPage

