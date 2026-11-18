import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/useAuth";
import { ADMIN_EMAIL } from "../../lib/auth/constants";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, User, AlertCircle, CheckCircle2 } from "lucide-react";

const field = "w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]/50 transition-all";

const AdminSignup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError("Admin registration is restricted to authorized administrator emails.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for an admin password.");
      return;
    }
    setLoading(true);
    try {
      // The admin role is granted by the database (allowlist trigger), never by the client.
      const res = await signup(name.trim(), email.trim(), password);
      if (res.needsConfirmation) {
        setNotice("Admin account created. Confirm your email, then sign in to the Admin Portal.");
      } else if (res.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        setError("Account created, but it was not granted admin access.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-20 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FF69B4]/20 blur-[120px] rounded-full"></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#FF69B4]/20 rounded-2xl flex items-center justify-center mb-4 border border-[#FF69B4]/30">
              <ShieldCheck className="w-8 h-8 text-[#FF69B4]" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin <span className="text-[#FF69B4]">Registration</span></h1>
            <p className="text-slate-400 mt-2 text-center text-sm">Only authorized LKLN administrator emails are granted access</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
          {notice && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200">{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2"><User className="w-4 h-4 text-[#FF69B4]" /> Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Admin name" className={field} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF69B4]" /> Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder={ADMIN_EMAIL} className={field} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2"><Lock className="w-4 h-4 text-[#FF69B4]" /> Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Min. 8 characters" className={field} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#FF69B4] hover:bg-[#FF4081] text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 mt-4 shadow-xl shadow-pink-900/20">
              {loading ? "Creating account..." : "Create Admin Account"}
            </button>
          </form>

          <p className="mt-8 pt-6 border-t border-white/5 text-center text-slate-400 text-sm">
            Already registered? <Link to="/admin/login" className="text-[#FF69B4] font-bold">Admin sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSignup;
