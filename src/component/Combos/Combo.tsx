import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Shield, Truck, ArrowRight } from "lucide-react";
import { productService, type Product } from "../../lib/api/services/products";
import { ProductCard } from "../common/ProductCard";
import { Skeleton } from "../common/Skeleton";
import { motion } from "framer-motion";

const Combo: React.FC = () => {
  const [combos, setCombos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true);
      try {
        // Fetch products that might be combos (e.g., category contains 'Combo' or just specific ones)
        // For now, let's fetch 'Combo' category if it exists, or just some featured products
        const res = await productService.getProducts({ category: "Combo", limit: 12 });
        setCombos(res.products);
      } catch (error) {
        console.error("Failed to fetch combos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center overflow-hidden bg-gray-900 rounded-b-[4rem] mx-4 md:mx-8">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover opacity-40 scale-105"
            alt="Combos"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
        </div>

        <div className="container mx-auto px-8 md:px-16 z-10 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl space-y-6"
          >
            <span className="px-5 py-2 bg-[#FF69B4] text-white rounded-full text-xs font-black uppercase tracking-[0.2em] italic">Limited Edition</span>
            <h1 className="text-6xl md:text-8xl font-black text-white italic leading-[0.9] tracking-tighter">
              ULTIMATE <br /> <span className="text-pink-500">COMBOS</span>
            </h1>
            <p className="text-xl text-gray-300 italic font-medium max-w-lg leading-relaxed">
              Curated bundles designed for the modern lifestyle. Save up to 40% on our premium collections. 
            </p>
            <div className="flex gap-4 pt-4">
               <button className="px-8 py-4 bg-white text-gray-900 font-black italic rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                 SHOP ALL COMBOS <ArrowRight size={20} />
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Bar */}
      <div className="py-12 overflow-hidden border-y border-gray-100 mt-[-2rem] bg-white relative z-20 mx-12 rounded-3xl shadow-2xl flex items-center justify-around flex-wrap gap-8">
         <div className="flex items-center gap-4 group">
            <div className="p-3 bg-pink-50 rounded-2xl group-hover:bg-[#FF69B4] group-hover:text-white transition-colors">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase italic">Express</p>
              <p className="text-sm font-black text-gray-900 italic">24H SHIPPING</p>
            </div>
         </div>
         <div className="flex items-center gap-4 group">
            <div className="p-3 bg-pink-50 rounded-2xl group-hover:bg-[#FF69B4] group-hover:text-white transition-colors">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase italic">Quality</p>
              <p className="text-sm font-black text-gray-900 italic">LIFETIME WARRANTY</p>
            </div>
         </div>
         <div className="flex items-center gap-4 group">
            <div className="p-3 bg-pink-50 rounded-2xl group-hover:bg-[#FF69B4] group-hover:text-white transition-colors">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase italic">Global</p>
              <p className="text-sm font-black text-gray-900 italic">FREE DELIVERY</p>
            </div>
         </div>
      </div>

      {/* Product Grid */}
      <section className="container mx-auto px-4 md:px-16 pt-24 space-y-16">
        <div className="flex items-end justify-between">
           <div className="space-y-2">
              <h2 className="text-4xl font-black text-gray-900 italic tracking-tight">CURATED BUNDLES</h2>
              <div className="h-1.5 w-24 bg-[#FF69B4] rounded-full" />
           </div>
           <p className="text-gray-400 font-bold italic hidden md:block">{combos.length} Exclusive Sets Available</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] rounded-[2rem]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : combos.length === 0 ? (
          <div className="py-40 text-center space-y-6 bg-gray-50 rounded-[3rem]">
             <h3 className="text-4xl font-black text-gray-200 italic uppercase">No Combos Found</h3>
             <p className="text-gray-400 italic font-medium">We're currently updating our exclusive bundle collections.</p>
             <Link to="/" className="inline-block text-[#FF69B4] font-black italic hover:underline">Back to Shop</Link>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16"
          >
            {combos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </section>

      {/* Special CTA */}
      <section className="container mx-auto px-4 md:px-16 pt-32">
         <div className="bg-[#FF69B4] rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col items-center text-center gap-8 shadow-2xl shadow-pink-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <h2 className="text-5xl md:text-7xl font-black text-white italic leading-tight tracking-tighter relative z-10">
              BUILD YOUR OWN <br /> CUSTOM COMBO
            </h2>
            <p className="text-pink-100 text-xl font-medium italic max-w-2xl relative z-10">
              Mix and match any 3 items and get an instant 30% discount at checkout. No coupon codes needed.
            </p>
            <button className="px-12 py-5 bg-white text-[#FF69B4] font-black italic text-xl rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl relative z-10">
              START BUILDING
            </button>
         </div>
      </section>
    </div>
  );
};

export default Combo;
