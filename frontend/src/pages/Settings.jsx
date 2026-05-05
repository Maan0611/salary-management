import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { 
  Shield, Key, Lock, Eye, EyeOff,
  Save, Palette, Database, Activity,
  CheckCircle2, AlertTriangle, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [showPass, setShowPass] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get("https://salary-management-64wa.onrender.com/api/dashboard/system-health", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHealth(res.data);
      } catch (err) {
        console.error("Failed to fetch system health", err);
      } finally {
        setHealthLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put("https://salary-management-64wa.onrender.com/api/auth/change-password", {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      alert("Admin password updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Password update failed");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Configure your Nexus HR environment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Security Overview</h4>
               <div className="flex items-center gap-4 text-indigo-600 mb-8">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                   <Shield size={24} />
                 </div>
                 <span className="font-black text-lg">Tier 1 Encryption</span>
               </div>
               <p className="text-xs text-slate-500 font-bold leading-relaxed">
                 You are logged in with Administrative privileges. All system changes are logged and audited for compliance.
               </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Database size={16} className="text-indigo-400" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">System Health</h4>
              </div>

              {healthLoading ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-bold">Scanning database...</span>
                </div>
              ) : health ? (
                <div className="space-y-5 relative z-10">
                  {/* Main Storage Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Storage Used</span>
                      <span className={`text-sm font-black ${
                        health.status === 'Healthy' ? 'text-emerald-400' :
                        health.status === 'Warning' ? 'text-amber-400' : 'text-rose-400'
                      }`}>{health.usedPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${health.usedPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          health.status === 'Healthy' ? 'bg-emerald-500' :
                          health.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>{health.usedMB} MB used</span>
                      <span>{health.capacityMB} MB capacity</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    health.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    health.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {health.status === 'Healthy' ? <CheckCircle2 size={12} /> :
                     health.status === 'Warning' ? <AlertTriangle size={12} /> :
                     <AlertCircle size={12} />}
                    {health.status}
                  </div>

                  {/* Per-table breakdown — real MB sizes */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Table Breakdown</p>
                    {health.tableStats.length > 0 ? health.tableStats.map((t) => (
                      <div key={t.label} className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500">{t.label}</span>
                        <span className="text-[10px] font-black text-slate-300">
                          {t.sizeMB < 0.001 ? '<0.001' : t.sizeMB} MB
                        </span>
                      </div>
                    )) : (
                      <p className="text-[10px] text-slate-600">No table data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-bold">Could not load health data.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-10">
            {/* Password Change */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Lock size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Security Credentials</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Reset your administrative password</p>
                </div>
              </div>
              
              <form onSubmit={handleChangePassword} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Root Password</label>
                  <div className="relative group">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      type={showPass ? "text" : "password"}
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-14 py-4 font-bold text-base outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                      placeholder="••••••••••••"
                      value={passData.oldPassword}
                      onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password"
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-base outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                      placeholder="Min. 8 chars"
                      value={passData.newPassword}
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Authorization</label>
                    <input 
                      type="password"
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-base outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                      placeholder="Match new password"
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-3"
                  >
                    {loading ? "Verifying..." : <><Save size={22} /> Update Security Profile</>}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
