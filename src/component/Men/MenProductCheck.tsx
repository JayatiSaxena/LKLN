import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { productService, type Product } from "../../lib/api/services/products";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../lib/auth/useAuth";
import { Skeleton } from "../common/Skeleton";
import { ProductGrid } from "../common/ProductGrid";
import { motion, AnimatePresence } from "framer-motion";

const MenProductCheck: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem: addToCart } = useCartStore();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlistStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [selectedReviewImages, setSelectedReviewImages] = useState<File[]>([]);
  const [uploadingReview, setUploadingReview] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const isWished = isInWishlist(id || "");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productService.getProductById(Number(id));
        setProduct(data);
        setActiveImage(data.image_url || (data.images && data.images[0]) || "");
        
        // Fetch similar products
        const res = await productService.getProducts({ category: data.category, limit: 5 });
        setSimilarProducts(res.products.filter(p => p.id !== data.id).slice(0, 4));

        // Fetch Reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*, profiles(full_name, avatar_url)")
          .eq("product_id", id)
          .order("created_at", { ascending: false });
        setReviews(reviewsData || []);

        // Fetch Questions
        const { data: qsData } = await supabase
          .from("product_questions")
          .select("*, profiles!user_id(full_name, avatar_url)")
          .eq("product_id", id)
          .eq("is_public", true)
          .order("created_at", { ascending: false });
        setQuestions(qsData || []);

      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setUploadingReview(true);
    try {
      let imageUrls: string[] = [];

      if (selectedReviewImages.length > 0) {
        for (const file of selectedReviewImages) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('reviews').upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('reviews').getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      const { error } = await supabase
        .from("reviews")
        .insert({
          product_id: id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment,
          images: imageUrls,
          is_verified_purchase: true
        });

      if (error) throw error;
      window.dispatchEvent(new CustomEvent("toast:show", { detail: { message: "Review submitted!", type: "success" } }));
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: "" });
      setSelectedReviewImages([]);
      const { data: reviewsData } = await supabase.from("reviews").select("*, profiles(full_name, avatar_url)").eq("product_id", id).order("created_at", { ascending: false });
      setReviews(reviewsData || []);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { detail: { message: error.message, type: "error" } }));
    } finally {
      setUploadingReview(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newQuestion.trim()) return;
    setSubmittingQuestion(true);
    try {
      const { error } = await supabase
        .from("product_questions")
        .insert({ product_id: id, user_id: user.id, question: newQuestion.trim() });
      if (error) throw error;
      window.dispatchEvent(new CustomEvent("toast:show", { detail: { message: "Question sent!", type: "success" } }));
      setNewQuestion("");
      setIsAsking(false);
      const { data: qsData } = await supabase.from("product_questions").select("*, profiles!user_id(full_name, avatar_url)").eq("product_id", id).eq("is_public", true).order("created_at", { ascending: false });
      setQuestions(qsData || []);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { detail: { message: error.message, type: "error" } }));
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !user) {
      if (!user) navigate("/login");
      return;
    }
    if (!selectedSize) {
      window.dispatchEvent(new CustomEvent("toast:show", { detail: { message: "Please select a size", type: "error" } }));
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(user.id, { product_id: product.id, quantity: 1, size: selectedSize, color: selectedColor });
      window.dispatchEvent(new CustomEvent("toast:show", { detail: { message: "Added to cart!", type: "success" } }));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product || !user) {
      if (!user) navigate("/login");
      return;
    }
    setTogglingWishlist(true);
    try {
      await toggleWishlist(user.id, product.id);
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto space-y-12">
        <Skeleton className="h-96 w-full rounded-[3rem]" />
      </div>
    );
  }

  if (!product) return null;

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Red", value: "#FF0000" }
  ];

  return (
    <div className="pt-24 px-4 md:px-16 pb-20 max-w-7xl mx-auto flex flex-col gap-20">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        <div className="lg:w-1/2 space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="sticky top-28 space-y-6">
             <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-pink-500 mb-2 transition-colors italic uppercase tracking-widest"><ArrowLeft size={16} /> Back</button>
             <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img key={activeImage} src={activeImage} alt={product.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                </AnimatePresence>
                <button onClick={handleToggleWishlist} disabled={togglingWishlist} className={`absolute top-6 right-6 p-4 rounded-full shadow-xl backdrop-blur-md transition-all duration-300 ${isWished ? "bg-red-500 text-white" : "bg-white/90 text-gray-400 hover:text-red-500 hover:scale-110"}`}><Heart size={24} fill={isWished ? "currentColor" : "none"} /></button>
             </div>
             {galleryImages.length > 1 && (
               <div className="flex flex-wrap gap-4 px-2">
                  {galleryImages.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImage(img)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-pink-500 scale-105 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}><img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" /></button>
                  ))}
               </div>
             )}
          </motion.div>
        </div>

        <div className="lg:w-1/2 flex flex-col">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-xs font-black uppercase tracking-widest">{product.category}</span>
              <h1 className="text-5xl font-black text-gray-900 italic leading-[1.1] tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg">
                  <Star size={18} fill="#f59e0b" className="text-amber-500" />
                  <span className="font-black text-amber-700 italic">{product.rating}</span>
                </div>
                <span className="text-sm font-bold text-gray-400 italic">({product.reviews_count} Verified Reviews)</span>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900 italic flex items-baseline gap-2">
              <span className="text-sm text-gray-400 font-bold">₹</span>
              {product.price.toLocaleString("en-IN")}
            </div>
            <p className="text-lg text-gray-500 italic font-medium max-w-xl">{product.description}</p>
            <div className="grid sm:grid-cols-2 gap-8 py-8 border-y-2 border-gray-50">
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-xl font-bold transition-all border-2 ${selectedSize === size? "bg-gray-900 border-gray-900 text-white shadow-xl scale-105" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}>{size}</button>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Platelette</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                        <button key={color.name} onClick={() => setSelectedColor(color.name)} className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color.name ? "border-pink-500 scale-110 shadow-lg" : "border-transparent"}`} style={{ backgroundColor: color.value }} />
                    ))}
                  </div>
               </div>
            </div>
            <button onClick={handleAddToCart} disabled={addingToCart} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black italic text-lg py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-pink-100 disabled:bg-pink-300">
                {addingToCart ? "Adding..." : <><ShoppingCart size={24} /> Add to Cart</>}
            </button>
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-50">
               <div className="flex flex-col items-center gap-2 text-center p-4 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl group transition-all">
                  <ShieldCheck size={24} className="text-pink-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Secure</p>
               </div>
               <div className="flex flex-col items-center gap-2 text-center p-4 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl group transition-all">
                  <Truck size={24} className="text-pink-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Fast</p>
               </div>
               <div className="flex flex-col items-center gap-2 text-center p-4 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl group transition-all">
                  <RefreshCw size={24} className="text-pink-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Easy</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reviews */}
      <section className="space-y-12">
        <div className="flex items-center justify-between border-b-2 border-gray-50 pb-8">
           <h2 className="text-4xl font-black italic tracking-tighter uppercase">Customer Reviews</h2>
           {!showReviewForm && <button onClick={() => user ? setShowReviewForm(true) : navigate("/login")} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Write Review</button>}
        </div>
        <AnimatePresence>
          {showReviewForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-2xl">
              <form onSubmit={handleSubmitReview} className="space-y-8">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setNewReview({ ...newReview, rating: star })} className={`p-2 transition-all ${newReview.rating >= star ? "text-amber-400" : "text-slate-200"}`}><Star size={32} fill={newReview.rating >= star ? "currentColor" : "none"} /></button>
                  ))}
                </div>
                <textarea required placeholder="Your thoughts..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} className="w-full h-40 bg-slate-50 border-none rounded-3xl p-6 font-medium italic outline-none" />
                <div className="flex gap-4">
                  <button type="submit" disabled={uploadingReview} className="bg-pink-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">{uploadingReview ? "Posting..." : "Post Review"}</button>
                  <button type="button" onClick={() => setShowReviewForm(false)} className="px-10 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid md:grid-cols-2 gap-8">
          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-slate-200 overflow-hidden"><img src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`} alt="User" /></div>
                     <div><p className="font-black italic text-slate-900">{review.profiles?.full_name || "Style Icon"}</p></div>
                  </div>
                  <div className="flex text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />)}</div>
               </div>
               <p className="text-slate-600 italic font-medium leading-relaxed">"{review.comment}"</p>
            </div>
          )) : <div className="md:col-span-2 py-20 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">No reviews yet.</div>}
        </div>
      </section>

      {/* Q&A */}
      <section className="space-y-12">
        <div className="flex items-center justify-between border-t border-slate-100 pt-16">
           <h2 className="text-4xl font-black italic tracking-tighter uppercase">Product Q&A</h2>
           {!isAsking && <button onClick={() => user ? setIsAsking(true) : navigate("/login")} className="bg-white border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Ask Question</button>}
        </div>
        <AnimatePresence>
          {isAsking && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-white">
              <form onSubmit={handleAskQuestion} className="space-y-8">
                <input required placeholder="Your question..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} className="w-full bg-white/10 rounded-2xl p-6 text-white outline-none" />
                <div className="flex gap-4">
                  <button type="submit" disabled={submittingQuestion} className="bg-[#FF69B4] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">{submittingQuestion ? "Sending..." : "Submit"}</button>
                  <button type="button" onClick={() => setIsAsking(false)} className="px-10 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
               <p className="text-lg font-black italic">"{q.question}"</p>
               {q.answer && <p className="mt-4 p-4 bg-pink-50 rounded-2xl text-slate-700 italic border border-pink-100">LKLN Style Expert: {q.answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-12">
          <h2 className="text-4xl font-black italic tracking-tighter">SIMILAR STYLES</h2>
          <ProductGrid products={similarProducts} loading={false} />
      </section>
    </div>
  );
};

export default MenProductCheck;
