import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import BrandSection from "@/components/BrandSection";
import { useState, useEffect, useMemo } from "react";
import { dataService } from "@/lib/dataService";
import type { Product } from "@/types";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    dataService
      .getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured),
    [products]
  );
  const newArrivals = useMemo(
    () => products.filter((p) => p.isNewArrival),
    [products]
  );
  const promotions = useMemo(
    () => products.filter((p) => p.isPromotion),
    [products]
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Hero />
      <main>
        <ProductGrid
          title="Featured Products"
          products={featuredProducts}
          type="featured"
        />
        <ProductGrid title="New Arrivals" products={newArrivals} type="new" />
        <ProductGrid
          title="Promotions"
          products={promotions}
          type="promotion"
        />
        <BrandSection />
      </main>
    </>
  );
}
