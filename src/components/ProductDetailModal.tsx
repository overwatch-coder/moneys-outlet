import { useState, useEffect } from "react";
import { Star, X, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/store/useModal";
import { useCart } from "@/store/useCart";
import { formatPrice, cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ProductDetailModal() {
  const { selectedProduct, isProductModalOpen, closeProductModal } = useModal();
  const addItem = useCart((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedImage(0);
      setSelectedSize(selectedProduct.sizes[0] || "");
      setSelectedColor(selectedProduct.colors[0] || "");
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    const effectivePrice =
      selectedProduct.isPromotion && selectedProduct.discountPrice
        ? selectedProduct.discountPrice
        : selectedProduct.price;
    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: effectivePrice,
      image: selectedProduct.images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    closeProductModal();
  };

  return (
    <Dialog open={isProductModalOpen} onOpenChange={closeProductModal}>
      <DialogContent className="max-w-2xl w-full max-h-[95vh] bg-background border-none p-0 text-white overflow-hidden rounded-[2.5rem] flex flex-col">
        <DialogTitle className="sr-only">{selectedProduct.name}</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-background z-10 shrink-0">
          <h1 className="text-center flex-1 text-base sm:text-lg text-primary font-semibold tracking-tight">
            Product: {selectedProduct.name}
          </h1>
          <DialogClose className="text-primary hover:opacity-80 transition-colors">
            <X size={24} />
          </DialogClose>
        </div>

        {/* Main Content Area */}
        <ScrollArea className="flex-1 w-full custom-scrollbar overflow-y-auto">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            {/* Main Product Image */}
            <div className="mb-10 flex justify-center">
              <div className="w-full max-w-sm h-64 sm:h-96 relative flex items-center justify-center">
                <img
                  src={selectedProduct.images[selectedImage]}
                  alt={selectedProduct.name}
                  className="h-full w-auto object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="mb-10">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {selectedProduct.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "shrink-0 w-20 h-20 sm:w-28 sm:h-28 bg-[#2D2D2D] rounded-lg overflow-hidden cursor-pointer transition-all border-2 flex items-center justify-center p-3",
                      selectedImage === i
                        ? "border-primary"
                        : "border-transparent hover:border-white/10"
                    )}
                  >
                    <img
                      src={img}
                      alt={`Product view ${i}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {selectedProduct.name}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#AAAAAA] leading-relaxed font-medium">
                {selectedProduct.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="fill-yellow-500 text-yellow-500"
                    />
                  ))}
                  <Star
                    size={20}
                    className="fill-neutral-600 text-neutral-600"
                  />
                </div>
                <div className="h-4 w-px bg-white/20 mx-1"></div>
                <span className="text-sm sm:text-base text-neutral-400 font-medium whitespace-nowrap">
                  5 Customer Review
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1">
                {selectedProduct.isPromotion &&
                selectedProduct.discountPrice ? (
                  <>
                    <div className="text-3xl sm:text-4xl font-black italic tracking-tighter text-primary">
                      {formatPrice(selectedProduct.discountPrice)}
                    </div>
                    <div className="text-lg sm:text-xl text-neutral-500 line-through font-medium">
                      {formatPrice(selectedProduct.price)}
                    </div>
                  </>
                ) : (
                  <div className="text-3xl sm:text-4xl font-black italic tracking-tighter text-primary">
                    {formatPrice(selectedProduct.price)}
                  </div>
                )}
              </div>

              {/* Colors Available */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Colors available
                </h3>
                <div className="flex gap-4">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all border-2",
                        selectedColor === color
                          ? "border-white ring-2 ring-primary scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Sizes
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "min-w-12 h-12 px-4 rounded-full border text-sm sm:text-base font-bold transition-all flex items-center justify-center",
                        selectedSize === size
                          ? "border-primary bg-primary text-white"
                          : "border-white/20 text-neutral-300 hover:border-white/50"
                      )}
                    >
                      {size.replace("US ", "").replace("EUR ", "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4 pb-32">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Quantity
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-[#2D2D2D] rounded-full p-1 border border-white/5">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white"
                    >
                      <span className="text-2xl font-light">-</span>
                    </button>
                    <span className="w-12 text-center text-lg font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white"
                    >
                      <span className="text-2xl font-light">+</span>
                    </button>
                  </div>
                  <span className="text-sm text-neutral-400 font-medium italic">
                    Total:{" "}
                    {formatPrice(
                      (selectedProduct.isPromotion &&
                      selectedProduct.discountPrice
                        ? selectedProduct.discountPrice
                        : selectedProduct.price) * quantity
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Add to Cart Button Footer */}
        <div className="absolute bottom-0 left-0 w-full bg-background border-t border-white/5 pt-0 shrink-0">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-white text-black hover:bg-neutral-100 text-lg sm:text-xl font-black uppercase py-7 rounded-none transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <ShoppingCart size={24} />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
