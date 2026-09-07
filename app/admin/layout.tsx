"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/shared/Logo";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Video, 
  LogOut, 
  Menu, 
  X, 
  ShoppingBag, 
  Package, 
  Tag, 
  MessageSquare, 
  Camera,
  Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { Activity } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserRole(data.user.role);
        }
      })
      .catch(console.error);
  }, []);

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Customer Orders", href: "/admin/orders", icon: Package },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Homepage CMS", href: "/admin/homepage", icon: Activity },
    { name: "Offers & Deals", href: "/admin/offers", icon: Tag },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Customer Results", href: "/admin/results", icon: Camera },
    { name: "Influencers", href: "/admin/influencers", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Referrals", href: "/admin/referrals", icon: Users },
    { name: "Instagram Reels", href: "/admin/reels", icon: Video },
    { name: "Store Polls", href: "/admin/polls", icon: Activity },
    { name: "SEO & Marketing", href: "/admin/seo", icon: Search },
  ];


  const handleLogout = async () => {
    try {
      document.cookie = "eshara_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "eshara_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ivory)" }}>
      {/* Top Header - Always Visible */}
      <div className="fixed top-0 left-0 w-full z-[105] flex items-center justify-between p-3.5 bg-white border-b" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <Menu size={22} style={{ color: "var(--charcoal)" }} />
          </button>
          <Link href="/admin" className="flex items-center">
            <Logo variant="horizontal" theme="dark" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        <span className="text-xs font-sans font-bold text-gray-500 uppercase tracking-wider hidden sm:block">Admin Dashboard</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors font-sans text-sm tracking-wide"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-[110] w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        
        <div className="flex flex-col h-full">
          <div className="h-[60px] flex items-center justify-between px-6 border-b" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
            <span className="font-sans font-bold tracking-wider text-gray-700">MENU</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <X size={20} style={{ color: "var(--charcoal)" }} />
            </button>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-sans text-sm tracking-wide ${
                    isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-50 text-gray-600"
                  }`}
                  style={{ color: isActive ? "var(--charcoal)" : "var(--text-secondary)" }}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Dedicated Payouts Link */}
            <Link
              href="/admin/payouts"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-sans text-sm tracking-wide ${
                pathname === "/admin/payouts" ? "bg-gray-100 font-medium" : "hover:bg-gray-50 text-gray-600"
              }`}
              style={{ color: pathname === "/admin/payouts" ? "var(--charcoal)" : "var(--text-secondary)" }}
            >
              <Users size={18} />
              Payouts
            </Link>

            {userRole === "SUPERADMIN" && (
              <div className="pt-6 pb-2">
                <span className="px-4 text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">
                  Superadmin Zone
                </span>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/admin/users"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-sans text-sm tracking-wide ${
                      pathname === "/admin/users" ? "bg-purple-50 text-purple-700 font-medium" : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <Users size={18} />
                    Admin Management
                  </Link>
                  <Link
                    href="/admin/activity"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-sans text-sm tracking-wide ${
                      pathname === "/admin/activity" ? "bg-purple-50 text-purple-700 font-medium" : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <Activity size={18} />
                    Activity Logs
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Overlay backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[105]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 w-full min-w-0 pt-[60px] overflow-y-auto h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
