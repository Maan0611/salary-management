import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { 
  User, Mail, Building2, Briefcase, Calendar, 
  IndianRupee, ShieldCheck, Lock, PlaneTakeoff,
  Save, X, Info, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emp_id: "", 
    name: "", 
    email: "", 
    department: "", 
    position: "", 
    basic_salary: "", 
    join_date: "", 
    leave_balance: 0, 
    password: "", 
    status: "Active"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        if(data.join_date) {
            data.join_date = new Date(data.join_date).toISOString().split('T')[0];
        }
        setFormData({ ...data, password: "" }); // Password reset only
        setLoading(false);
      } catch (err) {
        setError("Synchronization failed: Unable to retrieve record");
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/employees/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Employee record successfully synchronized!");
      setTimeout(() => navigate("/employees"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to commit record changes");
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Retrieving Profile...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">
              <Save size={12} /> Record Maintenance
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Edit <span className="text-indigo-600">Employee</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Update profile for <span className="text-slate-900 font-bold">{formData.name}</span>.</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate("/employees")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <X size={16} /> Discard Edits
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold shadow-sm">
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold shadow-sm">
              <CheckCircle2 size={18} /> {success}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20} /></div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Identity Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employee ID</label>
                    <input type="text" name="emp_id" value={formData.emp_id} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                    <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={20} /></div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Contractual Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                    <input type="text" name="department" value={formData.department} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Position</label>
                    <input type="text" name="position" value={formData.position} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Basic Salary</label>
                    <input type="number" name="basic_salary" value={formData.basic_salary} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Join Date</label>
                    <input type="date" name="join_date" value={formData.join_date} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Lock size={20} /></div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Security & Credits</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Leave Credits</label>
                    <div className="relative">
                      <input type="number" name="leave_balance" value={formData.leave_balance} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" />
                      <PlaneTakeoff size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Portal Password</label>
                    <div className="relative">
                      <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700" placeholder="••••••••" />
                      <ShieldCheck size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic px-1">Leave blank to keep current password.</p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 space-y-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? "Syncing..." : "Commit Changes"}
                      {!isSubmitting && <Save size={16} className="group-hover:scale-110 transition-transform" />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => navigate("/employees")}
                      className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                    >
                      Cancel Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
