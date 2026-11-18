import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Heart, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw, CheckCircle, Camera, Trash2 } from "lucide-react";
import { productService, type Product } from "../../lib/api/services/products";
import { colorHex } from "../../lib/colors";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../lib/auth/useAuth";
import { Skeleton } from "../common/Skeleton";
import { ProductGrid } from "../common/ProductGrid";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetail: React.FC = () => {
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

      // Upload images if any
      if (selectedReviewImages.length > 0) {
        for (const file of selectedReviewImages) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('reviews')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('reviews')
            .getPublicUrl(filePath);
          
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

      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Review submitted! Thank you.", type: "success" } 
      }));
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: "" });
      setSelectedReviewImages([]);
      
      // Refresh reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, profiles(full_name, avatar_url)")
        .eq("product_id", id)
        .order("created_at", { ascending: false });
      setReviews(reviewsData || []);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: error.message || "Failed to submit review", type: "error" } 
      }));
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
        .insert({
          product_id: id,
          user_id: user.id,
          question: newQuestion.trim()
        });

      if (error) throw error;

      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Question sent! We'll answer soon.", type: "success" } 
      }));
      setNewQuestion("");
      setIsAsking(false);

      // Refresh questions
      const { data: qsData } = await supabase
        .from("product_questions")
        .select("*, profiles!user_id(full_name, avatar_url)")
        .eq("product_id", id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      setQuestions(qsData || []);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: error.message || "Failed to send question", type: "error" } 
      }));
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
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Please select a size", type: "error" } 
      }));
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(user.id, { 
        product_id: product.id, 
        quantity: 1, 
        size: selectedSize, 
        color: selectedColor 
      });
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Added to cart!", type: "success" } 
      }));
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
        <div className="flex flex-col md:flex-row gap-12">
          <Skeleton className="md:w-1/2 aspect-[4/5] rounded-3xl" />
          <div className="md:w-1/2 space-y-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
               {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-12 h-12 rounded-xl" />)}
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-20 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl font-black text-gray-900 italic">Product not found</h2>
        <Link to="/" className="text-pink-500 font-bold hover:underline italic">Back to Home</Link>
      </div>
    );
  }

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL"];
  const colors = product.colors && product.colors.length > 0
    ? product.colors.map(name => ({ name, value: colorHex(name) }))
    : [
        { name: "Black", value: "#000000" },
        { name: "White", value: "#FFFFFF" },
        { name: "Red", value: "#FF0000" },
        { name: "Blue", value: "#0000FF" }
      ];
  const details: [string, string | null | undefined][] = [
    ["Brand", product.brand], ["SKU", product.sku], ["Material", product.material],
    ["Fit", product.fit], ["Care", product.care_instructions],
  ];

  // Combine images for gallery
  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url];

  return (
    <div className="pt-24 px-4 md:px-16 pb-20 max-w-7xl mx-auto flex flex-col gap-20">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left: Image Canvas */}
        <div className="lg:w-1/2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sticky top-28 space-y-6"
          >
             <button 
               onClick={() => navigate(-1)} 
               className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-pink-500 mb-2 transition-colors italic uppercase tracking-widest"
             >
                <ArrowLeft size={16} /> Back
             </button>
             
             <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImage}
                    src={activeImage} 
                    alt={product.name} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  />
                </AnimatePresence>
                <button
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  className={`absolute top-6 right-6 p-4 rounded-full shadow-xl backdrop-blur-md transition-all duration-300 ${
                    isWished 
                      ? "bg-red-500 text-white" 
                      : "bg-white/90 text-gray-400 hover:text-red-500 hover:scale-110"
                  }`}
                >
                  <Heart size={24} fill={isWished ? "currentColor" : "none"} />
                </button>
             </div>

             {/* Thumbnails */}
             {galleryImages.length > 1 && (
               <div className="flex flex-wrap gap-4 px-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImage === img ? 'border-pink-500 scale-105 shadow-lg' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
               </div>
             )}
          </motion.div>
        </div>

        {/* Right: Product Details */}
        <div className="lg:w-1/2 flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-xs font-black uppercase tracking-widest">
                {product.category}
              </span>
              <h1 className="text-5xl font-black text-gray-900 italic leading-[1.1] tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg">
                  <Star size={18} fill="#f59e0b" className="text-amber-500" />
                  <span className="font-black text-amber-700 italic">{product.rating}</span>
                </div>
                <span className="text-sm font-bold text-gray-400 italic">({product.reviews_count} Verified Customer Reviews)</span>
              </div>
            </div>

            <div className="text-4xl font-black text-gray-900 italic flex items-baseline gap-2">
              <span className="text-sm text-gray-400 font-bold">₹</span>
              {product.price.toLocaleString("en-IN")}
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-gray-400 font-bold line-through ml-2">₹{Number(product.original_price).toLocaleString("en-IN")}</span>
              )}
            </div>

            <p className="text-lg text-gray-500 leading-relaxed italic font-medium max-w-xl">
              {product.description}
            </p>

            {details.some(([, v]) => v) && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                {details.filter(([, v]) => v).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="font-black uppercase tracking-widest text-xs text-gray-400 italic pt-0.5">{k}</dt>
                    <dd className="font-medium text-gray-600 italic">{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}

            {/* Selection Grid */}
            <div className="grid sm:grid-cols-2 gap-8 py-8 border-y-2 border-gray-50">
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Select Fit Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 border-2 ${
                          selectedSize === size 
                            ? "bg-gray-900 border-gray-900 text-white shadow-xl scale-105" 
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Available Palette</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        className={`w-10 h-10 rounded-full border-4 transition-all duration-300 ${
                          selectedColor === color.name 
                            ? "border-pink-500 scale-110 shadow-lg" 
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white font-black italic text-lg py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-pink-100 disabled:bg-pink-300 active:scale-95"
              >
                {addingToCart ? "Adding..." : <><ShoppingCart size={24} /> Add to Cart</>}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-50">
               <div className="flex flex-col items-center gap-2 text-center p-4 rounded-3xl bg-gray-50/50 transition-colors hover:bg-white hover:shadow-xl group">
                  <ShieldCheck size={24} className="text-pink-600 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Secure Payment</p>
               </div>
               <div className="flex flex-col items-center gap-2 text-center p-4 rounded-3xl bg-gray-50/50 transition-colors hover:bg-white hover:shadow-xl group">
                  <Truck size={24} className="text-pink-600 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Fast Delivery</p>
               </div>
               <div className="flex flex-col items-center gap-2 text-center p-4 rounded-3xl bg-gray-50/50 transition-colors hover:bg-white hover:shadow-xl group">
                  <RefreshCw size={24} className="text-pink-600 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Easy Exchange</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Description & Specs */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-16 bg-gray-50/50 p-12 md:p-20 rounded-[3rem] border border-gray-100"
      >
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Product DNA</h2>
          <p className="text-lg text-gray-500 italic leading-relaxed font-medium">
            This {product.name} represents the pinnacle of premium craftsmanship. Every stitch is engineered for durability, while the {product.category} DNA ensures you stay at the forefront of contemporary fashion. 
          </p>
          <div className="flex gap-4">
             <div className="px-6 py-2 bg-white rounded-full border border-gray-200 text-xs font-black italic uppercase tracking-widest">Sustainability First</div>
             <div className="px-6 py-2 bg-white rounded-full border border-gray-200 text-xs font-black italic uppercase tracking-widest">Ethically Sourced</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
           {[
             { label: "Fabric", value: "Premium Cotton" },
             { label: "Fit", value: "Modern Tailored" },
             { label: "Origin", value: "Responsibly Made" },
             { label: "Care", value: "Machine Wash Cold" }
           ].map((spec, i) => (
             <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm transition-transform hover:-translate-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-1">{spec.label}</p>
                <p className="text-sm font-black text-gray-900 italic">{spec.value}</p>
             </div>
           ))}
        </div>
      </motion.section>

      {/* Reviews Section */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase">Customer Feedback</h2>
            <div className="flex items-center gap-4">
               <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.round(product.rating) ? "currentColor" : "none"} />
                  ))}
               </div>
               <span className="text-sm font-bold text-gray-500 italic">Based on {reviews.length} reviews</span>
            </div>
          </div>
          {!showReviewForm && (
            <button 
              onClick={() => user ? setShowReviewForm(true) : navigate("/login")}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl"
            >
              Write a Review
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <form onSubmit={handleSubmitReview} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Overall Rating</label>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`p-2 transition-all transform hover:scale-125 ${
                          newReview.rating >= star ? "text-amber-400" : "text-slate-200"
                        }`}
                      >
                        <Star size={32} fill={newReview.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Your Experience</label>
                  <textarea
                    required
                    placeholder="Tell others what you loved or how it fits..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full h-40 bg-slate-50 border-none rounded-3xl p-6 focus:ring-4 focus:ring-pink-50 transition-all font-medium italic outline-none text-slate-900"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic text-left block">Add Photos</label>
                  <div className="flex flex-wrap gap-4">
                    {selectedReviewImages.map((file, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-pink-100 group">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setSelectedReviewImages(selectedReviewImages.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    {selectedReviewImages.length < 5 && (
                      <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all text-slate-400 hover:text-pink-500">
                        <Camera size={24} />
                        <span className="text-[10px] font-black uppercase">Add</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files) {
                              const files = Array.from(e.target.files);
                              setSelectedReviewImages([...selectedReviewImages, ...files].slice(0, 5));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit"
                    disabled={uploadingReview}
                    className="bg-pink-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg disabled:bg-pink-300"
                  >
                    {uploadingReview ? "Uploading..." : "Post Review"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-8">
          {reviews.length > 0 ? reviews.map((review, i) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-slate-50/50 border border-slate-100 p-8 rounded-[2.5rem] relative"
            >
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200 overflow-hidden">
                       <img src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="font-black italic text-slate-900">{review.profiles?.full_name || "Style Icon"}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                 </div>
              </div>
              <p className="text-slate-600 italic font-medium leading-relaxed mb-6">"{review.comment}"</p>
              
              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {review.images.map((img: string, idx: number) => (
                    <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                      <img src={img} alt={`Review ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {review.is_verified_purchase && (
                <div className="flex items-center gap-2 text-emerald-600">
                   <CheckCircle size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Verified Purchase</span>
                </div>
              )}
            </motion.div>
          )) : (
            <div className="md:col-span-2 py-20 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold italic">Be the first to review this icon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Q&A Section */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-100 pt-16">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase">Product Q&A</h2>
            <p className="text-sm font-bold text-gray-500 italic">Have a doubt? Ask the community or our stylists.</p>
          </div>
          {!isAsking && (
            <button 
              onClick={() => user ? setIsAsking(true) : navigate("/login")}
              className="bg-white border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl"
            >
              Ask a Question
            </button>
          )}
        </div>

        <AnimatePresence>
          {isAsking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-white"
            >
              <form onSubmit={handleAskQuestion} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Your Question</label>
                  <input
                    required
                    placeholder="e.g. Does this run true to size?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full bg-white/10 border-none rounded-2xl p-6 focus:ring-4 focus:ring-purple-500/30 transition-all font-medium italic outline-none text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="submit"
                    disabled={submittingQuestion}
                    className="bg-[#FF69B4] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FF4081] transition-all"
                  >
                    {submittingQuestion ? "Sending..." : "Submit Question"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAsking(false)}
                    className="px-10 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {questions.length > 0 ? questions.map((q) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="group bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-xl transition-all"
            >
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 italic">Q</div>
                <div className="space-y-4 flex-grow">
                  <p className="text-lg font-black text-slate-900 italic">"{q.question}"</p>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{q.profiles?.full_name || "Guest"}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>

                  {q.answer ? (
                    <div className="mt-8 flex gap-6 bg-pink-50/50 p-6 rounded-3xl border border-pink-100">
                       <div className="flex-shrink-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center font-black text-white italic">A</div>
                       <div className="space-y-4 flex-grow">
                          <p className="text-slate-700 font-medium italic leading-relaxed">{q.answer}</p>
                          <div className="flex items-center gap-2 text-pink-500">
                             <ShieldCheck size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Answered by LKLN Expert</span>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-amber-500 bg-amber-50 w-fit px-4 py-1.5 rounded-full">
                       <RefreshCw size={12} className="animate-spin" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Expert Response</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold italic">No questions yet. Be the first to ask!</p>
            </div>
          )}
        </div>
      </section>

      {/* Recommended Products */}
      <AnimatePresence>
        {similarProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between">
               <h2 className="text-4xl font-black text-gray-900 italic tracking-tighter">RECOMMENDED FOR YOU</h2>
               <div className="h-0.5 flex-grow mx-8 bg-gray-50 hidden md:block" />
            </div>
            <ProductGrid products={similarProducts} loading={false} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
