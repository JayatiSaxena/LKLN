import React, { useState, useEffect, useRef } from "react";
import { productService, type Product } from "../../lib/api/services/products";
import { supabase } from "../../lib/supabase";
import { X, Check, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCompletion } from "../../lib/productChecklist";

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    image_url: product?.image_url || "",
    images: product?.images || [],
    stock_quantity: product?.stock_quantity || 0,
    is_new: product?.is_new || false,
    is_trending: product?.is_trending || false,
    sku: product?.sku || "",
    brand: product?.brand || "LKLN",
    gender: product?.gender || "unisex",
    sizes: (product?.sizes || []).join(", "),
    colors: (product?.colors || []).join(", "),
    material: product?.material || "",
    fit: product?.fit || "",
    care_instructions: product?.care_instructions || "",
    original_price: product?.original_price || 0,
    tags: (product?.tags || []).join(", "),
  });

  const toList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const completion = getCompletion({
    ...formData,
    sizes: toList(formData.sizes),
    colors: toList(formData.colors),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const newImages = [...formData.images];
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        newImages.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: newImages,
        image_url: prev.image_url || newImages[0] // Set first image as main if none exists
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please ensure you have created the 'products' bucket with public access in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image_url: prev.image_url === prev.images[index] ? (newImages[0] || "") : prev.image_url
      };
    });
  };

  const setMainImage = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validation: Must have at least one image
      if (formData.images.length === 0 && !formData.image_url) {
        alert("Please upload at least one image.");
        return;
      }

      const submissionData = {
        ...formData,
        sku: formData.sku.trim() || null,
        sizes: toList(formData.sizes),
        colors: toList(formData.colors),
        tags: toList(formData.tags),
        original_price: formData.original_price > 0 ? formData.original_price : null,
        // Ensure image_url is pointing to a valid image if not explicitly set
        image_url: formData.image_url || formData.images[0]
      };

      if (product) {
        await productService.updateProduct(product.id, submissionData);
      } else {
        await productService.createProduct(submissionData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) : value
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-white px-10 py-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {product ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Configure your product with high-quality media across categories.
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
             <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-10">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Product Images (Multi-upload)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {formData.images.map((url, index) => (
                    <motion.div 
                      key={url}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`relative aspect-square rounded-3xl overflow-hidden border-2 transition-all ${
                        formData.image_url === url ? 'border-[#FF69B4] shadow-lg shadow-pink-100' : 'border-slate-100'
                      }`}
                    >
                      <img src={url} alt="Product" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setMainImage(url)}
                          className="p-2 bg-white rounded-xl text-[#FF69B4] hover:bg-[#FF69B4] hover:text-white transition-all shadow-lg"
                          title="Set as main image"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-white rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                          title="Remove image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {formData.image_url === url && (
                        <div className="absolute top-2 left-2 bg-[#FF69B4] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                          Main
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-purple-600 hover:text-purple-600 transition-all bg-slate-50 relative overflow-hidden group"
                >
                  {uploading ? (
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-[#FF69B4] rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Product Name</label>
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Premium Silk Shirt"
                    className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                  <select 
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900 appearance-none"
                  >
                    <option value="">Select Category</option>
                    {fetchingCategories ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Price (₹)</label>
                    <input 
                      required
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Stock</label>
                    <input 
                      required
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-8 py-4 px-2">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      formData.is_new ? 'bg-[#FF69B4] border-[#FF69B4]' : 'border-slate-200'
                    }`}>
                      {formData.is_new && <Check size={14} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      name="is_new"
                      checked={formData.is_new}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      formData.is_trending ? 'bg-[#FF69B4] border-[#FF69B4]' : 'border-slate-200'
                    }`}>
                      {formData.is_trending && <Check size={14} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      name="is_trending"
                      checked={formData.is_trending}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Trending Item</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">SKU</label>
                <input name="sku" type="text" value={formData.sku as string | number} onChange={handleChange} placeholder="LKLN-XX-016" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Brand</label>
                <input name="brand" type="text" value={formData.brand as string | number} onChange={handleChange} placeholder="LKLN" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900">
                  <option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Sizes (comma separated)</label>
                <input name="sizes" type="text" value={formData.sizes as string | number} onChange={handleChange} placeholder="XS, S, M, L" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Colours (comma separated)</label>
                <input name="colors" type="text" value={formData.colors as string | number} onChange={handleChange} placeholder="Black, White" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">MRP / Original price</label>
                <input name="original_price" type="number" value={formData.original_price as string | number} onChange={handleChange} placeholder="0" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Material</label>
                <input name="material" type="text" value={formData.material as string | number} onChange={handleChange} placeholder="100% cotton" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Fit</label>
                <input name="fit" type="text" value={formData.fit as string | number} onChange={handleChange} placeholder="Regular" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tags (comma separated)</label>
                <input name="tags" type="text" value={formData.tags as string | number} onChange={handleChange} placeholder="tee, basic" className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Care Instructions</label>
              <input name="care_instructions" value={formData.care_instructions} onChange={handleChange} placeholder="Machine wash cold..." className="w-full px-6 py-4 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
              <textarea 
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell customers about this item..."
                className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-none focus:ring-2 focus:ring-[#FF69B4] transition-all font-bold text-slate-900 leading-relaxed"
              />
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Completion Checklist</h4>
                <span className="text-sm font-black text-slate-900">{completion.done}/{completion.total} · {completion.percent}%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden mb-4">
                <div className={`h-full ${completion.percent === 100 ? "bg-emerald-500" : "bg-[#FF69B4]"}`} style={{ width: `${completion.percent}%` }} />
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {completion.items.map((i) => (
                  <li key={i.key} className={`text-xs font-bold flex items-center gap-2 ${i.done ? "text-emerald-600" : "text-slate-400"}`}>
                    {i.done ? <Check size={14} /> : <X size={14} />} {i.label}
                  </li>
                ))}
              </ul>
            </div>
          </form>
        </div>

        <div className="bg-slate-50 px-10 py-8 shrink-0 flex items-center gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-8 py-5 rounded-[1.5rem] font-black text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="product-form"
            disabled={loading || uploading}
            className="flex-[2] bg-slate-900 text-white px-12 py-5 rounded-[1.5rem] font-black text-sm hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Check size={18} />
                {product ? "Update Product" : "Launch Product"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminProductForm;
