import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  DollarSign,
  Clock,
  CreditCard,
  Wallet,
  Users,
  MessageSquare,
  ArrowDownToLine,
  LogOut,
  Settings,
  User
} from "lucide-react";

const mockTransactions = [
  {
    id: "1",
    date: "2025-10-18",
    description: "Pigmy Collection - Week 42",
    amount: 5000,
    type: "credit",
    status: "completed",
    category: "Collection",
  },
  {
    id: "2",
    date: "2025-10-17",
    description: "Loan Disbursement - LN-2024-089",
    amount: 50000,
    type: "debit",
    status: "completed",
    category: "Loan",
  },
  {
    id: "3",
    date: "2025-10-16",
    description: "Member Registration Fee",
    amount: 500,
    type: "credit",
    status: "completed",
    category: "Fee",
  },
  {
    id: "4",
    date: "2025-10-15",
    description: "Interest Payment - LN-2024-067",
    amount: 2500,
    type: "credit",
    status: "pending",
    category: "Interest",
  },
  {
    id: "5",
    date: "2025-10-14",
    description: "Pigmy Collection - Week 41",
    amount: 4800,
    type: "credit",
    status: "completed",
    category: "Collection",
  },
  {
    id: "6",
    date: "2025-10-13",
    description: "Withdrawal Request - MEM-456",
    amount: 15000,
    type: "debit",
    status: "failed",
    category: "Withdrawal",
  },
  {
    id: "7",
    date: "2025-10-12",
    description: "Late Payment Fee",
    amount: 300,
    type: "credit",
    status: "completed",
    category: "Fee",
  },
  {
    id: "8",
    date: "2025-10-11",
    description: "Pigmy Collection - Week 40",
    amount: 5200,
    type: "credit",
    status: "completed",
    category: "Collection",
  },
];

const PigmyXpressDashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(value.toLowerCase()) ||
        t.category.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  const handleFilterType = (value) => {
    setTypeFilter(value);
    if (value === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter((t) => t.type === value));
    }
  };

  const handleFilterStatus = (value) => {
    setStatusFilter(value);
    if (value === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter((t) => t.status === value));
    }
  };

  const handleExport = () => {
    alert(
      "Export Started: Your transaction history is being prepared for download."
    );
  };

  const handleCustomerLogin = () => {
    navigate("/auth");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce(
    (sum, t) => sum + (t.type === "credit" ? t.amount : 0),
    0
  );
  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  // StatsCard Component
  const StatsCard = ({ title, value, icon: Icon, trend, iconColor }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-1 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  // TransactionList Component
  const TransactionList = ({ transactions }) => (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === "credit"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.type.toUpperCase()}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : transaction.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.status.toUpperCase()}
                </span>
              </div>
              <p className="font-medium text-gray-900 mt-2">
                {transaction.description}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>{transaction.date}</span>
                <span>•</span>
                <span>{transaction.category}</span>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-semibold ${
                  transaction.type === "credit"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "credit" ? "+" : "-"}₹
                {transaction.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // FilterBar Component
  const FilterBar = ({ onSearch, onFilterType, onFilterStatus, onExport }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Search transactions..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button
          onClick={onExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">PigmyXpress</h1>
              <p className="text-blue-100 mt-1">
                Complete Savings & Payment Management System
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-blue-200">Welcome to</p>
                <p className="font-semibold text-white">Pigmy Savings</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCustomerLogin}
                  className="flex items-center text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors border border-white/30"
                >
                  <User className="mr-2 h-4 w-4" />
                  Customer Login
                </button>
                <button
                  onClick={handleAdminLogin}
                  className="flex items-center text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors border border-white/30"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to PigmyXpress</h2>
          <p className="text-lg text-green-100 mb-4">
            Your complete solution for pigmy savings management, transactions, and customer services.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold">For Customers</h3>
              <p className="text-sm">Login to manage your savings accounts</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold">For Admins</h3>
              <p className="text-sm">Manage customers, collectors, and transactions</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => navigate("/paymentpage")}
            className="flex flex-col items-center bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-md transition-colors"
          >
            <CreditCard className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm">Make Payment</span>
          </button>
          <button
            onClick={() => navigate("/accountspage")}
            className="flex flex-col items-center bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-md transition-colors"
          >
            <Wallet className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm">Accounts</span>
          </button>
          <button
            onClick={() => navigate("/withdrawal")}
            className="flex flex-col items-center bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-md transition-colors"
          >
            <ArrowDownToLine className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm">Withdrawal</span>
          </button>
          <button
            onClick={() => navigate("/feedback")}
            className="flex flex-col items-center bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-md transition-colors"
          >
            <MessageSquare className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm">Feedback</span>
          </button>
          <button
            onClick={handleCustomerLogin}
            className="flex flex-col items-center bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-md transition-colors"
          >
            <User className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm">Customer Portal</span>
          </button>
          <button
            onClick={handleAdminLogin}
            className="flex flex-col items-center bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-md transition-colors"
          >
            <Settings className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm">Admin Panel</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Transactions"
            value={totalTransactions.toString()}
            icon={ArrowUpDown}
            trend={{ value: "12%", isPositive: true }}
            iconColor="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Total Credits"
            value={`₹${totalAmount.toLocaleString("en-IN")}`}
            icon={DollarSign}
            trend={{ value: "8%", isPositive: true }}
            iconColor="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Pending Amount"
            value={`₹${pendingAmount.toLocaleString("en-IN")}`}
            icon={Clock}
            iconColor="bg-yellow-100 text-yellow-600"
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            onSearch={handleSearch}
            onFilterType={handleFilterType}
            onFilterStatus={handleFilterStatus}
            onExport={handleExport}
          />
        </div>

        {/* Transaction List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-500">
              Showing {filteredTransactions.length} of {totalTransactions}{" "}
              transactions
            </p>
          </div>
          <TransactionList transactions={filteredTransactions} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PigmyXpress</h3>
              <p className="text-gray-300">
                Complete savings management system for pigmy collections, 
                customer management, and financial tracking.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => navigate("/")} className="block text-gray-300 hover:text-white">Home</button>
                <button onClick={handleCustomerLogin} className="block text-gray-300 hover:text-white">Customer Login</button>
                <button onClick={handleAdminLogin} className="block text-gray-300 hover:text-white">Admin Login</button>
                <button onClick={() => navigate("/feedback")} className="block text-gray-300 hover:text-white">Feedback</button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">Email: support@pigmyxpress.com</p>
              <p className="text-gray-300">Phone: +91 9876543210</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; 2024 PigmyXpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PigmyXpressDashboard;