import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Calendar as CalendarIcon, Clock, 
  UserMinus, Filter, ChevronLeft, ChevronRight,
  Activity
} from "lucide-react";

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employee-portal/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const stats = {
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length,
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">My Attendance</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Monitor your daily presence and punctuality</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition"><ChevronLeft size={20} /></button>
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest px-2">April 2026</span>
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 relative overflow-hidden">
          <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-1">Total Present</p>
          <h2 className="text-3xl font-black text-emerald-700">{stats.present} Days</h2>
          <Activity className="absolute right-4 bottom-4 text-emerald-200 opacity-50" size={48} />
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 relative overflow-hidden">
          <p className="text-rose-600 font-black text-[10px] uppercase tracking-widest mb-1">Total Absents</p>
          <h2 className="text-3xl font-black text-rose-700">{stats.absent} Days</h2>
          <UserMinus className="absolute right-4 bottom-4 text-rose-200 opacity-50" size={48} />
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 relative overflow-hidden">
          <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest mb-1">Late Arrivals</p>
          <h2 className="text-3xl font-black text-amber-700">{stats.late} Days</h2>
          <Clock className="absolute right-4 bottom-4 text-amber-200 opacity-50" size={48} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Daily Logs</h3>
          <button className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition">
            <Filter size={16} /> Filter Records
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendance.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <CalendarIcon size={18} />
                      </div>
                      <span className="text-sm font-black text-slate-800">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{log.check_in ? new Date(`1970-01-01T${log.check_in}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{log.check_out ? new Date(`1970-01-01T${log.check_out}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}</td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        log.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                        log.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Automatic log</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
