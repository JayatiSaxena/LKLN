import Marquee from "react-fast-marquee";
import React, { useEffect, useState } from "react";
import { homeService, type Brand } from "../../lib/api/services/home";
import { motion } from "framer-motion";

const HomeBrandDeal: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await homeService.getBrands();
        setBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (loading && brands.length === 0) return null;

  return (
    <div className="w-full px-6 md:px-16 lg:px-24 mb-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-slate-900 rounded-[3rem] py-20 px-8 text-center relative overflow-hidden shadow-2xl group"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/20 blur-[120px] rounded-full -mr-48 -mt-48 transition-all duration-700 group-hover:bg-pink-600/30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full -ml-48 -mb-48 transition-all duration-700 group-hover:bg-blue-600/20"></div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Top Brands <span className="text-pink-500 font-black italic">Deal</span>
          </h2>
        
          <p className="text-slate-400 text-lg md:text-xl mb-16 font-medium max-w-2xl mx-auto italic">
            Experience luxury at its peak. Up To <span className="text-pink-400 font-black">60% OFF</span> on premium international brands.
          </p>

          <div className="mt-12">
            <Marquee speed={60} gradient={true} gradientColor="rgba(15, 23, 42, 1)" gradientWidth={100}>
              {brands.map((brand) => (
                <motion.div
                  key={brand.id}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-md border border-white/5 mx-6 w-[180px] h-[100px] rounded-3xl flex items-center justify-center p-6 group hover:border-pink-500/50 transition-all duration-500"
                >
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain filter brightness-0 invert opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </motion.div>
              ))}
            </Marquee>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeBrandDeal;