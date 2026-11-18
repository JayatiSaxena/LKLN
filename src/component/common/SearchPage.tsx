import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../../lib/api/services/products";
import type { Product, ProductFilters } from "../../lib/api/services/products";
import { ProductGrid } from "../common/ProductGrid";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Filter states from URL
  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const sortBy = (searchParams.get("sortBy") as ProductFilters["sortBy"]) || "newest";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 10000;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodData, catData] = await Promise.all([
          productService.getProducts({
            search: searchQuery,
            category: categoryFilter,
            sortBy,
            minPrice,
            maxPrice,
            limit: 40
          }),
          productService.getCategories()
        ]);
        setProducts(prodData.products);
        setTotalCount(prodData.totalCount);
        setCategories(catData);
      } catch (error) {
        console.error("Failed to load search results:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchQuery, categoryFilter, sortBy, minPrice, maxPrice]);

  const updateFilters = (updates: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams);
  };

  return (
    <div className="pt-24 px-4 md:px-16 pb-20 max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 italic mb-6 flex items-center gap-4">
          <span className="w-2 h-10 bg-pink-500 rounded"></span> Search Results
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-500 focus:bg-white transition-all outline-none font-bold italic"
              value={searchQuery}
              onChange={(e) => updateFilters({ q: e.target.value })}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black italic border-2 transition-all w-full md:w-auto justify-center ${
              showFilters ? "border-pink-500 bg-pink-50 text-pink-500" : "border-gray-100 bg-white text-gray-500 hover:border-pink-200"
            }`}
          >
            <SlidersHorizontal size={20} /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full lg:w-64 shrink-0"
            >
              <div className="space-y-8 sticky top-28">
                {/* Categories */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 italic">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFilters({ category: "" })}
                      className={`block w-full text-left px-4 py-2.5 rounded-xl font-bold italic transition-all ${
                        categoryFilter === "" ? "bg-pink-500 text-white shadow-lg shadow-pink-100" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateFilters({ category: cat })}
                        className={`block w-full text-left px-4 py-2.5 rounded-xl font-bold italic transition-all ${
                          categoryFilter === cat ? "bg-pink-500 text-white shadow-lg shadow-pink-100" : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 italic">Sort By</h3>
                  <select
                    className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold italic focus:border-pink-500 outline-none appearance-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 italic">Price Range</h3>
                  <div className="space-y-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="10000" 
                      step="100"
                      value={maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex items-center justify-between font-black italic text-gray-700">
                      <span>₹0</span>
                      <span>Up to ₹{maxPrice.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSearchParams({})}
                  className="w-full py-4 text-xs font-black text-red-500 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Product Area */}
        <div className="flex-grow">
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                   <div key={i} className="aspect-[3/4] bg-gray-100 rounded-3xl animate-pulse" />
                ))}
             </div>
          ) : products.length === 0 ? (
            <div className="text-center py-40 flex flex-col items-center gap-6">
              <div className="p-8 bg-gray-50 rounded-full">
                <Search size={48} className="text-gray-300" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 italic">No products found</h2>
              <p className="text-gray-500 italic font-medium max-w-sm">Try adjusting your search terms or filters to find what you're looking for.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold italic hover:bg-pink-600 shadow-lg shadow-pink-100"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between italic">
                <p className="text-gray-500 font-medium">Showing <span className="text-gray-900 font-bold">{products.length}</span> of {totalCount} products</p>
              </div>
              <ProductGrid products={products} loading={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
