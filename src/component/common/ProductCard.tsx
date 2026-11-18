import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { type Product } from "../../lib/api/services/products";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import { useAuth } from "../../lib/auth/useAuth";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await toggleWishlist(user.id, product.id);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await addToCart(user.id, { product_id: product.id, quantity: 1 });
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Added to cart!", type: "success" } 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full border-2 border-transparent hover:border-yellow-200 overflow-hidden relative"
    >
      <Link to={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          src={product.image_url || (product.images && product.images[0])}
          alt={product.name}
          className={`w-full h-full object-cover transform transition-all duration-1000 ease-out ${
            product.images && product.images.length > 1 ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-110'
          }`}
        />
        
        {product.images && product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate`}
            className="absolute inset-0 w-full h-full object-cover transform scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-1000 ease-out"
          />
        )}
        
        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={loading}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 transform active:scale-90 ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white/90 text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Labels */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {product.rating >= 4.5 && (
             <span className="bg-pink-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg border-2 border-white/50">
               Top Rated
             </span>
           )}
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow bg-white">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`} className="text-lg font-black text-slate-900 line-clamp-1 italic tracking-tight hover:text-pink-500 transition-colors">
            {product.name}
          </Link>
        </div>
        <p className="text-xs font-bold text-slate-400 mb-4 italic uppercase tracking-widest">
           {product.category}
        </p>
        
        <div className="mt-auto flex items-center justify-between border-t border-pink-50 pt-4">
          <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-300 italic uppercase">Price</span>
             <span className="text-2xl font-black text-slate-900 italic tracking-tighter">₹{product.price.toLocaleString("en-IN")}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-[#FF69B4] hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 active:scale-95 group/btn"
          >
            <ShoppingBag size={20} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
