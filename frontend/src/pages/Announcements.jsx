import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Megaphone, Plus, Search, Filter, 
  MoreVertical, Edit2, Trash2, Calendar, 
  Users, Paperclip, Send, X, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "Normal",
    target_type: "All Employees",
    target_id: "",
    publish_date: new Date().toISOString().split('T')[0],
    expiry_date: "",
  });
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [attachment, setAttachment] = useState(null);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [annRes, deptRes] = await Promise.all([
        axios.get("https://salary-management-64wa.onrender.com/api/announcements/admin/all", { headers }),
        axios.get("https://salary-management-64wa.onrender.com/api/dashboard/departments", { headers })
      ]);
      setAnnouncements(annRes.data);
      setDepartments(deptRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeptToggle = (dept) => {
    setSelectedDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'target_id') data.append(key, formData[key]);
    });
    
    // Process target_id based on type
    let finalTargetId = formData.target_id;
    if (formData.target_type === 'Department Wise') {
      finalTargetId = selectedDepts.join(',');
    }
    data.append('target_id', finalTargetId);
    
    if (attachment) data.append("attachment", attachment);

    try {
      const token = sessionStorage.getItem("token");
      const url = editingId 
        ? `https://salary-management-64wa.onrender.com/api/announcements/${editingId}`
        : "https://salary-management-64wa.onrender.com/api/announcements/create";
      
      const method = editingId ? "put" : "post";
      
      await axios[method](url, data, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchData();
    } catch (err) {
      alert("Failed to save announcement");
    }
  };

  const handleEdit = (ann) => {
    setEditingId(ann.id);
    setFormData({
      title: ann.title,
      message: ann.message,
      priority: ann.priority,
      target_type: ann.target_type,
      target_id: ann.target_type === 'Specific Employee' ? ann.target_id : "",
      publish_date: ann.publish_date ? ann.publish_date.split('T')[0] : "",
      expiry_date: ann.expiry_date ? ann.expiry_date.split('T')[0] : "",
      status: ann.status
    });
    if (ann.target_type === 'Department Wise') {
      setSelectedDepts(ann.target_id ? ann.target_id.split(',') : []);
    } else {
      setSelectedDepts([]);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`https://salary-management-64wa.onrender.com/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Deletion failed");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      priority: "Normal",
      target_type: "All Employees",
      target_id: "",
      publish_date: new Date().toISOString().split('T')[0],
      expiry_date: "",
    });
    setSelectedDepts([]);
    setAttachment(null);
    setEditingId(null);
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Urgent': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Important': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Megaphone className="text-indigo-600" size={32} /> Announcement Hub
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Manage company-wide notices and updates</p>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Create Announcement
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="p-20 text-center font-black text-slate-300 uppercase animate-pulse">Synchronizing Data...</div>
          ) : announcements.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">No announcements published yet.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={ann.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${getPriorityColor(ann.priority)}`}>
                  <Megaphone size={28} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${getPriorityColor(ann.priority)}`}>
                      {ann.priority}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} /> {new Date(ann.publish_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">{ann.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{ann.message}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg">
                      <Users size={12} /> {ann.target_type} {ann.target_type !== 'All Employees' && `(${ann.target_id})`}
                    </div>
                    {ann.attachment && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-lg">
                        <Paperclip size={12} /> Attachment
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(ann)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ann.id)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8 bg-indigo-600 text-white flex justify-between items-center sticky top-0 z-10">
                  <div>
                    <h3 className="text-2xl font-black">{editingId ? "Edit Notice" : "New Announcement"}</h3>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Broadcast important information</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                    <input 
                      type="text" required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                    <textarea 
                      required rows="4"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option>Normal</option>
                      <option>Important</option>
                      <option>Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audience</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none"
                      value={formData.target_type}
                      onChange={(e) => setFormData({...formData, target_type: e.target.value})}
                    >
                      <option>All Employees</option>
                      <option>Department Wise</option>
                      <option>Specific Employee</option>
                    </select>
                  </div>

                  {formData.target_type === 'Department Wise' && (
                    <div className="col-span-2 space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Departments</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {departments.map(dept => (
                          <label key={dept} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:bg-indigo-50 transition">
                            <input 
                              type="checkbox"
                              checked={selectedDepts.includes(dept)}
                              onChange={() => handleDeptToggle(dept)}
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">{dept}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.target_type === 'Specific Employee' && (
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Employee ID</label>
                      <input 
                        type="text" required 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition"
                        value={formData.target_id}
                        onChange={(e) => setFormData({...formData, target_id: e.target.value})}
                        placeholder="e.g. EMP001"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Publish Date</label>
                    <input 
                      type="date" required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none"
                      value={formData.publish_date}
                      onChange={(e) => setFormData({...formData, publish_date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachment</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={(e) => setAttachment(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center group-hover:border-indigo-200 transition">
                        <Paperclip size={24} className="mx-auto text-slate-300 mb-2 group-hover:text-indigo-400" />
                        <p className="text-xs font-bold text-slate-400">
                          {attachment ? attachment.name : "Click to upload PDF or Image"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 pt-6 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      <Send size={18} /> {editingId ? "Update Notice" : "Publish Now"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
