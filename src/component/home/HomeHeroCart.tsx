import React, { useEffect, useState } from "react";
import { homeService, type HomeSection } from "../../lib/api/services/home";
import { motion } from "framer-motion";

const HomeHeroCart: React.FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await homeService.getHomeSections('hero-side');
        setSections(data.slice(0, 2));
      } catch (error) {
        console.error("Error fetching hero sections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  if (loading && sections.length === 0) return null;

  return (
    <div className="w-full px-6 md:px-16 lg:px-24 py-12 bg-[#FFF5F7]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {sections.map((section, i) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] overflow-hidden shadow-sm group h-[500px]"
          >
            <img
              src={section.image_url}
              alt={section.title}
              className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-pink-950/40 to-transparent flex flex-col justify-center items-start p-12 lg:p-16">
              <span className="bg-pink-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-6 shadow-lg border border-yellow-400/30">
                {section.badge || 'New Season'}
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter mb-4">
                {section.title}
              </h2>
              <p className="text-xl font-bold text-white/80 mb-8 uppercase tracking-widest italic">{section.subtitle}</p>
              <button className="text-white font-black text-sm border-b-2 border-white/30 pb-1 hover:border-pink-500 hover:text-pink-400 transition-all uppercase tracking-widest">
                {section.button_text || 'Explore Items'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomeHeroCart;
