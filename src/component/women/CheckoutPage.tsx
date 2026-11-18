import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";
import { useAuth } from "../../lib/auth/useAuth";
import { supabase } from "../../lib/supabase";
import { CreditCard, Truck, MapPin, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "card"
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const shipping = items.length > 0 ? 5 : 0;
  const total = subtotal + shipping - discount;

  useEffect(() => {
    if (items.length === 0 && !success) {
      navigate("/cart");
    }
  }, [items, navigate, success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Create the order with enhanced fields
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          status: "pending",
          shipping_address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          phone: formData.phone,
          payment_method: formData.paymentMethod,
          coupon_id: appliedCoupon?.id,
          discount_amount: discount
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.product?.price || 0,
        size: item.size,
        color: item.color
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear cart
      await clearCart(user.id);
      
      setSuccess(true);
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Order placed successfully!", type: "success" } 
      }));
    } catch (error) {
      console.error("Order failed:", error);
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Failed to place order. Please try again.", type: "error" } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .single();

      if (error || !coupon) {
        throw new Error("Invalid coupon code");
      }

      if (subtotal < coupon.min_purchase_amount) {
        throw new Error(`Minimum purchase of ₹${coupon.min_purchase_amount} required`);
      }

      let calculatedDiscount = 0;
      if (coupon.discount_type === "percentage") {
        calculatedDiscount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount) {
          calculatedDiscount = Math.min(calculatedDiscount, coupon.max_discount_amount);
        }
      } else {
        calculatedDiscount = coupon.discount_value;
      }

      setDiscount(calculatedDiscount);
      setAppliedCoupon(coupon);
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: `Coupon applied! You saved ₹${calculatedDiscount}`, type: "success" } 
      }));
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: error.message || "Failed to apply coupon", type: "error" } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Geolocation is not supported by your browser", type: "error" } 
      }));
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use OpenStreetMap Reverse Geocoding (Free and no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          const address = data.address;
          
          setFormData(prev => ({
            ...prev,
            address: data.display_name || "",
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            zipCode: address.postcode || ""
          }));
          
          window.dispatchEvent(new CustomEvent("toast:show", { 
            detail: { message: "Location fetched successfully!", type: "success" } 
          }));
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
        window.dispatchEvent(new CustomEvent("toast:show", { 
          detail: { message: "Failed to get location. Please enter manually.", type: "error" } 
        }));
      }
    );
  };

  if (success) {
    return (
      <div className="pt-40 pb-20 px-4 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle size={48} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 italic">Thank You for Your Order!</h1>
        <p className="text-gray-500 mb-8 max-w-md italic font-medium">
          Your order has been placed successfully. We'll send you an email confirmation with your order details and tracking information soon.
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-pink-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100"
        >
          View My Orders
        </button>
      </div>
    );
  }

  const inputStyle = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all outline-none italic font-medium";
  const labelStyle = "block text-sm font-bold text-gray-700 mb-2 italic";

  return (
    <div className="pt-24 px-4 md:px-16 pb-20 max-w-7xl mx-auto min-h-screen bg-[#FFF5F7]">
      <h1 className="text-3xl font-bold mb-10 italic flex items-center gap-3">
        <span className="w-2 h-8 bg-pink-500 rounded"></span> Checkout
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-10">
          {/* Shipping Details */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold italic flex items-center gap-2">
                <MapPin size={20} className="text-pink-500" /> Shipping Details
              </h2>
              <button
                type="button"
                onClick={handleUseLocation}
                className="text-xs font-black text-pink-500 hover:text-pink-700 uppercase tracking-widest italic flex items-center gap-2"
              >
                Use Current Location →
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>First Name</label>
                <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Last Name</label>
                <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Full Address</label>
                <input required name="address" value={formData.address} onChange={handleInputChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>City</label>
                <input required name="city" value={formData.city} onChange={handleInputChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>State / Province</label>
                <input required name="state" value={formData.state} onChange={handleInputChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>ZIP / Postal Code</label>
                <input required name="zipCode" value={formData.zipCode} onChange={handleInputChange} className={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputStyle} />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 italic flex items-center gap-2">
              <CreditCard size={20} className="text-pink-500" /> Payment Method
            </h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                formData.paymentMethod === 'card' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'
              }`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={formData.paymentMethod === 'card'} 
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-pink-500" 
                />
                <div className="flex-grow">
                  <p className="font-bold text-gray-900 italic">Credit / Debit Card (Simulated)</p>
                  <p className="text-sm text-gray-500 italic">Pay securely with your card</p>
                </div>
              </label>

              <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                formData.paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'
              }`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={formData.paymentMethod === 'cod'} 
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-pink-500" 
                />
                <div className="flex-grow">
                  <p className="font-bold text-gray-900 italic">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-500 italic">Pay when you receive your order</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl lg:sticky lg:top-24 border border-white">
            <h2 className="text-2xl font-bold mb-8 italic text-slate-900">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 italic font-medium">
                    {item.product?.name} <span className="text-slate-900 ml-2 font-black">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900">₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-pink-50 pt-6 italic font-medium text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className="font-bold text-slate-900">₹{shipping.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-emerald-600 font-bold">
                  <span className="italic">Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Coupon Input */}
              <div className="pt-4 mt-2">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow bg-white border border-pink-100 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-pink-500 transition-all text-slate-900 placeholder:text-slate-400"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl italic">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       Coupon "{appliedCoupon.code}" Applied
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setAppliedCoupon(null);
                        setDiscount(0);
                        setCouponCode("");
                      }}
                      className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-pink-50 flex justify-between items-center">
                <span className="text-xl font-bold text-slate-900">Total</span>
                <span className="text-3xl font-black text-pink-500">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 text-white font-bold py-5 rounded-2xl transition-all mt-10 shadow-lg shadow-pink-100 relative group overflow-hidden"
            >
              <span className="relative z-10">{loading ? "Processing Order..." : "Confirm & Pay Now"}</span>
              <div className="absolute inset-0 bg-yellow-400 translate-x-full group-hover:translate-x-0 transition-transform duration-500 -z-0 opacity-20"></div>
            </button>

            <div className="mt-8 flex items-center justify-center gap-4 opacity-70">
               <Truck size={20} className="text-pink-500" />
               <p className="text-xs font-bold italic text-slate-500">Standard Delivery (3-5 Business Days)</p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
