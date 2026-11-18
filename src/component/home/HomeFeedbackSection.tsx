import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
// @ts-expect-error Swiper CSS imports
import "swiper/css";
// @ts-expect-error Swiper CSS imports
import "swiper/css/pagination";

import user1 from "../../assets/svgs/feedperson1.svg";
import user2 from "../../assets/svgs/feedperson2.svg";
import user3 from "../../assets/svgs/feedperson3.svg";
import StarIcon from "../../assets/svgs/feedstar1.svg";

const FeedbackSection = () => {
  const feedbacks = [
    {
      img: user1,
      name: "Floyd Miles",
      text: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
    },
    {
      img: user2,
      name: "Ronald Richards",
      text: "Ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
    },
    {
      img: user3,
      name: "Savannah Nguyen",
      text: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
    },
    {
      img: user1,
      name: "Dianne Russell",
      text: "Curabitur in libero a lorem pulvinar porttitor. Sed at turpis sed dui posuere semper.",
    },
    {
      img: user2,
      name: "Jacob Jones",
      text: "Quisque gravida, metus quis tempor lobortis, lacus nisl viverra urna, eget posuere justo dolor quis enim.",
    },
  ];

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-24 bg-[#FFF5F7] relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-pink-100/30 blur-[120px] rounded-full -z-10"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <h2 className="text-sm font-black text-pink-500 uppercase tracking-[0.4em] mb-4">
            Testimonials
          </h2>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
            What Our Clients Say
          </h1>
        </div>
        <div className="feedback-pagination flex gap-2" />
      </div>

      <div className="relative">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={32}
          slidesPerView={3}
          slidesPerGroup={1}
          loop
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ el: ".feedback-pagination", clickable: true }}
          onBeforeInit={(swiper) => {
            if (
              swiper?.params?.pagination &&
              typeof swiper.params.pagination === "object"
            ) {
              (swiper.params.pagination as { el: string | HTMLElement }).el =
                ".feedback-pagination";
            }
          }}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-12"
        >
          {feedbacks.map((item, i) => (
            <SwiperSlide key={i}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/70 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                   <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 p-2 border border-slate-50">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div className="flex flex-col items-end">
                      <img
                        src={StarIcon}
                        alt="rating"
                        className="w-[100px] h-5 object-contain"
                      />
                      <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mt-1">Verified Buyer</span>
                   </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{item.name}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                  "{item.text}"
                </p>
                
                <div className="mt-auto pt-8 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excellent Service</span>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeedbackSection;