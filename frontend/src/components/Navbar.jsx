import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LogOut, User, Settings, 
  Menu, Sparkles, X
} from "lucide-react";

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center sticky top-0 z-50">
      <div className="w-full px-4 md:px-8 flex items-center justify-between">
        
        {/* Left Section: Context Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button - Left on mobile */}
          <button 
            onClick={toggleSidebar}
            className="lg:hidden w-12 h-12 bg-slate-50 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-slate-100/50 relative z-50"
          >
            {isSidebarOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
          </button>
          
          <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 sm:flex items-center gap-2 hidden">
             <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Nexus HR | Admin Portal</span>
          </div>
        </div>

        {/* Right Section: Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
            <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-2 md:pr-4 hover:bg-slate-50 rounded-2xl transition-all group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100 border border-white group-hover:scale-105 transition-transform">
                  A
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Administrator</p>
                <p className="text-[10px] font-bold text-slate-400">System Control</p>
              </div>
            </Link>

            <button 
              onClick={logout} 
              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
              title="Terminate Session"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
