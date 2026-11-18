import { useEffect, useState } from "react";
import { productService, type Product } from "../../lib/api/services/products";
import { Skeleton } from "../common/Skeleton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HomeNewArrival = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products: fetchedProducts } = await productService.getProducts();
        setProducts(fetchedProducts.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full px-6 md:px-16 lg:px-24 py-20 bg-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-sm font-black text-pink-500 uppercase tracking-[0.3em] mb-3">
             New Collection
          </h2>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
            Fresh Arrivals
          </h1>
        </div>
        <Link 
          to="/women" 
          className="text-sm font-bold border-b-2 border-slate-900 pb-1 hover:text-pink-500 hover:border-pink-500 transition-all"
        >
          View All Products
        </Link>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="w-full aspect-[3/4] rounded-3xl" />
                <Skeleton className="mt-6 w-3/4 h-6" />
                <Skeleton className="mt-2 w-1/4 h-4" />
              </div>
            ))
          : products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="group relative"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-white shadow-sm group-hover:shadow-2xl transition-all duration-500 border-2 border-transparent group-hover:border-yellow-200">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <span className="bg-white text-slate-950 px-6 py-3 rounded-full font-black text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl border-2 border-pink-50">
                         Quick View
                       </span>
                    </div>

                    {product.is_new && (
                      <span className="absolute top-6 left-6 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-pink-500 transition-colors tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-wider italic">
                        {product.category || 'Lifestyle'}
                      </p>
                    </div>
                    <p className="text-xl font-black text-slate-950 italic">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
      </motion.div>
    </div>
  );
};

export default HomeNewArrival;
