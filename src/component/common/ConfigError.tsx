import React from "react";
import { AlertCircle, Key, Link2 } from "lucide-react";

export const ConfigError: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 text-center space-y-6 border border-gray-100">
        <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto text-[#FF69B4] animate-bounce">
          <AlertCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 italic tracking-tight uppercase">
          Configuration Required
        </h1>
        
        <p className="text-gray-500 font-medium italic leading-relaxed">
          The Supabase credentials are missing from your environment. Please add them to your <code className="bg-gray-100 px-2 py-1 rounded text-[#FF69B4]">.env</code> file to continue.
        </p>

        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
            <Link2 className="text-[#FF69B4] shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Variable 1</p>
              <p className="text-sm font-bold text-gray-900 italic">VITE_SUPABASE_URL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
            <Key className="text-[#FF69B4] shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Variable 2</p>
              <p className="text-sm font-bold text-gray-900 italic">VITE_SUPABASE_ANON_KEY</p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-[#FF69B4] text-white font-black italic rounded-full shadow-xl shadow-pink-100 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};
