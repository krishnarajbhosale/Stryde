import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function ShippingPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <div className="w-full bg-black text-[#E5E5E5] min-h-screen pb-16">
        <div className="max-w-[1430px] mx-auto px-4 md:px-6 py-10 md:py-14">
          <h1 className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#E5E5E5] mb-3">
            Shipping Policy
          </h1>
          <p className="text-xs md:text-sm tracking-wide text-[#E5E5E5]/80 mb-8 max-w-2xl">
            Thank you for shopping with Strydeeva. We aim to deliver your orders quickly and safely.
          </p>

          <div className="space-y-4 text-sm md:text-base text-[#E5E5E5]/85 leading-relaxed max-w-3xl">
            <p>1. Order Processing</p>
            <p>i. All orders are processed within 1 to 3 business days after confirmation.</p>
            <p>ii. Orders are not processed or shipped on Sundays or public holidays.</p>
            <p>iii. You will receive a confirmation message once your order is placed and another when it is shipped.</p>
            <p>2. Shipping Time</p>
            <p>i. Within India: delivery typically takes 3 to 7 business days depending on your location.</p>
            <p>ii. Delivery times may vary due to unforeseen circumstances such as weather, courier delays, or high demand.</p>
            <p>3. Shipping Charges</p>
            <p>i. Shipping charges, if any, are calculated and displayed at checkout.</p>
            <p>ii. We may offer free shipping on selected orders or promotions.</p>
            <p>4. Order Tracking</p>
            <p>Once your order is shipped, you receive a tracking ID or link via email or SMS to track your delivery.</p>
            <p>5. Delivery Issues</p>
            <p>i. Please ensure your shipping address and contact details are correct.</p>
            <p>ii. Strydeeva is not responsible for delays or failed deliveries due to incorrect information provided by the customer.</p>
            <p>6. Delayed or Lost Shipments</p>
            <p>i. If your order is delayed beyond the expected time, please contact us.</p>
            <p>ii. In case of lost shipments, we work with the courier partner to resolve the issue.</p>
            <p>7. International Shipping</p>
            <p>Currently, we do not offer international shipping.</p>
            <p>8. Damaged Packages</p>
            <p>If your order arrives damaged, contact us within 48 hours of delivery with photos for assistance.</p>
            <p>9. Contact Us</p>
            <p>For any shipping-related queries, please use the Contact Us page.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ShippingPolicyPage
