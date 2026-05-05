import React, { useState } from "react";
import axios from "axios";
import { 
  Shield, Key, Lock, Bell, 
  Smartphone, Globe, Eye, EyeOff,
  Save, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function EmployeeSettings() {
  const [showPass, setShowPass] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employee-portal/change-password`, {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Password update failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Account Settings</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Manage your security and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Security Level</h4>
            <div className="flex items-center gap-3 text-emerald-600 mb-6">
              <Shield size={24} />
              <span className="font-bold">Enhanced</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
              Your account is protected by industry standard encryption and role-based access control.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Password Change */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Change Password</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Update your login credentials</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-12 py-4 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition"
                    value={passData.oldPassword}
                    onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  {loading ? "Updating..." : <><Save size={18} /> Save New Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
