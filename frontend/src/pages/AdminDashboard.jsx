// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Users, Building2, IndianRupee, ClipboardList, RefreshCw, Search, ChevronDown, Calendar, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants for container and cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    totalSalary: 0,
    pendingRequests: 0,
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch aggregated stats from the backend (placeholder endpoint)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = useMemo(
    () => [
      { label: "Active Employees", value: stats.employees, icon: Users, color: "indigo" },
      { label: "Business Units", value: stats.departments, icon: Building2, color: "purple" },
      { label: "Total Payroll", value: `₹${stats.totalSalary.toLocaleString()}`, icon: IndianRupee, color: "emerald" },
      { label: "Pending Requests", value: stats.pendingRequests, icon: ClipboardList, color: "orange" },
    ],
    [stats]
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        className="max-w-7xl mx-auto py-8 space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.h1
          className="text-4xl font-extrabold text-gradient"
          variants={cardVariants}
        >
          <Settings className="inline-block mr-3 align-text-bottom" size={36} /> Admin Dashboard
        </motion.h1>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="glass-card p-6 rounded-2xl flex flex-col items-center text-center"
              variants={cardVariants}
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center bg-${card.color}-500/10 text-${card.color}-600 mb-4`}
              >
                <card.icon size={32} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity Table */}
        <motion.div className="glass-card p-6 rounded-2xl" variants={cardVariants}>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <RefreshCw size={20} className="text-indigo-600" /> Recent Activity
          </h2>
          {error && (
            <div className="p-4 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-lg flex items-center gap-2">
              <Calendar size={20} className="text-rose-600" /> {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 uppercase">Event</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {stats.recent && stats.recent.length > 0 ? (
                  stats.recent.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-2 text-sm text-slate-700">{row.event}</td>
                      <td className="px-4 py-2 text-sm text-slate-700">{row.user}</td>
                      <td className="px-4 py-2 text-sm text-slate-700">{new Date(row.time).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No recent activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
