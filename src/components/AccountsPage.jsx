import { useState, useEffect } from "react";
import { Wallet, Plus, ArrowLeft, QrCode, CreditCard, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAccountsByCustomer, getCustomerProfile } from "../services/api";

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');

  useEffect(() => {
    loadCustomerAccounts();
  }, []);

  const loadCustomerAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch customer profile first to get customer ID
      const profileResponse = await getCustomerProfile();
      const customerData = profileResponse.data.data;
      setCustomer(customerData);

      // Fetch accounts for this specific customer
      const accountsResponse = await getAccountsByCustomer(customerData._id);
      setAccounts(accountsResponse.data.data || []);
      
    } catch (error) {
      console.error('Error loading customer accounts:', error);
      setError('Failed to load your accounts. Please try again.');
      // Fallback to mock data for demonstration
      setAccounts(getMockAccounts());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback - remove this in production
  const getMockAccounts = () => {
    return [
      {
        _id: "1",
        accountNumber: "ACC-001-2024",
        accountId: "ACC-001-2024",
        type: "Savings Account",
        totalBalance: 45000,
        status: "active",
        planId: {
          name: "Basic Savings Plan",
          interestRate: 3.5,
          duration: 12
        },
        openingDate: "2024-01-15",
        customerId: {
          name: customer?.name || "Current Customer",
          customerId: customer?.customerId || "CUST001"
        },
        collectorId: {
          name: "Ramesh Kumar",
          area: "Bangalore South",
          phone: "9876543210"
        },
        dailyAmount: 100,
        maturityDate: "2025-01-15",
        transactions: []
      },
      {
        _id: "2",
        accountNumber: "PIGMY-002-2024",
        accountId: "PIGMY-002-2024",
        type: "Pigmy Deposit",
        totalBalance: 12500,
        status: "active",
        planId: {
          name: "Daily Deposit Plan",
          interestRate: 6.2,
          duration: 6
        },
        openingDate: "2024-02-01",
        customerId: {
          name: customer?.name || "Current Customer",
          customerId: customer?.customerId || "CUST001"
        },
        collectorId: {
          name: "Suresh Patel",
          area: "Mumbai Central",
          phone: "9876543211"
        },
        dailyAmount: 50,
        maturityDate: "2024-08-01",
        transactions: []
      }
    ];
  };

  const generateReferenceNumber = () => {
    return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handlePayment = (account) => {
    setSelectedAccount(account);
    setReferenceNumber(generateReferenceNumber());
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      // Simulate payment processing
      console.log('Processing payment for account:', selectedAccount.accountNumber);
      console.log('Payment method:', paymentMethod);
      console.log('Reference:', referenceNumber);
      
      // In real implementation, call your payment API here
      alert(`Payment initiated successfully!\nReference: ${referenceNumber}\nAmount: ₹${selectedAccount.dailyAmount || 0}`);
      setShowPaymentModal(false);
      setSelectedAccount(null);
      
      // Reload accounts to reflect updated balance
      loadCustomerAccounts();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/auth');
  };

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'savings': return 'bg-blue-100 text-blue-800';
      case 'pigmy': return 'bg-green-100 text-green-800';
      case 'fixed deposit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'savings': return <Wallet className="h-5 w-5" />;
      case 'pigmy': return <TrendingUp className="h-5 w-5" />;
      case 'fixed deposit': return <Calendar className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const calculateProgress = (balance, targetAmount) => {
    if (!targetAmount || targetAmount === 0) return 0;
    return Math.min((balance / targetAmount) * 100, 100);
  };

  const PaymentModal = () => {
    if (!showPaymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Make Payment</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Account</p>
              <p className="font-semibold">{selectedAccount?.accountNumber} - {selectedAccount?.type}</p>
              <p className="text-sm text-gray-600 mt-1">
                Amount: <span className="font-semibold">₹{selectedAccount?.dailyAmount || 0}</span>
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Payment Method</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-lg ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-lg ${
                    paymentMethod === 'online' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Online
                </button>
              </div>
            </div>

            {paymentMethod === 'online' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Scan QR Code to Pay</p>
                <div className="bg-gray-100 p-4 rounded-lg inline-block">
                  <QrCode className="h-32 w-32 mx-auto text-gray-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Reference: <span className="font-mono">{referenceNumber}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Amount: <span className="font-semibold">₹{selectedAccount?.dailyAmount || 0}</span>
                </p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Please hand over ₹{selectedAccount?.dailyAmount || 0} to our collector. 
                  They will provide you with a receipt.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Reference: <span className="font-mono">{referenceNumber}</span>
                </p>
                {selectedAccount?.collectorId && (
                  <div className="mt-2 text-xs text-yellow-700">
                    <p>Collector: {selectedAccount.collectorId.name}</p>
                    <p>Area: {selectedAccount.collectorId.area}</p>
                    <p>Phone: {selectedAccount.collectorId.phone}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleLoginRedirect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            {customer && (
              <span className="text-sm text-gray-600">
                Welcome, {customer.name} ({customer.customerId})
              </span>
            )}
          </div>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">My Accounts</h1>
          <p className="text-gray-600">Manage all accounts created for you by admin</p>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
            <p className="text-yellow-700 text-sm mt-1">Showing demo data</p>
          </div>
        )}

        {/* Accounts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getAccountTypeColor(account.type)}`}>
                      {getAccountTypeIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {account.type}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {account.accountNumber}
                      </p>
                      {account.planId && (
                        <p className="text-xs text-gray-500">
                          Plan: {account.planId.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.status === "active"
                        ? "bg-green-100 text-green-800"
                        : account.status === "closed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {account.status}
                  </span>
                </div>

                {/* Progress Bar (if target amount exists) */}
                {account.targetAmount && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{calculateProgress(account.totalBalance, account.targetAmount).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(account.totalBalance, account.targetAmount)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Balance</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹{account.totalBalance?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Account Type</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {account.type}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Interest Rate</p>
                      <p className="font-semibold text-green-600">
                        {account.planId?.interestRate || account.interestRate || 'N/A'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Daily Amount</p>
                      <p className="font-semibold">₹{account.dailyAmount || '0'}</p>
                    </div>
                  </div>

                  {account.collectorId && (
                    <div className="text-sm">
                      <p className="text-gray-600">Collector</p>
                      <p className="font-semibold">{account.collectorId.name}</p>
                      <p className="text-gray-500 text-xs">{account.collectorId.area} • {account.collectorId.phone}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md transition-colors text-sm">
                      View Details
                    </button>
                    {account.status === "active" && account.dailyAmount > 0 && (
                      <button 
                        onClick={() => handlePayment(account)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors text-sm"
                      >
                        Make Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {accounts.length === 0 && !error && (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-600 mb-4">You don't have any accounts yet. Contact admin to create an account for you.</p>
            <button 
              onClick={() => navigate("/customer/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal />
    </div>
  );
};

export default AccountsPage;