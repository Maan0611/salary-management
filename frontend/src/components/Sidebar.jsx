import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, UserPlus, Calculator, 
  Wallet, Clock, MessageSquare, Bell, Settings,
  LogOut, ShieldCheck, ChevronRight, ChevronLeft,
  FileBarChart, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Salary', path: '/salary', icon: Wallet },
    { name: 'Requests', path: '/requests', icon: MessageSquare },
    { name: 'Announcements', path: '/announcements', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isCollapsed ? "80px" : "250px"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`h-full bg-white text-slate-600 flex flex-col shadow-xl z-40 border-r border-slate-100 flex-shrink-0 fixed lg:relative transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Decorative Background Elements - Wrapped to allow button to exceed bounds if needed */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-r-3xl">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-4 top-10 w-8 h-8 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center shadow-lg hover:text-indigo-600 hover:scale-110 transition-all z-50 group"
      >
        <div className="group-hover:scale-110 transition-transform">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </div>
      </button>

      {/* Brand Identity */}
      <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'px-8'} flex-shrink-0 relative z-10`}>
        <Link to="/dashboard" className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShieldCheck className="text-white" size={24} />
            </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">NEXUS HR</h1>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1">ADMIN PORTAL</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className={`flex-1 ${isCollapsed ? 'px-3' : 'px-6'} py-8 space-y-2 overflow-y-auto relative z-10 custom-scrollbar`}>
        {!isCollapsed && (
          <div className="px-3 mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management Hub</span>
          </div>
        )}

        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            title={isCollapsed ? item.name : ""}
            className={`
              group flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden
              ${isActive(item.path) 
                ? 'text-white shadow-xl shadow-indigo-200/50' 
                : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50'}
            `}
            style={isActive(item.path) ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #9333EA)' } : {}}
          >
            <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-4'} relative z-10`}>
              <div className={`
                p-2 rounded-xl transition-all duration-300
                ${isActive(item.path) 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'}
              `}>
                <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              </div>
              {!isCollapsed && <span className="text-sm tracking-wide">{item.name}</span>}
            </div>
            
            {!isCollapsed && isActive(item.path) && (
              <ChevronRight size={14} className="opacity-60" />
            )}
          </Link>
        ))}
      </div>
      
      {/* User Status / Bottom Section */}
      <div className={`p-6 relative z-10 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`bg-slate-50 border border-slate-100 rounded-3xl p-5 group cursor-pointer hover:bg-white hover:shadow-xl transition-all ${isCollapsed ? 'w-14 h-14 p-0 flex items-center justify-center' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-lg shrink-0">
              AD
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider truncate">Super Admin</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">System Control</p>
              </div>
            )}
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 font-black text-xs uppercase tracking-widest transition-all"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        )}
        {isCollapsed && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleLogout}
              title="Log Out"
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
        {!isCollapsed && (
          <div className="mt-6 flex justify-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Version 2.1.0 Premium</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Sidebar;