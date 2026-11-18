import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/useAuth";
import { ADMIN_EMAIL } from "../../lib/auth/constants";
import logo from "../../assets/svgs/Logo.svg";

const Signup: React.FC = () => {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate("/account/info", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      setError("This email is reserved for the Admin Portal.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await signup(name.trim(), email.trim(), password);
      if (res.needsConfirmation) {
        setNotice("Account created! Check your email to confirm it, then sign in.");
      } else {
        navigate("/account/info", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20 pb-10 overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] -ml-64 -mt-64" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px] -mr-64 -mb-64" />

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] p-10 sm:p-12 w-full max-w-lg relative z-10 shadow-2xl shadow-pink-100/50">
        <div className="flex flex-col items-center mb-10">
           <img src={logo} alt="LKLN" className="h-24 w-auto mb-6" />
           <h1 className="text-4xl font-black text-center tracking-tighter uppercase text-slate-900">Join LKLN <span className="text-pink-500 text-5xl">.</span></h1>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Start your luxury journey</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 rounded-2xl italic">{error}</div>}
        
        {notice && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 rounded-2xl italic">{notice}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-4">Full Name</label>
             <input
               className="w-full bg-slate-50 border border-slate-100 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl px-6 py-4 placeholder-slate-300 outline-none transition-all font-medium italic"
               placeholder="Lionel LKLN"
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               required
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-4">Email Address</label>
             <input
               className="w-full bg-slate-50 border border-slate-100 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl px-6 py-4 placeholder-slate-300 outline-none transition-all font-medium italic"
               placeholder="name@example.com"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-4">Complex Password</label>
             <input
               className="w-full bg-slate-50 border border-slate-100 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl px-6 py-4 placeholder-slate-300 outline-none transition-all font-medium italic"
               placeholder="••••••••"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 rounded-2xl py-5 font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(255,182,193,0.3)] active:scale-95"
          >
            {loading ? "Creating Profile..." : "Create LKLN Account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-10 text-slate-100">
          <div className="h-px bg-slate-100 flex-1" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">or continue with</span>
          <div className="h-px bg-slate-100 flex-1" />
        </div>

        <div className="space-y-3">
          <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl py-4 font-medium text-slate-600 transition-colors">
            <span className="inline-flex items-center gap-2 justify-center">
              <span className="text-sm">Continue with Google</span>
            </span>
          </button>
          <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl py-4 font-medium text-slate-600 transition-colors">
            <span className="inline-flex items-center gap-2 justify-center">
              <span className="text-sm">Continue with Apple</span>
            </span>
          </button>
        </div>

        <p className="text-sm text-slate-400 mt-10 text-center font-medium italic">
          Already a member?{" "}
          <Link to="/login" className="text-pink-500 font-black hover:text-pink-600 transition-colors underline-offset-4 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
