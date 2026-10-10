import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/views/Home';
import ProductDetailModal from '@/components/ProductDetailModal';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Home />
      </main>
      <Footer />
      <ProductDetailModal />
    </>
  );
}
