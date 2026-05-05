import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" />;
  }

  // Define route spaces
  // Explicitly match exactly '/employee' or starting with '/employee/'
  const isEmployeeRoute = location.pathname === '/employee' || location.pathname.startsWith('/employee/');
  const isAdminRoute = !isEmployeeRoute && location.pathname !== '/';

  // If role isn't explicitly defined, we assume older behavior 
  // but if it is 'employee', they shouldn't access admin routes
  if (isAdminRoute && user.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (isEmployeeRoute && user.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;