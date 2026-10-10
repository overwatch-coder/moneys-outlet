import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Shop from '@/views/Shop';
import ProductDetailModal from '@/components/ProductDetailModal';
import LoadingScreen from '@/components/LoadingScreen';

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<LoadingScreen />}>
          <Shop />
        </Suspense>
      </main>
      <Footer />
      <ProductDetailModal />
    </>
  );
}
