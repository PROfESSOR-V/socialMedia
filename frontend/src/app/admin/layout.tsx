"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu,
  ChevronRight,
  User as UserIcon,
  X,
  Users,
  Settings,
  CreditCard
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, setLogout, _hasHydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;

    // Basic frontend auth check
    if (!user) {
      router.push("/login");
    } else if (user.role !== "ADMIN") {
      router.push("/");
    } else {
      setIsCheckingAuth(false);
    }
  }, [token, user, router, _hasHydrated]);

  const handleLogout = () => {
    setLogout();
    router.push("/login");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Verifying access...</p>
      </div>
    );
  }

  // Double check just to be safe before rendering
  if (!user || user.role !== "ADMIN") return null;

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "All Users", href: "/admin/users", icon: Users },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex bg-zinc-50 min-h-screen text-zinc-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-zinc-200 w-64 flex flex-col z-50 transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:top-0 md:h-screen md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200">
          <Link href="/" className="font-serif text-xl font-medium tracking-tight text-black flex items-center">
            AÚRELYÑ <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-sans ml-2 tracking-normal uppercase relative top-[-1px]">Admin</span>
          </Link>
          <button className="md:hidden text-zinc-500" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-black text-white shadow-sm" 
                    : "text-zinc-600 hover:text-black hover:bg-zinc-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-zinc-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-zinc-500 hover:text-black transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
              <span className="font-serif">Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-zinc-800 font-medium capitalize">
                {pathname === '/admin' ? 'Dashboard' : pathname.replace('/admin/', '').split('/')[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 text-sm">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-zinc-900 leading-tight">{user.name || "Admin User"}</p>
                <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase">{user.role}</p>
              </div>
              <div className="w-9 h-9 bg-zinc-100 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
}
