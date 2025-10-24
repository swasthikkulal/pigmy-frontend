import { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  ArrowLeft,
  QrCode,
  CreditCard,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAccountsByCustomer, getCustomerProfile } from "../services/api";

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [pendingPayments, setPendingPayments] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomPayment, setIsCustomPayment] = useState(false);

  useEffect(() => {
    loadCustomerAccounts();
  }, []);

  const loadCustomerAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch customer profile first to get customer ID
      const profileResponse = await getCustomerProfile();
      const customerData = profileResponse.data.data;
      setCustomer(customerData);

      // Fetch accounts for this specific customer
      const accountsResponse = await getAccountsByCustomer(customerData._id);
      const accountsData = accountsResponse.data.data || [];
      setAccounts(accountsData);

      // Calculate pending payments for each account
      calculatePendingPayments(accountsData);
    } catch (error) {
      console.error("Error loading customer accounts:", error);
      setError("Failed to load your accounts. Please try again.");
      // Fallback to mock data for demonstration
      const mockAccounts = getMockAccounts();
      setAccounts(mockAccounts);
      calculatePendingPayments(mockAccounts);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Calculate pending payments based on plan type and transaction history
  const calculatePendingPayments = (accountsData) => {
    const pending = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    accountsData.forEach((account) => {
      const planType = getPlanTypeFromAccount(account);
      const transactions = account.transactions || [];
      const openingDate = new Date(
        account.openingDate || account.startDate || account.createdAt
      );
      openingDate.setHours(0, 0, 0, 0); // Normalize to start of day

      let pendingAmount = 0;
      let pendingCount = 0;

      // Don't calculate pending payments for accounts created today
      if (openingDate.getTime() === today.getTime()) {
        pending[account._id] = {
          amount: 0,
          count: 0,
          hasPending: false,
        };
        return;
      }

      if (planType === "daily") {
        // For daily plans, check each day from opening date to today
        const checkDate = new Date(openingDate);
        
        while (checkDate < today) {
          const dateString = checkDate.toDateString();
          
          // Check if there's a transaction for this specific date
          const hasTransactionForDate = transactions.some((transaction) => {
            const transactionDate = new Date(transaction.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate.getTime() === checkDate.getTime();
          });

          if (!hasTransactionForDate) {
            pendingAmount += account.dailyAmount || 0;
            pendingCount += 1;
          }

          // Move to next day
          checkDate.setDate(checkDate.getDate() + 1);
        }

      } else if (planType === "weekly") {
        // For weekly plans, check each week from opening date to current week
        const checkDate = new Date(openingDate);
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Start of current week (Sunday)

        while (checkDate < currentWeekStart) {
          const weekStart = new Date(checkDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Saturday)

          // Check if there's any transaction in this week
          const hasTransactionInWeek = transactions.some((transaction) => {
            const transactionDate = new Date(transaction.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate >= weekStart && transactionDate <= weekEnd;
          });

          if (!hasTransactionInWeek) {
            pendingAmount += account.dailyAmount || 0;
            pendingCount += 1;
          }

          // Move to next week
          checkDate.setDate(checkDate.getDate() + 7);
        }

        // Also check current week if account was opened before current week
        if (openingDate < currentWeekStart) {
          const hasTransactionInCurrentWeek = transactions.some((transaction) => {
            const transactionDate = new Date(transaction.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate >= currentWeekStart && transactionDate <= today;
          });

          if (!hasTransactionInCurrentWeek) {
            pendingAmount += account.dailyAmount || 0;
            pendingCount += 1;
          }
        }

      } else if (planType === "monthly") {
        // For monthly plans, check each month from opening date to current month
        const checkDate = new Date(openingDate);
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        while (checkDate < currentMonthStart) {
          const monthStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), 1);
          const monthEnd = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);

          // Check if there's any transaction in this month
          const hasTransactionInMonth = transactions.some((transaction) => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= monthStart && transactionDate <= monthEnd;
          });

          if (!hasTransactionInMonth) {
            pendingAmount += account.dailyAmount || 0;
            pendingCount += 1;
          }

          // Move to next month
          checkDate.setMonth(checkDate.getMonth() + 1);
        }

        // Also check current month if account was opened before current month
        if (openingDate < currentMonthStart) {
          const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          currentMonthEnd.setHours(23, 59, 59, 999);

          const hasTransactionInCurrentMonth = transactions.some((transaction) => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
          });

          if (!hasTransactionInCurrentMonth) {
            pendingAmount += account.dailyAmount || 0;
            pendingCount += 1;
          }
        }
      }

      pending[account._id] = {
        amount: pendingAmount,
        count: pendingCount,
        hasPending: pendingAmount > 0,
      };
    });

    setPendingPayments(pending);
  };

  // Helper functions for account objects
  const getPlanTypeFromAccount = (account) => {
    if (!account) return "monthly";

    // Use accountType from your schema
    if (account.accountType) return account.accountType;
    if (account.planId?.type) return account.planId.type;

    // Check plan name for keywords
    const planName =
      account.planId?.name?.toLowerCase() ||
      account.planName?.toLowerCase() ||
      "";
    if (planName.includes("weekly")) return "weekly";
    if (planName.includes("daily")) return "daily";
    if (planName.includes("monthly")) return "monthly";

    // Default fallback
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

  // Mock data fallback - remove this in production
  const getMockAccounts = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);

    return [
      {
        _id: "1",
        accountNumber: "ACC-001-2024",
        accountId: "ACC-001-2024",
        type: "Savings Account",
        accountType: "monthly",
        totalBalance: 45000,
        status: "active",
        planId: {
          name: "Basic Savings Plan",
          interestRate: 3.5,
          duration: 12,
          type: "monthly",
        },
        openingDate: "2024-01-15",
        customerId: {
          name: customer?.name || "Current Customer",
          customerId: customer?.customerId || "CUST001",
        },
        collectorId: {
          name: "Ramesh Kumar",
          area: "Bangalore South",
          phone: "9876543210",
        },
        dailyAmount: 100,
        maturityDate: "2025-01-15",
        transactions: [
          {
            date: "2024-10-20",
            amount: 100,
            type: "deposit",
          },
        ],
      },
      {
        _id: "2",
        accountNumber: "PIGMY-002-2024",
        accountId: "PIGMY-002-2024",
        type: "Pigmy Deposit",
        accountType: "weekly",
        totalBalance: 12500,
        status: "active",
        planId: {
          name: "Weekly Deposit Plan",
          interestRate: 6.2,
          duration: 4,
          type: "weekly",
        },
        openingDate: twoWeeksAgo.toISOString().split('T')[0], // Account opened 2 weeks ago
        customerId: {
          name: customer?.name || "Current Customer",
          customerId: customer?.customerId || "CUST001",
        },
        collectorId: {
          name: "Suresh Patel",
          area: "Mumbai Central",
          phone: "9876543211",
        },
        dailyAmount: 500,
        maturityDate: "2024-03-01",
        transactions: [
          {
            date: oneWeekAgo.toISOString().split('T')[0], // Only one payment 1 week ago
            amount: 500,
            type: "deposit",
          },
        ],
      },
      {
        _id: "3",
        accountNumber: "DAILY-003-2024",
        accountId: "DAILY-003-2024",
        type: "Daily Deposit",
        accountType: "daily",
        totalBalance: 7500,
        status: "active",
        planId: {
          name: "Daily Savings",
          interestRate: 5.0,
          duration: 30,
          type: "daily",
        },
        openingDate: "2024-10-20", // Account opened 4 days ago
        customerId: {
          name: customer?.name || "Current Customer",
          customerId: customer?.customerId || "CUST001",
        },
        collectorId: {
          name: "Priya Sharma",
          area: "Delhi North",
          phone: "9876543212",
        },
        dailyAmount: 50,
        maturityDate: "2024-03-31",
        transactions: [
          {
            date: "2024-10-21", // Only one payment 3 days ago
            amount: 50,
            type: "deposit",
          },
        ],
      },
    ];
  };

  const generateReferenceNumber = () => {
    return "REF-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Mock function to simulate fetching payment history
  const loadPaymentHistory = async (accountId) => {
    // In real implementation, you would fetch this from your API
    const mockPayments = [
      {
        _id: "1",
        accountId: accountId,
        amount: 100,
        paymentMethod: "cash",
        status: "completed",
        referenceNumber: "REF-ABC123",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        verifiedBy: "Ramesh Kumar",
        verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: "deposit"
      },
      {
        _id: "2",
        accountId: accountId,
        amount: 100,
        paymentMethod: "cash",
        status: "pending",
        referenceNumber: "REF-XYZ789",
        date: new Date().toISOString(),
        verifiedBy: null,
        verifiedAt: null,
        type: "deposit"
      },
      {
        _id: "3",
        accountId: accountId,
        amount: 500,
        paymentMethod: "online",
        status: "completed",
        referenceNumber: "REF-ONLINE123",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        verifiedBy: "System",
        verifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: "deposit"
      }
    ];
    setPaymentHistory(mockPayments);
  };

  const handlePayment = (account) => {
    const pending = pendingPayments[account._id];
    const planType = getPlanTypeFromAccount(account);

    if (pending && pending.hasPending) {
      const confirmMessage = `You have ${
        pending.count
      } pending ${planType} payment${pending.count > 1 ? "s" : ""} totaling ₹${
        pending.amount
      }. Do you want to pay the pending amount of ₹${
        pending.amount
      } instead of the regular ${planType} amount of ₹${account.dailyAmount}?`;

      if (window.confirm(confirmMessage)) {
        // User wants to pay pending amount
        setSelectedAccount({
          ...account,
          pendingAmount: pending.amount,
          isPendingPayment: true,
        });
      } else {
        // User wants to pay regular amount
        setSelectedAccount(account);
      }
    } else {
      // No pending payments, proceed with regular amount
      setSelectedAccount(account);
    }

    setReferenceNumber(generateReferenceNumber());
    setCustomAmount("");
    setIsCustomPayment(false);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      // Validate reference number for online payments
      if (paymentMethod === "online" && !referenceNumber.trim()) {
        alert("Please enter a reference number for online payment");
        return;
      }

      let paymentAmount;
      let isPartialPayment = false;
      let remainingPendingAmount = 0;

      if (isCustomPayment && customAmount) {
        // Validate custom amount
        const minAmount = selectedAccount.dailyAmount || 0;
        const maxAmount = selectedAccount.pendingAmount || selectedAccount.dailyAmount || 0;
        
        if (parseFloat(customAmount) < minAmount) {
          alert(`Minimum payment amount is ₹${minAmount}`);
          return;
        }

        if (parseFloat(customAmount) > maxAmount) {
          alert(`Payment amount cannot exceed pending amount of ₹${maxAmount}`);
          return;
        }

        paymentAmount = parseFloat(customAmount);
        isPartialPayment = paymentAmount < maxAmount;
        remainingPendingAmount = maxAmount - paymentAmount;
      } else {
        paymentAmount = selectedAccount.pendingAmount || selectedAccount.dailyAmount || 0;
      }

      const isPendingPayment = selectedAccount.isPendingPayment;

      // Determine payment status based on payment method
      const paymentStatus = paymentMethod === "cash" ? "pending" : "completed";

      // Simulate payment processing
      console.log(
        "Processing payment for account:",
        selectedAccount.accountNumber
      );
      console.log("Payment method:", paymentMethod);
      console.log("Reference:", referenceNumber);
      console.log("Amount:", paymentAmount);
      console.log("Is pending payment:", isPendingPayment);
      console.log("Payment status:", paymentStatus);
      console.log("Is partial payment:", isPartialPayment);
      console.log("Remaining pending amount:", remainingPendingAmount);

      // In real implementation, call your payment API here
      // This would be something like:
      // await processPaymentAPI({
      //   accountId: selectedAccount._id,
      //   amount: paymentAmount,
      //   paymentMethod,
      //   referenceNumber,
      //   status: paymentStatus,
      //   isPendingPayment,
      //   isPartialPayment,
      //   remainingPendingAmount
      // });

      let alertMessage = "";
      if (paymentMethod === "cash") {
        if (isPartialPayment) {
          alertMessage = `Partial cash payment recorded as PENDING!\nReference: ${referenceNumber}\nAmount Paid: ₹${paymentAmount}\nRemaining Pending: ₹${remainingPendingAmount}\nStatus: ${paymentStatus}\n\nOur collector will verify and mark this payment as completed.`;
        } else {
          alertMessage = `Cash payment recorded as PENDING!\nReference: ${referenceNumber}\nAmount: ₹${paymentAmount}\nStatus: ${paymentStatus}\n\nOur collector will verify and mark this payment as completed.`;
        }
      } else {
        if (isPartialPayment) {
          alertMessage = `Partial online payment completed successfully!\nReference: ${referenceNumber}\nAmount Paid: ₹${paymentAmount}\nRemaining Pending: ₹${remainingPendingAmount}\nStatus: ${paymentStatus}`;
        } else {
          alertMessage = `Online payment completed successfully!\nReference: ${referenceNumber}\nAmount: ₹${paymentAmount}\nStatus: ${paymentStatus}`;
        }
      }

      alert(alertMessage);

      setShowPaymentModal(false);
      setSelectedAccount(null);
      setReferenceNumber("");
      setCustomAmount("");
      setIsCustomPayment(false);

      // Reload accounts to reflect updated balance (if payment is completed)
      if (paymentStatus === "completed") {
        loadCustomerAccounts();
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  const handleViewPaymentHistory = (account) => {
    loadPaymentHistory(account._id);
    setSelectedAccount(account);
    setShowHistoryModal(true);
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleLoginRedirect = () => {
    navigate("/auth");
  };

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "savings":
        return "bg-blue-100 text-blue-800";
      case "pigmy":
        return "bg-green-100 text-green-800";
      case "fixed deposit":
        return "bg-purple-100 text-purple-800";
      case "daily deposit":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccountTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "savings":
        return <Wallet className="h-5 w-5" />;
      case "pigmy":
        return <TrendingUp className="h-5 w-5" />;
      case "fixed deposit":
        return <Calendar className="h-5 w-5" />;
      case "daily deposit":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const calculateProgress = (balance, targetAmount) => {
    if (!targetAmount || targetAmount === 0) return 0;
    return Math.min((balance / targetAmount) * 100, 100);
  };

  const PaymentModal = () => {
    if (!showPaymentModal) return null;

    const amountLabel = selectedAccount
      ? getAmountLabelFromAccount(selectedAccount)
      : "day";
    const regularAmount = selectedAccount?.dailyAmount || 0;
    const pendingAmount = selectedAccount?.pendingAmount || regularAmount;
    const isPendingPayment = selectedAccount?.isPendingPayment;
    const minAmount = regularAmount;
    const maxAmount = pendingAmount;

    const calculatedPaymentAmount = isCustomPayment && customAmount ? parseFloat(customAmount) : pendingAmount;
    const remainingAmount = isCustomPayment && customAmount ? maxAmount - parseFloat(customAmount) : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xl font-bold">
              {isPendingPayment ? "Pay Pending Amount" : "Make Payment"}
            </h3>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Account</p>
                <p className="font-semibold">
                  {selectedAccount?.accountNumber} - {selectedAccount?.type}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isPendingPayment
                    ? "Pending Amount"
                    : amountLabel === "week"
                    ? "Weekly Amount"
                    : "Daily Amount"}
                  :<span className="font-semibold"> ₹{pendingAmount}</span>
                </p>
                {isPendingPayment && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        This includes{" "}
                        {pendingPayments[selectedAccount?._id]?.count || 0}{" "}
                        pending {getPlanTypeFromAccount(selectedAccount)} payment
                        {pendingPayments[selectedAccount?._id]?.count > 1
                          ? "s"
                          : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Amount Selection */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Amount</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsCustomPayment(false);
                        setCustomAmount("");
                      }}
                      className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                        !isCustomPayment
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Full Amount (₹{pendingAmount})
                    </button>
                    <button
                      onClick={() => setIsCustomPayment(true)}
                      className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                        isCustomPayment
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Custom Amount
                    </button>
                  </div>

                  {isCustomPayment && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enter Amount (₹{minAmount} - ₹{maxAmount})
                        </label>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          min={minAmount}
                          max={maxAmount}
                          placeholder={`Enter amount between ₹${minAmount} - ₹${maxAmount}`}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum: ₹{minAmount} • Maximum: ₹{maxAmount}
                        </p>
                      </div>

                      {customAmount && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-600">Amount to Pay</p>
                              <p className="font-semibold text-green-600">
                                ₹{calculatedPaymentAmount}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Remaining Pending</p>
                              <p className="font-semibold text-orange-600">
                                ₹{remainingAmount}
                              </p>
                            </div>
                          </div>
                          {remainingAmount > 0 && (
                            <p className="text-xs text-blue-700 mt-2">
                              The remaining ₹{remainingAmount} will stay as pending payment.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                      paymentMethod === "cash"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                      paymentMethod === "online"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Online
                  </button>
                </div>
              </div>

              {paymentMethod === "online" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Scan QR Code to Pay
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg inline-block">
                      <QrCode className="h-24 w-24 mx-auto text-gray-600" />
                    </div>
                  </div>

                  {/* Reference Number Input for Online Payment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Enter UTR/Transaction ID"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <button
                        onClick={() =>
                          setReferenceNumber(generateReferenceNumber())
                        }
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300 whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the UTR number or transaction ID from your bank
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Payment Instructions:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 list-disc list-inside space-y-1">
                      <li>Scan the QR code above to make payment</li>
                      <li>
                        Enter the UTR/Reference number provided by your bank
                      </li>
                      <li>Payment will be verified automatically</li>
                      <li>Keep the transaction receipt for reference</li>
                    </ul>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-semibold">
                        Cash Payment - Status: PENDING
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {isCustomPayment && customAmount ? (
                          <>Please hand over ₹{calculatedPaymentAmount} to our collector. ₹{remainingAmount} will remain as pending.</>
                        ) : (
                          <>Please hand over ₹{calculatedPaymentAmount} to our collector.</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-yellow-600 mt-2 space-y-1">
                    <p className="font-mono">Reference: {referenceNumber}</p>
                    {selectedAccount?.collectorId && (
                      <>
                        <p>Collector: {selectedAccount.collectorId.name}</p>
                        <p>Area: {selectedAccount.collectorId.area}</p>
                        <p>Phone: {selectedAccount.collectorId.phone}</p>
                      </>
                    )}
                  </div>
                  <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> This payment will appear as "Pending" until verified by the collector.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setReferenceNumber("");
                  setCustomAmount("");
                  setIsCustomPayment(false);
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                disabled={
                  (paymentMethod === "online" && !referenceNumber.trim()) ||
                  (isCustomPayment && (!customAmount || parseFloat(customAmount) < minAmount || parseFloat(customAmount) > maxAmount))
                }
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium ${
                  (paymentMethod === "online" && !referenceNumber.trim()) ||
                  (isCustomPayment && (!customAmount || parseFloat(customAmount) < minAmount || parseFloat(customAmount) > maxAmount))
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isPendingPayment 
                  ? (isCustomPayment && customAmount ? "Pay Partial Amount" : "Pay Pending Amount")
                  : "Confirm Payment"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentHistoryModal = () => {
    if (!showHistoryModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Payment History</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              {selectedAccount?.accountNumber} - {selectedAccount?.type}
            </p>
          </div>
          
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-6">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment history found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(
                              payment.status
                            )}`}
                          >
                            {getPaymentStatusIcon(payment.status)}
                            {payment.status.toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{payment.amount}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Reference</p>
                          <p className="font-mono text-gray-900">
                            {payment.referenceNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Method</p>
                          <p className="capitalize text-gray-900">
                            {payment.paymentMethod}
                          </p>
                        </div>
                      </div>
                      
                      {payment.verifiedBy && (
                        <div className="mt-2 text-xs text-gray-500">
                          Verified by {payment.verifiedBy} on{" "}
                          {new Date(payment.verifiedAt).toLocaleDateString()}
                        </div>
                      )}
                      
                      {payment.status === "pending" && (
                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                          <p className="text-xs text-yellow-800">
                            Awaiting verification by collector
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
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
            onClick={() => navigate("/")}
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
          <p className="text-gray-600">
            Manage all accounts created for you by admin
          </p>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
            <p className="text-yellow-700 text-sm mt-1">Showing demo data</p>
          </div>
        )}

        {/* Accounts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const amountLabel = getAmountLabelFromAccount(account);
            const durationDisplay = getDurationDisplayFromAccount(account);
            const pending = pendingPayments[account._id];

            return (
              <div
                key={account._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 relative"
              >
                {/* Pending Payment Badge */}
                {pending?.hasPending && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {pending.count} Pending
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${getAccountTypeColor(
                          account.type
                        )}`}
                      >
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

                  {/* Pending Payment Warning */}
                  {pending?.hasPending && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-sm text-red-800">
                          {pending.count} pending{" "}
                          {getPlanTypeFromAccount(account)} payment
                          {pending.count > 1 ? "s" : ""} - ₹{pending.amount}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar (if target amount exists) */}
                  {account.targetAmount && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {calculateProgress(
                            account.totalBalance,
                            account.targetAmount
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${calculateProgress(
                              account.totalBalance,
                              account.targetAmount
                            )}%`,
                          }}
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
                          ₹{account.totalBalance?.toLocaleString() || "0"}
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
                          {account.planId?.interestRate ||
                            account.interestRate ||
                            "N/A"}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {amountLabel === "week"
                            ? "Weekly Amount"
                            : "Daily Amount"}
                        </p>
                        <p className="font-semibold">
                          ₹{account.dailyAmount || "0"}/{amountLabel}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {durationDisplay}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Maturity Date</p>
                        <p className="font-semibold text-gray-900">
                          {account.maturityDate
                            ? new Date(
                                account.maturityDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {account.collectorId && (
                      <div className="text-sm">
                        <p className="text-gray-600">Collector</p>
                        <p className="font-semibold">
                          {account.collectorId.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {account.collectorId.area} •{" "}
                          {account.collectorId.phone}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewPaymentHistory(account)}
                        className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md transition-colors text-sm"
                      >
                        View History
                      </button>
                      {account.status === "active" &&
                        account.dailyAmount > 0 && (
                          <button
                            onClick={() => handlePayment(account)}
                            className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm ${
                              pending?.hasPending
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {pending?.hasPending
                              ? "Pay Pending"
                              : "Make Payment"}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {accounts.length === 0 && !error && (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No accounts found
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have any accounts yet. Contact admin to create an
              account for you.
            </p>
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
      
      {/* Payment History Modal */}
      <PaymentHistoryModal />
    </div>
  );
};

export default AccountsPage;