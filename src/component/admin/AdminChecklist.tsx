import React, { useEffect, useState } from "react";
import { productService, type Product } from "../../lib/api/services/products";
import { getCompletion } from "../../lib/productChecklist";
import { CheckCircle2, Circle, Edit2 } from "lucide-react";

const AdminChecklist: React.FC<{ onEdit: (p: Product) => void; refreshKey?: number }> = ({ onEdit, refreshKey }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService.getProducts({ limit: 200 })
      .then((r) => setProducts(r.products))
      .catch((e) => console.error("Error loading products:", e))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const rows = products.map((p) => ({ p, c: getCompletion(p) }));
  const complete = rows.filter((r) => r.c.percent === 100).length;
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.c.percent, 0) / rows.length) : 0;
  const shown = onlyIncomplete ? rows.filter((r) => r.c.percent < 100) : rows;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Product Completion Checklist</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {complete}/{rows.length} products fully complete · average {avg}%
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer">
          <input type="checkbox" checked={onlyIncomplete} onChange={(e) => setOnlyIncomplete(e.target.checked)} className="rounded" />
          Show incomplete only
        </label>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold">Loading...</div>
      ) : shown.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-bold">Every product is complete.</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {shown.map(({ p, c }) => (
            <div key={p.id} className="p-6 md:px-8 flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 lg:w-80 shrink-0">
                <img src={p.image_url || p.images?.[0]} alt={p.name} className="w-14 h-14 rounded-2xl object-cover bg-slate-100" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.sku || `ID #${p.id}`}</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.percent === 100 ? "bg-emerald-500" : "bg-[#FF69B4]"}`} style={{ width: `${c.percent}%` }} />
                  </div>
                  <span className="text-xs font-black text-slate-700 w-20 text-right">{c.done}/{c.total} · {c.percent}%</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.items.map((i) => (
                    <span key={i.key} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${i.done ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                      {i.done ? <CheckCircle2 size={12} /> : <Circle size={12} />} {i.label.replace(/ \(.*\)/, "")}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => onEdit(p)} className="self-start lg:self-center p-3 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all" aria-label="Edit product">
                <Edit2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChecklist;
