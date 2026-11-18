import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../lib/auth/useAuth";
import { productService, type Product } from "../../lib/api/services/products";
import { ProductCard } from "../common/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { items: wishlistIds, loading: storeLoading } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch all products in wishlist
        // Note: For large wishlists, we'd use a specific batch fetch, 
        // but for now we'll fetch all and filter to keep it simple and reactive.
        const { products: allProducts } = await productService.getProducts({ limit: 1000 });
        const filtered = allProducts.filter(p => wishlistIds.includes(String(p.id)));
        setProducts(filtered);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  if (!user) {
    return (
      <div className="pt-40 pb-20 px-4 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
           <Heart size={40} />
        </div>
        <h2 className="text-3xl font-black italic mb-4">Your Wishlist is Waiting</h2>
        <p className="text-slate-500 mb-8 italic">Please login to save and view your favorite products.</p>
        <Link to="/login" className="bg-pink-500 text-white px-10 py-4 rounded-2xl font-black italic hover:bg-pink-600 transition-all shadow-xl shadow-pink-100">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 px-4 md:px-16 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-4">
             My Wishlist <span className="text-pink-500 text-6xl">.</span>
          </h1>
          <p className="text-slate-400 font-bold italic uppercase tracking-widest mt-2">
             {products.length} Items Saved
          </p>
        </div>
        <Link to="/women" className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest italic hover:text-pink-500 transition-colors">
           Continue Shopping <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {loading || storeLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-50 rounded-[2.5rem] animate-pulse" />
            ))}
          </motion.div>
        ) : products.length > 0 ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200"
          >
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                <ShoppingBag size={32} />
             </div>
             <h3 className="text-xl font-black italic text-slate-900 mb-2">No favorites yet</h3>
             <p className="text-slate-400 font-medium italic mb-8">Items added to your wishlist will appear here.</p>
             <Link to="/women" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                Discover Styles
             </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
