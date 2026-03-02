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
            Terms &amp; Condition
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            By accessing and using Strydeeva&apos;s website, you agree to the terms outlined below.
            These terms ensure a safe and transparent experience for both you and our brand.
          </p>

          <div className="space-y-8 text-sm md:text-base text-[#E5E5E5]/85 leading-relaxed max-w-3xl">
            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Use of the Website
              </h2>
              <p className="text-[#E5E5E5]/80">
                All content on this site, including imagery, text, and design, is the intellectual
                property of Strydeeva. It may not be copied, reproduced, or used for commercial
                purposes without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Orders &amp; Pricing
              </h2>
              <p className="text-[#E5E5E5]/80">
                Product prices are listed in INR and include applicable taxes unless stated
                otherwise. Placing an order constitutes an offer to purchase; we reserve the right
                to accept or cancel any order in case of stock issues, payment concerns, or
                inaccuracies.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Payments
              </h2>
              <p className="text-[#E5E5E5]/80">
                Payments are processed securely through our partnered gateways. You agree that the
                card or payment method used belongs to you or that you have permission to use it for
                the transaction.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Shipping, Returns &amp; Refunds
              </h2>
              <p className="text-[#E5E5E5]/80">
                Shipping timelines, return eligibility, and refund processes are described on our
                Return &amp; Refund page. By placing an order, you acknowledge and agree to those
                conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Privacy
              </h2>
              <p className="text-[#E5E5E5]/80">
                Any personal information you share with us is used solely to process your order and
                improve your experience with Strydeeva. We do not sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Changes to Terms
              </h2>
              <p className="text-[#E5E5E5]/80">
                We may update these terms from time to time. The latest version will always be
                available on this page and applies from the date it is published.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Contact
              </h2>
              <p className="text-[#E5E5E5]/80">
                For any questions regarding these terms, please reach out to us at{' '}
                <span className="underline">care@strydeeva.com</span>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TermsConditionsPage

