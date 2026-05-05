import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Layout, Calendar, DollarSign, FileText, 
  User, LogOut, ChevronLeft, ShieldCheck, Megaphone, X
} from "lucide-react";

export default function EmployeeSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/announcements/employee/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = res.data.filter(ann => !ann.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/employee/dashboard", icon: Layout },
    { name: "Attendance", path: "/employee/attendance", icon: Calendar },
    { name: "My Salary", path: "/employee/salary", icon: DollarSign },
    { name: "My Requests", path: "/employee/requests", icon: FileText },
    { name: "Announcements", path: "/employee/announcements", icon: Megaphone, badge: unreadCount },
    { name: "Settings", path: "/employee/settings", icon: ShieldCheck },
    { name: "My Profile", path: "/employee/profile", icon: User },
  ];

  const linkClass = (path) => `
    flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all
    ${location.pathname === path 
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
      : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}
  `;

  return (
    <div className={`
      w-72 bg-white border-r border-slate-100 h-screen fixed lg:sticky top-0 z-40 flex flex-col p-6 shadow-sm transition-transform duration-300 transform
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Layout className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 leading-tight">NEXUS EMPLOYEE</h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Portal Access</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className={linkClass(item.path)} onClick={() => { if(window.innerWidth < 1024) toggleSidebar(); }}>
            <div className="flex items-center gap-4 flex-1">
              <item.icon size={20} />
              <span className="text-sm">{item.name}</span>
            </div>
            {item.badge > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-rose-200">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="pt-8 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
