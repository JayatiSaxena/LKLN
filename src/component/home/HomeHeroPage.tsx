import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, AnimatePresence } from "framer-motion";
import { homeService, type HomeSection } from "../../lib/api/services/home";
// @ts-expect-error Swiper CSS imports
import "swiper/css";
// @ts-expect-error Swiper CSS imports
import "swiper/css/effect-fade";

const HomeHeroPage: React.FC = () => {
  const [navHeight, setNavHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState<HomeSection[]>([]);
  const navRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHero = async () => {
      try {
        const data = await homeService.getHomeSections('hero-main');
        setSlides(data);
      } catch (error) {
        console.error("Error loading hero:", error);
      } finally {
        setFetching(false);
      }
    };
    loadHero();

    const navbar = document.querySelector("nav");
    if (navbar) {
      setNavHeight(navbar.clientHeight);
      navRef.current = navbar as HTMLElement;
    }

    const handleResize = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShopNow = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/women");
    }, 1200);
  };

  if (fetching && slides.length === 0) return (
     <div className="w-full h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-pink-500 rounded-full animate-spin"></div>
     </div>
  );

  return (
    <section
      style={{ marginTop: `${navHeight}px` }}
      className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-[#FFF5F7]"
    >
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-full h-full object-cover object-top scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-0 z-20 flex items-center px-6 md:px-24 lg:px-44 pointer-events-none">
        <AnimatePresence mode="wait">
          {slides[activeIndex] && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left max-w-2xl text-slate-900 pointer-events-auto"
            >
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-pink-500 text-sm md:text-lg font-black uppercase tracking-[0.3em] mb-4"
              >
                {slides[activeIndex].badge}
              </motion.p>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-8xl font-black mb-6 leading-[1.1] whitespace-pre-line tracking-tighter"
              >
                {slides[activeIndex].title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg md:text-2xl text-slate-600 font-medium mb-10 tracking-wide"
              >
                {slides[activeIndex].subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={handleShopNow}
                  disabled={loading}
                  className="group relative overflow-hidden bg-pink-500 text-white px-10 py-4 rounded-full font-black text-lg transition-all hover:pr-14 active:scale-95 shadow-2xl shadow-pink-100"
                >
                  <span className="relative z-10">
                    {loading ? "Discovering..." : "Shop Collection"}
                  </span>
                  {!loading && (
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      →
                    </span>
                  )}
                  <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-0"></div>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-12 bg-pink-500' : 'w-4 bg-slate-200'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeHeroPage;
