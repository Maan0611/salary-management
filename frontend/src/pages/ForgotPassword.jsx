import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ArrowLeft, ArrowRight, Mail, Lock, 
  Sparkles, AlertCircle, KeyRound, Layout, CheckCircle, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Timers
  const [timer, setTimer] = useState(300); // 5 minutes code expiry
  const [resendCooldown, setResendCooldown] = useState(0);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://salary-management-64wa.onrender.com/api";

  // 5-minute expiry timer
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && step === 2) {
      setError("Verification code expired. Please request a new one.");
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // 60-second resend cooldown timer
  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Please enter your email address.");
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { email });
      setMessage(res.data.message || "A secure verification code has been dispatched.");
      setTimer(300); // reset 5-minute timer
      setResendCooldown(60); // start 60s cooldown
      
      // Move to step 2 after a brief delay
      setTimeout(() => {
        setStep(2);
        setMessage("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch verification code. Please check SMTP settings.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate OTP Code local presentation 
  const handleVerifyOtpLocal = (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      return setError("Please enter the complete 6-digit verification code.");
    }
    if (timer === 0) {
      return setError("Verification code expired. Please resend a new code.");
    }
    
    setError("");
    setStep(3);
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError("");
    setMessage("");
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { email });
      setMessage(res.data.message || "A new code has been successfully dispatched!");
      setTimer(300); // reset 5-minute timer
      setResendCooldown(60); // restart 60s cooldown
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP & Reset Password in one final secure backend payload
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return setError("New password must be at least 6 characters long.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match. Please verify.");
    }
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
        newPassword
      });
      
      setMessage(res.data.message || "Your password has been successfully updated!");
      
      // Redirect to Login page after 2.5 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please request a new OTP code.");
    } finally {
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
        
        {/* Left Side: Branding (Synchronized with Login.jsx) */}
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
                Recover your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Account Access</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium mt-8 max-w-lg leading-relaxed">
                Seamless self-service recovery engineered with bank-grade security to safely reset your operational credentials.
              </p>
            </div>
          </div>
          
          {/* Abstract Grid Decor */}
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Right Side: Step-driven glassmorphic recovery card */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-[#0a0f1d]">
          <div className="w-full max-w-md">
            
            {/* Header info */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 border border-indigo-500/20">
                <Sparkles size={12} /> Password Recovery System
              </div>
              <h3 className="text-4xl font-black text-white tracking-tight">
                {step === 1 && "Reset Password"}
                {step === 2 && "Verification Code"}
                {step === 3 && "Secure Credentials"}
              </h3>
              <p className="text-slate-500 font-medium mt-3">
                {step === 1 && "Provide your email to generate a secure passcode"}
                {step === 2 && `Enter the 6-digit code dispatched to ${email}`}
                {step === 3 && "Set your new encrypted portal login password"}
              </p>
            </div>

            {/* Custom Toast alerts */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 text-sm font-bold"
                >
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-400 text-sm font-bold"
                >
                  <CheckCircle size={20} className="shrink-0" />
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Enter Email */}
                {step === 1 && (
                  <motion.form 
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleRequestOtp} 
                    className="space-y-6"
                  >
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
                          disabled={loading}
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
                          Request Verification Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* STEP 2: Enter OTP Code */}
                {step === 2 && (
                  <motion.form 
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleVerifyOtpLocal} 
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Passcode</label>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">
                          <Clock size={12} />
                          <span>{formatTime(timer)}</span>
                        </div>
                      </div>

                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                          type="text" 
                          maxLength="6"
                          placeholder="6-Digit OTP"
                          className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-center text-xl font-bold tracking-[0.4em] placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all outline-none"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || timer === 0}
                      className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Verify Passcode <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || loading}
                        className="text-xs text-indigo-400 font-bold uppercase tracking-wider hover:text-indigo-300 disabled:text-slate-600 transition-colors"
                      >
                        {resendCooldown > 0 
                          ? `Resend Code in ${resendCooldown}s` 
                          : "Resend Passcode"}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* STEP 3: Enter New Password */}
                {step === 3 && (
                  <motion.form 
                    key="step3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleResetPassword} 
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Portal Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm font-bold focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all outline-none"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm font-bold focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all outline-none"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
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
                          Reset System Password <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

              </AnimatePresence>
            </div>

            {/* Back to Login Action */}
            <div className="text-center mt-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
              >
                <ArrowLeft size={14} /> Back to secure login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
