import React, { useState } from "react";
import axios from "axios";
import { 
  ShieldCheck, ArrowRight, Mail, Lock, 
  Sparkles, ChevronLeft, AlertCircle, CheckCircle2,
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api`;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { email });
      setStep(2);
      setMessage("OTP sent to your email address.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      setStep(3);
      setMessage("OTP verified. Please set your new password.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

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
              {step === 1 ? "Forgot Password?" : step === 2 ? "Verify OTP" : "New Password"}
            </h3>
            <p className="text-slate-500 font-medium mt-3">
              {step === 1 ? "Enter your email to receive a recovery code" : 
               step === 2 ? "We've sent a 6-digit code to your inbox" : 
               "Ensure your new password is secure and unique"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 text-sm font-bold"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-400 text-sm font-bold"
              >
                <CheckCircle2 size={20} />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={step === 1 ? handleSendOTP : step === 2 ? handleVerifyOTP : handleResetPassword} className="space-y-6">
            {step === 1 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm font-bold focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-xl font-black tracking-[0.5em] focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm font-bold focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {step === 1 ? "Request Recovery" : step === 2 ? "Verify Identity" : "Update Password"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
