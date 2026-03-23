import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function LawOfJurisdictionPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Law of Jurisdiction
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            Dispute Resolution and Jurisdiction for Strydeeva policies and website usage.
          </p>

          <div className="space-y-4 text-sm md:text-base text-[#E5E5E5]/85 leading-relaxed max-w-3xl">
            <p>In the event of any dispute, claim, or controversy arising out of or relating to these terms or the use of the website, the parties shall first attempt to resolve the dispute amicably.</p>
            <p>If such dispute cannot be resolved within 30 days, it shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996.</p>
            <p>The seat and venue of arbitration shall be Pune, Maharashtra, India. The language of arbitration shall be English.</p>
            <p>Subject to the above, the courts at Pune, Maharashtra, India shall have exclusive jurisdiction.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default LawOfJurisdictionPage
