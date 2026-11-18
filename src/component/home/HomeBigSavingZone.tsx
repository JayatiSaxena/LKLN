import React, { useEffect, useState } from "react";
import { homeService, type HomeSection } from "../../lib/api/services/home";
import { motion } from "framer-motion";

const HomeBigSavingZone: React.FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await homeService.getHomeSections('fashion');
        setSections(data);
      } catch (error) {
        console.error("Error fetching saving zone sections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  if (loading && sections.length === 0) return null;

  return (
    <section className="w-full py-24 px-6 md:px-16 lg:px-24 bg-[#FFF5F7]">
      <div className="flex flex-col mb-16 px-2">
        <h2 className="text-sm font-black text-pink-500 uppercase tracking-[0.4em] mb-4 text-center sm:text-left">
          Exclusive Offers
        </h2>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight text-center sm:text-left">
          Big Saving Zone
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 auto-rows-[450px]"
      >
        {sections.map((section, i) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`${i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'} relative group overflow-hidden rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 border border-yellow-100/50 hover:border-yellow-400`}
          >
            <img 
              src={section.image_url} 
              alt={section.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-10 flex flex-col justify-end">
              <h3 className="text-white text-3xl font-black mb-2 tracking-tight italic">{section.title}</h3>
              <p className="text-white/80 font-medium mb-6 uppercase tracking-widest text-xs italic">{section.subtitle}</p>
              <div className="flex items-center justify-between">
                <span className="bg-pink-500/20 backdrop-blur-md text-pink-200 px-4 py-2 rounded-xl text-sm font-black border border-pink-500/30 italic">
                  {section.badge || 'Limited Deal'}
                </span>
                <button className="bg-[#FF69B4] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-xl">
                  {section.button_text || 'Shop Now'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HomeBigSavingZone;
