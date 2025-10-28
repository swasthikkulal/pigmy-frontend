import React, { useState, useEffect } from "react";
import {
  Users,
  PiggyBank,
  TrendingUp,
  DollarSign,
  UserCheck,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  RefreshCw // Add this import
} from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAccounts: 0,
    totalCollectors: 0,
    activeAccounts: 0,
    totalDailyCollection: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState([]);

  // Helper function to calculate dashboard stats
  const calculateDashboardStats = (accounts, customers, collectors) => {
    const totalAccounts = accounts?.length || 0;
    const activeAccounts = accounts?.filter(acc => acc.status === 'active')?.length || 0;
    const totalCustomers = customers?.length || 0;
    const totalCollectors = collectors?.length || 0;
    const totalDailyCollection = accounts?.reduce((sum, account) => sum + (account.dailyAmount || 0), 0) || 0;
    
    // Calculate monthly growth
    const monthlyGrowth = totalAccounts > 0 ? ((activeAccounts / totalAccounts) * 100).toFixed(1) : 0;
    
    return {
      totalAccounts,
      activeAccounts,
      totalCustomers,
      totalCollectors,
      totalDailyCollection,
      monthlyGrowth
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting dashboard data fetch with direct axios calls...');
      
      // Get token from localStorage
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('🛑 No admin token found');
        useMockDataOnly();
        return;
      }

      console.log('🔑 Token found, making direct API calls...');

      // Create axios instance with auth header
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Make direct API calls using axios.get
      try {
        console.log('1. Fetching accounts...');
        const accountsRes = await api.get('/accounts');
        const accounts = accountsRes.data.data || [];
        console.log('✅ Accounts fetched:', accounts.length);

        console.log('2. Fetching customers...');
        const customersRes = await api.get('/customers');
        const customers = customersRes.data.data || [];
        console.log('✅ Customers fetched:', customers.length);

        console.log('3. Fetching collectors...');
        const collectorsRes = await api.get('/collectors');
        const collectors = collectorsRes.data.data || [];
        console.log('✅ Collectors fetched:', collectors.length);

        console.log('4. Fetching plans...');
        const plansRes = await api.get('/plans');
        const plans = plansRes.data.data || [];
        console.log('✅ Plans fetched:', plans.length);

        // Calculate stats with real data
        const calculatedStats = calculateDashboardStats(accounts, customers, collectors);
        setStats(calculatedStats);

        // Prepare plan distribution with real data
        const planDistribution = plans.map(plan => ({
          name: plan.name,
          accounts: accounts.filter(acc => acc.planId?._id === plan._id).length,
          amount: plan.amount || plan.dailyAmount,
          percentage: accounts.length > 0 ? 
            ((accounts.filter(acc => acc.planId?._id === plan._id).length / accounts.length) * 100).toFixed(1) : 0
        }));
        
        setPlanData(planDistribution);

        console.log('✅ Dashboard data loaded successfully with real data');

      } catch (apiError) {
        console.error('❌ API call failed:', apiError.response?.data || apiError.message);
        
        if (apiError.response?.status === 401) {
          console.log('🔐 401 Unauthorized - Token might be invalid');
        }
        
        // Fallback to mock data
        useMockDataOnly();
      }

    } catch (error) {
      console.error('💥 Unexpected error in fetchData:', error);
      useMockDataOnly();
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback function
  const useMockDataOnly = () => {
    console.log('🔄 Using mock data as fallback');
    
    const mockAccounts = [
      { _id: '1', status: 'active', dailyAmount: 100, planId: { name: 'Basic Plan' } },
      { _id: '2', status: 'active', dailyAmount: 150, planId: { name: 'Premium Plan' } },
      { _id: '3', status: 'inactive', dailyAmount: 200, planId: { name: 'Basic Plan' } }
    ];
    
    const mockCustomers = [
      { _id: '1', name: 'Customer 1' },
      { _id: '2', name: 'Customer 2' },
      { _id: '3', name: 'Customer 3' }
    ];
    
    const mockCollectors = [
      { _id: '1', name: 'Collector 1' },
      { _id: '2', name: 'Collector 2' }
    ];

    const calculatedStats = calculateDashboardStats(mockAccounts, mockCustomers, mockCollectors);
    setStats(calculatedStats);
    
    const mockPlans = [
      { _id: '1', name: 'Basic Plan', amount: 100 },
      { _id: '2', name: 'Premium Plan', amount: 150 },
      { _id: '3', name: 'Gold Plan', amount: 200 }
    ];
    
    setPlanData(mockPlans.map(plan => ({
      name: plan.name,
      accounts: mockAccounts.filter(acc => acc.planId?.name === plan.name).length,
      amount: plan.amount,
      percentage: 33.3
    })));
  };

  // Add a manual refresh function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchData();
  };

  // Add token debug function
  const debugToken = () => {
    const token = localStorage.getItem('adminToken');
    console.log('🔍 Token debug:', {
      exists: !!token,
      length: token ? token.length : 0,
      preview: token ? token.substring(0, 50) + '...' : 'None'
    });
    alert(`Token exists: ${!!token}\nLength: ${token ? token.length : 0}`);
  };

  const statsCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      description: "Registered customers"
    },
    {
      title: "Total Accounts",
      value: stats.totalAccounts,
      icon: PiggyBank,
      color: "bg-green-500",
      textColor: "text-green-600",
      description: "Pigmy accounts"
    },
    {
      title: "Active Accounts",
      value: stats.activeAccounts,
      icon: UserCheck,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      description: "Currently active"
    },
    {
      title: "Daily Collection",
      value: `₹${stats.totalDailyCollection}`,
      icon: DollarSign,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      description: "Per day collection"
    },
    {
      title: "Total Collectors",
      value: stats.totalCollectors,
      icon: Users,
      color: "bg-red-500",
      textColor: "text-red-600",
      description: "Field agents"
    },
    {
      title: "Growth Rate",
      value: `${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: "bg-teal-500",
      textColor: "text-teal-600",
      description: "Monthly growth"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your pigmy business</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={debugToken}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              Debug Token
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <IconComponent className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Plan Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Plan Distribution</h3>
            </div>
            <div className="space-y-4">
              {planData.map((plan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index % 4 === 0 ? 'bg-blue-500' : 
                      index % 4 === 1 ? 'bg-green-500' : 
                      index % 4 === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                      <p className="text-xs text-gray-500">₹{plan.amount}/day</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{plan.accounts} accounts</p>
                    <p className="text-xs text-gray-500">{plan.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <PieChart className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Active Accounts</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900 mr-2">{stats.activeAccounts}</span>
                  <ArrowUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Inactive Accounts</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900 mr-2">{stats.totalAccounts - stats.activeAccounts}</span>
                  <ArrowDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Active Rate</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.monthlyGrowth}%</p>
                  <p className="text-xs text-blue-500">of total accounts are active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">System started successfully</span>
              </div>
              <span className="text-xs text-gray-500">Just now</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">{stats.totalCustomers} customers loaded</span>
              </div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">{stats.totalAccounts} accounts processed</span>
              </div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">₹{stats.totalDailyCollection} daily collection estimated</span>
              </div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-700">Manage Customers</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-center">
              <PiggyBank className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-700">View Accounts</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-center">
              <UserCheck className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-purple-700">Collectors</span>
            </button>
            <button className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-center">
              <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-orange-700">Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;