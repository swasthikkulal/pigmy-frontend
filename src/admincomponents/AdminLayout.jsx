import React from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut, User, Shield } from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Add debugging to see what's actually stored
  React.useEffect(() => {
    const adminData = localStorage.getItem("adminData");
    const adminToken = localStorage.getItem("adminToken");
    
    console.log('🏠 AdminLayout mounted');
    console.log('🔑 Admin token:', adminToken ? 'EXISTS' : 'MISSING');
    console.log('👤 Admin data:', adminData);
    console.log('📍 Current path:', location.pathname);
  }, [location]);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  // Safe parsing of admin data
  const getAdminData = () => {
    try {
      const adminDataStr = localStorage.getItem("adminData");
      if (!adminDataStr) return {};
      return JSON.parse(adminDataStr);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      return {};
    }
  };

  const adminData = getAdminData();

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: Shield },
    { path: "/admin/customers", label: "Customers", icon: User },
    { path: "/admin/collectors", label: "Collectors", icon: User },
    { path: "/admin/accounts", label: "Accounts", icon: User },
    { path: "/admin/payments", label: "Payments", icon: User },
    { path: "/admin/plans", label: "Plans", icon: User },
    { path: "/admin/reports", label: "Reports", icon: User },
    { path: "/admin/feedback", label: "Feedback", icon: User },
  ];

  return (
    <div className="flex h-screen mx-[-12%] w-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-70 bg-blue-800 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">PigmyXpress</h1>
          <p className="text-blue-200 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-900 text-white border-r-4 border-yellow-400"
                    : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-64 p-4 bg-blue-900">
          <div className="flex items-center justify-between">
            <div>
              {/* ✅ FIX: Use correct field names */}
              <p className="text-sm font-medium">
                {adminData.name || adminData.email || 'Admin User'}
              </p>
              <p className="text-xs text-blue-200 capitalize">
                {adminData.role || 'admin'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;