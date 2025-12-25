import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/types/index";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/useCart";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  showTag?: boolean;
  type?: string;
}

export default function ProductCard({
  product,
  onClick,
  showTag = true,
  type,
}: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const effectivePrice =
      product.isPromotion && product.discountPrice
        ? product.discountPrice
        : product.price;
    addItem({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.images[0],
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
    });
  };

  // Calculate discount percentage if it's a promotion
  const discountPercentage =
    product.isPromotion && product.discountPrice
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100
        )
      : null;

  return (
    <div
      className="group bg-bg-secondary rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 hover:translate-y-[-8px] shadow-sm hover:shadow-2xl border border-white/5 flex flex-col h-full"
      onClick={() => onClick(product)}
    >
      {/* Image Container - Flush with rounding */}
      <div className="relative aspect-square bg-bg-tertiary rounded-t-[2.5rem] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Conditional Badges - Red rectangle with white text for NEW */}
        {showTag && (
          <div className="absolute top-8 left-0">
            {type !== "featured" && (
              <div
                className={`text-white px-5 py-2 font-bold text-base tracking-wider shadow-md ${
                  type === "promotion" && discountPercentage
                    ? "bg-bg-secondary"
                    : "bg-primary"
                }`}
              >
                {type === "new"
                  ? "NEW"
                  : type === "promotion"
                  ? `${discountPercentage}%`
                  : ""}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area - "Writing and descriptions at the second side" */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name and Brand/Description in the middle */}
        <div className="flex-1 mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-white text-[10px] md:text-xs line-clamp-2 mt-2 font-medium border-dashed border-muted border-2 px-4 py-1 rounded-full">
              {product.brand.name}
            </span>
          </div>

          <h3 className="text-white font-medium italic text-xs md:text-sm line-clamp-1 uppercase tracking-wider">
            {product.name}
          </h3>
          <p className="text-muted text-xs line-clamp-2 mt-2 font-medium opacity-60 leading-tight">
            {product.description}
          </p>
        </div>

        {/* Bottom Row - Price and Cart Icon */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex flex-col">
            {product.isPromotion && product.discountPrice ? (
              <>
                <span className="text-primary font-semibold text-2xl lg:text-xl tracking-tighter">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-muted text-xs line-through opacity-50">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-primary font-semibold text-2xl lg:text-xl tracking-tighter">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-[#BDBDBD] bg-primary text-white transition-all shadow-md group/cart"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 text-white transition-transform group-hover/cart:scale-110" />
          </Button>
        </div>
      </div>
    </div>
  );
}
