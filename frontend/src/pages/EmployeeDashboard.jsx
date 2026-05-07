import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  Clock, ArrowRight, Bell,
  CheckCircle2, Sparkles, Zap, ChevronRight,
  Info, Activity, CreditCard
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer,
  Cell, PieChart, Pie
} from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import LiveClock from "../components/LiveClock";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    presentDays: 0,
    absentDays: 0,
    salaryStatus: 'Pending',
    currentNetSalary: 0,
    pendingLeaves: 0,
    joinDate: '',
    leaveBalance: 0,
    name: ''
  });
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employee-portal/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        setLoading(false);
        const attRes = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employee-portal/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = attRes.data.find(log => {
          const logDate = new Date(log.date).toISOString().split('T')[0];
          return logDate === todayStr;
        });
        
        if (todayLog) {
          setCheckedIn(true);
          setCheckedOut(!!todayLog.check_out);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCheckIn = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/attendance/check-in`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheckedIn(true);
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/attendance/check-out`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheckedOut(true);
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };


  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/10 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Portal Experience...</p>
    </div>
  );

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 17) return "Good Afternoon";
      return "Good Evening";
    };

    return (
      <div className="space-y-10 pb-12">
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 p-6 md:p-10 text-white shadow-2xl shadow-indigo-200">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest mb-4">
                <Sparkles size={12} className="text-yellow-300" /> Professional Dashboard
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">{stats.name.split(' ')[0]}</span>!
              </h2>
              <p className="text-indigo-100 text-base md:text-lg font-medium opacity-90 max-w-md leading-relaxed">
                You're currently <span className="font-bold underline decoration-indigo-400 underline-offset-4">aligned</span> with your career goals. Check your metrics below.
              </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-8">
              {!checkedIn ? (
                <button 
                  onClick={handleCheckIn}
                  className="group relative bg-white text-indigo-700 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <Zap size={18} className="text-indigo-500 group-hover:animate-pulse" />
                  Clock In Session
                </button>
              ) : !checkedOut ? (
                <button 
                  onClick={handleCheckOut}
                  className="group relative bg-rose-500 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl hover:bg-rose-600 hover:scale-105 active:scale-95 flex items-center gap-3 border border-rose-400/30"
                >
                  <Clock size={18} className="text-white group-hover:animate-spin" />
                  Clock Out Session
                </button>
              ) : (
                <div className="bg-emerald-500/20 backdrop-blur-md text-white px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-3 border border-emerald-500/30">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                  Currently Synced
                </div>
              )}
              <Link to="/employee/profile" className="px-6 py-3 md:py-3.5 bg-white/10 backdrop-blur-md rounded-2xl text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                View Profile
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <LiveClock 
              className="flex flex-col items-start lg:items-end gap-3 text-left lg:text-right"
              containerClass="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-3xl border border-white/10" 
            />
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
      </div>

      {/* Bento Grid Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Main Earnings & Trend (2x1) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card rounded-[2.5rem] p-6 md:p-8 bg-white relative overflow-hidden flex flex-col justify-between h-[320px] shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Financial Performance</p>
              <h3 className="text-3xl font-black text-slate-800">Total Earnings</h3>
            </div>
          </div>
          
          <div className="flex-1 mt-4 relative z-10">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={[
                {name: 'Mon', value: 400}, {name: 'Tue', value: 300}, {name: 'Wed', value: 600}, 
                {name: 'Thu', value: 800}, {name: 'Fri', value: stats.currentNetSalary}
              ]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="text-5xl font-black text-slate-900 tracking-tighter">
              ₹<CountUp end={stats.totalEarnings || stats.currentNetSalary} duration={2} separator="," />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              Latest Payout: {stats.salaryStatus === 'Paid' ? 'Processed' : 'Pending'}
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Attendance Activity (1x1) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[2.5rem] p-8 bg-white relative overflow-hidden flex flex-col justify-between h-[320px] shadow-sm border border-slate-100"
        >
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Reliability Score</p>
            <h3 className="text-xl font-black text-slate-800">Attendance</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
             <div className="text-center">
                <div className="text-6xl font-black text-indigo-600 tracking-tighter">
                  {Math.min(100, Math.round((stats.presentDays / (new Date().getDate())) * 100))}%
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Monthly Compliance</p>
             </div>
             <div className="absolute inset-0 opacity-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{value: stats.presentDays}, {value: 30 - stats.presentDays}]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#4F46E5" />
                      <Cell fill="#F1F5F9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
            <Activity size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Stable Performance</span>
          </div>
        </motion.div>

        {/* Quick Meta Stats (1x1) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6"
        >
          <div className="h-[148px] glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white relative overflow-hidden group">
            <p className="text-purple-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Leave Credits</p>
            <div className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
              <CountUp end={stats.leaveBalance} duration={2} /> Days
            </div>
            <Link to="/employee/leave" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all">
              Request <ArrowRight size={10} />
            </Link>
            <Zap size={64} className="absolute -right-4 -bottom-4 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
          </div>

          <div className="h-[148px] glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 bg-white border border-slate-100 relative overflow-hidden group">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Security Status</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Verified</p>
                <p className="text-[10px] font-bold text-slate-400">Account Secure</p>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Actions Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Operational Hub</h3>
            <span className="p-2 bg-white shadow-sm border border-slate-100 rounded-xl"><Activity size={16} className="text-indigo-500" /></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <Link to="/employee/salary" className="group flex items-center justify-between p-6 glass-card rounded-[2rem] hover:bg-indigo-600 transition-all duration-500 overflow-hidden relative bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-500 shadow-inner">
                  <CreditCard size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 group-hover:text-white transition-colors uppercase tracking-tight">Payslip Archives</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-100 opacity-80 mt-1">Review Statement</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10" />
            </Link>

            <Link to="/employee/leave" className="group flex items-center justify-between p-6 glass-card rounded-[2rem] hover:bg-purple-600 transition-all duration-500 overflow-hidden relative bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-500 shadow-inner">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 group-hover:text-white transition-colors uppercase tracking-tight">Time Off</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-purple-100 opacity-80 mt-1">Submit Request</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10" />
            </Link>
          </div>
        </div>

        {/* Corporate Bulletins */}
        <div className="lg:col-span-8 glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-b border-slate-100 pb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                NOTICE BOARD <Bell size={24} className="text-indigo-600" />
              </h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Latest Corporate Updates</p>
            </div>
            <Link to="/employee/announcements" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stats.announcements && stats.announcements.length > 0 ? (
              stats.announcements.slice(0, 4).map((ann, i) => (
                <motion.div 
                  key={ann.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-8 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      ann.priority === 'Urgent' ? 'bg-rose-500 text-white' : 
                      ann.priority === 'Important' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {ann.priority}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100">{new Date(ann.publish_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">{ann.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {ann.message}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <Info size={40} className="text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-300 uppercase tracking-[0.2em]">All Caught Up</h4>
                <p className="text-slate-400 text-sm mt-3 font-medium italic opacity-60">No new notices to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
