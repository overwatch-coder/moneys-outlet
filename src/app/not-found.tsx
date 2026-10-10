import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFound from '@/views/NotFound';

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main>
        <NotFound />
      </main>
      <Footer />
    </>
  );
}
