import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/useAuth";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

const AdminLogin: React.FC = () => {
  const { login, logout, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password, "admin");
      navigate(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in as admin");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-[#FF69B4] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-20 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF69B4]/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#FF69B4]/20 rounded-2xl flex items-center justify-center mb-4 border border-[#FF69B4]/30">
              <ShieldCheck className="w-8 h-8 text-[#FF69B4]" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin <span className="text-[#FF69B4]">Portal</span></h1>
            <p className="text-slate-400 mt-2 text-center text-sm">Secure access for LKLN administrators</p>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-sm text-amber-200">
              You are signed in as a customer ({user.email}).{" "}
              <button type="button" onClick={() => logout()} className="underline font-bold">Sign out</button> to use the Admin Portal.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF69B4]" /> Email Address
              </label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required
                placeholder="admin@lkln.com"
                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FF69B4]" /> Password
              </label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]/50 transition-all"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#FF69B4] hover:bg-[#FF4081] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl shadow-pink-900/20"
            >
              {loading ? "Verifying Credentials..." : (<>Enter Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>)}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
            <p className="text-slate-400 text-sm">New admin? <Link to="/admin/signup" className="text-[#FF69B4] font-bold">Register</Link></p>
            <p className="text-slate-500 text-xs">Shopping instead? <Link to="/login" className="underline">Customer sign in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
