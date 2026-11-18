import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import { homeService, type HomeSection } from "../../lib/api/services/home";

// @ts-expect-error Swiper CSS imports
import "swiper/css";
// @ts-expect-error Swiper CSS imports
import "swiper/css/effect-fade";

const HomeFashionSection: React.FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await homeService.getHomeSections('fashion');
        setSections(data);
      } catch (error) {
        console.error("Error fetching fashion sections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  if (loading && sections.length === 0) return null;

  return (
    <div className="w-full px-6 md:px-16 lg:px-24 py-20 bg-[#FFF5F7]">
      <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[3.5rem] overflow-hidden shadow-2xl min-h-[700px] border border-white">
        {/* Left Content Section */}
        <div
          className="relative flex items-center justify-center text-white p-12 lg:p-20 overflow-hidden"
          style={{
            backgroundImage: `url(${sections[0]?.image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-pink-950/40 backdrop-blur-[2px]"></div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-xl"
          >
            <h2 className="text-sm font-black text-pink-400 uppercase tracking-[0.4em] mb-6">
               {sections[0]?.badge || 'Lifestyle Choice'}
            </h2>
            <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter uppercase">
              {sections[0]?.title || 'WE MADE YOUR EVERYDAY FASHION BETTER!'}
            </h1>
            <p className="text-lg md:text-xl mb-12 text-slate-200 font-medium leading-relaxed">
              {sections[0]?.subtitle || 'Comfortable & Affordable fashion 24/7. Discover our latest everyday wear range.'}
            </p>
            <button className="bg-[#FF69B4] text-white px-10 py-5 rounded-[2rem] font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-pink-200">
              Shop Now
            </button>
          </motion.div>
        </div>

        {/* Right Slider Section */}
        <div className="relative overflow-hidden bg-slate-100">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full"
          >
            {sections.map((section) => (
              <SwiperSlide key={section.id}>
                <div className="w-full h-full relative group">
                  <img
                    src={section.image_url}
                    alt={section.title}
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-slate-950/20 to-transparent"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <div className="absolute bottom-12 right-12 z-20 glass p-6 rounded-[2rem] border-white/20 hidden md:block">
             <p className="text-slate-900 font-black text-xs uppercase tracking-widest">Premium Quality</p>
             <p className="text-slate-500 text-[10px] font-bold mt-1">ESTABLISHED 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFashionSection;
