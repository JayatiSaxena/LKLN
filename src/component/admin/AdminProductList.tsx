import React, { useState, useEffect } from "react";
import { productService, type Product } from "../../lib/api/services/products";
import { 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCompletion } from "../../lib/productChecklist";

interface AdminProductListProps {
  onEdit: (product: Product) => void;
}

const AdminProductList: React.FC<AdminProductListProps> = ({ onEdit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { products } = await productService.getProducts({ limit: 100 });
      setProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Product Inventory</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage your store's items and stock.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-12 pr-6 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-sm w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all">
              <Filter size={18} />
           </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Product</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Category</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Price</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Stock</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Completion</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td className="px-8 py-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                     </td>
                     <td colSpan={5} className="px-8 py-6">
                        <div className="h-4 w-full bg-slate-50 rounded" />
                     </td>
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                <motion.tr 
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50 group-hover:scale-105 transition-transform duration-500 relative">
                        <img src={product.image_url || (product.images && product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                        {product.images && product.images.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-md rounded-md px-1 py-0.5 text-[8px] font-black text-slate-900 shadow-sm border border-slate-100">
                             +{product.images.length - 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 tracking-tight">{product.name}</p>
                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mt-1">ID: #{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500 uppercase tracking-wider">{product.category}</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900">₹{product.price.toLocaleString("en-IN")}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">
                     <span className={`${product.stock_quantity < 10 ? 'text-orange-500 bg-orange-50' : 'text-emerald-500 bg-emerald-50'} px-3 py-1 rounded-lg text-xs`}>
                        {product.stock_quantity} in stock
                     </span>
                  </td>
                  <td className="px-8 py-6">
                     {(() => { const c = getCompletion(product); return (
                       <div className="w-28" title={c.items.filter(i => !i.done).map(i => i.label).join(", ") || "Complete"}>
                         <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1"><span>{c.done}/{c.total}</span><span>{c.percent}%</span></div>
                         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${c.percent === 100 ? "bg-emerald-500" : "bg-[#FF69B4]"}`} style={{ width: `${c.percent}%` }} /></div>
                       </div>
                     ); })()}
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onEdit(product)}
                          className="p-2 text-slate-400 hover:text-pink-600 transition-all rounded-xl hover:bg-pink-50"
                        >
                           <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-all rounded-xl hover:bg-red-50"
                        >
                           <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                           <MoreVertical size={16} />
                        </button>
                     </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {!loading && filteredProducts.length === 0 && (
        <div className="p-20 text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-slate-300" />
           </div>
           <h3 className="text-xl font-black text-slate-900">No products found</h3>
           <p className="text-slate-500 font-medium mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProductList;
