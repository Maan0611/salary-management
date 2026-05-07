import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { 
  IndianRupee, Download, Search, FileText, 
  CreditCard, Clock, CheckCircle, AlertCircle, Edit, 
  Trash2, Calendar, MoreVertical,
  Plus, RefreshCw, FileSpreadsheet, ChevronDown,
  TrendingUp, Wallet, Receipt, CheckCircle2, XCircle, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf/dist/jspdf.umd.js";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Salary() {
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: '2-digit' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState("All");
  const [editRecord, setEditRecord] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState(null);

  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" }, 
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  const fetchSalaries = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalaryRecords(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch failed", err);
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const token = sessionStorage.getItem("token");
      await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary/generate`, { 
        month: selectedMonth, 
        year: selectedYear 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: "Payroll successfully computed for this period!" });
      fetchSalaries();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Generation failed" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const handlePay = async (id) => {
    if (!window.confirm("Authorize payment for this record?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary/pay/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: "Transaction completed successfully" });
      fetchSalaries();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Payment update failed", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary/update/${editRecord.id}`, editRecord, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setMessage({ type: "success", text: "Payroll record updated" });
      fetchSalaries();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this payroll record?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: "Record removed" });
      fetchSalaries();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: "Salary approved" });
      fetchSalaries();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  const handleReject = async () => {
    if (!remarks) return alert("Please provide rejection remarks");
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary/reject/${rejectId}`, { remarks }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowRejectModal(false);
      setRemarks("");
      setMessage({ type: "success", text: "Salary rejected" });
      fetchSalaries();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Rejection failed", err);
    }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Approve ${selectedIds.length} salary records?`)) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/salary/bulk-approve`, { ids: selectedIds }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: `${selectedIds.length} salaries approved` });
      setSelectedIds([]);
      fetchSalaries();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Bulk approval failed", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredRecords = useMemo(() => {
    return salaryRecords.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All" || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [salaryRecords, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = filteredRecords.reduce((acc, curr) => acc + parseFloat(curr.net_salary), 0);
    const paid = filteredRecords.filter(s => s.status === "Paid").length;
    const pending = filteredRecords.filter(s => s.status === "Draft" || s.status === "Rejected").length;
    const totalBonus = filteredRecords.reduce((acc, curr) => acc + parseFloat(curr.bonus), 0);
    return { total, paid, pending, totalBonus };
  }, [filteredRecords]);

  const exportExcel = () => {
    const data = filteredRecords.map(s => ({
      "ID": s.employee_code, "Name": s.name, "Dept": s.department, "Net": s.net_salary, "Status": s.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, `Payroll_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const generatePayslip = (salary) => {
    const doc = new jsPDF();
    
    // --- Header Section ---
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, 210, 50, 'F');
    
    // Company Branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("NEXUS HR", 14, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Enterprise Solutions & Workforce Management", 14, 32);
    doc.text("Tech Park, Building 4, Sector 62, Noida, UP", 14, 37);
    
    // Payslip Title & Period
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SALARY PAYSLIP", 196, 25, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthLabel = monthNames[parseInt(salary.month) - 1] || salary.month;
    doc.text(`${monthLabel} ${salary.year}`, 196, 33, { align: 'right' });
    
    // --- Employee & Record Details ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EMPLOYEE DETAILS", 14, 65);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, 67, 196, 67);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    // Left Column
    doc.text(`Employee Name:`, 14, 75);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.name}`, 45, 75);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Employee ID:`, 14, 82);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.employee_code || 'N/A'}`, 45, 82);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Designation:`, 14, 89);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.position || 'Specialist'}`, 45, 89);
    
    // Right Column
    doc.setFont("helvetica", "normal");
    doc.text(`Department:`, 110, 75);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.department || 'Operations'}`, 140, 75);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Date:`, 110, 82);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.payment_date ? new Date(salary.payment_date).toLocaleDateString() : 'Awaiting'}`, 140, 82);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Status:`, 110, 89);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.status.toUpperCase()}`, 140, 89);
    
    // --- Financial Table ---
    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Earnings (INR)', 'Deductions (INR)', 'Total']],
      body: [
        ['Basic Salary', salary.basic_salary.toLocaleString(), '-', salary.basic_salary.toLocaleString()],
        ['Performance Bonus', salary.bonus ? salary.bonus.toLocaleString() : '0', '-', `+${(parseFloat(salary.bonus) || 0).toLocaleString()}`],
        ['Overtime Pay', salary.overtime ? salary.overtime.toLocaleString() : '0', '-', `+${(parseFloat(salary.overtime) || 0).toLocaleString()}`],
        ['Provident Fund / Deductions', '-', salary.deduction ? salary.deduction.toLocaleString() : '0', `-${(parseFloat(salary.deduction) || 0).toLocaleString()}`],
        ['Income Tax (TDS)', '-', salary.tax ? salary.tax.toLocaleString() : '0', `-${(parseFloat(salary.tax) || 0).toLocaleString()}`],
        [{ content: 'NET TAKE HOME PAY', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } }, { content: `${parseFloat(salary.net_salary).toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } }]
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [79, 70, 229], 
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      styles: { 
        fontSize: 10,
        cellPadding: 6
      }
    });
    
    // --- Footer Section ---
    const finalY = doc.lastAutoTable.finalY + 30;
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, finalY, 70, finalY);
    doc.line(140, finalY, 196, finalY);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Signature", 42, finalY + 5, { align: 'center' });
    doc.text("Authorized Signatory", 168, finalY + 5, { align: 'center' });
    
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("This is a computer-generated payslip and does not require a physical stamp.", 105, 280, { align: 'center' });
    
    doc.save(`Payslip_${salary.name}_${monthLabel}_${selectedYear}.pdf`);
  };

  if (loading && salaryRecords.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Calculating Payroll Data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
              Payroll <span className="text-indigo-600">Distribution</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" /> 
              Managing compensation for <span className="text-slate-900 font-bold">{selectedMonth}/{selectedYear}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {generating ? <RefreshCw className="animate-spin" size={20} /> : <Receipt size={20} />}
              Compute Payroll
            </button>
            <button onClick={exportExcel} className="p-3.5 bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm" title="Export Spreadsheet">
              <FileSpreadsheet size={22} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Gross Distribution", value: `₹${stats.total.toLocaleString()}`, icon: Wallet, color: "indigo" },
            { label: "Completed Payments", value: stats.paid, icon: CheckCircle, color: "emerald" },
            { label: "Awaiting Clearance", value: stats.pending, icon: Clock, color: "rose" },
            { label: "Monthly Bonuses", value: `₹${stats.totalBonus.toLocaleString()}`, icon: TrendingUp, color: "amber" }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-600`}>
                  <card.icon size={24} strokeWidth={2.5} />
                </div>
                <MoreVertical size={16} className="text-slate-300 cursor-pointer" />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{card.label}</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="glass-card p-6 rounded-2xl mb-8 flex flex-wrap lg:flex-nowrap gap-6 items-end">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Search Employee</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="ID, Name or Dept..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:flex gap-4">
            <div className="min-w-[140px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Month</label>
              <div className="relative group">
                <select 
                  className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="min-w-[120px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Year</label>
              <div className="relative group">
                <select 
                  className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Status</label>
            <div className="relative group">
              <select 
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={fetchSalaries}
            className="p-3.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-indigo-100 rounded-xl transition-all shadow-sm active:rotate-180 duration-500"
            title="Refresh Data"
          >
            <RefreshCw size={22} />
          </button>
        </div>

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8 p-4 bg-indigo-600 rounded-2xl flex items-center justify-between shadow-xl shadow-indigo-200 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                  {selectedIds.length}
                </div>
                <p className="font-bold">Records Selected</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedIds([])}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                >
                  Clear
                </button>
                <button 
                  onClick={handleBulkApprove}
                  className="px-6 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all shadow-lg"
                >
                  Bulk Approve
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mb-8 p-4 rounded-2xl border flex items-center gap-4 font-bold ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-700'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Salary Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="pl-8 pr-4 py-6 w-10">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg accent-indigo-600"
                      checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredRecords.map(r => r.id));
                        else setSelectedIds([]);
                      }}
                    />
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compensation Breakdown</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Payout</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Workflow Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((s, i) => (
                  <motion.tr 
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`hover:bg-indigo-50/30 transition-all group ${selectedIds.includes(s.id) ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="pl-8 pr-4 py-6">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg accent-indigo-600"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSelect(s.id)}
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-100">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-slate-800">{s.name}</p>
                            {s.is_modified === 1 && (
                              <div className="group/info relative">
                                <Info size={14} className="text-amber-500 cursor-help" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-50">
                                  This record has been modified manually after generation.
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase">#{s.employee_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base</span>
                          <span className="text-sm font-bold text-slate-700">₹{s.basic_salary?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Bonus</span>
                          <span className="text-sm font-bold text-emerald-600">+₹{s.bonus?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Deduct</span>
                          <span className="text-sm font-bold text-rose-600">-₹{(parseFloat(s.deduction) + parseFloat(s.tax)).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800">₹{parseFloat(s.net_salary).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Amount</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        s.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 
                        s.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' :
                        s.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                        'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          s.status === 'Paid' ? 'bg-emerald-500' : 
                          s.status === 'Approved' ? 'bg-indigo-500' :
                          s.status === 'Rejected' ? 'bg-rose-500' :
                          'bg-slate-400'
                        }`}></div>
                        {s.status}
                      </span>
                      {(s.payment_date || s.approved_at) && (
                        <p className="text-[10px] font-bold text-slate-400 mt-2">
                          {s.payment_date ? new Date(s.payment_date).toLocaleDateString('en-GB') : new Date(s.approved_at).toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'Draft' || s.status === 'Rejected' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(s.id)}
                              className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 rounded-xl transition-all"
                              title="Approve Record"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => {setRejectId(s.id); setShowRejectModal(true);}}
                              className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600 rounded-xl transition-all"
                              title="Reject Record"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        ) : s.status === 'Approved' ? (
                          <button 
                            onClick={() => handlePay(s.id)}
                            className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-600 rounded-xl transition-all"
                            title="Release Payment"
                          >
                            <CreditCard size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => generatePayslip(s)}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                            title="Generate PDF"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        {s.status === 'Paid' && (
                          <button 
                            onClick={async () => {
                              try {
                                const token = sessionStorage.getItem("token");
                                await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/email/send-salary`, { salaryId: s.id }, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setMessage({ type: "success", text: "Salary slip sent to " + s.email });
                                setTimeout(() => setMessage(null), 3000);
                              } catch (err) {
                                setMessage({ type: "error", text: "Failed to send email" });
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
                            title="Send Email Slip"
                          >
                            <Plus size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => {setEditRecord(s); setShowEditModal(true);}}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Adjust Figures"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No payroll history found</h3>
                <p className="text-slate-500 font-medium mt-1 mb-6">Compute payroll to see records for this period</p>
                <button onClick={handleGenerate} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all">Compute Now</button>
              </div>
            )}
          </div>

          <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-100 flex justify-between items-center">
            <p className="text-sm font-bold text-slate-500">
              Computed for <span className="text-indigo-600 font-black">{filteredRecords.length}</span> active staff members
            </p>
          </div>
        </div>
      </div>

      {/* Edit Salary Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Adjust Payroll">
        <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-[-2rem] mb-6">{editRecord?.name}</p>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bonus</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={editRecord?.bonus}
                onChange={(e) => setEditRecord({...editRecord, bonus: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Overtime</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={editRecord?.overtime}
                onChange={(e) => setEditRecord({...editRecord, overtime: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deduction</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={editRecord?.deduction}
                onChange={(e) => setEditRecord({...editRecord, deduction: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={editRecord?.tax}
                onChange={(e) => setEditRecord({...editRecord, tax: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjustment Remarks</label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
              placeholder="Reason for modification..."
              value={editRecord?.remarks || ""}
              onChange={(e) => setEditRecord({...editRecord, remarks: e.target.value})}
            ></textarea>
          </div>
          <div className="bg-indigo-600 p-6 rounded-2xl flex justify-between items-center text-white">
            <div>
              <p className="text-[10px] font-bold text-indigo-200 uppercase">Estimated Net</p>
              <p className="text-2xl font-black">₹{(parseFloat(editRecord?.basic_salary||0) + parseFloat(editRecord?.bonus||0) + parseFloat(editRecord?.overtime||0) - parseFloat(editRecord?.deduction||0) - parseFloat(editRecord?.tax||0)).toLocaleString()}</p>
            </div>
            <button type="submit" className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Salary">
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0">
              <AlertCircle size={20} />
            </div>
            <p className="text-sm font-bold text-rose-700">Please provide a reason for rejecting this salary record.</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Remarks</label>
            <textarea 
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-rose-500/5 transition-all h-32 resize-none"
              placeholder="Reason for rejection..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            ></textarea>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setShowRejectModal(false)}
              className="flex-1 px-6 py-3.5 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleReject}
              className="flex-1 px-6 py-3.5 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

const Modal = ({ children, isOpen, onClose, title }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 border border-white/20 relative"
        >
          <button onClick={onClose} className="absolute right-6 top-6 w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full transition-all">
            <Plus className="rotate-45" size={24} />
          </button>
          <div className="mb-10">
            <h3 className="text-2xl font-black text-slate-800">{title}</h3>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
