import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  IndianRupee, FileText, Download, Calendar, 
  TrendingUp, TrendingDown, Briefcase, User
} from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EmployeeSalary() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/employee-portal/salary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalaries(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSalaries();
  }, []);

  const generatePayslip = (salary) => {
    const doc = new jsPDF();
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    
    // --- Header Section ---
    // Dark background for header
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
    doc.text(`${user.name}`, 45, 75);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Employee ID:`, 14, 82);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.employee_code || salary.employee_id || 'N/A'}`, 45, 82);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Designation:`, 14, 89);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.position || 'Employee'}`, 45, 89);
    
    // Right Column
    doc.setFont("helvetica", "normal");
    doc.text(`Department:`, 110, 75);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.department || 'Operations'}`, 140, 75);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Date:`, 110, 82);
    doc.setFont("helvetica", "bold");
    doc.text(`${salary.payment_date ? new Date(salary.payment_date).toLocaleDateString() : 'N/A'}`, 140, 82);
    
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
        ['Performance Bonus', salary.bonus ? salary.bonus.toLocaleString() : '0', '-', `+${(salary.bonus || 0).toLocaleString()}`],
        ['Overtime Pay', salary.overtime ? salary.overtime.toLocaleString() : '0', '-', `+${(salary.overtime || 0).toLocaleString()}`],
        ['Provident Fund / Deductions', '-', salary.deduction ? salary.deduction.toLocaleString() : '0', `-${(salary.deduction || 0).toLocaleString()}`],
        ['Income Tax (TDS)', '-', salary.tax ? salary.tax.toLocaleString() : '0', `-${(salary.tax || 0).toLocaleString()}`],
        [{ content: 'NET TAKE HOME PAY', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } }, { content: `${salary.net_salary.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } }]
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
    
    doc.save(`Antigravity_Payslip_${monthLabel}_${salary.year}.pdf`);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black text-slate-800">My Salary History</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">View and download your monthly payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <h4 className="text-indigo-100 font-bold text-[10px] uppercase tracking-widest mb-1">Total Earnings (YTD)</h4>
          <h2 className="text-3xl font-black">₹{salaries.reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0).toLocaleString()}</h2>
          <div className="absolute right-4 bottom-4 opacity-20"><TrendingUp size={48} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Last Month Payout</h4>
          <h2 className="text-3xl font-black text-slate-800">₹{Number(salaries[0]?.net_salary || 0).toLocaleString()}</h2>
          <div className="absolute right-4 bottom-4 opacity-10 text-emerald-600"><IndianRupee size={48} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Payment Consistency</h4>
          <h2 className="text-3xl font-black text-slate-800">100%</h2>
          <div className="absolute right-4 bottom-4 opacity-10 text-blue-600"><Briefcase size={48} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-600">Net Salary</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {salaries.map((salary) => (
              <tr key={salary.id} className="hover:bg-slate-50/50 transition">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                      {salary.month}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{salary.month}/{salary.year}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Payroll</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-600">
                  {salary.status === 'Approved' || salary.status === 'Paid' ? `₹${Number(salary.basic_salary).toLocaleString()}` : '***'}
                </td>
                <td className="px-8 py-5 text-sm font-bold text-emerald-500">
                  {salary.status === 'Approved' || salary.status === 'Paid' ? `+₹${Number((salary.bonus || 0) + (salary.overtime || 0)).toLocaleString()}` : '***'}
                </td>
                <td className="px-8 py-5 text-sm font-black text-slate-800">
                  {salary.status === 'Approved' || salary.status === 'Paid' ? `₹${Number(salary.net_salary).toLocaleString()}` : '***'}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    salary.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                    salary.status === 'Approved' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {salary.status === 'Draft' || salary.status === 'Rejected' ? 'Processing...' : salary.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  { (salary.status === 'Approved' || salary.status === 'Paid') && (
                    <button 
                      onClick={() => generatePayslip(salary)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Download PDF Payslip"
                    >
                      <Download size={18} />
                    </button>
                  )}
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
