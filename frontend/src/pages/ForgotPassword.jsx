import React from "react";
import { 
  ChevronLeft, AlertCircle, KeyRound
} from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  return (
    <div className="flex h-screen w-full bg-[#0a0f1d] overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <a href="/" className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors">
              <ChevronLeft size={16} /> Back to Login
            </a>
          </div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 border border-indigo-500/20">
              <KeyRound size={12} /> Security Recovery
            </div>
            <h3 className="text-4xl font-black text-white tracking-tight">
              Password Reset
            </h3>
            
            <div className="mt-12 p-8 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-xl">
              <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Feature Unavailable</h4>
              <p className="text-slate-400 font-medium">
                The self-service password reset system is currently disabled. 
                Please contact the <span className="text-indigo-400">IT Department</span> or your 
                <span className="text-indigo-400"> HR Administrator</span> to reset your credentials.
              </p>
              
              <div className="mt-8 pt-8 border-t border-white/5">
                <a 
                  href="/"
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  Return to Login
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
