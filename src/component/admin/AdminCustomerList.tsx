import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, X, Mail, Phone, ShoppingBag } from "lucide-react";

interface Customer { id: string; full_name: string | null; email: string | null; phone: string | null; role: string; created_at?: string }
interface OrderRow { id: string; user_id: string; total_amount: number; status: string; created_at: string }

const AdminCustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, o] = await Promise.all([
          supabase.from("profiles").select("*").eq("role", "user").order("created_at", { ascending: false }),
          supabase.from("orders").select("id, user_id, total_amount, status, created_at").order("created_at", { ascending: false }),
        ]);
        if (c.error) throw c.error;
        if (o.error) throw o.error;
        setCustomers((c.data ?? []) as Customer[]);
        setOrders((o.data ?? []) as OrderRow[]);
      } catch (e) {
        console.error("Error loading customers:", e);
        setError(e instanceof Error ? e.message : "Failed to load customers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; spent: number }>();
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const s = m.get(o.user_id) ?? { count: 0, spent: 0 };
      s.count += 1; s.spent += Number(o.total_amount) || 0;
      m.set(o.user_id, s);
    });
    return m;
  }, [orders]);

  const filtered = customers.filter((c) =>
    `${c.full_name ?? ""} ${c.email ?? ""}`.toLowerCase().includes(term.toLowerCase())
  );
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const th = "px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400";

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Customers</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">{customers.length} registered customers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search customers..."
            className="pl-12 pr-6 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#FF69B4] font-medium text-sm w-full md:w-64" />
        </div>
      </div>

      {error && <div className="m-8 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-slate-50/50">
            <th className={th}>Customer</th><th className={th}>Email</th><th className={th}>Orders</th><th className={th}>Total Spent</th><th className={th}>Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No customers found.</td></tr>
            ) : filtered.map((c) => {
              const s = stats.get(c.id) ?? { count: 0, spent: 0 };
              return (
                <tr key={c.id} onClick={() => setSelected(c)} className="hover:bg-slate-50/50 cursor-pointer transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-900">{c.full_name || "—"}</td>
                  <td className="px-8 py-5 text-sm text-slate-500">{c.email}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">{s.count}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{fmt(s.spent)}</td>
                  <td className="px-8 py-5 text-sm text-slate-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selected.full_name || "Customer"}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-2"><Mail size={14} /> {selected.email}</p>
                {selected.phone && <p className="text-sm text-slate-500 flex items-center gap-2 mt-1"><Phone size={14} /> {selected.phone}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100" aria-label="Close"><X size={20} /></button>
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><ShoppingBag size={14} /> Order History</h4>
            {orders.filter((o) => o.user_id === selected.id).length === 0 ? (
              <p className="text-sm text-slate-400 font-bold">No orders yet.</p>
            ) : (
              <ul className="space-y-2">
                {orders.filter((o) => o.user_id === selected.id).map((o) => (
                  <li key={o.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl text-sm">
                    <span className="font-bold text-slate-700">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-3"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{o.status}</span><span className="font-black text-slate-900">{fmt(Number(o.total_amount))}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerList;
