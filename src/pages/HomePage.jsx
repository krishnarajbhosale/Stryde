import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import Manifesto from '../components/Manifesto'
import CuratedSelection from '../components/CuratedSelection'
import Footer from '../components/Footer'

function HomePage() {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <Manifesto />
      <div className="w-full h-px bg-[#D1C7B7]" aria-hidden />
      <CuratedSelection />
      <main className="w-full max-w-7xl mx-auto px-4">
        {/* Page content goes here */}
      </main>
      <Footer />
    </>
  )
}

export default HomePage
