import React, { useState } from "react";
import { 
  Calendar, FileText, Briefcase, Bell, Layout as LayoutIcon,
  User, LogOut, Menu, X
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../apiConfig";

export default function EmployeeLayout({ children }) {
  const [profile, setProfile] = React.useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/employee-portal/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    window.addEventListener('profileUpdate', fetchProfile);
    return () => window.removeEventListener('profileUpdate', fetchProfile);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex bg-slate-50 min-h-screen relative overflow-x-hidden">
      {/* Sidebar */}
      <EmployeeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleSidebar}
              className="lg:hidden w-12 h-12 bg-slate-50 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-slate-100/50 relative z-50"
            >
              {isSidebarOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
            </button>

            <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
               <LayoutIcon size={16} className="text-indigo-600" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest hidden sm:inline">Self Service Portal</span>
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest sm:hidden">Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            <div 
              onClick={() => navigate("/employee/profile")}
              className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-100 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{profile?.name || user.name || "Employee"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role || "Staff"}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner overflow-hidden border border-white group-hover:ring-2 group-hover:ring-indigo-100 transition-all">
                {profile?.profile_photo ? (
                  <img src={`${API_URL}${profile.profile_photo}`} alt="P" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-10 min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
