import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Zap, Compass } from "lucide-react";
import { productService, type Product } from "../../lib/api/services/products";
import { ProductCard } from "../common/ProductCard";
import { Skeleton } from "../common/Skeleton";
import { motion } from "framer-motion";

const Joggy: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoggers = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ category: "Joggers", limit: 12 });
        setProducts(res.products);
      } catch (error) {
        console.error("Failed to fetch joggers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJoggers();
  }, []);

  return (
    <div className="pt-24 pb-20 overflow-hidden">
      {/* Dynamic Header */}
      <section className="relative px-4 md:px-16 pt-12 pb-24">
         <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative z-10"
         >
           <div className="flex items-center gap-4 mb-4">
              <span className="w-12 h-1 bg-[#FF69B4] rounded-full" />
              <span className="text-sm font-black text-[#FF69B4] uppercase tracking-widest italic">Performance Gear</span>
           </div>
           <h1 className="text-7xl md:text-9xl font-black text-gray-900 italic leading-[0.85] tracking-tighter">
             URBAN <br /> <span className="text-transparent border-t-2 border-gray-900 inline-block mt-2" style={{ WebkitTextStroke: '2px #111827' }}>JOGGERS</span>
           </h1>
           <div className="mt-12 flex flex-col md:flex-row items-end gap-12">
              <p className="text-xl text-gray-500 font-medium italic max-w-xl leading-relaxed">
                Engineered for movement, styled for the street. Our latest jogger collection combines four-way stretch technology with a contemporary tapered silhouette.
              </p>
              <div className="flex-grow h-px bg-gray-100 mb-4 hidden md:block" />
              <div className="flex gap-12">
                 <div className="text-center">
                    <p className="text-4xl font-black text-gray-900 italic">4-WAY</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Stretch Tech</p>
                 </div>
                 <div className="text-center">
                    <p className="text-4xl font-black text-gray-900 italic">100%</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Breathable</p>
                 </div>
              </div>
           </div>
         </motion.div>

         {/* Abstract background elements */}
         <div className="absolute top-0 right-0 -z-0 opacity-10 blur-3xl pointer-events-none">
            <div className="w-[600px] h-[600px] bg-pink-100/50 rounded-full" />
         </div>
      </section>

      {/* Interactive Feature Cards */}
      <section className="px-4 md:px-16 grid md:grid-cols-3 gap-8 mb-32">
         {[
           { icon: <Activity />, title: "MOTION READY", desc: "Special ergonomic knee construction for zero resistance." },
           { icon: <Zap />, title: "QUICK DRY", desc: "Advanced moisture-wicking fabric keeps you cool all day." },
           { icon: <Compass />, title: "ALL TERRAIN", desc: "Reinforced seams designed for both gym and heavy street use." }
         ].map((item, i) => (
           <motion.div 
             key={i}
             whileHover={{ y: -10 }}
             className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-2xl hover:shadow-purple-100"
           >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#FF69B4] shadow-sm border border-gray-100 mb-6 group-hover:bg-[#FF69B4] group-hover:text-white transition-all">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 italic mb-3">{item.title}</h3>
              <p className="text-gray-500 font-medium italic">{item.desc}</p>
           </motion.div>
         ))}
      </section>

      {/* List Section */}
      <section className="px-4 md:px-16 container mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[2rem]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-2xl font-black text-gray-300 italic">STAY TUNED. NEW DROPS COMING SOON.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer Banner */}
      <section className="mt-40 px-4 md:px-16">
         <div className="relative h-96 rounded-[4rem] overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=2072" 
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
              alt="Lifestyle"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">THE NEW STANDARD OF COMFORT</h2>
                  <Link to="/search" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-black italic rounded-full hover:bg-[#FF69B4] hover:text-white transition-all">
                    EXPLORE PERFORMANCE <ArrowRight size={20} />
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Joggy;
