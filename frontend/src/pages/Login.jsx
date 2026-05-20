import React, { useState } from "react";
import axios from "axios";
import { 
  ShieldCheck, ArrowRight, Mail, Lock, 
  Sparkles, Globe, ChevronRight, AlertCircle,
  Command, Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const API_URL = window.location.hostname === "localhost" 
        ? "http://localhost:5000/api" 
        : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api`;
        
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'admin') {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/employee/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication synchronization failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0f1d] overflow-hidden relative">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-600/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col md:flex-row h-full relative z-10">
        
        {/* Left Side: Branding & Visual */}
        <div className="hidden lg:flex flex-[1.2] flex-col justify-between p-16 relative overflow-hidden bg-white/[0.02] border-r border-white/5">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-2xl shadow-2xl shadow-indigo-500/20">
                <Layout size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Nexus </h1>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">Enterprise Management</p>
              </div>
            </div>
            
            <div className="mt-20">
              <h2 className="text-6xl font-black text-white leading-tight tracking-tight">
                Accelerate your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Digital Workforce</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium mt-8 max-w-lg leading-relaxed">
                The next-generation compensation and operations platform designed for high-performance organizations.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex items-center gap-6">
              </div>
          </div>
          
          {/* Abstract Grid Decor */}
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-[#0a0f1d]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 border border-indigo-500/20">
                <Sparkles size={12} /> Secure Access Portal
              </div>
              <h3 className="text-4xl font-black text-white tracking-tight">System Authentication</h3>
              <p className="text-slate-500 font-medium mt-3">Enter your credentials to synchronize with your profile</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 text-sm font-bold"
                >
                  <AlertCircle size={20} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm font-bold focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Password</label>
                  <Link to="/forgot-password" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm font-bold focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

            

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Sync <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
