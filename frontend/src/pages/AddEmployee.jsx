import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { 
  User, Mail, Building2, Briefcase, Calendar, 
  IndianRupee, ShieldCheck, Lock, PlaneTakeoff,
  ArrowRight, CheckCircle2, UserPlus, Info
} from "lucide-react";
import { motion } from "framer-motion";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emp_id: "", 
    name: "", 
    email: "", 
    department: "", 
    position: "", 
    basic_salary: "", 
    join_date: "", 
    leave_balance: 12, 
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Basic validation
    if (!formData.password) {
      setError("Portal password is required for account access.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employees`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Employee successfully integrated into the workforce!");
      setTimeout(() => navigate("/employees"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to finalize employee registration. Please verify all fields.");
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">
              <UserPlus size={12} /> Workforce Management
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Onboard New <span className="text-indigo-600">Employee</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Create a new professional profile and configure portal access.</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate("/employees")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            Back to Directory
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold shadow-sm">
              <Info size={18} /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold shadow-sm">
              <CheckCircle2 size={18} /> {success}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Main Info */}
            <div className="lg:col-span-8 space-y-8">
              {/* Identity Section */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20} /></div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Identity & Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employee Code</label>
                    <input type="text" name="emp_id" value={formData.emp_id} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="EMP-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="John Doe" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="john.doe@company.com" />
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={20} /></div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Placement Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                    <input type="text" name="department" value={formData.department} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="Engineering" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Position</label>
                    <input type="text" name="position" value={formData.position} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="Senior Developer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Salary (₹)</label>
                    <input type="number" name="basic_salary" value={formData.basic_salary} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="50000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Join Date</label>
                    <input type="date" name="join_date" value={formData.join_date} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Config & Actions */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Lock size={20} /></div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Portal Config</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Leave Credits</label>
                    <div className="relative">
                      <input type="number" step="0.5" name="leave_balance" value={formData.leave_balance} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="15" />
                      <PlaneTakeoff size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Password</label>
                    <div className="relative">
                      <input type="password" name="password" value={formData.password} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="••••••••" />
                      <ShieldCheck size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic px-1">Mandatory for employee portal access.</p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 space-y-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? "Processing..." : "Onboard Employee"}
                      {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => navigate("/employees")}
                      className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                    >
                      Cancel Entry
                    </button>
                  </div>
                </div>
              </div>

              {/* Tip Card */}
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 text-indigo-200">Pro Tip</h4>
                  <p className="text-sm font-bold leading-relaxed opacity-90">Ensure the employee email is unique. This will be used for all corporate communications and portal login identification.</p>
                </div>
                <Info size={100} className="absolute -right-8 -bottom-8 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
