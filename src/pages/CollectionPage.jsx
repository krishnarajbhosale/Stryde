import Navbar from '../components/Navbar'
import CuratedSelection from '../components/CuratedSelection'
import Footer from '../components/Footer'

function CollectionPage() {
  return (
    <>
      <Navbar />
      <CuratedSelection showAllProducts />
      <Footer />
    </>
  )
}

export default CollectionPage
