import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartIcon from "./assets/svgs/cart.svg";
import logo from "./assets/svgs/Logo.svg";
import searchIcon from "./assets/svgs/searchIcon.svg";
import userIcon from "./assets/svgs/user.svg";
import heartIcon from "./assets/svgs/whishlist.svg";
import { HiMenu, HiX } from "react-icons/hi";
import { SmartImage } from "./component/common/SmartImage";
import { useAuth } from "./lib/auth/useAuth";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const cartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  const [scrolled, setScrolled] = useState(false);

  // Close the account menu on outside click / Escape (replaces the fragile onBlur timeout)
  useEffect(() => {
    if (!isProfileOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsProfileOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isProfileOpen]);

  useEffect(() => { if (!user) setIsProfileOpen(false); }, [user]);

  const go = (path: string) => { setIsProfileOpen(false); navigate(path); };
  const handleLogout = async () => { setIsProfileOpen(false); setIsMenuOpen(false); await logout(); };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "py-4 bg-white/90 backdrop-blur-xl shadow-lg shadow-pink-50/50 border-b border-pink-100" : "py-8 bg-transparent"
    }`}>
      <div className="w-full flex items-center justify-between py-3 px-4 lg:px-8 max-w-7xl mx-auto">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center group">
            <SmartImage
              src={logo}
              alt="LKLN"
              className="h-16 md:h-16 object-contain transition-transform group-hover:scale-110"
              width={160}
              height={60}
            />
          </Link>
        </div>

        {/* CENTER: Menu Links (desktop) */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 text-slate-600 font-semibold uppercase tracking-wider text-xs">
          <Link to="/" className="hover:text-[#FF69B4] transition-colors">Home</Link>
          <Link to="/men" className="hover:text-[#FF69B4] transition-colors">Men</Link>
          <Link to="/women" className="hover:text-[#FF69B4] transition-colors">Women</Link>
          <Link to="/combo" className="hover:text-[#FF69B4] transition-colors">Combos</Link>
          <Link to="/joggers" className="hover:text-[#FF69B4] transition-colors">Joggers</Link>
          
          {/* Admin Link - Only visible to admins */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className="px-4 py-1.5 bg-pink-500 text-white rounded-full text-[10px] hover:bg-pink-600 transition-all shadow-lg shadow-pink-100"
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* RIGHT: Search and Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-amber-500 transition-all w-48 xl:w-64 text-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <SmartImage src={searchIcon} alt="Search" className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" width={16} height={16} />
          </form>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-5">
            <Link to="/wishlist" aria-label="Wishlist" className="relative group">
              <SmartImage src={heartIcon} alt="Wishlist" className="h-5 w-5 transition-transform group-hover:scale-110" width={20} height={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            <div className="relative" ref={profileRef}>
              <button 
                aria-label="Account" 
                onClick={() => {
                  if (!user) navigate("/login");
                  else setIsProfileOpen(!isProfileOpen);
                }}
                className="group flex items-center"
              >
                {user?.picture ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-amber-500/20 bg-slate-100 group-hover:border-amber-500 transition-all">
                    <SmartImage 
                      src={user.picture} 
                      alt={user.name || "User"} 
                      className="h-full w-full object-cover" 
                      width={32} 
                      height={32} 
                    />
                  </div>
                ) : (
                  <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-amber-50 transition-all">
                    <SmartImage 
                      src={userIcon} 
                      alt="User" 
                      className="h-5 w-5 transition-transform group-hover:text-amber-600 group-hover:scale-110" 
                      width={20} 
                      height={20} 
                    />
                  </div>
                )}
                {user && (
                  <span className="hidden xl:block ml-2 max-w-[8rem] truncate text-xs font-black text-slate-700 italic">
                    {user.name}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isProfileOpen && user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden py-2 z-50 origin-top-right"
                  >
                    <div className="px-6 py-4 border-b border-slate-50 mb-1">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Welcome</p>
                      <p className="font-black text-slate-900 truncate italic">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => go("/admin")}
                        className="w-full text-left px-6 py-3 text-sm font-bold text-amber-600 hover:bg-slate-900 hover:text-amber-400 transition-colors italic flex items-center gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Admin Dashboard
                      </button>
                    )}
                    
                    <button 
                      onClick={() => go("/account/info")}
                      className="w-full text-left px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors italic"
                    >
                      Profile Overview
                    </button>
                    
                    <button 
                      onClick={() => go("/orders")}
                      className="w-full text-left px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors italic"
                    >
                      My Orders
                    </button>
                    
                    <div className="h-px bg-slate-50 my-1 mx-4" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-colors italic uppercase tracking-widest"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              aria-label="Cart" 
              onClick={() => navigate("/cart")} 
              className="relative group bg-slate-900 p-2 rounded-xl text-white hover:bg-slate-800 transition-all shadow-lg overflow-visible"
            >
              <SmartImage src={cartIcon} alt="Cart" className="h-4 w-4 invert brightness-150" width={20} height={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4 py-6 px-6 text-slate-800 font-bold tracking-tight">
            <Link to="/" onClick={toggleMenu} className="hover:text-pink-500 transition-colors">Home</Link>
            <Link to="/men" onClick={toggleMenu} className="hover:text-pink-500 transition-colors">Men</Link>
            <Link to="/women" onClick={toggleMenu} className="hover:text-pink-500 transition-colors">Women</Link>
            <Link to="/combo" onClick={toggleMenu} className="hover:text-pink-500 transition-colors">Combos</Link>
            <Link to="/joggers" onClick={toggleMenu} className="hover:text-pink-500 transition-colors">Joggers</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={toggleMenu} className="text-pink-600 py-2 border-t border-slate-100">
                Admin Panel
              </Link>
            )}
            {user ? (
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Signed in as <span className="text-slate-800 normal-case">{user.name}</span></p>
                <Link to="/account/info" onClick={toggleMenu} className="hover:text-pink-500 transition-colors">My Account</Link>
                <Link to="/orders" onClick={toggleMenu} className="hover:text-pink-500 transition-colors">My Orders</Link>
                <button onClick={handleLogout} className="text-left text-red-500 font-black uppercase tracking-widest text-sm">Logout</button>
              </div>
            ) : (
              <Link to="/login" onClick={toggleMenu} className="pt-4 border-t border-slate-100 text-pink-600">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
