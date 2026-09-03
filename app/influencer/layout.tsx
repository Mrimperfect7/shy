"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  LogOut, 
  Menu,
  X,
  CreditCard,
  Ticket
} from "lucide-react";
import { useState } from "react";

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar on login page
  if (pathname === "/influencer/login") {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Dashboard", href: "/influencer", icon: LayoutDashboard },
  ];

  const handleLogout = async () => {
    try {
      document.cookie = "eshara_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ivory)" }}>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-20 flex items-center p-4 bg-white border-b" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 mr-4">
          <Menu size={24} style={{ color: "var(--charcoal)" }} />
        </button>
        <span className="font-serif text-xl tracking-wide uppercase" style={{ color: "var(--charcoal)" }}>Partner Portal</span>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center justify-between px-6 border-b" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
            <Link href="/influencer" className="font-serif text-xl tracking-widest uppercase block" style={{ color: "var(--charcoal)" }}>
              Eshara Partner
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
              <X size={20} style={{ color: "var(--charcoal)" }} />
            </button>
          </div>

          <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
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
          </nav>

          <div className="p-4 border-t" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-md hover:bg-red-50 text-red-600 transition-colors font-sans text-sm tracking-wide"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 w-full min-w-0 pt-16 lg:pt-0 overflow-y-auto h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
