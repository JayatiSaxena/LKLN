import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Tag, Trash2, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  expires_at: string | null;
  is_active: boolean;
  used_count: number;
}

const AdminCouponList: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    min_purchase_amount: 0,
    expires_at: ""
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("coupons")
        .insert({
          ...newCoupon,
          code: newCoupon.code.toUpperCase(),
          expires_at: newCoupon.expires_at || null
        });

      if (error) throw error;
      
      setShowAddForm(false);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        min_purchase_amount: 0,
        expires_at: ""
      });
      fetchCoupons();
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch (err) {
      console.error("Error toggling coupon status:", err);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic tracking-tight">Manage Coupons</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          Create New
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl"
          >
            <form onSubmit={handleCreateCoupon} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Coupon Code</label>
                <input
                  required
                  placeholder="e.g. WELCOME10"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 font-bold italic"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Discount Type</label>
                <select
                  value={newCoupon.discount_type}
                  onChange={e => setNewCoupon({ ...newCoupon, discount_type: e.target.value as any })}
                  className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 font-bold italic"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Discount Value</label>
                <input
                  required
                  type="number"
                  value={newCoupon.discount_value}
                  onChange={e => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                  className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 font-bold italic"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Min Purchase (₹)</label>
                <input
                  required
                  type="number"
                  value={newCoupon.min_purchase_amount}
                  onChange={e => setNewCoupon({ ...newCoupon, min_purchase_amount: Number(e.target.value) })}
                  className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 font-bold italic"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.expires_at}
                  onChange={e => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                  className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 font-bold italic"
                />
              </div>
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#FF69B4] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all text-sm shadow-lg shadow-pink-100"
                >
                  Save Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Code</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Discount</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Min Purchase</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Usage</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-8 py-6"><div className="h-4 bg-slate-50 rounded w-full" /></td>
                </tr>
              ))
            ) : coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 uppercase font-black italic text-slate-900 flex items-center gap-2">
                   <Tag size={14} className="text-[#FF69B4]" /> {coupon.code}
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600">₹{coupon.min_purchase_amount}</td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600">{coupon.used_count} used</td>
                <td className="px-8 py-6">
                   <button 
                    onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      coupon.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}
                   >
                     {coupon.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                     {coupon.is_active ? 'Active' : 'Inactive'}
                   </button>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => deleteCoupon(coupon.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && !loading && (
          <div className="p-20 text-center font-bold italic text-slate-400">No coupons found. Create your first one above!</div>
        )}
      </div>
    </div>
  );
};

export default AdminCouponList;
