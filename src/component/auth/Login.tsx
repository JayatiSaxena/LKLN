import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/useAuth";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import logo from "../../assets/svgs/Logo.svg";

const Login: React.FC = () => {
  const { login, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname: string } } | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(state?.from?.pathname || "/account/info", { replace: true });
    }
  }, [user, navigate, state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password, 'user');
      navigate(state?.from?.pathname || "/account/info", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20 pb-10 overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] p-10 sm:p-12 w-full max-w-lg relative z-10 shadow-2xl shadow-pink-100/50">
        <div className="flex flex-col items-center mb-10">
           <img src={logo} alt="LKLN" className="h-24 w-auto mb-6" />
           <h1 className="text-4xl font-black text-center tracking-tighter uppercase text-slate-900">Sign In <span className="text-pink-500 text-5xl">.</span></h1>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">LKLN luxury experience</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 rounded-2xl italic">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-4">Secret Password</label>
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
            {loading ? "Authenticating..." : "Enter LKLN Workspace"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-10 text-slate-100">
          <div className="h-px bg-slate-100 flex-1" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">or continue with</span>
          <div className="h-px bg-slate-100 flex-1" />
        </div>

        <div className="space-y-3">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse: CredentialResponse) => {
                try {
                  setError(null);
                  const cred = credentialResponse.credential;
                  if (!cred) throw new Error("No credential received from Google");
                  await googleLogin(cred);
                  navigate(state?.from?.pathname || "/account/info", { replace: true });
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Google sign-in failed");
                }
              }}
              onError={() => setError("Google sign-in failed")}
              useOneTap
              theme="filled_black"
              shape="pill"
              size="large"
            />
          </div>
          <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl py-4 font-medium text-slate-600 transition-colors">
            <span className="inline-flex items-center gap-2 justify-center">
              <span>Continue with GitHub</span>
            </span>
          </button>
          <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl py-4 font-medium text-slate-600 transition-colors">
            <span className="inline-flex items-center gap-2 justify-center">
              <span>Continue with Apple</span>
            </span>
          </button>
        </div>

        <p className="text-sm text-slate-400 mt-10 text-center font-medium italic">
          New to the pride?{" "}
          <Link to="/signup" className="text-pink-500 font-black hover:text-pink-600 transition-colors underline-offset-4 hover:underline">Create Account</Link>
        </p>
        <p className="text-xs text-slate-300 mt-4 text-center font-medium">
          Store admin? <Link to="/admin/login" className="text-slate-500 font-bold hover:text-pink-500">Admin Portal</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
