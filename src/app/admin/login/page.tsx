import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminLogin from '@/views/admin/Login';

export default function AdminLoginPage() {
  return (
    <>
      <Navbar />
      <main>
        <AdminLogin />
      </main>
      <Footer />
    </>
  );
}
