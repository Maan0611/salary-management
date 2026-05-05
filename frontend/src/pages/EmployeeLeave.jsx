import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, Calendar, Clock, CheckCircle2, 
  XCircle, AlertCircle, Plus, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeLeave() {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    leave_type: "Casual Leave",
    from_date: "",
    to_date: "",
    reason: ""
  });

  const fetchLeaves = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("https://salary-management-64wa.onrender.com/api/employee-portal/leaves", {
        headers: { Authorization: `Bearer ${token}` } 
      });
      setLeaves(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.post("https://salary-management-64wa.onrender.com/api/employee-portal/leaves", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchLeaves();
      setFormData({ leave_type: "Casual Leave", from_date: "", to_date: "", reason: "" });
    } catch (err) {
      alert("Failed to submit leave request");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Leave Requests</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Manage and track your time off</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied On</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest">No leave requests found</td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-5 font-black text-slate-700 text-sm">{leave.request_type}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar size={14} className="text-indigo-500" />
                      {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">
                    {new Date(leave.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${getStatusStyle(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 text-right max-w-xs truncate italic">
                    "{leave.reason}"
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
            >
              <div className="p-8 bg-indigo-600 text-white">
                <h3 className="text-xl font-black">Apply for Leave</h3>
                <p className="text-indigo-100 text-xs font-bold mt-1 uppercase tracking-widest">Submit your request to HR</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                      value={formData.leave_type}
                      onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                    >
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Emergency Leave</option>
                      <option>Maternity/Paternity</option>
                    </select>
                  </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                        <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none transition focus:ring-2 focus:ring-indigo-100"
                          value={formData.from_date}
                          onChange={(e) => setFormData({...formData, from_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                        <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none transition focus:ring-2 focus:ring-indigo-100"
                          value={formData.to_date}
                          onChange={(e) => setFormData({...formData, to_date: e.target.value})}
                        />
                      </div>
                    </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
                    <textarea 
                      required
                      placeholder="Briefly explain your reason for leave..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none transition focus:ring-2 focus:ring-indigo-100 min-h-[100px]"
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-slate-100 rounded-xl font-black text-slate-400 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                  >
                    <Send size={18} /> Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
