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
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  X,
  Trash2,
} from "lucide-react";
import {
  getAccounts,
  createAccount,
  updateAccount,
  getCollectors,
  getPlans,
  getTransactions,
} from "../services/api";
import axios from "axios";

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accountPayments, setAccountPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [formData, setFormData] = useState({
    accountNumber: "",
    customerId: "",
    collectorId: "",
    planId: "",
    accountType: "monthly",
    dailyAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    duration: "12",
    status: "active",
    remarks: "",
  });

  // Helper functions for plan objects
  const getPlanTypeFromPlan = (plan) => {
    if (!plan) return "monthly";
    return (
      plan.type ||
      plan.planType ||
      (plan.name?.toLowerCase().includes("weekly")
        ? "weekly"
        : plan.name?.toLowerCase().includes("daily")
        ? "daily"
        : "monthly")
    );
  };

  const getAmountLabelFromPlan = (plan) => {
    const planType = getPlanTypeFromPlan(plan);
    return planType === "weekly" ? "week" : "day";
  };

  const getDurationDisplayFromPlan = (plan) => {
    if (!plan) return "";

    const duration = plan.duration || plan.term;
    const planType = getPlanTypeFromPlan(plan);

    switch (planType.toLowerCase()) {
      case "daily":
        return `${duration} day${duration > 1 ? "s" : ""}`;
      case "weekly":
        return `${duration} week${duration > 1 ? "s" : ""}`;
      case "monthly":
        return `${duration} month${duration > 1 ? "s" : ""}`;
      default:
        return `${duration} months`;
    }
  };

  // Helper functions for account objects
  const getPlanTypeFromAccount = (account) => {
    if (!account) return "monthly";

    if (account.accountType) return account.accountType;
    if (account.planId?.type) return account.planId.type;

    const planName =
      account.planId?.name?.toLowerCase() ||
      account.planName?.toLowerCase() ||
      "";
    if (planName.includes("weekly")) return "weekly";
    if (planName.includes("daily")) return "daily";
    if (planName.includes("monthly")) return "monthly";

    return "monthly";
  };

  const getAmountLabelFromAccount = (account) => {
    const planType = getPlanTypeFromAccount(account);
    return planType === "weekly" ? "week" : "day";
  };

  const getDurationDisplayFromAccount = (account) => {
    if (!account) return "";

    const duration = account.duration || account.planId?.duration;
    const planType = getPlanTypeFromAccount(account);

    switch (planType.toLowerCase()) {
      case "daily":
        return `${duration} day${duration > 1 ? "s" : ""}`;
      case "weekly":
        return `${duration} week${duration > 1 ? "s" : ""}`;
      case "monthly":
        return `${duration} month${duration > 1 ? "s" : ""}`;
      default:
        return `${duration} months`;
    }
  };

  // Helper functions
  const calculateTotalDays = (duration, planType = "monthly") => {
    const durationValue = parseInt(duration);
    switch (planType?.toLowerCase()) {
      case "daily":
        return durationValue;
      case "weekly":
        return durationValue * 7;
      case "monthly":
        return durationValue * 30;
      default:
        return durationValue * 30;
    }
  };

  const calculateMaturityDate = (startDate, duration, planType = "monthly") => {
    const start = new Date(startDate);
    const maturity = new Date(start);
    const durationValue = parseInt(duration);

    switch (planType?.toLowerCase()) {
      case "daily":
        maturity.setDate(maturity.getDate() + durationValue);
        break;
      case "weekly":
        maturity.setDate(maturity.getDate() + durationValue * 7);
        break;
      case "monthly":
        maturity.setMonth(maturity.getMonth() + durationValue);
        break;
      default:
        maturity.setMonth(maturity.getMonth() + durationValue);
    }
    return maturity.toISOString().split("T")[0];
  };

  const generateAccountNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    return `ACC${timestamp}`;
  };

  // Status badge function
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

  // Initialize account number when modal opens
  useEffect(() => {
    if (showModal) {
      setFormData((prev) => ({
        ...prev,
        accountNumber: generateAccountNumber(),
      }));
    }
  }, [showModal]);

  // Function to fetch payments for a specific account
  const fetchAccountPayments = async (accountId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `http://localhost:5000/api/payments/account/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching payments for account ${accountId}:`, error);
      return [];
    }
  };

  // Function to fetch all account payments
  const fetchAllAccountPayments = async (accountList) => {
    const paymentsMap = {};
    
    for (const account of accountList) {
      const payments = await fetchAccountPayments(account._id);
      paymentsMap[account._id] = payments;
    }
    
    return paymentsMap;
  };

  const getAccountStats = (account) => {
    if (!account) {
      return {
        totalDeposits: 0,
        missedDeposits: 0,
        lastDepositDate: null,
        totalInterest: 0,
        maturityAmount: 0,
        nextDueDate: null,
        transactionsCount: 0,
      };
    }

    // Use account's own transactions if available
    const accountTransactions = account.transactions || [];
    const accountPaymentsData = accountPayments[account._id] || [];

    // Combine both transactions and payments
    const allDeposits = [
      ...accountTransactions.filter(t => t.type === 'deposit'),
      ...accountPaymentsData.filter(p => p.status === 'completed' || p.status === 'verified')
    ];

    // Calculate total deposits
    const totalDeposits = allDeposits.reduce((sum, deposit) => {
      return sum + (deposit.amount || 0);
    }, 0);

    // Calculate missed deposits based on plan type
    const startDate = new Date(account.startDate);
    const today = new Date();
    const planType = getPlanTypeFromAccount(account);

    let expectedDeposits = 0;
    switch (planType.toLowerCase()) {
      case "daily":
        const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        expectedDeposits = Math.max(0, daysPassed);
        break;
      case "weekly":
        const weeksPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 7));
        expectedDeposits = Math.max(0, weeksPassed);
        break;
      case "monthly":
        const monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 +
          (today.getMonth() - startDate.getMonth());
        expectedDeposits = Math.max(0, monthsPassed);
        break;
      default:
        expectedDeposits = 0;
    }

    const missedDeposits = Math.max(0, expectedDeposits - allDeposits.length);

    // Calculate next due date
    const lastDeposit = allDeposits[allDeposits.length - 1];
    let nextDueDate = new Date();
    
    if (lastDeposit?.date || lastDeposit?.paymentDate) {
      const lastDepositDate = new Date(lastDeposit.date || lastDeposit.paymentDate);
      nextDueDate = new Date(lastDepositDate);
      
      switch (planType.toLowerCase()) {
        case "daily":
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case "weekly":
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case "monthly":
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
      }
    } else {
      nextDueDate = new Date(startDate);
    }

    // Calculate interest and maturity amount
    const interestRate = account.interestRate || account.planId?.interestRate || 6.5;
    const totalInterest = ((totalDeposits * interestRate) / 100) * (parseInt(account.duration) / 12);
    const maturityAmount = totalDeposits + totalInterest;

    return {
      totalDeposits,
      missedDeposits,
      lastDepositDate: lastDeposit ? (lastDeposit.date || lastDeposit.paymentDate) : null,
      nextDueDate: nextDueDate.toISOString().split("T")[0],
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      maturityAmount: parseFloat(maturityAmount.toFixed(2)),
      maturityDate: account.maturityDate,
      maturityStatus: account.maturityStatus || "Pending",
      transactionsCount: allDeposits.length,
    };
  };

  // Delete account function
  const handleDeleteAccount = async (accountId) => {
    const account = accounts.find(acc => acc._id === accountId);
    const stats = getAccountStats(account);
    
    if (stats.transactionsCount > 0 || stats.totalDeposits > 0) {
      const shouldForceDelete = window.confirm(
        `This account has ${stats.transactionsCount} transactions and total deposits of ₹${stats.totalDeposits}. ` +
        `Are you sure you want to FORCE DELETE? This action cannot be undone and will permanently remove all transaction history.`
      );
      
      if (!shouldForceDelete) {
        const closeInstead = window.confirm(
          "Would you like to close this account instead? This will preserve transaction history."
        );
        
        if (closeInstead) {
          await handleCloseAccount(accountId);
        }
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to delete this account?")) {
        return;
      }
    }

    setDeleteLoading(accountId);
    
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(
        `http://localhost:5000/api/accounts/${accountId}?force=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setAccounts(prevAccounts => 
          prevAccounts.filter(account => account._id !== accountId)
        );
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error.response?.data?.message || "Failed to delete account.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Close account function
  const handleCloseAccount = async (accountId) => {
    setDeleteLoading(accountId);
    
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `http://localhost:5000/api/accounts/${accountId}/status`,
        { status: 'closed' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setAccounts(prevAccounts => 
          prevAccounts.map(account => 
            account._id === accountId 
              ? { ...account, status: 'closed' }
              : account
          )
        );
        alert("Account closed successfully!");
      } else {
        alert(response.data.message || "Failed to close account.");
      }
    } catch (error) {
      console.error("Error closing account:", error);
      alert("Failed to close account. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle view details - FIXED FUNCTION
  const handleViewDetails = (account) => {
    console.log("View details clicked for account:", account);
    setSelectedAccount(account);
    setShowDetailModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const mockAccounts = [
        {
          _id: "1",
          accountNumber: "ACC001",
          customerId: {
            _id: "cust1",
            name: "Raj Swasthik",
            phone: "9483369031",
            email: "swasthik126@gmail.com",
            address: "Mangalore, Karnataka",
            nomineeName: "Ravi Swasthik",
            customerId: "CUST001",
          },
          collectorId: {
            _id: "col1",
            name: "Ramesh Kumar",
            area: "Bangalore South",
            collectorId: "COL002",
          },
          planId: {
            _id: "plan1",
            name: "Gold Grower",
            amount: 100,
            interestRate: 7.0,
            duration: "12",
            type: "monthly",
          },
          accountType: "monthly",
          dailyAmount: 100,
          startDate: "2025-10-22",
          duration: "12",
          interestRate: 7.0,
          totalDays: 365,
          maturityDate: "2026-10-22",
          status: "active",
          maturityStatus: "Pending",
          transactions: [
            {
              amount: 100,
              type: "deposit",
              date: "2025-10-23",
              collectedBy: "col1"
            },
            {
              amount: 100,
              type: "deposit",
              date: "2025-10-24",
              collectedBy: "col1"
            }
          ]
        },
      ];

      try {
        let customersData = [];
        try {
          const token = localStorage.getItem("adminToken");
          const customersResponse = await axios.get(
            "http://localhost:5000/api/customers",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (customersResponse.data && customersResponse.data.data) {
            customersData = customersResponse.data.data;
          } else if (Array.isArray(customersResponse.data)) {
            customersData = customersResponse.data;
          }
        } catch (customerError) {
          console.error("Error fetching customers:", customerError);
        }

        setCustomers(customersData);

        const [accountsRes, collectorsRes, plansRes] = await Promise.all([
          getAccounts().catch(() => ({ data: { data: mockAccounts } })),
          getCollectors().catch(() => ({ data: { data: [] } })),
          getPlans().catch(() => ({ data: { data: [] } })),
        ]);

        const accountsData = accountsRes?.data?.data || mockAccounts;
        setAccounts(accountsData);
        setCollectors(collectorsRes?.data?.data || []);
        setPlans(plansRes?.data?.data || []);

        // Fetch payments for all accounts
        const paymentsData = await fetchAllAccountPayments(accountsData);
        setAccountPayments(paymentsData);

      } catch (error) {
        console.error("Error in API calls:", error);
        setAccounts(mockAccounts);
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
    setSubmitLoading(true);

    try {
      const selectedPlan = plans.find((plan) => plan._id === formData.planId);
      const accountType = formData.accountType || getPlanTypeFromPlan(selectedPlan) || "monthly";
      const duration = selectedPlan?.duration || formData.duration;

      const accountData = {
        accountNumber: formData.accountNumber,
        customerId: formData.customerId,
        collectorId: formData.collectorId,
        planId: formData.planId,
        accountType: accountType,
        dailyAmount: parseFloat(formData.dailyAmount),
        startDate: formData.startDate,
        duration: duration,
        status: formData.status,
        remarks: formData.remarks || "",
      };

      console.log("Sending minimal account data:", accountData);

      const response = await createAccount(accountData);

      if (response.data.success) {
        alert("Account created successfully!");
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        alert(`Failed to create account: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      
      if (error.response) {
        const errorMessage = error.response.data.message || error.response.data.error;
        alert(`Error creating account: ${errorMessage}`);
      } else {
        alert("Network error. Please try again.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountNumber: generateAccountNumber(),
      customerId: "",
      collectorId: "",
      planId: "",
      accountType: "monthly",
      dailyAmount: "",
      startDate: new Date().toISOString().split("T")[0],
      duration: "12",
      status: "active",
      remarks: "",
    });
  };

  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.accountNumber?.toLowerCase().includes(searchLower) ||
      account.accountId?.toLowerCase().includes(searchLower) ||
      account.customerId?.name?.toLowerCase().includes(searchLower) ||
      account.customerId?.phone?.includes(searchTerm) ||
      account.collectorId?.name?.toLowerCase().includes(searchLower)
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Accounts</h1>
            <p className="text-gray-600 mt-2">
              {error ? "Using demo data - " : ""}Create and manage pigmy savings accounts
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
                <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Accounts</p>
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
                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {accounts.reduce((sum, account) => {
                    const stats = getAccountStats(account);
                    return sum + stats.totalDeposits;
                  }, 0)}
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
                <p className="text-2xl font-bold text-gray-900">{collectors.length}</p>
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
              placeholder="Search accounts by ID, customer name, phone, or collector..."
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
                    Collector
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
                  const amountLabel = getAmountLabelFromAccount(account);

                  return (
                    <tr key={account._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {account.accountNumber || account.accountId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Start: {new Date(account.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Matures: {new Date(stats.maturityDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {account.customerId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {account.customerId?.phone}
                        </div>
                        <div className="text-xs text-gray-400">
                          {account.customerId?.customerId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {account.collectorId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.collectorId?.collectorId}
                        </div>
                        <div className="text-xs text-gray-400">
                          {account.collectorId?.area}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {account.planId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{account.dailyAmount}/{amountLabel}
                        </div>
                        <div className="text-xs text-gray-400">
                          {account.interestRate}% • {getDurationDisplayFromAccount(account)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(account.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          Deposits: ₹{stats.totalDeposits}
                        </div>
                        {stats.transactionsCount > 0 && (
                          <div className="text-xs text-blue-500 mt-1">
                            {stats.transactionsCount} payments
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(account)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {/* <button className="text-green-600 hover:text-green-900 p-1 rounded transition-colors">
                            <Edit className="h-4 w-4" />
                          </button> */}
                          <button
                            onClick={() => handleDeleteAccount(account._id)}
                            disabled={deleteLoading === account._id}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors disabled:opacity-50"
                            title="Delete Account"
                          >
                            {deleteLoading === account._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
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

        {/* Create Account Modal - Improved background */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Account</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Account Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                  </div>

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
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name} - {customer.phone}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No customers available</option>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {customers.length} customer(s) available
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collector
                    </label>
                    <select
                      required
                      value={formData.collectorId}
                      onChange={(e) =>
                        setFormData({ ...formData, collectorId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Collector</option>
                      {collectors.map((collector) => (
                        <option key={collector._id} value={collector._id}>
                          {collector.name} - {collector.area}
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
                        const planType = getPlanTypeFromPlan(selectedPlan);

                        setFormData({
                          ...formData,
                          planId: e.target.value,
                          accountType: planType,
                          dailyAmount: selectedPlan?.amount || "",
                          duration: selectedPlan?.duration || "12",
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Plan</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name} - ₹{plan.amount}/{getAmountLabelFromPlan(plan)} - {plan.interestRate}% - {getDurationDisplayFromPlan(plan)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.accountType === "weekly" ? "Weekly Amount (₹)" : "Daily Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      required
                      readOnly
                      min="10"
                      value={formData.dailyAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, dailyAmount: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${formData.accountType === "weekly" ? "weekly" : "daily"} amount`}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional comments..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={submitLoading}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {submitLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Account Detail Modal - Improved background and added content */}
        {showDetailModal && selectedAccount && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Account Details - {selectedAccount.accountNumber || selectedAccount.accountId}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Account Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Basic Account Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Account Number:</span>
                        <span className="text-sm text-gray-900">
                          {selectedAccount.accountNumber || selectedAccount.accountId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Plan Type:</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {getPlanTypeFromAccount(selectedAccount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Customer ID:</span>
                        <span className="text-sm text-gray-900">
                          {selectedAccount.customerId?.customerId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Collector:</span>
                        <span className="text-sm text-gray-900">
                          {selectedAccount.collectorId?.name} ({selectedAccount.collectorId?.collectorId})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Plan:</span>
                        <span className="text-sm text-gray-900">
                          {selectedAccount.planId?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {getAmountLabelFromAccount(selectedAccount) === "week" ? "Weekly Amount:" : "Daily Amount:"}
                        </span>
                        <span className="text-sm text-gray-900">
                          ₹{selectedAccount.dailyAmount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Duration:</span>
                        <span className="text-sm text-gray-900">
                          {getDurationDisplayFromAccount(selectedAccount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Interest Rate:</span>
                        <span className="text-sm text-gray-900">
                          {selectedAccount.interestRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Deposit Summary
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {(() => {
                        const stats = getAccountStats(selectedAccount);
                        const planType = getPlanTypeFromAccount(selectedAccount);
                        const depositUnit = planType === "weekly" ? "weeks" : "days";

                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Total Deposits:</span>
                              <span className="text-sm text-gray-900">₹{stats.totalDeposits}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Missed Deposits:</span>
                              <span className="text-sm text-gray-900">{stats.missedDeposits} {depositUnit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Last Deposit:</span>
                              <span className="text-sm text-gray-900">
                                {stats.lastDepositDate
                                  ? new Date(stats.lastDepositDate).toLocaleDateString()
                                  : "No deposits"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Next Due Date:</span>
                              <span className="text-sm text-gray-900">
                                {stats.nextDueDate
                                  ? new Date(stats.nextDueDate).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Total Interest:</span>
                              <span className="text-sm text-gray-900">₹{stats.totalInterest}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Maturity Amount:</span>
                              <span className="text-sm text-gray-900">₹{stats.maturityAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Maturity Date:</span>
                              <span className="text-sm text-gray-900">
                                {new Date(stats.maturityDate).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <span className="text-sm text-gray-900">{selectedAccount.customerId?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <span className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedAccount.customerId?.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <span className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedAccount.customerId?.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Address:</span>
                        <span className="text-sm text-gray-900 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedAccount.customerId?.address || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Nominee:</span>
                        <span className="text-sm text-gray-900">
                          {selectedAccount.customerId?.nomineeName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      System Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <span className="text-sm text-gray-900">{getStatusBadge(selectedAccount.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Start Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedAccount.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Maturity Status:</span>
                        <span className="text-sm text-gray-900">{selectedAccount.maturityStatus}</span>
                      </div>
                      {selectedAccount.remarks && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Remarks:</span>
                          <span className="text-sm text-gray-900 text-right">{selectedAccount.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAccounts;