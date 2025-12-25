import { ShoppingCart, X, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/store/useCart";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import PaymentModal from "./PaymentModal";
import { useStatus } from "./StatusOverlay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { dataService } from "@/lib/dataService";
import { supabase } from "@/lib/supabase";

type CheckoutStage = "cart" | "processing" | "success";

export default function CartDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { items, removeItem, totalPrice, clearCart } = useCart();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>("cart");
  const [orderId, setOrderId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
  });
  const showStatus = useStatus((state) => state.showStatus);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.email
    ) {
      showStatus(
        "error",
        "Details Missing",
        "Please fill in all details (including email) before proceeding."
      );
      return;
    }

    // Show processing animation
    setCheckoutStage("processing");

    // Create order in database
    dataService
      .placeOrder(
        {
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: formData.address,
          total: totalPrice() + shippingFee,
          shippingFee: shippingFee,
          status: "PENDING",
        },
        items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      )
      .then((order) => {
        // Clear cart
        clearCart();

        // Show payment modal with the real readable ID
        setOrderId(order.readableId);

        setTimeout(() => {
          setIsSheetOpen(false);
          setIsPaymentOpen(true);
          setCheckoutStage("cart");
        }, 1000);
      })
      .catch((err) => {
        console.error("Order creation failed:", err);
        showStatus(
          "error",
          "Order Failed",
          "Could not process your order. Please try again."
        );
        setTimeout(() => {
          setCheckoutStage("cart");
        }, 1000);
      });
  };

  const handlePaymentComplete = () => {
    // User has confirmed payment, show success modal
    setIsPaymentOpen(false);
    setCheckoutStage("success");
    setIsSheetOpen(true);
  };

  const handleSuccessClose = () => {
    // Clear cart and reset everything
    clearCart();
    setIsSheetOpen(false);
    setCheckoutStage("cart");
    setFormData({ email: "", name: "", phone: "", address: "" });
  };

  // Reset checkout stage when sheet closes
  useEffect(() => {
    if (!isSheetOpen && checkoutStage === "success") {
      // keep it success so they see it if they re-open?
      // Actually usually better to reset if closed without proceeding
    }
  }, [isSheetOpen]);

  const [shippingFee, setShippingFee] = useState(150);

  useEffect(() => {
    const fetchShippingFee = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "shipping_fee")
        .single();

      if (data?.value) {
        setShippingFee(Number(data.value));
      }
    };
    fetchShippingFee();
  }, []);

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} modal={false}>
        <div onClick={() => setIsSheetOpen(true)} className="cursor-pointer">
          {children}
        </div>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-[450px] bg-background border-none text-white p-0 flex flex-col h-full outline-none overflow-hidden"
        >
          <SheetTitle className="sr-only">Checkout</SheetTitle>
          <AnimatePresence mode="wait">
            {checkoutStage === "cart" && (
              <motion.div
                key="cart"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <SheetHeader className="p-8 pb-6 border-b border-white/10 flex items-center justify-center relative flex-row space-y-0">
                  <h2 className="text-primary font-medium text-2xl tracking-tight">
                    Shopping Cart
                  </h2>
                  <SheetClose className="absolute right-8 text-primary hover:opacity-80 transition-opacity">
                    <X className="h-6 w-6" />
                  </SheetClose>
                </SheetHeader>

                {/* Scrollable Area */}
                <ScrollArea className="flex-1 px-8 custom-scrollbar">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted opacity-50">
                      <ShoppingCart className="h-20 w-20 mb-6" />
                      <p className="font-bold uppercase tracking-widest text-sm text-center">
                        Your cart is empty
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-10 py-10">
                      {items.map((item) => (
                        <div
                          key={`${item.id}-${item.size}-${item.color}`}
                          className="flex gap-6 items-start"
                        >
                          <div className="h-28 w-28 rounded-2xl overflow-hidden bg-[#2D2D2D] shrink-0 flex items-center justify-center p-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex-1 pt-2">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-white font-medium text-sm mb-1">
                                  {item.name}
                                </h4>
                                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">
                                  {item.size} / {item.color}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  removeItem(item.id, item.size, item.color)
                                }
                                className="text-white/40 hover:text-primary transition-colors"
                              >
                                <div className="h-7 w-7 rounded-full border border-white/20 flex items-center justify-center">
                                  <X className="h-4 w-4" />
                                </div>
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-[#2D2D2D] rounded-full p-0.5 border border-white/5">
                                <button
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      useCart
                                        .getState()
                                        .updateQuantity(
                                          item.id,
                                          item.quantity - 1,
                                          item.size,
                                          item.color
                                        );
                                    } else {
                                      removeItem(
                                        item.id,
                                        item.size,
                                        item.color
                                      );
                                    }
                                  }}
                                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/5 text-white"
                                >
                                  <span className="text-xl font-light">-</span>
                                </button>
                                <span className="w-8 text-center text-sm font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    useCart
                                      .getState()
                                      .updateQuantity(
                                        item.id,
                                        item.quantity + 1,
                                        item.size,
                                        item.color
                                      )
                                  }
                                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/5 text-white"
                                >
                                  <span className="text-xl font-light">+</span>
                                </button>
                              </div>
                              <span className="text-primary font-bold">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="mt-8 mb-12">
                      <h3 className="text-white font-bold text-xl mb-6 tracking-tight">
                        Payer Details
                      </h3>
                      <div className="space-y-6">
                        <div className="space-y-2.5 text-left">
                          <Label className="text-white text-xs font-bold uppercase tracking-widest">
                            Name*
                          </Label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Value"
                            className="bg-white border-none text-black h-12 rounded-lg placeholder:text-black/30 font-medium focus-visible:ring-0"
                          />
                        </div>
                        <div className="space-y-2.5 text-left">
                          <Label className="text-white text-xs font-bold uppercase tracking-widest">
                            Email Address*
                          </Label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@example.com"
                            className="bg-white border-none text-black h-12 rounded-lg placeholder:text-black/30 font-medium focus-visible:ring-0"
                          />
                        </div>
                        <div className="space-y-2.5 text-left">
                          <Label className="text-white text-xs font-bold uppercase tracking-widest">
                            Number*
                          </Label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Value"
                            className="bg-white border-none text-black h-12 rounded-lg placeholder:text-black/30 font-medium focus-visible:ring-0"
                          />
                        </div>
                        <div className="space-y-2.5 text-left">
                          <Label className="text-white text-xs font-bold uppercase tracking-widest">
                            Street Address*
                          </Label>
                          <Input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="House Number, Street Number and Postal Code"
                            className="bg-white border-none text-black h-12 rounded-lg placeholder:text-black/30 font-medium focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="space-y-4 py-8 mb-10 border-t border-white/5">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-white opacity-80">Subtotal</span>
                        <span className="text-primary font-bold">
                          {formatPrice(totalPrice())}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-white opacity-80">Shipping</span>
                        <span className="text-primary font-bold">
                          {formatPrice(shippingFee)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold pt-2">
                        <span className="text-white">Total</span>
                        <span className="text-primary font-black italic text-lg">
                          {formatPrice(totalPrice() + shippingFee)}
                        </span>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {items.length > 0 && (
                  <div className="mt-auto">
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-white text-black hover:bg-white/90 font-medium uppercase py-6 text-lg rounded-none transition-all duration-300 shadow-xl"
                    >
                      Make Payment
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {checkoutStage === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full p-8 text-center"
              >
                <div className="relative">
                  <Loader2 className="h-20 w-20 text-primary animate-spin mb-8" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4">
                  Creating Order
                </h2>
                <p className="text-muted text-sm max-w-xs">
                  Please wait while we process your order details...
                </p>
              </motion.div>
            )}

            {checkoutStage === "success" && (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col h-full bg-[#111111]"
              >
                {/* Success Header */}
                <div className="p-8 pb-6 flex items-center justify-center relative">
                  <h2 className="text-primary font-medium text-2xl tracking-tight">
                    Order {orderId}
                  </h2>
                  <SheetClose className="absolute right-8 text-primary hover:opacity-80 transition-opacity">
                    <X className="h-6 w-6" />
                  </SheetClose>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-2 text-center -mt-5">
                  {/* Illustration Area */}
                  <div className="relative mb-12">
                    <img
                      src="/images/delivery.png"
                      alt="delivery image"
                      className="w-52 h-52 object-contain"
                    />
                  </div>

                  <h3 className="text-white font-normal text-xl capitalize tracking-widest mb-4">
                    Delivery Order
                  </h3>
                  <h2 className="text-white font-bold text-xl uppercase tracking-wider mb-6">
                    THANK YOU FOR YOUR ORDER!
                  </h2>
                  <p className="text-muted text-sm leading-relaxed max-w-xs">
                    We've received your order and are currently processing it.
                    We will contact you once order is ready for delivery.
                  </p>
                </div>

                {/* Success Button */}
                <div className="mt-auto">
                  <Button
                    onClick={handleSuccessClose}
                    className="w-full bg-white text-black hover:bg-white/90 font-black uppercase py-7 text-lg rounded-none transition-all duration-300 shadow-xl"
                  >
                    CLOSE
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentComplete={handlePaymentComplete}
        orderId={orderId || "ORD-00000"}
      />
    </>
  );
}
