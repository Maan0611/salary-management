import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import AdminProfile from "./pages/AdminProfile";
import Attendance from "./pages/Attendance";
import Salary from "./pages/Salary";
import RequestManagement from "./pages/RequestManagement";
import MyRequests from "./pages/MyRequests";
import EmployeeSettings from "./pages/EmployeeSettings";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeSalary from "./pages/EmployeeSalary";
import EmployeeLeave from "./pages/EmployeeLeave";
import EmployeeProfile from "./pages/EmployeeProfile";
import Announcements from "./pages/Announcements";
import EmployeeAnnouncements from "./pages/EmployeeAnnouncements";
import EmployeeLayout from "./components/EmployeeLayout";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

// Global axios interceptor: auto-redirect to login on 401/403 (expired/invalid token)


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/add-employee" element={<ProtectedRoute><AddEmployee /></ProtectedRoute>} />
        <Route path="/edit-employee/:id" element={<ProtectedRoute><EditEmployee /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><Salary /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestManagement /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Protected Employee Portal Routes */}
        <Route path="/employee/dashboard" element={<ProtectedRoute><EmployeeLayout><EmployeeDashboard /></EmployeeLayout></ProtectedRoute>} />
        <Route path="/employee/attendance" element={<ProtectedRoute><EmployeeLayout><EmployeeAttendance /></EmployeeLayout></ProtectedRoute>} />
        <Route path="/employee/salary" element={<ProtectedRoute><EmployeeLayout><EmployeeSalary /></EmployeeLayout></ProtectedRoute>} />
        <Route path="/employee/leave" element={<ProtectedRoute><EmployeeLayout><EmployeeLeave /></EmployeeLayout></ProtectedRoute>} />
        <Route path="/employee/requests" element={<ProtectedRoute><EmployeeLayout><MyRequests /></EmployeeLayout></ProtectedRoute>} />
        <Route path="/employee/announcements" element={<ProtectedRoute><EmployeeLayout><EmployeeAnnouncements /></EmployeeLayout></ProtectedRoute>} />
        <Route path="/employee/settings" element={<ProtectedRoute><EmployeeLayout><EmployeeSettings /></EmployeeLayout></ProtectedRoute>} />
        <Route path="/employee/profile" element={<ProtectedRoute><EmployeeLayout><EmployeeProfile /></EmployeeLayout></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
