import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, DollarSign, Users } from "lucide-react";

const CollectorDashboard = () => {
  const navigate = useNavigate();

  const collectorData = JSON.parse(
    localStorage.getItem("collectorData") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("collectorToken");
    localStorage.removeItem("collectorData");
    navigate("/collector/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Collector Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {collectorData.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Collection
                </p>
                <p className="text-2xl font-bold text-gray-900">₹0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">My Area</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collectorData.area}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">Record Collection</h3>
              <p className="text-sm text-gray-600">Add daily collection</p>
            </button>

            <button
              onClick={() => navigate("/collector/customers")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium text-gray-900">My Customers</h3>
              <p className="text-sm text-gray-600">View customer list</p>
            </button>

            <button
              onClick={() => navigate("/collector/collections")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium text-gray-900">My Collections</h3>
              <p className="text-sm text-gray-600">View collection history</p>
            </button>

            <button
              onClick={() => navigate("/collector/profile")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium text-gray-900">Profile</h3>
              <p className="text-sm text-gray-600">Update my profile</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollectorDashboard;
