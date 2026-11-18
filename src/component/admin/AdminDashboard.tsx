import React, { useState, useEffect, useCallback } from "react"; // Reactive scan trigger
import { supabase } from "../../lib/supabase";
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Plus, 
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AdminProductList from "./AdminProductList";
import AdminProductForm from "./AdminProductForm";
import AdminOrderList from "./AdminOrderList";
import AdminAnalytics from "./AdminAnalytics";
import AdminCouponList from "./AdminCouponList";
import AdminReturnList from "./AdminReturnList";
import AdminCommunity from "./AdminCommunity";
import AdminCustomerList from "./AdminCustomerList";
import AdminChecklist from "./AdminChecklist";
import { useAuth } from "../../lib/auth/useAuth";
import type { Product } from "../../lib/api/services/products";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'checklist' | 'orders' | 'customers' | 'analytics' | 'coupons' | 'returns' | 'community'>('analytics');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [
        { count: productsCount },
        { count: ordersCount },
        { count: usersCount },
        { data: ordersData }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount')
      ]);

      const totalRevenue = ordersData?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;

      setStats({
        products: productsCount || 0,
        orders: ordersCount || 0,
        users: usersCount || 0,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleProductSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(undefined);
    setRefreshKey(prev => prev + 1);
    fetchStats(); // Update stats as well
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

  if (loading && stats.products === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FF69B4] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Premium Header */}
      <div className="w-full px-6 md:px-16 lg:px-24 py-12 bg-slate-50 border-b border-slate-100 mb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-sm font-black text-[#FF69B4] uppercase tracking-[0.4em] mb-4">
               Control Panel
            </h2>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
              Admin Dashboard
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={handleAddProduct}
              className="bg-[#FF69B4] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-pink-600 transition-all shadow-xl shadow-pink-200 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Product
            </button>
            <button
              onClick={() => logout()}
              title={user?.email ? `Signed in as ${user.email}` : "Logout"}
              className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-red-500 hover:border-red-200 transition-all shadow-sm flex items-center gap-2 font-black text-sm"
            >
               <LogOut size={18} /> Logout
            </button>
          </motion.div>
        </div>
      </div>

      <div className="w-full px-6 md:px-16 lg:px-24">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: "Total Products", value: stats.products, icon: <LayoutDashboard />, color: "bg-blue-500 shadow-blue-200" },
            { label: "Active Orders", value: stats.orders, icon: <ShoppingBag />, color: "bg-[#FF69B4] shadow-pink-200" },
            { label: "Total Users", value: stats.users, icon: <Users />, color: "bg-orange-500 shadow-orange-200" },
            { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: <TrendingUp />, color: "bg-emerald-500 shadow-emerald-200" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl ${stat.color.split(' ')[0]} text-white shadow-lg ${stat.color.split(' ')[1]} group-hover:scale-110 transition-transform`}>
                   {stat.icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+12% from last month</span>
              </div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-12 border-b border-slate-100 overflow-x-auto">
           {['analytics', 'products', 'checklist', 'orders', 'customers', 'coupons', 'returns', 'community'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`pb-6 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${
                 activeTab === tab ? 'text-[#FF69B4]' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {tab}
               {activeTab === tab && (
                 <motion.div 
                   layoutId="activeTab"
                   className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-full"
                 />
               )}
             </button>
           ))}
        </div>

        {/* Dynamic Content Section */}
        <div className="mb-16">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ duration: 0.3 }}
             >
                {activeTab === 'analytics' ? (
                  <AdminAnalytics />
                ) : activeTab === 'products' ? (
                  <AdminProductList key={refreshKey} onEdit={handleEditProduct} />
                ) : activeTab === 'checklist' ? (
                  <AdminChecklist key={refreshKey} onEdit={handleEditProduct} />
                ) : activeTab === 'customers' ? (
                  <AdminCustomerList />
                ) : activeTab === 'orders' ? (
                  <AdminOrderList />
                ) : activeTab === 'returns' ? (
                  <AdminReturnList />
                ) : activeTab === 'community' ? (
                  <AdminCommunity />
                ) : (
                  <AdminCouponList />
                )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Support Section */}
        <div className="grid lg:grid-cols-3 gap-10 pb-20">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                   <LayoutDashboard size={200} />
                </div>
                <div className="relative z-10">
                   <h2 className="text-3xl font-black tracking-tight mb-4">System Overview</h2>
                   <p className="text-slate-400 font-medium max-w-lg mb-8">
                      Your store is performing higher than 85% of peers. Keep updating your inventory to maintain growth.
                   </p>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div>
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Server Status</p>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="font-bold text-sm">Optimal</span>
                         </div>
                      </div>
                      <div>
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Sync Rate</p>
                         <span className="font-bold text-sm">99.9%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          <div className="bg-[#FF69B4] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
             <div>
                <h2 className="text-2xl font-black tracking-tight mb-2">Admin Support</h2>
                <p className="text-pink-100/70 font-medium text-sm">Quick access to developer documentation and help guides.</p>
             </div>
             <button className="bg-white text-[#FF69B4] w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-50 transition-all mt-8">
                Documentation
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showProductForm && (
          <AdminProductForm 
            product={editingProduct}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(undefined);
            }} 
            onSuccess={handleProductSuccess} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
