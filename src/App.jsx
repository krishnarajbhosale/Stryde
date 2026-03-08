import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { SearchProvider } from './context/SearchContext'
import ScrollToTop from './components/ScrollToTop'
import AddedToCartPopup from './components/AddedToCartPopup'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CollectionPage from './pages/CollectionPage'
import AboutPage from './pages/AboutPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ContactPage from './pages/ContactPage'
import TrackOrderPage from './pages/TrackOrderPage'
import ReturnsRefundPage from './pages/ReturnsRefundPage'
import TermsConditionsPage from './pages/TermsConditionsPage'
import './App.css'

function App() {
  return (
    <CartProvider>
      <SearchProvider>
      <AddedToCartPopup />
      <div className="min-h-screen">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/return-and-refund" element={<ReturnsRefundPage />} />
          <Route path="/terms-and-condition" element={<TermsConditionsPage />} />
          <Route path="/adminlogin/101/*" element={<AdminLoginPage />} />
        </Routes>
      </div>
      </SearchProvider>
    </CartProvider>
  )
}

export default App
