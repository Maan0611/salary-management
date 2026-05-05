import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/employee-portal/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/employee-portal/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'danger': return <XCircle className="text-rose-500" size={20} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  if (loading) return <div className="p-8 font-black text-slate-400 uppercase animate-pulse">Loading Notifications...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Notifications</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Stay updated with company news and requests</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
          <Bell size={18} className="text-indigo-600" />
          <span className="text-xs font-black text-slate-600">{notifications.filter(n => !n.is_read).length} UNREAD</span>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Bell size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={notif.id}
              className={`p-6 rounded-2xl border transition-all relative flex gap-6 ${
                notif.is_read ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-100 shadow-lg shadow-indigo-50/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                notif.is_read ? 'bg-slate-50' : 'bg-white shadow-sm'
              }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className={`text-base font-black ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{notif.message}</p>
                {!notif.is_read && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    className="mt-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
              {!notif.is_read && (
                <div className="absolute top-6 right-6 w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
