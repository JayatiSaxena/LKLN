import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom"; 
import Footer from "./Footer";
import Navbar from "./Navbar";
import HomePage from "./component/home/HomePage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import logo from "./assets/svgs/Logo.svg";

// Women pages
import WomenPage from "./component/women/WomenPage";
import ProductDetail from "./component/women/ProductDetail"; 
import CartDetails from "./component/women/CartDetails";
import CheckoutPage from "./component/women/CheckoutPage";
import AccountOverview from "./component/account/AccountOverview";
import HeroMen from "./component/Men/HeroMen"; 
import MenProductCheck from "./component/Men/MenProductCheck.tsx";
import Combo from "./component/Combos/Combo"; 
import Joggy from "./component/Joggers/Joggy";
import Wishlist from "./component/wishlist/Wishlist";
import SearchPage from "./component/common/SearchPage";
import { AuthProvider } from "./lib/auth/AuthProvider";
import RequireAuth from "./lib/auth/RequireAuth";
import Login from "./component/auth/Login";
import Signup from "./component/auth/Signup";
import Orders from "./component/account/Orders";
import Addresses from "./component/account/Addresses";
import AdminDashboard from "./component/admin/AdminDashboard";
import RequireAdmin from "./lib/auth/RequireAdmin";
import AdminLogin from "./component/admin/AdminLogin";
import AdminSignup from "./component/admin/AdminSignup";

import { useAuthStore } from "./store/useAuthStore";
import { ConfigError } from "./component/common/ConfigError";

const App = () => {
  const { loading, initialized, initialize } = useAuthStore();
  
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!initialized && isConfigured) {
      initialize();
    }
  }, [initialized, initialize, isConfigured]);

  if (!isConfigured) {
    return <ConfigError />;
  }

  if (loading && !initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white transition-opacity duration-500">
        <div className="flex flex-col items-center">
          <div className="relative">
             <div className="w-24 h-24 border-4 border-pink-50 border-t-pink-500 rounded-full animate-spin"></div>
             <img 
               src={logo} 
               alt="LKLN" 
               className="absolute inset-0 m-auto w-12 h-12 object-contain"
             />
          </div>
          <p className="text-pink-500 text-6xl mt-8 animate-pulse font-black tracking-tighter">LKLN</p>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.5em] mt-2">Luxury & Lifestyle</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <AuthProvider>
          <Navbar />
          <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Women */}
        <Route path="/women" element={<WomenPage />} />
        <Route path="/product/:id" element={<ProductDetail />} /> 
        <Route path="/cart" element={<CartDetails />} /> 
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/account/info"
          element={
            <RequireAuth>
              <AccountOverview />
            </RequireAuth>
          }
        />

        {/* Men */}
        <Route path="/men" element={<HeroMen />} />
        <Route path="/men/product/:id" element={<MenProductCheck />} /> 
        <Route path="/combo" element={<Combo />} />
        <Route path="/joggers" element={<Joggy />} />

        {/* Wishlist */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Search */}
        <Route path="/search" element={<SearchPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Account subpages */}
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <Orders />
            </RequireAuth>
          }
        />
        <Route
          path="/account/addresses"
          element={
            <RequireAuth>
              <Addresses />
            </RequireAuth>
          }
        />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
      </Routes>

        <Footer /> 
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
};

export default App;
