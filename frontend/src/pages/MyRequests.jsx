import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, Calendar, Clock, CheckCircle2, 
  XCircle, Send, FileText, ChevronRight,
  MessageCircle, IndianRupee, Briefcase, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    request_type: "Leave Request",
    reason: "",
    from_date: "",
    to_date: "",
    amount: ""
  });

  const fetchRequests = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/requests/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/requests/create", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ request_type: "Leave Request", reason: "", from_date: "", to_date: "", amount: "" });
      fetchRequests();
    } catch (err) {
      alert("Submission failed");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  if (loading) return <div className="p-8 font-black text-slate-400 uppercase animate-pulse tracking-widest">Syncing Requests...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">My Requests</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Track and manage your internal applications</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Applications</p>
          <h2 className="text-3xl font-black text-slate-800">{requests.filter(r => r.status === 'Pending').length}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved This Month</p>
          <h2 className="text-3xl font-black text-emerald-600">{requests.filter(r => r.status === 'Approved').length}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rejected Requests</p>
          <h2 className="text-3xl font-black text-rose-600">{requests.filter(r => r.status === 'Rejected').length}</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details / Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Admin Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50 transition">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      <FileText size={18} />
                    </div>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{req.request_type}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <Calendar size={12} />
                      {new Date(req.from_date).toLocaleDateString()} {req.to_date && `→ ${new Date(req.to_date).toLocaleDateString()}`}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 italic">"{req.reason}"</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${getStatusStyle(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <p className="text-xs font-bold text-slate-500">{req.admin_remark || '---'}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10">
              <div className="p-8 bg-indigo-600 text-white">
                <h3 className="text-xl font-black tracking-tight">New Request</h3>
                <p className="text-indigo-100 text-xs font-bold mt-1 uppercase tracking-widest">Select request type and provide details</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Type</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition"
                    value={formData.request_type}
                    onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                  >
                    <option value="Leave Request">Leave Request</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Work From Home">Work From Home</option>
                    <option value="Salary Advance">Salary Advance</option>
                    <option value="Profile Update">Profile Update</option>
                  </select>
                </div>

                {formData.request_type === 'Salary Advance' && (
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Enter amount..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
                    <input type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition" value={formData.from_date} onChange={(e) => setFormData({...formData, from_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition" value={formData.to_date} onChange={(e) => setFormData({...formData, to_date: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Description</label>
                  <textarea required placeholder="Explain your request in detail..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition min-h-[100px]" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-slate-100 rounded-xl font-black text-slate-400 hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-2"><Send size={18} /> Submit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
