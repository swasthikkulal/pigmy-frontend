import { useState } from "react";
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const withdrawalRequests = [
  {
    id: "1",
    amount: 5000,
    date: "2025-01-15",
    status: "pending",
    account: "XXXX-1234",
  },
  {
    id: "2",
    amount: 10000,
    date: "2025-01-10",
    status: "approved",
    account: "XXXX-1234",
  },
  {
    id: "3",
    amount: 3000,
    date: "2025-01-05",
    status: "rejected",
    account: "XXXX-5678",
  },
];

const Withdrawal = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button and New Request Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Withdrawal Requests</h1>
          <p className="text-gray-500">
            Track and manage your withdrawal requests
          </p>
        </div>

        {/* Withdrawal Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Request Withdrawal</h2>
              <p className="text-gray-500">Submit a new withdrawal request</p>
            </div>
            <form className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="account"
                  className="block text-sm font-medium text-gray-700"
                >
                  Account
                </label>
                <input
                  id="account"
                  type="text"
                  placeholder="Select account"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount (₹)
                </label>
                <input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reason
                </label>
                <input
                  id="reason"
                  type="text"
                  placeholder="Purpose of withdrawal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Withdrawal Requests List */}
        <div className="space-y-4">
          {withdrawalRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">
                      ₹{request.amount.toLocaleString()}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Account: {request.account}
                  </p>
                  <p className="text-sm text-gray-500">Date: {request.date}</p>
                </div>
                <button className="text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
