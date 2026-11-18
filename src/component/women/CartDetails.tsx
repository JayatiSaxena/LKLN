import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useAuth } from "../../lib/auth/useAuth";
import { Skeleton } from "../common/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

const CartDetails: React.FC = () => {
  const { items, loading, fetchItems, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchItems(user.id);
    }
  }, [user, fetchItems]);

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const shipping = items.length > 0 ? 5 : 0;
  const total = subtotal + shipping;

  if (loading && items.length === 0) {
    return (
      <div className="pt-24 px-4 md:px-16 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-20 px-4 text-center flex flex-col items-center gap-6">
        <div className="p-6 bg-gray-50 rounded-full">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 italic">Your cart is empty</h2>
        <p className="text-gray-500 max-w-md">Looks like you haven't added anything to your cart yet. Explore our latest collections and find something you love!</p>
        <Link 
          to="/" 
          className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-16 pb-20 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-10 italic flex items-center gap-3">
        <span className="w-2 h-8 bg-pink-500 rounded"></span> Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/70 backdrop-blur-md border border-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-500"
              >
                <div className="w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-50 shrink-0">
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 italic line-clamp-1">{item.product?.name}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-gray-500 font-medium">
                        <span className="italic">Size: <span className="text-gray-900">{item.size || "N/A"}</span></span>
                        <span className="italic flex items-center gap-1.5">
                          Color: 
                          <span 
                            className="w-3 h-3 rounded-full border border-gray-200" 
                            style={{ backgroundColor: item.color || "#000" }}
                          ></span>
                        </span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-pink-500">${item.product?.price}</p>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-white hover:text-pink-500 rounded-md transition-all disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white hover:text-pink-500 rounded-md transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold mb-6 italic">Order Summary</h2>
          
          <div className="space-y-4 text-gray-600 mb-8 font-medium italic">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-gray-900 font-bold">${shipping.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xl text-gray-900 font-bold">Total</span>
              <span className="text-3xl font-black text-pink-500">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-pink-100 mb-4"
          >
            Proceed to Checkout
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white border-2 border-gray-100 text-gray-500 hover:text-gray-700 hover:border-gray-200 font-bold py-4 rounded-2xl transition-all"
          >
            Continue Shopping
          </button>

          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                <p className="text-xs text-green-700 font-bold">Secure Checkout</p>
             </div>
             <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                <p className="text-xs text-blue-700 font-bold">Easy Returns</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;
