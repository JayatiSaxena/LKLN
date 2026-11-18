import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { homeService, type Category } from "../../lib/api/services/home";
import ArrowIcon from "../../assets/svgs/Arrow 1.svg"; 
import { SmartImage } from "../common/SmartImage";
import { motion } from "framer-motion";

const CategoriesForWomen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await homeService.getCategories('women');
        setCategories(data);
      } catch (error) {
        console.error("Error fetching women categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading && categories.length === 0) return null;

  return (
    <div className="w-full px-6 md:px-16 lg:px-24 py-24 bg-[#FFF5F7]">
      <div className="flex flex-col mb-16">
        <h2 className="text-sm font-black text-pink-500 uppercase tracking-[0.4em] mb-4 text-center sm:text-left">
          Timeless Elegance
        </h2>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 text-center sm:text-left">
          Categories For Women
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
      >
        {categories.map((cat, i) => (
          <motion.div 
            key={cat.id} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col group"
          >
            <Link to={`/women?category=${cat.name}`} className="block">
              <div className="relative aspect-[3/4.8] overflow-hidden rounded-[2.5rem] bg-white shadow-sm group-hover:shadow-2xl transition-all duration-700 border-2 border-transparent group-hover:border-yellow-200">
                <SmartImage
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-yellow-500/5 transition-colors duration-500"></div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl">
                      <SmartImage src={ArrowIcon} alt="arrow" className="w-6 h-6 text-pink-500" />
                   </div>
                </div>
              </div>

              <div className="mt-6 px-2 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-pink-500 transition-colors tracking-tight line-clamp-1 italic">{cat.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest italic">{cat.description || 'Explore Now!'}</p>
                </div>
                <div className="hidden sm:block">
                   <SmartImage src={ArrowIcon} alt="arrow" className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CategoriesForWomen;