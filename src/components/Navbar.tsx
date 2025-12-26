import { Search, ShoppingCart, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from "@/store/useCart";
import { Badge } from "@/components/ui/badge";
import CartDrawer from "./CartDrawer";
import NotificationDropdown from "./admin/NotificationDropdown";
import { useModal } from "@/store/useModal";
import { formatPrice } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";

export default function Navbar() {
  const { products } = useProducts();
  const cartItemsCount = useCart((state) => state.totalItems());
  const openProductModal = useModal((state) => state.openProductModal);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("profile")
      .select("role")
      .eq("authId", userId)
      .single();

    setIsAdmin(data?.role === "admin");
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [searchQuery]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop", hasDropdown: true },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-white/10">
      <div className="container flex h-20 items-center justify-between px-4 md:px-8 w-full mx-auto">
        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-background border-r border-white/10 text-white py-8"
            >
              <SheetHeader>
                <SheetTitle className="text-primary font-bold text-2xl italic">
                  <img
                    src="/logos/logo.png"
                    alt="Money's Outlet"
                    className="h-10 w-auto"
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-10 text-lg uppercase font-semibold">
                {navLinks.map((link) => (
                  <SheetClose asChild>
                    <Link
                      key={link.name}
                      to={link.href}
                      className={
                        "hover:text-primary transition-colors " +
                        (pathname === link.href ? "text-primary" : "")
                      }
                    >
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <img
              src="/logos/logo.png"
              alt="Money's Outlet"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={
                "text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1 " +
                (pathname === link.href ? "text-primary" : "")
              }
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search & Cart */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden lg:flex items-center bg-white/10 rounded-md px-3 py-1.5 focus-within:ring-1 ring-primary">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="bg-transparent border-none focus:ring-0 text-sm w-40 placeholder:text-muted ml-2 outline-none"
            />

            {/* Search Results Popover */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-white/10 rounded-xl shadow-2xl overflow-hidden z-100">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          openProductModal(product);
                          setSearchQuery("");
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none text-left w-full pointer-events-auto"
                      >
                        <div className="h-12 w-12 rounded-lg bg-[#2D2D2D] p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-sm font-bold text-white truncate">
                            {product.name}
                          </h4>
                          <p className="text-primary text-xs font-bold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const currentQuery = searchQuery;
                        setSearchQuery("");
                        setIsSearchFocused(false);
                        navigate(
                          `/shop?search=${encodeURIComponent(currentQuery)}`
                        );
                      }}
                      className="p-3 text-center text-xs font-bold uppercase tracking-widest text-muted hover:text-white transition-colors bg-white/5 block w-full pointer-events-auto"
                    >
                      View all results
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-muted">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="text-white lg:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <CartDrawer>
            <Button variant="ghost" size="icon" className="relative text-white">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-white border-2 border-background">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </CartDrawer>

          {isAdmin && <NotificationDropdown />}

          {session && (
            <Link
              to={isAdmin ? "/admin" : "/"}
              className="text-white hover:text-primary transition-colors ml-1"
              title={isAdmin ? "Go to Dashboard" : "My Account"}
            >
              <UserIcon className="h-6 w-6" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
