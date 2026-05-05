import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { 
  CheckCircle2, XCircle, Clock, Search, 
  User, Calendar, 
  MessageSquare, FileText, ChevronRight, AlertCircle,
  Briefcase, CheckCircle, Info, ArrowRight,
  ChevronDown, RefreshCw, Plus, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");

  const fetchRequests = async () => {
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log out and log in again.");
        setLoading(false);
        return;
      }
      const res = await axios.get("https://salary-management-64wa.onrender.com/api/requests/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error("fetchRequests error:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 401) {
        setError(`Authentication failed (401): ${msg}. Please log out and log in again.`);
      } else if (status === 403) {
        setError(`Access denied (403): ${msg}. Admin role is required.`);
      } else if (status === 500) {
        setError(`Server error (500): ${msg}. Check the backend console for details.`);
      } else {
        setError(`Failed to load requests: ${msg}`);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const token = sessionStorage.getItem("token");
      const url = `https://salary-management-64wa.onrender.com/api/requests/admin/${id}/${action}`;
      await axios.put(url, { admin_remark: adminRemark }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedRequest(null);
      setAdminRemark("");
      fetchRequests();
    } catch (err) {
      alert("Action failed");
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = (req.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (req.employee_code || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const isLeaveCategory = ['Leave Request', 'Casual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity/Paternity'].includes(req.request_type);
    const matchesType = filterType === "All" || req.request_type === filterType || (filterType === "Leave Request" && isLeaveCategory);
    
    const matchesStatus = filterStatus === "All" || req.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle size={12} /> Approved
        </span>
      );
      case 'Rejected': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <XCircle size={12} /> Rejected
        </span>
      );
      default: return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Clock size={12} className="animate-pulse" /> Pending
        </span>
      );
    }
  };

  if (loading && requests.length === 0) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/10 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Submissions...</p>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-rose-500" />
          </div>
          <div className="text-center max-w-lg">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-3">Failed to Load Requests</h3>
            <p className="text-rose-600 font-bold text-sm bg-rose-50 border border-rose-100 rounded-2xl px-6 py-4">{error}</p>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-700 transition-all"
          >
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
              Request <span className="text-indigo-600">Approvals</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Info size={18} className="text-indigo-500" /> 
              Managing <span className="text-slate-900 font-bold">{requests.filter(r => r.status === 'Pending').length} pending</span> employee requests
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-white shadow-sm">
            <div className="flex items-center gap-3 px-4 border-r border-slate-100">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{requests.filter(r => r.status === 'Pending').length} Pending</span>
            </div>
            <div className="flex items-center gap-3 px-4">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{requests.filter(r => r.status === 'Approved').length} Handled</span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="glass-card p-6 rounded-2xl mb-8 flex flex-wrap lg:flex-nowrap gap-6 items-end">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Employee Search</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="ID, Name or Department..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[180px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Submission Type</label>
              <div className="relative group">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Leave Request">Leave Request</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Work From Home">Work From Home</option>
                  <option value="Salary Advance">Salary Advance</option>
                  <option value="Profile Update">Profile Update</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="min-w-[160px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Decision Status</label>
              <div className="relative group">
                <CheckCircle2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button 
              onClick={fetchRequests}
              className="p-3.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-indigo-100 rounded-xl transition-all shadow-sm active:rotate-180 duration-500"
            >
              <RefreshCw size={22} />
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submission</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Data</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req, i) => (
                  <motion.tr 
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-100">
                          {(req.employee_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800">{req.employee_name || 'Unknown Employee'}</p>
                          <p className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase">#{req.employee_code || 'N/A'} • {req.department || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{req.request_type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                          <Calendar size={14} className="text-indigo-400" />
                          {req.from_date ? new Date(req.from_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'} 
                          {req.to_date && ` — ${new Date(req.to_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
                        </div>
                        {req.amount && (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-100">
                            VAL: ₹{req.amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Inbox Zero</h3>
                <p className="text-slate-500 font-medium mt-1 italic">No pending requests match your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedRequest(null)}
                className="absolute right-8 top-8 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full transition-all z-20"
              >
                <Plus className="rotate-45" size={28} />
              </button>

              <div className="p-12 bg-slate-900 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 backdrop-blur-xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-2xl">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black">{selectedRequest.request_type}</h3>
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mt-1">Personnel Submission</p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-10 py-8 border-y border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Initiator</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black shadow-lg">
                        {(selectedRequest.employee_name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{selectedRequest.employee_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">ID: {selectedRequest.employee_code}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Effective Window</p>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-xs font-bold flex items-center gap-3">
                        <Calendar size={16} className="text-indigo-400" />
                        {selectedRequest.from_date 
                          ? new Date(selectedRequest.from_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                          : 'N/A'
                        } 
                        {selectedRequest.to_date && (
                          <>
                            <ArrowRight size={14} className="text-slate-500 mx-1" />
                            {new Date(selectedRequest.to_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
              </div>

              <div className="p-12 space-y-10">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-500" /> Submission Context
                  </h4>
                  <div className="p-8 bg-slate-50/80 rounded-[2rem] border border-slate-100 italic text-slate-600 text-base leading-relaxed relative">
                    <span className="absolute top-4 left-4 text-4xl text-indigo-100 font-serif">"</span>
                    <p className="relative z-10 px-4">{selectedRequest.reason || 'No specific justification provided by the employee.'}</p>
                    <span className="absolute bottom-2 right-4 text-4xl text-indigo-100 font-serif">"</span>
                  </div>
                </div>

                {selectedRequest.status === 'Pending' ? (
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Administrative Remarks</label>
                      <textarea 
                        placeholder="Add professional feedback or reason for the decision..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-6 text-sm font-bold outline-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all min-h-[120px] shadow-inner"
                        value={adminRemark}
                        onChange={(e) => setAdminRemark(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-6">
                      <button 
                        onClick={() => handleAction(selectedRequest.id, 'reject')}
                        className="flex-1 px-8 py-5 border-2 border-rose-100 text-rose-500 rounded-3xl font-black text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <XCircle size={22} /> Decline Request
                      </button>
                      <button 
                        onClick={() => handleAction(selectedRequest.id, 'approve')}
                        className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <CheckCircle2 size={22} /> Approve Submission
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl overflow-hidden relative">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Decision Repository</p>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {getStatusBadge(selectedRequest.status)}
                        {selectedRequest.admin_remark && (
                          <div className="flex-1 border-l border-white/10 pl-6 ml-2 italic text-slate-400 text-sm leading-relaxed">
                            &ldquo;{selectedRequest.admin_remark}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
