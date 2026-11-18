import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth/useAuth";
import { User, Package, Heart, MapPin, LogOut, ChevronRight } from "lucide-react";

interface AccountLayoutProps {
  title?: string;
  children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ title = "Profile", children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: "Overview", path: "/account/info", icon: User },
    { label: "My Orders", path: "/orders", icon: Package },
    { label: "Wishlist", path: "/wishlist", icon: Heart },
    { label: "Addresses", path: "/account/addresses", icon: MapPin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 min-h-screen bg-[#FFF5F7]">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-10 italic font-medium">
        <Link to="/" className="hover:text-pink-500 transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">My Account</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white/70 backdrop-blur-md border border-white rounded-3xl p-8 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-pink-100 border-4 border-pink-50 flex items-center justify-center overflow-hidden">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-pink-500">
                    {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="italic">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Welcome back</p>
                <h2 className="text-lg font-black text-gray-900 line-clamp-1">
                  {user?.name || "Guest User"}
                </h2>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold italic ${
                    isActive(item.path)
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-pink-500"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-300 font-bold italic mt-4"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="bg-white/70 backdrop-blur-md border border-white rounded-3xl p-8 lg:p-10 shadow-sm min-h-[500px]">
            <header className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 italic flex items-center gap-3">
                <span className="w-2 h-8 bg-pink-500 rounded"></span> {title}
              </h1>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
