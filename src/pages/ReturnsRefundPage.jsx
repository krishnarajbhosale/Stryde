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
            Return &amp; Refund
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            We want you to feel completely at ease in your Strydeeva pieces. If something isn&apos;t
            quite right, our return and refund guidelines are kept simple and transparent.
          </p>

          <div className="space-y-8 text-sm md:text-base text-[#E5E5E5]/85 leading-relaxed max-w-3xl">
            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Eligibility
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[#E5E5E5]/80 text-sm md:text-base">
                <li>Returns are accepted within 7 days from the date of delivery.</li>
                <li>
                  Items must be unused, unwashed, and in their original condition with all tags and
                  packaging intact.
                </li>
                <li>Pieces purchased on final sale or marked non-returnable are not eligible.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                How to Request a Return
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-[#E5E5E5]/80 text-sm md:text-base">
                <li>Write to us at care@strydeeva.com with your order ID and item details.</li>
                <li>Our team will confirm eligibility and share return instructions.</li>
                <li>
                  Once the piece reaches us and passes quality checks, your refund will be initiated.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Refund Method
              </h2>
              <p className="text-[#E5E5E5]/80 text-sm md:text-base">
                Approved refunds are processed to the original mode of payment. Depending on your
                bank or payment provider, it may take 5–7 business days for the amount to reflect in
                your account.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Shipping Charges
              </h2>
              <p className="text-[#E5E5E5]/80 text-sm md:text-base">
                Original shipping fees are non-refundable. In most cases, the cost of return
                shipping will be deducted from your refund unless the item received was damaged or
                incorrect.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Custom Sizes &amp; Alterations
              </h2>
              <p className="text-[#E5E5E5]/80 text-sm md:text-base">
                Made-to-measure and custom-sized pieces are created uniquely for you. These orders
                are not eligible for returns or refunds unless there is a manufacturing defect.
              </p>
            </section>

            <section>
              <h2 className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#D1C7B7] mb-3">
                Need Help?
              </h2>
              <p className="text-[#E5E5E5]/80 text-sm md:text-base">
                If you&apos;re unsure about eligibility or need assistance with a specific order,
                write to us at <span className="underline">care@strydeeva.com</span> and we&apos;ll
                guide you through the next steps.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ReturnsRefundPage

