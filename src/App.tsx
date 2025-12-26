import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductDetailModal from "./components/ProductDetailModal";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import { StatusOverlay } from "./components/StatusOverlay";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBrands from "./pages/admin/Brands";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCategories from "./pages/admin/Categories";
import AdminSettings from "./pages/admin/Settings";
import AdminNotifications from "./pages/admin/Notifications";
import AdminContactMessages from "./pages/admin/ContactMessages";
import NotFound from "./pages/NotFound";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";
import RootLayout from "./components/RootLayout";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAuthenticated(!!session);
      setLoading(false);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;

  return authenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
      <StatusOverlay />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <RootLayout>
              <Navbar />
              <Home />
              <Footer />
              <ProductDetailModal />
            </RootLayout>
          }
        />
        <Route
          path="/shop"
          element={
            <RootLayout>
              <Navbar />
              <Shop />
              <Footer />
              <ProductDetailModal />
            </RootLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <RootLayout>
              <Navbar />
              <Contact />
              <Footer />
            </RootLayout>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <RootLayout>
              <Navbar />
              <AdminLogin />
              <Footer />
            </RootLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="messages" element={<AdminContactMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <NotFound />
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
