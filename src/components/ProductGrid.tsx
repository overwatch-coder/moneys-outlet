import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { type Product } from "@/types/index";
import { useModal } from "@/store/useModal";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  title: string;
  products: Product[];
  type?: string;
}

export default function ProductGrid({
  title,
  products,
  type,
}: ProductGridProps) {
  const navigate = useNavigate();
  const openProductModal = useModal((state) => state.openProductModal);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Adjust based on card width
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      scrollContainerRef.current.classList.add("scrollbar-hide");
    }
  };

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4 md:px-8 max-w-[1600px] mx-auto">
        {/* Header with Navigation for Mobile */}
        <div className="flex items-center justify-between mb-16 px-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-white font-black italic text-xl md:text-3xl uppercase tracking-tight">
              {title}
            </h2>
            <div className="h-1 w-12 bg-primary"></div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile & Tablet Scroll Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-white/10 bg-white/5 text-white hover:bg-primary hover:border-primary transition-all"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-white/10 bg-white/5 text-white hover:bg-primary hover:border-primary transition-all"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div
              className="hidden md:flex items-center gap-2 text-muted hover:text-primary cursor-pointer transition-all font-bold text-sm uppercase tracking-widest"
              onClick={() => navigate(type ? `/shop?type=${type}` : "/shop")}
            >
              Explore All <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Grid Container - Scrollable on mobile, Grid on desktop */}
        <div
          ref={scrollContainerRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10 pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide! overflow-x-scroll"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-start"
            >
              <ProductCard
                product={product}
                type={type}
                onClick={openProductModal}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
