import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Grid3x3,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  Mail,
  Bell,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAdminModals } from "@/lib/admin-modals";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { type User as UserType } from "@supabase/supabase-js";

import NotificationDropdown from "./NotificationDropdown";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const openAddProduct = useAdminModals((state) => state.openAddProduct);
  const [user, setUser] = useState<UserType | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: user } = await supabase.auth.getUser();
      setUser(user.user);
    };
    fetchUser();
  }, []);

  const handleAddProduct = () => {
    if (location.pathname !== "/admin/products") {
      navigate("/admin/products");
    }
    openAddProduct();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Brands", href: "/admin/brands", icon: Tag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: Grid3x3 },
    { name: "Messages", href: "/admin/messages", icon: Mail },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/admin/dashboard">
          <img
            src="/logos/logo.png"
            alt="Money's Outlet"
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 md:overflow-y-scroll">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              onClick={() => setOpen(false)}
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? "bg-white text-primary font-bold"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-white/10 transition-all w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#C4C4C4] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[186px] bg-[#0D0D0D] flex-col fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[186px] min-w-0">
        {/* Top Bar */}
        <header className="h-[72px] bg-[#0D0D0D] border-b border-white/10 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-white"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-[186px] bg-[#0D0D0D] border-r-white/10"
              >
                <SheetTitle className="sr-only">Admin</SheetTitle>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="flex lg:hidden">
              <Link to="/admin/dashboard">
                <img src="/logos/logo.png" alt="" className="h-8 w-auto" />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              className="bg-primary hidden sm:block hover:bg-primary/90 text-white font-bold text-xs lg:text-sm h-9 lg:h-10 px-3 lg:px-6 rounded-lg"
              onClick={handleAddProduct}
            >
              <span className="hidden sm:inline">+ Add Product</span>
              <span className="sm:hidden">+ Product</span>
            </Button>
            <NotificationDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg pl-3 pr-1 py-1 hover:bg-white/20 transition-all">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-bg-secondary border-white/10 text-white"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">
                      Super Admin
                    </p>
                    <p className="text-xs leading-none text-white/50">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => navigate("/admin/settings")}
                  className="hover:bg-white/10 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-primary hover:bg-white/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
