import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingBag, ArrowUpRight, Calendar } from "lucide-react";

interface AnalyticsData {
  date: string;
  revenue: number;
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data: orders, error } = await supabase
          .from("orders")
          .select("created_at, total_amount")
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Group by day for now (simplified)
        const grouped = (orders || []).reduce((acc: any, order) => {
          const date = new Date(order.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + (order.total_amount || 0);
          return acc;
        }, {});

        const formatted = Object.entries(grouped).map(([date, revenue]) => ({
          date,
          revenue: revenue as number
        })).slice(-7); // Last 7 days

        setData(formatted);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FF69B4] rounded-full animate-spin"></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="space-y-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Analytics</h3>
              <p className="text-sm text-slate-400 font-medium italic mt-1 uppercase tracking-widest">Performance tracking </p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
              {(['7d', '30d', '12m'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === p ? 'bg-white text-[#FF69B4] shadow-sm' : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG Chart */}
          <div className="h-64 relative flex items-end gap-2 md:gap-4 px-2">
            {data.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 uppercase tracking-widest">
                  ₹{item.revenue.toLocaleString()}
                </div>
                
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${
                    i === data.length - 1 ? 'bg-[#FF69B4] shadow-lg shadow-pink-200' : 'bg-slate-100 group-hover:bg-pink-100'
                  }`}
                />
                <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-tighter truncate w-full text-center">
                  {item.date.split('/')[0]}/{item.date.split('/')[1]}
                </p>
              </div>
            ))}
          </div>

          {/* Grid Lines Overlay (Subtle) */}
          <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between opacity-30">
             {[0, 1, 2, 3].map(line => (
               <div key={line} className="w-full border-t border-dashed border-slate-200" />
             ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-120 transition-transform duration-700">
               <TrendingUp size={100} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Sales</p>
               <h3 className="text-4xl font-black italic tracking-tighter">₹{(data.reduce((a, b) => a + b.revenue, 0)).toLocaleString()}</h3>
               <div className="mt-6 flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest italic">
                  <ArrowUpRight size={14} />
                  <span>+18.4% high</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 italic">Quick Stats</h4>
             <div className="space-y-6">
                {[
                  { label: "Avg. Order Value", value: "₹2,450", icon: <DollarSign size={16} /> },
                  { label: "Orders Placed", value: "142", icon: <ShoppingBag size={16} /> },
                  { label: "Completion Rate", value: "98.2%", icon: <Calendar size={16} /> }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4">
                     <div className="p-3 bg-slate-50 rounded-xl text-[#FF69B4]">
                        {stat.icon}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="font-black italic text-slate-900">{stat.value}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Top Products (Placeholder Logic) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
         <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 italic">Top Selling Products</h3>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-all cursor-pointer group">
                 <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100" />
                 </div>
                 <div className="flex-grow">
                    <p className="font-black italic text-slate-900 truncate">Product #{i + 1}</p>
                    <p className="text-[10px] font-black text-[#FF69B4] uppercase tracking-widest mt-0.5">₹{(Math.random() * 5000 + 1000).toFixed(0)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales</p>
                    <p className="font-black italic text-slate-900">{(Math.random() * 50 + 10).toFixed(0)}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
