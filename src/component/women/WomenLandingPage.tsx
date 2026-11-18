import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { productService, type Product } from "../../lib/api/services/products";
import { ProductCard } from "../common/ProductCard";
import { Skeleton } from "../common/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

const Section: React.FC<{
  title: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}> = ({ title, isOpen, setOpen, children }) => (
  <div className="mb-6 border-b border-gray-100 pb-6">
    <button
      className="flex justify-between items-center w-full py-2 group"
      onClick={() => setOpen(!isOpen)}
    >
      <h3 className="font-black text-gray-900 italic uppercase tracking-widest text-sm group-hover:text-pink-500 transition-colors">{title}</h3>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className="text-gray-400 group-hover:text-pink-500 transition-colors" size={18} />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden mt-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const WomenLandingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(true);
  const [sizesOpen, setSizesOpen] = useState(true);
  
  const selectedCategory = searchParams.get("category") || "";
  const [maxPrice, setMaxPrice] = useState(10000);

  const categories = ["T-Shirts", "Shirts", "Hoodies", "Kurti", "Jeans", "Joggers", "Pajamas"];
  const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
  const colors = [
    { name: "Purple", hex: "#8434E1" },
    { name: "Black", hex: "#000000" },
    { name: "Red", hex: "#F35528" },
    { name: "Navy", hex: "#345EFF" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Pink", hex: "#E08D9D" },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          category: selectedCategory,
          maxPrice: maxPrice,
          limit: 20
        });
        setProducts(res.products);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory, maxPrice]);

  return (
    <section className="pt-24 px-4 md:px-16 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-28 space-y-2">
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-900">
               <h2 className="text-2xl font-black text-gray-900 italic flex items-center gap-2">
                  <SlidersHorizontal size={20} /> FILTERS
               </h2>
               <button onClick={() => { setSearchParams({}); setMaxPrice(1000); }} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">Reset</button>
            </div>

            <Section title="Category" isOpen={filterOpen} setOpen={setFilterOpen}>
              <ul className="space-y-3">
                <li 
                  onClick={() => setSearchParams({})}
                  className={`cursor-pointer font-bold italic transition-all flex items-center gap-2 ${selectedCategory === "" ? "text-pink-500 translate-x-1" : "text-gray-500 hover:text-pink-400"}`}
                >
                   <span className={`w-1.5 h-1.5 rounded-full bg-pink-500 transition-opacity ${selectedCategory === "" ? "opacity-100" : "opacity-0"}`} />
                   All Collections
                </li>
                {categories.map((cat) => (
                  <li 
                    key={cat} 
                    onClick={() => setSearchParams({ category: cat })}
                    className={`cursor-pointer font-bold italic transition-all flex items-center gap-2 ${selectedCategory === cat ? "text-pink-500 translate-x-1" : "text-gray-500 hover:text-pink-400"}`}
                  >
                     <span className={`w-1.5 h-1.5 rounded-full bg-pink-500 transition-opacity ${selectedCategory === cat ? "opacity-100" : "opacity-0"}`} />
                     {cat}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Price Limit" isOpen={priceOpen} setOpen={setPriceOpen}>
              <div className="space-y-4 px-1">
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-pink-500" 
                />
                <div className="flex justify-between font-black italic text-gray-900">
                  <span className="text-xs text-gray-400">Min ₹0</span>
                  <span>Up to ₹{maxPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Section>

            <Section title="Colors" isOpen={colorsOpen} setOpen={setColorsOpen}>
              <div className="grid grid-cols-5 gap-3">
                {colors.map((c) => (
                  <button 
                    key={c.name} 
                    title={c.name}
                    className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-pink-200 transition-all shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </Section>

            <Section title="Size" isOpen={sizesOpen} setOpen={setSizesOpen}>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button key={s} className="px-4 py-2 border-2 border-gray-100 rounded-xl text-xs font-black italic text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-all">{s}</button>
                ))}
              </div>
            </Section>
          </div>
        </aside>

        {/* Product Listing Area */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
               <h1 className="text-5xl font-black text-gray-900 italic tracking-tighter">WOMEN'S</h1>
               <p className="text-gray-400 font-bold italic uppercase tracking-[0.3em] text-xs">Essential Style Guide</p>
            </div>
            
            <div className="flex items-center gap-6 pb-2">
               <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                  <button className="p-2.5 bg-white shadow-sm rounded-xl text-pink-500"><LayoutGrid size={18} /></button>
                  <button className="p-2.5 text-gray-400 hover:text-pink-500"><List size={18} /></button>
               </div>
               <select className="bg-transparent font-black italic text-sm outline-none cursor-pointer border-b-2 border-transparent hover:border-pink-500 pb-1 transition-all">
                  <option>NEWEST</option>
                  <option>PRICE: LOW</option>
                  <option>PRICE: HIGH</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-[2.5rem]" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full py-40 text-center space-y-6">
                 <h3 className="text-3xl font-black text-gray-200 italic uppercase">No Products Found</h3>
                 <button onClick={() => setSearchParams({})} className="text-pink-500 font-black italic hover:underline">Clear Filters</button>
              </div>
            ) : (
              products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </main>
      </div>
    </section>
  );
};

export default WomenLandingPage;
