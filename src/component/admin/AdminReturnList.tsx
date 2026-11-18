import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  images: string[];
  admin_comment: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminReturnList: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("return_requests")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReturns(data || []);
    } catch (error: any) {
      console.error("Error fetching returns:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("return_requests")
        .update({ 
          status, 
          admin_comment: comment,
          updated_at: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) throw error;
      
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: `Return request ${status} successfully`, type: "success" } 
      }));
      
      setSelectedReturn(null);
      setComment("");
      fetchReturns();
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: error.message, type: "error" } 
      }));
    } finally {
      setProcessing(false);
    }
  };

  const filteredReturns = returns.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-100';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search replacement ID, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-pink-50 transition-all font-bold italic outline-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  statusFilter === status 
                    ? 'bg-[#FF69B4] text-white shadow-lg shadow-pink-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Request Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Reason</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Photos</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 underline-offset-4">
                      <div className="h-12 bg-slate-50 rounded-2xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-slate-50 rounded-full text-slate-300">
                        <Clock size={40} />
                      </div>
                      <p className="text-slate-400 font-bold italic">No return requests found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReturns.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-400 mb-1">REQ-{req.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-sm font-bold text-slate-900 italic">Order: #{req.order_id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 mt-1">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 italic uppercase tracking-tight">{req.profiles?.full_name || 'Guest User'}</span>
                      <span className="text-[10px] font-bold text-slate-400">{req.profiles?.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <p className="text-sm text-slate-600 italic font-medium line-clamp-2">{req.reason}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex -space-x-3">
                      {req.images && req.images.length > 0 ? (
                        req.images.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden shadow-sm">
                            <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase italic">No Photos</span>
                      )}
                      {req.images && req.images.length > 3 && (
                        <div className="w-10 h-10 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center">
                          <span className="text-[10px] font-black text-slate-500">+{req.images.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedReturn(req)}
                      className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-[#FF69B4] hover:shadow-xl transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReturn && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReturn(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Side: Photos */}
              <div className="w-full md:w-1/2 bg-slate-50 p-8 overflow-y-auto">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic mb-6">Evidence Gallery</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedReturn.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-3xl overflow-hidden shadow-sm group relative">
                      <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                      <a 
                        href={img} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <ExternalLink size={24} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Decision Area */}
              <div className="w-full md:w-1/2 p-10 flex flex-col">
                <div className="mb-8 pb-8 border-b border-slate-100">
                  <span className="text-xs font-black text-[#FF69B4] uppercase tracking-widest mb-2 block">Request REQ-{selectedReturn.id.slice(0, 8).toUpperCase()}</span>
                  <h2 className="text-3xl font-black text-slate-900 italic tracking-tight mb-4">Review Return</h2>
                  <div className="flex flex-col gap-2 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">User's Reason</p>
                    <p className="text-slate-600 font-medium italic italic">"{selectedReturn.reason}"</p>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
                       <MessageSquare size={14} /> Admin Feedback (Mandatory for rejection)
                    </label>
                    <textarea 
                      placeholder="Enter comment for user..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full h-32 p-6 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-pink-50 transition-all font-medium italic outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8">
                  <button
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'rejected')}
                    disabled={processing || !comment}
                    className="py-5 rounded-2xl border-2 border-red-500 text-red-500 font-black italic uppercase tracking-widest text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'approved')}
                    disabled={processing}
                    className="py-5 rounded-2xl bg-emerald-600 text-white font-black italic uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} /> Approve
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReturnList;
