import { Wallet, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const accounts = [
  {
    id: "1",
    accountNumber: "XXXX-XXXX-1234",
    type: "Savings",
    balance: 45000,
    status: "active",
  },
  {
    id: "2",
    accountNumber: "XXXX-XXXX-5678",
    type: "Pigmy Deposit",
    balance: 12500,
    status: "active",
  },
  {
    id: "3",
    accountNumber: "XXXX-XXXX-9012",
    type: "Fixed Deposit",
    balance: 100000,
    status: "locked",
  },
];

const AccountsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back and Add Account buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">My Accounts</h1>
          <p className="text-gray-600">Manage all your accounts in one place</p>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {account.type}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {account.accountNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {account.status}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{account.balance.toLocaleString()}
                    </p>
                  </div>
                  <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
