import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Trash2, 
  Star,
  User,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  product_id: string;
  user_id: string;
  question: string;
  answer: string | null;
  created_at: string;
  is_public: boolean;
  products: { name: string };
  profiles: { full_name: string; email: string };
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  products: { name: string };
  profiles: { full_name: string; email: string };
}

const AdminCommunity: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [view, setView] = useState<'questions' | 'reviews'>('questions');
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'questions') {
        const { data, error } = await supabase
          .from("product_questions")
          .select(`
            *,
            products:product_id (name),
            profiles:user_id (full_name, email)
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setQuestions(data || []);
      } else {
        const { data, error } = await supabase
          .from("reviews")
          .select(`
            *,
            products:product_id (name),
            profiles:user_id (full_name, email)
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setReviews(data || []);
      }
    } catch (error: any) {
      console.error("Fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    try {
      const { error } = await supabase
        .from("product_questions")
        .update({ 
          answer: answerText,
          answered_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) throw error;
      
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Answer posted successfully!", type: "success" } 
      }));
      setAnswerText("");
      setSelectedQuestion(null);
      fetchData();
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: error.message, type: "error" } 
      }));
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Community Header */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setView('questions')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              view === 'questions' ? 'bg-[#FF69B4] text-white shadow-lg shadow-pink-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Questions ({questions.filter(q => !q.answer).length} New)
          </button>
          <button
            onClick={() => setView('reviews')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              view === 'reviews' ? 'bg-[#FF69B4] text-white shadow-lg shadow-pink-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-50 rounded-[2.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {view === 'questions' ? (
              questions.map((q) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#FF69B4]">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black italic text-slate-900">{q.profiles.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {q.answer ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Answered</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">Pending</span>
                    )}
                  </div>

                  <p className="text-[10px] font-black text-[#FF69B4] uppercase tracking-widest mb-2 italic">Product: {q.products.name}</p>
                  <h4 className="text-lg font-black text-slate-900 italic mb-6 leading-tight">"{q.question}"</h4>

                  {q.answer ? (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative">
                       <span className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400">Stylist Response</span>
                       <p className="text-sm text-slate-600 italic font-medium">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <textarea 
                         placeholder="Write your response..."
                         value={selectedQuestion?.id === q.id ? answerText : ""}
                         onChange={(e) => {
                            setSelectedQuestion(q);
                            setAnswerText(e.target.value);
                         }}
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-pink-50 transition-all font-medium italic outline-none text-sm"
                       />
                       <button 
                         onClick={() => handleAnswer(q.id)}
                         disabled={!answerText.trim() || selectedQuestion?.id !== q.id}
                         className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black italic text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                       >
                         Post Answer <Send size={14} />
                       </button>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              reviews.map((r) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group"
                >
                   <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black italic text-slate-900">{r.profiles.full_name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                           {[1, 2, 3, 4, 5].map(star => (
                             <Star key={star} size={10} fill={star <= r.rating ? "#f59e0b" : "none"} className={star <= r.rating ? "text-amber-500" : "text-slate-200"} />
                           ))}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p className="text-[10px] font-black text-[#FF69B4] uppercase tracking-widest mb-2 italic">Product: {r.products.name}</p>
                  <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"{r.comment}"</p>
                  <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminCommunity;
