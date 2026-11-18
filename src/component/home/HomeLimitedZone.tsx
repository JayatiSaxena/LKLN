import React, { useEffect, useState } from "react";
import { productService, type Product } from "../../lib/api/services/products";
import { motion } from "framer-motion";
import { ArrowRight, Star, ShoppingCart } from "lucide-react";
import SmartImage from "../common/SmartImage";

const HomeLimitedZone: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await productService.getProducts({ is_new: true, limit: 4 });
        setProducts(result.products);
      } catch (error) {
        console.error("Error fetching limited products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading && products.length === 0) return (
     <div className="w-full px-6 md:px-16 lg:px-24 py-24 text-center">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
     </div>
  );

  return (
    <div className="w-full px-6 md:px-16 lg:px-24 mb-32">
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-6">
          <div className="w-2 h-12 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)]"></div>
          <div>
            <h2 className="text-sm font-black text-pink-500 uppercase tracking-[0.4em] mb-2">
               Exclusive Drops
            </h2>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
              In The Limelight
            </h1>
          </div>
        </div>
        <button className="hidden md:flex items-center gap-2 group text-slate-900 font-bold tracking-tight hover:text-pink-500 transition-colors">
          View All Drops
          <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-pink-100 group-hover:text-pink-500 transition-colors">
             <ArrowRight size={16} />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group flex flex-col"
          >
            <div className="relative aspect-[3/4.2] overflow-hidden rounded-[2.5rem] bg-white group shadow-sm group-hover:shadow-2xl transition-all duration-700 border-2 border-transparent group-hover:border-yellow-200">
               <SmartImage 
                 src={product.image_url} 
                 alt={product.name} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
               />
               
               {/* Quick Add Overlay */}
               <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <button className="bg-white text-slate-900 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl flex items-center justify-center gap-2 border-2 border-pink-50">
                    <ShoppingCart size={16} className="text-pink-500" />
                    Quick Shop
                  </button>
               </div>
               
               <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-pink-100">
                     <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">New Arrival</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 px-2">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none italic">{product.category}</span>
                  <div className="flex items-center gap-1 text-pink-500">
                     <Star size={12} fill="currentColor" />
                     <span className="text-xs font-black text-slate-900 line-height-none">{product.rating || '4.8'}</span>
                  </div>
               </div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-pink-500 transition-colors line-clamp-1 italic">
                 {product.name}
               </h3>
               <p className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{product.price.toLocaleString("en-IN")}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomeLimitedZone;