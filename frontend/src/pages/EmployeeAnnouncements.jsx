import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Megaphone, Search, Calendar, 
  Download, AlertTriangle, 
  Info, Paperclip, X, Clock, ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnn, setSelectedAnn] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/announcements/employee/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(res.data);
      setLoading(false);

      // Show popup for the latest urgent unread announcement
      const urgent = res.data.find(a => a.priority === 'Urgent' && !a.is_read);
      if (urgent) setSelectedAnn(urgent);
      
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/announcements/employee/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_read: 1 } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityConfig = (p) => {
    switch (p) {
      case 'Urgent': return { color: 'rose', icon: AlertTriangle };
      case 'Important': return { color: 'amber', icon: Info };
      default: return { color: 'blue', icon: Info };
    }
  };

  const unreadCount = announcements.filter(a => !a.is_read).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Megaphone className="text-indigo-600" size={32} /> Notice Board
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Official updates and company announcements</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search notices..."
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{unreadCount} UNREAD</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center font-black text-slate-300 uppercase animate-pulse tracking-tighter">Connecting to Hub...</div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <Megaphone size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No notifications found</p>
          </div>
        ) : (
          filtered.map((ann) => {
            const config = getPriorityConfig(ann.priority);
            const Icon = config.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={ann.id}
                onClick={() => { setSelectedAnn(ann); if(!ann.is_read) markAsRead(ann.id); }}
                className={`p-6 rounded-[32px] border transition-all cursor-pointer group flex gap-6 relative ${
                  ann.is_read ? 'bg-white border-slate-100 hover:border-indigo-200' : 'bg-indigo-50/40 border-indigo-100 shadow-xl shadow-indigo-100/20'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  ann.is_read ? `bg-${config.color}-50 text-${config.color}-600` : `bg-white text-${config.color}-600 shadow-sm`
                }`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-lg font-black ${ann.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{ann.title}</h4>
                      {!ann.is_read && <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> {new Date(ann.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed line-clamp-1 ${ann.is_read ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                    {ann.message}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest text-${config.color}-600`}>{ann.priority} Priority</span>
                    {ann.attachment && <Paperclip size={12} className="text-slate-400" />}
                  </div>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                  <ExternalLink size={20} className="text-indigo-400" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Announcement Detail / Urgent Popup */}
      <AnimatePresence>
        {selectedAnn && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden relative"
            >
              <div className={`p-10 ${selectedAnn.priority === 'Urgent' ? 'bg-rose-600' : 'bg-indigo-600'} text-white`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md`}>
                    <Megaphone size={32} />
                  </div>
                  <button onClick={() => setSelectedAnn(null)} className="p-2 hover:bg-white/10 rounded-xl transition">
                    <X size={24} />
                  </button>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                  {selectedAnn.priority} Priority Notice
                </span>
                <h3 className="text-3xl font-black mt-4">{selectedAnn.title}</h3>
                <div className="flex items-center gap-4 mt-6 text-sm font-bold text-white/70">
                  <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(selectedAnn.publish_date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><Clock size={16} /> Published</div>
                </div>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="text-slate-600 leading-loose text-lg font-medium whitespace-pre-wrap">
                  {selectedAnn.message}
                </div>

                {selectedAnn.attachment && (
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                        <Paperclip size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Attached Document</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Material</p>
                      </div>
                    </div>
                    <a 
                      href={`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}${selectedAnn.attachment}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                      <Download size={16} /> Download
                    </a>
                  </div>
                )}

                <button 
                  onClick={() => setSelectedAnn(null)}
                  className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition"
                >
                  Close Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
