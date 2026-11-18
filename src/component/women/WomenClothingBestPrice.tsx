import React, { useEffect, useState } from "react";
import { productService, type Product } from "../../lib/api/services/products";
import { motion } from "framer-motion";

const WomensClothingTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestPrices = async () => {
      try {
        const res = await productService.getProducts({
          category: "Women",
          sortBy: "price_asc",
          limit: 12
        });
        setProducts(res.products);
      } catch (error) {
        console.error("Error fetching best prices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestPrices();
  }, []);

  if (loading && products.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-6 md:px-16 py-20 pb-40">
      <div className="flex flex-col mb-12">
        <h2 className="text-sm font-black text-[#FF69B4] uppercase tracking-[0.4em] mb-4">
           Value Shopping
        </h2>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
          Buy Women's Clothing at <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-[#FF4081]">Best Price</span>
        </h1>
      </div>

      <div className="bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/50">
              <th className="py-8 px-12 font-black text-slate-900 text-sm uppercase tracking-widest">
                Women's Essentials
              </th>
              <th className="py-8 px-12 font-black text-slate-900 text-sm uppercase tracking-widest text-right">
                Best Price
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group hover:bg-white transition-colors border-b border-slate-100 last:border-0"
              >
                <td className="py-6 px-12 text-slate-600 font-bold italic group-hover:text-[#FF69B4] transition-colors">
                  {item.name}
                </td>
                <td className="py-6 px-12 text-slate-900 font-black text-xl text-right">
                  ₹{item.price.toLocaleString("en-IN")}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default WomensClothingTable;
