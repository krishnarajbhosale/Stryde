import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            At Strydeeva, we value your privacy and are committed to protecting your personal information.
          </p>

          <div className="space-y-4 text-sm md:text-base text-[#E5E5E5]/85 leading-relaxed max-w-3xl">
            <p>1. Information We Collect</p>
            <p>i. Personal information: Name, email address, phone number, shipping and billing address.</p>
            <p>ii. Payment information: Credit/debit card details or other payment methods (processed securely through third-party providers).</p>
            <p>iii. Browsing data: IP address, browser type, device information, and website usage.</p>
            <p>2. How We Use Your Information</p>
            <p>i. Process and deliver your orders.</p>
            <p>ii. Communicate order updates and customer support.</p>
            <p>iii. Improve our products, services, and website experience.</p>
            <p>iv. Send promotional emails or offers only if you opt in.</p>
            <p>3. Sharing of Information</p>
            <p>i. We do not sell your personal data.</p>
            <p>ii. We may share your information with trusted third-party service providers (for example, payment processors and delivery partners), and legal authorities if required by law.</p>
            <p>4. Data Security</p>
            <p>We take reasonable measures to protect your personal information from unauthorized access, misuse, or disclosure.</p>
            <p>5. Cookies</p>
            <p>Our website may use cookies to enhance your browsing experience. You can disable cookies through your browser settings.</p>
            <p>6. Your Rights</p>
            <p>i. Access, update, or delete your personal data.</p>
            <p>ii. Opt out of marketing communications at any time.</p>
            <p>7. Third-Party Links</p>
            <p>Our website may contain links to other websites. We are not responsible for their privacy practices.</p>
            <p>8. Changes to This Policy</p>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>
            <p>9. Contact Us</p>
            <p>If you have questions about this Privacy Policy, please use the Contact Us page.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PrivacyPolicyPage
