import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { 
  Users, Search, Filter, Edit, Trash2, 
  Download, Building2, UserPlus, Briefcase, IndianRupee,
  ChevronRight, Calendar, Mail, Shield, Info,
  RefreshCw, FileSpreadsheet, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to synchronize employee directory");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const deleteEmployee = async (id) => {
    if (!window.confirm("Permanently remove this employee from the records?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadEmployees();
    } catch (err) {
      alert("Removal operation failed");
    }
  };

  const departments = useMemo(() => {
    const depts = ["All", ...new Set(employees.map(e => e.department))];
    return depts;
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === "All" || emp.department === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, filterDept]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDept]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const stats = useMemo(() => {
    const total = employees.length;
    const avgSalary = total > 0 ? employees.reduce((acc, curr) => acc + parseFloat(curr.basic_salary), 0) / total : 0;
    const depts = new Set(employees.map(e => e.department)).size;
    return { total, avgSalary, depts };
  }, [employees]);

  if (loading && employees.length === 0) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/10 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Directory Database...</p>
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
              Workforce <span className="text-indigo-600">Directory</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Info size={18} className="text-indigo-500" /> 
              Managing <span className="text-slate-900 font-bold">{stats.total} active employees</span> across {stats.depts} departments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Link 
              to="/add-employee" 
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <UserPlus size={20} />
              Onboard Employee
            </Link>
            <button className="p-3.5 bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm" title="Export CSV">
              <FileSpreadsheet size={22} />
            </button>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {[
            { label: "Active Talent", value: stats.total, icon: Users, color: "indigo" },
            { label: "Business Units", value: stats.depts, icon: Building2, color: "purple" },
            { label: "Avg. Compensation", value: `₹${Math.round(stats.avgSalary).toLocaleString()}`, icon: IndianRupee, color: "emerald" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] flex items-center gap-8 group cursor-pointer hover:border-indigo-200/50 transition-all"
            >
              <div className={`w-20 h-20 rounded-[2rem] bg-${stat.color}-500/10 text-${stat.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                <stat.icon size={36} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Control Bar */}
        <div className="glass-card p-6 rounded-[2rem] mb-10 flex flex-wrap lg:flex-nowrap gap-6 items-end">
          <div className="flex-1 min-w-[350px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 ml-2 tracking-[0.15em]">Directory Search</label>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, ID, or professional email..." 
                className="w-full pl-14 pr-6 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="min-w-[220px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 ml-2 tracking-[0.15em]">Business Unit</label>
              <div className="relative group">
                <Building2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full pl-14 pr-12 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-bold appearance-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <button 
              onClick={loadEmployees}
              className="p-4 bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm active:rotate-180 duration-500 mt-auto mb-1"
            >
              <RefreshCw size={24} />
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl">
          {error && (
            <div className="m-8 p-6 bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-2xl font-bold flex items-center gap-4 animate-shake">
              <Shield size={24} />
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Identity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role & Department</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compensation Data</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                <AnimatePresence>
                  {paginatedData.map((emp, i) => (
                    <motion.tr 
                      key={emp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className="hover:bg-indigo-50/40 transition-all group"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="relative group">
                            <div className="w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-lg"></div>
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-800 leading-tight">{emp.name}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">#{emp.emp_id}</span>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Mail size={12} className="opacity-60" />
                                <span className="text-xs font-bold">{emp.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-2.5">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <Building2 size={12} />
                            {emp.department}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 ml-1">
                            <Briefcase size={16} className="text-slate-300" />
                            <span className="text-sm font-bold">{emp.position}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-1.5">
                          <p className="text-xl font-black text-slate-800">₹{parseFloat(emp.basic_salary).toLocaleString()}</p>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={14} className="opacity-60" />
                            <span className="text-[11px] font-bold">Onboarded: {new Date(emp.join_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            to={`/edit-employee/${emp.id}`} 
                            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-xl rounded-2xl transition-all"
                            title="Edit Personnel Records"
                          >
                            <Edit size={20} />
                          </Link>
                          <button 
                            onClick={() => deleteEmployee(emp.id)}
                            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-xl rounded-2xl transition-all"
                            title="Deactivate Records"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-xl rounded-2xl transition-all">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-10 py-32 text-center flex flex-col items-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={40} className="text-slate-200" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 uppercase tracking-widest">No matching personnel</h4>
                      <p className="text-slate-500 font-medium mt-2 italic">Refine your search or adjust department filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50/50 px-10 py-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-slate-500">
              Discovered <span className="text-indigo-600 font-black">{filtered.length}</span> active professional profiles
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase text-slate-500 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                Previous Cycle
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button 
                    key={n} 
                    onClick={() => setCurrentPage(n)}
                    className={`w-10 h-10 rounded-xl text-xs font-black ${n === currentPage ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next Progression
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
