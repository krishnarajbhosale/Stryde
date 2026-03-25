import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function PaymentReturnPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    const status = (qs.get('status') || '').toLowerCase()
    const orderId = qs.get('orderId')
    const orderNumber = qs.get('orderNumber')
    const invoiceToken = qs.get('invoiceToken')

    if (status === 'success') {
      clearCart()
      navigate('/order-success', { replace: true, state: { orderId, orderNumber, invoiceToken } })
      return
    }
    navigate('/checkout/payment', { replace: true, state: { paymentError: 'Payment failed. Please try again.' } })
  }, [location.search, navigate, clearCart])

  return null
}

export default PaymentReturnPage

