import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../apiConfig";
import Layout from "../components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  Users, UserCheck, UserMinus, Building2, IndianRupee, Clock,
  Search, Filter, Download, FileSpreadsheet, Bell, Sun, Moon,
  ChevronRight, ArrowUpRight, Activity, MoreVertical, Calendar,
  Briefcase, CheckCircle2, AlertCircle, ClipboardList,
  Check, X as CloseIcon, RefreshCw, Zap, ShieldCheck
} from "lucide-react";
import { ArrowRight } from "lucide-react";
import CountUp from 'react-countup';
import { motion } from "framer-motion";
import LiveClock from "../components/LiveClock";

const StatCard = ({ title, value, icon: Icon, color }) => {
  const getColors = (c) => {
    switch(c) {
      case 'indigo': return { bg: '#d5cdfbff', text: '#4F46E5' };
      case 'emerald': return { bg: '#c0fadcff', text: '#10B981' };
      case 'rose': return { bg: '#FEE2E2', text: '#EF4444' };
      case 'purple': return { bg: '#EDE9FE', text: '#7C3AED' };
      case 'amber': return { bg: '#FEF3C7', text: '#F59E0B' };
      case 'orange': return { bg: '#FEF3C7', text: '#F59E0B' };
      default: return { bg: '#F3F4F6', text: '#111827' };
    }
  };
  const theme = getColors(color);
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-2xl p-5 flex flex-col items-start gap-3 relative overflow-hidden group shadow-sm border border-slate-100"
    >
      <div className="p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: theme.bg, color: theme.text }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-slate-400 text-[9px] font-black tracking-[0.2em] uppercase">{title}</p>
        <h3 className="text-2xl font-black mt-1 text-slate-900">
          <CountUp end={value} duration={1.5} separator="," prefix={title.includes("Salary") || title.includes("Budget") || title.includes("Expense") ? "₹" : ""} />
        </h3>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalDepartments: 0,
    monthlySalaryExpense: 0,
    pendingSalaries: 0,
    pendingRequests: 0,
    onLeaveToday: 0,
    employeesOnLeave: [],
    monthlySalaryTrend: [],
    departmentWise: [],
    announcements: [],
    requestStatus: [
      { name: 'Approved', value: 0, color: '#10b981' },
      { name: 'Pending', value: 0, color: '#f59e0b' },
      { name: 'Rejected', value: 0, color: '#ef4444' }
    ]
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, empRes, reqRes] = await Promise.all([
          axios.get(`${API_URL}/api/dashboard/stats`, { headers }),
          axios.get(`${API_URL}/api/employees`, { headers }),
          axios.get(`${API_URL}/api/requests/admin/all`, { headers })
        ]);

        const allReqs = reqRes.data || [];
        const pendingReqs = allReqs.filter(r => r.status === 'Pending');
        const approvedReqs = allReqs.filter(r => r.status === 'Approved');
        const rejectedReqs = allReqs.filter(r => r.status === 'Rejected');

        setStats({
          ...statsRes.data,
          pendingRequests: pendingReqs.length,
          requestStatus: [
            { name: 'Approved', value: approvedReqs.length, color: '#10b981' },
            { name: 'Pending', value: pendingReqs.length, color: '#f59e0b' },
            { name: 'Rejected', value: rejectedReqs.length, color: '#ef4444' }
          ]
        });
        setRecentRequests(pendingReqs.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const attendancePieData = useMemo(() => [
    { name: 'Present', value: stats.presentToday || 0, color: '#10b981' },
    { name: 'Absent', value: stats.absentToday || 0, color: '#ef4444' },
    { name: 'On Leave', value: stats.onLeaveToday || 0, color: '#f59e0b' }
  ], [stats.presentToday, stats.absentToday, stats.onLeaveToday]);

  const handleRequestAction = async (id, action) => {
    try {
      const token = sessionStorage.getItem("token");
      const url = `${API_URL}/api/requests/admin/${id}/${action.toLowerCase()}`;
      await axios.put(url, { admin_remark: "Approved via dashboard" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh data
      const statsRes = await axios.get(`${API_URL}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const reqRes = await axios.get(`${API_URL}/api/requests/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      
      const allReqs = reqRes.data || [];
      const pendingReqs = allReqs.filter(r => r.status === 'Pending');
      const approvedReqs = allReqs.filter(r => r.status === 'Approved');
      const rejectedReqs = allReqs.filter(r => r.status === 'Rejected');

      setStats({
        ...statsRes.data,
        pendingRequests: pendingReqs.length,
        requestStatus: [
          { name: 'Approved', value: approvedReqs.length, color: '#10b981' },
          { name: 'Pending', value: pendingReqs.length, color: '#f59e0b' },
          { name: 'Rejected', value: rejectedReqs.length, color: '#ef4444' }
        ]
      });
      setRecentRequests(pendingReqs.slice(0, 5));
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <RefreshCw size={48} className="text-primary animate-spin mb-4" />
          <p className="text-text-muted font-black uppercase tracking-widest text-xs animate-pulse">Initializing Administrative Intelligence...</p>
        </div>
      </Layout>
    );
  }

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 17) return "Good Afternoon";
      return "Good Evening";
    };

    return (
      <Layout>
        <div className="space-y-10 pb-12">
          
          {/* Hero Welcome Section - Matches Employee Portal Style */}
          <div className="relative overflow-hidden rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl shadow-indigo-200/50 border border-white/10" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #9333EA)' }}>
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-12">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest mb-6">
                  <ShieldCheck size={14} className="text-indigo-200" /> Administrative Control Center
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                  {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Admin</span> Overview
                </h2>
                <p className="text-indigo-100 text-base md:text-lg font-medium opacity-90 max-w-xl leading-relaxed">
                  You're currently monitoring <span className="font-bold underline decoration-indigo-400 underline-offset-8">{stats.totalEmployees} professionals</span> across your global infrastructure.
                </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-8 md:mt-10">
                 <Link to="/salary" className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-2xl flex items-center gap-3 text-sm md:text-base">
                  <Zap size={18} className="text-white group-hover:animate-pulse" />
                  Generate Payroll
                </Link>
                <div className="bg-white/10 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 rounded-2xl text-white font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-3 border border-white/10">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]"></div>
                  System Online
                </div>
              </div>
            </div>

            <div className="flex lg:flex flex-col items-start lg:items-end gap-4 text-left lg:text-right w-full lg:w-auto">
              <LiveClock />
            </div>
          </div>
          
          {/* Abstract Background Decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        </div>

        {/* Primary Stats Grid - 6 Cards in one row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <StatCard title="Total Staff" value={stats.totalEmployees} icon={Users} color="indigo" />
          <StatCard title="Present Today" value={stats.presentToday} icon={UserCheck} color="emerald" />
          <StatCard title="Absent Today" value={stats.absentToday} icon={UserMinus} color="rose" />
          <StatCard title="Staff on Leave" value={stats.onLeaveToday} icon={Calendar} color="amber" />
          <StatCard title="Monthly Budget" value={stats.monthlySalaryExpense} icon={IndianRupee} color="purple" />
          <StatCard title="Pending Payouts" value={stats.pendingSalaries} icon={Clock} color="amber" />
          <StatCard title="Open Requests" value={stats.pendingRequests} icon={ClipboardList} color="orange" />
        </div>

        {/* Data Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Expenditure Chart */}
          <div className="lg:col-span-8 glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 border-white/40 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-text-main uppercase tracking-tight">Expenditure Flow</h3>
                <p className="text-text-muted text-[10px] md:text-xs font-bold mt-1 uppercase tracking-widest">Monthly payroll capital allocation</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-white hover:shadow-lg transition-all"><Download size={20} /></button>
                <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner"><Activity size={20} /></div>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlySalaryTrend}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                    cursor={{ stroke: '#4F46E5', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" dot={{ r: 6, fill: '#4F46E5', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Metrics Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Attendance Pie */}
            <div className="glass-card rounded-[3rem] p-8 flex flex-col items-center">
              <h3 className="text-xl font-black text-text-main uppercase tracking-tight w-full mb-6">Attendance</h3>
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={85}
                      paddingAngle={10} dataKey="value" stroke="none"
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-text-main font-mono">{Math.round((stats.presentToday / (stats.totalEmployees || 1)) * 100)}%</span>
                  <span className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1">Live Sync</span>
                </div>
              </div>
              <div className="mt-8 flex gap-4 w-full">
                 <div className="flex-1 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Present</span>
                    <span className="text-xl font-black text-emerald-800">{stats.presentToday}</span>
                 </div>
                 <div className="flex-1 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Leave</span>
                    <span className="text-xl font-black text-amber-800">{stats.onLeaveToday}</span>
                 </div>
                 <div className="flex-1 p-4 bg-rose-50 rounded-2xl border border-rose-100/50">
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-1">Absent</span>
                    <span className="text-xl font-black text-rose-800">{stats.absentToday}</span>
                 </div>
              </div>
            </div>

            {/* Employees on Leave Detail */}
            <div className="glass-card rounded-[3rem] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-text-main uppercase tracking-tight">On Leave Today</h3>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase">{stats.onLeaveToday} Active</span>
              </div>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.employeesOnLeave && stats.employeesOnLeave.length > 0 ? (
                  stats.employeesOnLeave.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-amber-100 hover:bg-amber-50/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm font-black text-sm">{emp.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{emp.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.department}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-amber-600 bg-amber-100/50 px-2 py-1 rounded-lg uppercase">{emp.type}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No employees on leave today</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Row: Action Center & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Action Required: Pending Requests */}
          <div className="lg:col-span-7 glass-card rounded-[2rem] md:rounded-[3rem] flex flex-col shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6 md:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-text-main uppercase tracking-tight">Tactical Approvals</h3>
                <p className="text-text-muted text-[10px] md:text-xs font-bold mt-1 uppercase tracking-widest">Administrative decisions pending</p>
              </div>
              <Link to="/requests" className="inline-flex items-center gap-2 bg-slate-50 text-slate-500 px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all">
                Full Inbox <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-8 flex-1 overflow-y-auto max-h-[450px] space-y-5">
              {recentRequests.length > 0 ? (
                recentRequests.map((req) => (
                  <div key={req.id} className="group p-6 rounded-[2rem] bg-slate-50/50 border border-transparent hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
                          {req.emp_name?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></div>
                      </div>
                      <div>
                        <p className="text-base font-black text-text-main group-hover:text-primary transition-colors">{req.emp_name}</p>
                        <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">{req.type} Submission</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleRequestAction(req.id, 'Approved')}
                        className="w-12 h-12 rounded-2xl bg-white text-emerald-500 flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white active:scale-95 transition-all"
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => handleRequestAction(req.id, 'Rejected')}
                        className="w-12 h-12 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white active:scale-95 transition-all"
                      >
                        <CloseIcon size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-emerald-500 opacity-20" />
                  </div>
                  <h4 className="text-lg font-black text-slate-300 uppercase tracking-widest">Protocol Clear</h4>
                  <p className="text-text-muted font-bold text-xs uppercase tracking-[0.2em] mt-2 italic">Zero pending interventions</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Units Performance */}
          <div className="lg:col-span-5 glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="text-xl md:text-2xl font-black text-text-main uppercase tracking-tight">Business Units</h3>
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl"><Building2 size={24} /></div>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px]">
              {stats.departmentWise.map((dept, i) => (
                <div key={i} className="space-y-3 p-5 rounded-[2rem] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-700 uppercase tracking-widest group-hover:text-primary transition-colors">{dept.name}</span>
                    <span className="text-xs font-black text-primary bg-primary/5 px-3 py-1 rounded-full">{dept.value} Specialists</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(dept.value / stats.totalEmployees) * 100}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-8 mt-6 border-t border-slate-100">
              <Link to="/employees" className="flex items-center justify-center gap-3 text-xs font-black text-primary uppercase tracking-widest hover:gap-5 transition-all group">
                Access Personnel Directory <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
