import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  Users,
  UserCheck,
  UserMinus,
  Clock,
  Search,
  Save,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Download,
  Table as TableIcon,
  RefreshCw,
  Search as SearchIcon,
  Briefcase,
  ChevronDown,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf/dist/jspdf.umd.js";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`https://salary-management-64wa.onrender.com/api/attendance?date=${selectedDate}`, { headers });
      const data = res.data.map(emp => ({
        ...emp,
        status: emp.status || "Absent",
        check_in: emp.check_in || "09:00",
        check_out: emp.check_out || "18:00",
        notes: emp.notes || ""
      }));
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
      setLoading(false);
    }
  };

  const handleUpdate = (id, field, value) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const markAllPresent = () => {
    setEmployees(prev => prev.map(emp => ({ ...emp, status: "Present" })));
    setMessage({ type: 'success', text: "All employees marked as Present locally." });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveAllAttendance = async () => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const attendanceData = employees.map(emp => ({
        emp_id: emp.id,
        status: emp.status,
        check_in: emp.check_in,
        check_out: emp.check_out,
        notes: emp.notes
      }));
      await axios.post("https://salary-management-64wa.onrender.com/api/attendance/save", { attendanceData, date: selectedDate }, { headers });
      setMessage({ type: 'success', text: "Attendance records synchronized successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to save attendance records" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
      fetchAttendance();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report - ${selectedDate}`, 14, 15);
    const tableColumn = ["Emp ID", "Name", "Department", "Status", "Check In", "Check Out"];
    const tableRows = employees.map(emp => [emp.emp_id, emp.name, emp.department, emp.status, emp.check_in, emp.check_out]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20, theme: 'grid', headStyles: { fillColor: '#4f46e5' } });
    doc.save(`Attendance_${selectedDate}.pdf`);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees.map(emp => ({
      "Employee ID": emp.emp_id,
      "Name": emp.name,
      "Department": emp.department,
      "Status": emp.status,
      "Check In": emp.check_in,
      "Check Out": emp.check_out
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Attendance_${selectedDate}.xlsx`);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || (emp.emp_id && emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = filterDept === "All" || emp.department === filterDept;
    const matchesStatus = filterStatus === "All" || emp.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = ["All", ...new Set(employees.map(e => e.department))];
  const statuses = ["All", "Present", "Absent", "Half Day", "Leave"];

  const stats = {
    total: employees.length,
    present: employees.filter(e => e.status === "Present").length,
    absent: employees.filter(e => e.status === "Absent").length,
    leave: employees.filter(e => e.status === "Leave" || e.status === "Half Day").length
  };

  if (loading && employees.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Syncing Attendance Records...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
              Attendance <span className="text-indigo-600">Portal</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-2 bg-indigo-600/5 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-500/10 backdrop-blur-sm">
                <Calendar size={18} className="text-indigo-500" />
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="flex items-center gap-2 bg-slate-500/5 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold border border-slate-500/10 backdrop-blur-sm">
                <Clock size={18} className="text-indigo-500" /> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button onClick={markAllPresent} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-500/20 hover:bg-emerald-100 transition-all shadow-sm active:scale-95">
              <UserCheck size={20} /> Mark All Present
            </button>
            <button onClick={saveAllAttendance} disabled={saving} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95">
              {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              {saving ? "Saving Changes..." : "Sync Records"}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Staff Count", value: stats.total, icon: Users, color: "indigo" },
            { label: "Present", value: stats.present, icon: UserCheck, color: "emerald" },
            { label: "Absent", value: stats.absent, icon: UserMinus, color: "rose" },
            { label: "Exceptions", value: stats.leave, icon: AlertCircle, color: "amber" }
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 rounded-2xl flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-600 shrink-0`}>
                <card.icon size={32} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-black text-slate-800 mt-0.5">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Select Calendar</label>
              <div className="relative group">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Find Employee</label>
              <div className="relative group">
                <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <input type="text" placeholder="ID or Name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Department</label>
              <div className="relative group">
                <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer">
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Status Filter</label>
              <div className="relative group">
                <CheckCircle2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer">
                  {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="lg:col-span-1 flex items-end gap-3">
              <button onClick={exportPDF} className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95" title="Download PDF Report">
                <Download size={20} />
              </button>
              <button onClick={exportExcel} className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95" title="Export to Excel">
                <TableIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`mb-8 p-4 rounded-2xl border flex items-center gap-4 font-bold ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-700'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attendance Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time Tracking</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredEmployees.map((emp, i) => (
                  <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-100 dark:shadow-none">
                            {emp.name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 ${emp.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800 dark:text-slate-200">{emp.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">{emp.department}</span>
                            <span className="text-[10px] font-bold text-indigo-500 tracking-wider">#{emp.emp_id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <select value={emp.status} onChange={e => handleUpdate(emp.id, 'status', e.target.value)} className={`text-xs font-black px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer text-center min-w-[140px] appearance-none focus:outline-none ${emp.status === 'Present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : emp.status === 'Absent' ? 'bg-rose-50 border-rose-100 text-rose-600' : emp.status === 'Half Day' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                          <option value="Present">PRESENT</option>
                          <option value="Absent">ABSENT</option>
                          <option value="Half Day">HALF DAY</option>
                          <option value="Leave">LEAVE</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all">
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Check In</label>
                          <input type="time" value={emp.check_in || ""} onChange={e => handleUpdate(emp.id, 'check_in', e.target.value)} className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-transparent border-none p-1 focus:ring-0" />
                        </div>
                        <ArrowRight size={14} className="text-slate-300 mt-4" />
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Check Out</label>
                          <input type="time" value={emp.check_out || ""} onChange={e => handleUpdate(emp.id, 'check_out', e.target.value)} className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-transparent border-none p-1 focus:ring-0" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <input type="text" placeholder="Add observation..." value={emp.notes || ""} onChange={e => handleUpdate(emp.id, 'notes', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredEmployees.length === 0 && (
              <div className="text-center py-24 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <SearchIcon size={40} className="text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No matching staff found</h3>
                <p className="text-slate-500 font-medium mt-1">Refine your search or filters to see results</p>
              </div>
            )}
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
            <p className="text-sm font-bold text-slate-500">
              Synchronizing <span className="text-indigo-600 font-black">{filteredEmployees.length}</span> staff members
            </p>
            <button onClick={fetchAttendance} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm active:rotate-180 duration-500" title="Refresh Sync">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
