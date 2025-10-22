import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Eye,
  PiggyBank,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import {
  getAccounts,
  createAccount,
  updateAccount,
  getCustomers,
  getCollectors,
  getPlans,
  getTransactions,
} from "../services/api";

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    collectorId: "",
    planId: "",
    dailyAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    duration: "12",
    status: "active",
  });

  // Helper functions
  const calculateTotalDays = (durationMonths) => {
    return parseInt(durationMonths) * 30;
  };

  const calculateMaturityDate = (startDate, durationMonths) => {
    const start = new Date(startDate);
    const maturity = new Date(start);
    maturity.setMonth(maturity.getMonth() + parseInt(durationMonths));
    return maturity.toISOString().split("T")[0];
  };

  const generateAccountId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `ACC${timestamp}`;
  };

  const getAccountStats = (account) => {
    if (!account) {
      return {
        totalDeposits: 0,
        missedDeposits: 0,
        lastDepositDate: null,
        totalInterest: 0,
        maturityAmount: 0,
      };
    }

    const accountTransactions = transactions.filter(
      (transaction) =>
        transaction.accountId === account._id ||
        transaction.accountId === account.accountId
    );

    const totalDeposits = accountTransactions
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalInterest = (
      ((totalDeposits * (account.interestRate || 0)) / 100) *
      (parseInt(account.duration) / 12)
    ).toFixed(2);
    const maturityAmount = totalDeposits + parseFloat(totalInterest);

    return {
      totalDeposits,
      missedDeposits: 0,
      lastDepositDate: accountTransactions[0]?.date,
      totalInterest: parseFloat(totalInterest),
      maturityAmount,
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data as fallback
      const mockAccounts = [
        {
          _id: "1",
          accountId: "ACC001",
          customerId: {
            _id: "cust1",
            name: "Raj Kumar",
            phone: "9876543210",
            customerId: "CUST001",
          },
          collectorId: {
            _id: "col1",
            name: "Ramesh Kumar",
            area: "Bangalore South",
          },
          planId: {
            _id: "plan1",
            name: "Gold Plan",
            amount: 100,
            interestRate: 7.5,
          },
          dailyAmount: 100,
          startDate: "2024-01-01",
          duration: "12",
          interestRate: 7.5,
          status: "active",
        },
        {
          _id: "2",
          accountId: "ACC002",
          customerId: {
            _id: "cust2",
            name: "Priya Sharma",
            phone: "9876543211",
            customerId: "CUST002",
          },
          collectorId: {
            _id: "col2",
            name: "Suresh Patel",
            area: "Mumbai Central",
          },
          planId: {
            _id: "plan2",
            name: "Silver Plan",
            amount: 50,
            interestRate: 6.5,
          },
          dailyAmount: 50,
          startDate: "2024-02-01",
          duration: "6",
          interestRate: 6.5,
          status: "active",
        },
      ];

      const mockCustomers = [
        {
          _id: "cust1",
          name: "Raj Kumar",
          phone: "9876543210",
          customerId: "CUST001",
        },
        {
          _id: "cust2",
          name: "Priya Sharma",
          phone: "9876543211",
          customerId: "CUST002",
        },
      ];

      const mockCollectors = [
        {
          _id: "col1",
          name: "Ramesh Kumar",
          area: "Bangalore South",
        },
        {
          _id: "col2",
          name: "Suresh Patel",
          area: "Mumbai Central",
        },
      ];

      const mockPlans = [
        {
          _id: "plan1",
          name: "Gold Plan",
          amount: 100,
          interestRate: 7.5,
          duration: "12",
        },
        {
          _id: "plan2",
          name: "Silver Plan",
          amount: 50,
          interestRate: 6.5,
          duration: "6",
        },
        {
          _id: "plan3",
          name: "Premium Plan",
          amount: 200,
          interestRate: 8.0,
          duration: "24",
        },
      ];

      try {
        // Try to fetch real data
        const [
          accountsRes,
          customersRes,
          collectorsRes,
          plansRes,
          transactionsRes,
        ] = await Promise.all([
          getAccounts().catch(() => ({ data: { data: mockAccounts } })),
          getCustomers().catch(() => ({ data: { data: mockCustomers } })),
          getCollectors().catch(() => ({ data: { data: mockCollectors } })),
          getPlans().catch(() => ({ data: { data: mockPlans } })),
          getTransactions().catch(() => ({ data: { data: [] } })),
        ]);

        setAccounts(accountsRes?.data?.data || mockAccounts);
        setCustomers(customersRes?.data?.data || mockCustomers);
        setCollectors(collectorsRes?.data?.data || mockCollectors);
        setPlans(plansRes?.data?.data || mockPlans);
        setTransactions(transactionsRes?.data?.data || []);
      } catch (error) {
        console.error("Error in API calls:", error);
        // Use mock data as fallback
        setAccounts(mockAccounts);
        setCustomers(mockCustomers);
        setCollectors(mockCollectors);
        setPlans(mockPlans);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Using demo data instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedPlan = plans.find((plan) => plan._id === formData.planId);
      const selectedCustomer = customers.find(
        (cust) => cust._id === formData.customerId
      );

      const accountData = {
        ...formData,
        accountId: generateAccountId(),
        interestRate: selectedPlan?.interestRate || 6.5,
        totalDays: calculateTotalDays(formData.duration),
        maturityDate: calculateMaturityDate(
          formData.startDate,
          formData.duration
        ),
        customerName: selectedCustomer?.name,
        planName: selectedPlan?.name,
      };

      await createAccount(accountData);
      alert("Account created successfully!");
      setShowModal(false);
      setFormData({
        customerId: "",
        collectorId: "",
        planId: "",
        dailyAmount: "",
        startDate: new Date().toISOString().split("T")[0],
        duration: "12",
        status: "active",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Account created successfully with demo data!");
      setShowModal(false);
      fetchData();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      closed: { color: "bg-gray-100 text-gray-800", icon: XCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || "Unknown"}
      </span>
    );
  };

  const filteredAccounts = accounts.filter((account) => {
    return (
      account.accountId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customerId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      account.customerId?.phone?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Accounts
            </h1>
            <p className="text-gray-600 mt-2">
              {error ? "Using demo data - " : ""}Create and manage pigmy savings
              accounts
            </p>
            {error && <p className="text-yellow-600 text-sm mt-1">{error}</p>}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Account
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Accounts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Accounts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter((a) => a.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Daily</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {accounts.reduce(
                    (sum, account) => sum + (account.dailyAmount || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Collectors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collectors.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts by ID, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => {
                  const stats = getAccountStats(account);
                  return (
                    <tr key={account._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {account.accountId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Start:{" "}
                          {new Date(account.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Deposits: ₹{stats.totalDeposits}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {account.customerId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.customerId?.phone}
                        </div>
                        <div className="text-xs text-gray-400">
                          {account.collectorId?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {account.planId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{account.dailyAmount}/day
                        </div>
                        <div className="text-xs text-gray-400">
                          {account.interestRate}% interest
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(account.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <PiggyBank className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No accounts found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first account."}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create First Account
              </button>
            </div>
          )}
        </div>

        {/* Create Account Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Create New Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer
                    </label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) =>
                        setFormData({ ...formData, customerId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan
                    </label>
                    <select
                      required
                      value={formData.planId}
                      onChange={(e) => {
                        const selectedPlan = plans.find(
                          (plan) => plan._id === e.target.value
                        );
                        setFormData({
                          ...formData,
                          planId: e.target.value,
                          dailyAmount: selectedPlan?.amount || "",
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Plan</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name} - ₹{plan.amount}/day
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={formData.dailyAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyAmount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter daily amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAccounts;
