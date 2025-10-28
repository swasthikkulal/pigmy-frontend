import { useState, useEffect } from "react";
import {
  Wallet,
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
  Target,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAccountsByCustomer,
  getCustomerProfile,
  getPaymentHistory,
  processPayment,
} from "../services/api";

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
  const [processingPayment, setProcessingPayment] = useState(false);
  const [coveredPeriodsMap, setCoveredPeriodsMap] = useState({});
  const [paidPeriodsMap, setPaidPeriodsMap] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadCustomerAccounts();
    const storedPaidPeriods = JSON.parse(
      localStorage.getItem("paidPeriods") || "{}"
    );
    setPaidPeriodsMap(storedPaidPeriods);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadCustomerAccounts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // const loadCustomerAccounts = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     const profileResponse = await getCustomerProfile();
  //     const customerData = profileResponse.data.data;
  //     setCustomer(customerData);

  //     const accountsResponse = await getAccountsByCustomer(customerData._id);
  //     const accountsData = accountsResponse.data.data || [];

  //     // Calculate current balance for each account
  //     const updatedAccounts = accountsData.map((account) => {
  //       const currentBalance = calculateCurrentBalance(account);
  //       return {
  //         ...account,
  //         currentBalance,
  //       };
  //     });

  //     setAccounts(updatedAccounts);
  //     calculatePendingPayments(updatedAccounts);
  //     setLastUpdated(new Date());
  //   } catch (error) {
  //     console.error("Error loading customer accounts:", error);
  //     setError("Failed to load your accounts. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // FIXED: Calculate current balance including completed cash payments
//   const loadCustomerAccounts = async () => {
//   try {
//     setLoading(true);
//     setError("");

//     console.log('🔑 Customer token before API calls:', localStorage.getItem('customerToken'));

//     // Test each API call individually
//     try {
//       console.log('1. 📋 Fetching customer profile...');
//       const profileResponse = await getCustomerProfile();
//       console.log('✅ Profile fetched successfully');
//       const customerData = profileResponse.data.data;
//       console.log(customerData, "customerdata")
//       setCustomer(customerData);
//     } catch (profileError) {
//       console.log('❌ Profile fetch failed:', profileError.response?.status, profileError.response?.data);
//       throw profileError;
//     }

//     try {
//       console.log('2. 📊 Fetching customer accounts...');
//       const accountsResponse = await getAccountsByCustomer(customerData._id);
//       console.log('✅ Accounts fetched successfully');
//       const accountsData = accountsResponse.data.data || [];

//       // Calculate current balance for each account
//       const updatedAccounts = accountsData.map((account) => {
//         const currentBalance = calculateCurrentBalance(account);
//         return {
//           ...account,
//           currentBalance,
//         };
//       });

//       setAccounts(updatedAccounts);
//       calculatePendingPayments(updatedAccounts);
//       setLastUpdated(new Date());
//     } catch (accountsError) {
//       console.log('❌ Accounts fetch failed:', accountsError.response?.status, accountsError.response?.data);
//       throw accountsError;
//     }

//     console.log('🔑 Customer token after API calls:', localStorage.getItem('customerToken'));

//   } catch (error) {
//     console.error("Error loading customer accounts:", error);
//     console.log('🔑 Customer token after error:', localStorage.getItem('customerToken'));
//     setError("Failed to load your accounts. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// };
const loadCustomerAccounts = async () => {
  try {
    setLoading(true);
    setError("");

    console.log('🔑 STEP 1: Checking localStorage...');
    const customerToken = localStorage.getItem('customerToken');
    console.log('📦 Customer token:', customerToken ? 'EXISTS' : 'MISSING');

    if (!customerToken) {
      setError("Please login first");
      return;
    }

    console.log('🔑 STEP 2: Fetching customer profile...');
    const profileResponse = await getCustomerProfile();
    console.log('✅ Profile response:', profileResponse.data);
    
    // ✅ FIX: Store the customer data in a variable
    const customerData = profileResponse.data.data;
    setCustomer(customerData);
    console.log('👤 Customer ID:', customerData._id);

    console.log('🔑 STEP 3: Fetching customer accounts...');
    // ✅ FIX: Now customerData is defined and accessible
    const accountsResponse = await getAccountsByCustomer(customerData._id);
    console.log('✅ Accounts response:', accountsResponse.data);
    
    const accountsData = accountsResponse.data.data || [];
    console.log('📊 Accounts found:', accountsData.length);

    const updatedAccounts = accountsData.map((account) => {
      const currentBalance = calculateCurrentBalance(account);
      return {
        ...account,
        currentBalance,
      };
    });

    setAccounts(updatedAccounts);
    calculatePendingPayments(updatedAccounts);
    setLastUpdated(new Date());

  } catch (error) {
    console.error("💥 Error loading customer accounts:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    setError("Failed to load your accounts. Please try again.");
  } finally {
    setLoading(false);
  }
};
  
  const calculateCurrentBalance = (account) => {
    if (!account.transactions || account.transactions.length === 0) {
      return account.totalBalance || 0;
    }

    // Sum ALL completed transactions (both online and verified cash payments)
    const totalAmount = account.transactions.reduce((sum, transaction) => {
      // Include both completed online payments AND completed cash payments
      if (
        transaction.status === "completed" ||
        transaction.status === "verified"
      ) {
        return sum + (transaction.amount || 0);
      }
      return sum;
    }, 0);

    return totalAmount;
  };

  // Calculate maturity amount with interest
  const calculateMaturityAmount = (account) => {
    const dailyAmount = account.dailyAmount || 0;
    const duration = account.duration || account.planId?.duration || 0;
    const interestRate =
      account.planId?.interestRate || account.interestRate || 0;

    const totalPrincipal = dailyAmount * duration;
    const interestAmount = (totalPrincipal * interestRate) / 100;
    const maturityAmount = totalPrincipal + interestAmount;

    return {
      principalAmount: totalPrincipal,
      interestAmount,
      maturityAmount: Math.round(maturityAmount),
      interestRate,
    };
  };

  // Enhanced pending payment calculation
  const calculatePendingPayments = (accountsData) => {
    const pending = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const storedPaidPeriods = JSON.parse(
      localStorage.getItem("paidPeriods") || "{}"
    );

    accountsData.forEach((account) => {
      const accountPaidPeriods = storedPaidPeriods[account._id] || [];
      const paidPeriodIds = new Set(accountPaidPeriods.map((p) => p.periodId));

      const planType = getPlanTypeFromAccount(account);
      const transactions = account.transactions || [];
      const openingDate = new Date(account.openingDate);
      openingDate.setHours(0, 0, 0, 0);

      const dailyAmount = account.dailyAmount || 0;
      const duration = account.duration || account.planId?.duration || 0;

      const maturityCalculation = calculateMaturityAmount(account);
      const maturityAmount = maturityCalculation.maturityAmount;
      const principalAmount = maturityCalculation.principalAmount;
      const interestAmount = maturityCalculation.interestAmount;

      let pendingAmount = 0;
      let pendingCount = 0;
      let totalPaidAmount = 0;
      let remainingMaturityAmount = maturityAmount;
      const missedPeriods = [];

      // Calculate total paid amount (including completed cash payments)
      transactions.forEach((transaction) => {
        if (
          transaction.status === "completed" ||
          transaction.status === "verified"
        ) {
          totalPaidAmount += transaction.amount || 0;
        }
      });

      remainingMaturityAmount = Math.max(0, maturityAmount - totalPaidAmount);

      // If maturity reached, no pending payments
      if (totalPaidAmount >= maturityAmount) {
        pending[account._id] = {
          amount: 0,
          count: 0,
          hasPending: false,
          maturityAmount,
          principalAmount,
          interestAmount,
          totalPaidAmount,
          remainingMaturityAmount: 0,
          isMaturityReached: true,
          missedPeriods: [],
          pendingDays: 0,
          maturityCalculation,
        };
        return;
      }

      // Calculate pending periods based on plan type
      if (planType === "daily") {
        const checkDate = new Date(openingDate);
        let dayCount = 0;
        const processedDates = new Set();

        while (checkDate <= today && dayCount < duration) {
          const dateKey = checkDate.toISOString().split("T")[0];
          const periodId = `day-${dateKey}`;

          if (processedDates.has(dateKey)) {
            checkDate.setDate(checkDate.getDate() + 1);
            dayCount++;
            continue;
          }

          processedDates.add(dateKey);

          const hasTransactionForDate = transactions.some((transaction) => {
            if (!transaction.date) return false;
            const transactionDate = new Date(transaction.date);
            const transactionDateKey = transactionDate
              .toISOString()
              .split("T")[0];
            return (
              transactionDateKey === dateKey &&
              (transaction.status === "completed" ||
                transaction.status === "verified")
            );
          });

          const isPeriodPaid = paidPeriodIds.has(periodId);

          if (!hasTransactionForDate && !isPeriodPaid) {
            const potentialPendingAmount = pendingAmount + dailyAmount;
            if (potentialPendingAmount <= remainingMaturityAmount) {
              pendingAmount += dailyAmount;
              pendingCount += 1;
              missedPeriods.push({
                date: new Date(checkDate),
                amount: dailyAmount,
                type: "day",
                periodId: periodId,
              });
            }
          }

          checkDate.setDate(checkDate.getDate() + 1);
          dayCount++;
        }
      }

      const pendingDays = calculatePendingDays(
        account,
        remainingMaturityAmount
      );

      pending[account._id] = {
        amount: pendingAmount,
        count: pendingCount,
        hasPending: pendingAmount > 0,
        maturityAmount,
        principalAmount,
        interestAmount,
        totalPaidAmount,
        remainingMaturityAmount,
        isMaturityReached: totalPaidAmount >= maturityAmount,
        missedPeriods,
        pendingDays,
        maturityCalculation,
      };
    });

    setPendingPayments(pending);
  };

  const calculatePendingDays = (account, remainingMaturityAmount) => {
    const dailyAmount = account.dailyAmount || 0;
    if (dailyAmount <= 0) return 0;
    return Math.ceil(remainingMaturityAmount / dailyAmount);
  };

  const getPendingTimeDisplay = (account, pending) => {
    if (!pending) return "";
    const planType = getPlanTypeFromAccount(account);
    const pendingDays = pending.pendingDays || 0;

    switch (planType) {
      case "daily":
        return `${pendingDays} day${pendingDays > 1 ? "s" : ""}`;
      case "weekly":
        const weeks = Math.ceil(pendingDays / 7);
        return `${weeks} week${weeks > 1 ? "s" : ""}`;
      case "monthly":
        const months = Math.ceil(pendingDays / 30);
        return `${months} month${months > 1 ? "s" : ""}`;
      default:
        return `${pendingDays} day${pendingDays > 1 ? "s" : ""}`;
    }
  };

  // Helper functions
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
    switch (planType) {
      case "weekly":
        return "week";
      case "daily":
        return "day";
      case "monthly":
        return "month";
      default:
        return "month";
    }
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

  const generateReferenceNumber = () => {
    return "REF-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const loadPaymentHistory = async (accountId) => {
    try {
      const response = await getPaymentHistory(accountId);
      const historyData = response.data.data || [];
      const sortedHistory = historyData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setPaymentHistory(sortedHistory);
    } catch (error) {
      console.error("Error loading payment history:", error);
      setPaymentHistory([]);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedAccount(null);
    setReferenceNumber("");
    setCustomAmount("");
    setIsCustomPayment(false);
    if (selectedAccount) {
      setCoveredPeriodsMap((prev) => {
        const newMap = { ...prev };
        delete newMap[selectedAccount._id];
        return newMap;
      });
    }
  };

  const handlePayment = (account) => {
    const pending = pendingPayments[account._id];

    if (pending?.isMaturityReached) {
      alert(
        "Congratulations! You have reached the maturity amount for this account. No further payments are required."
      );
      return;
    }

    if (pending && pending.hasPending) {
      const planType = getPlanTypeFromAccount(account);
      const pendingTimeDisplay = getPendingTimeDisplay(account, pending);
      const confirmMessage = `You have ${
        pending.count
      } pending ${planType} payment${pending.count > 1 ? "s" : ""} totaling ₹${
        pending.amount
      }. \n\nApproximately ${pendingTimeDisplay} remaining to reach maturity.\n\nDo you want to pay the pending amount of ₹${
        pending.amount
      } instead of the regular ${planType} amount of ₹${account.dailyAmount}?`;

      if (window.confirm(confirmMessage)) {
        setSelectedAccount({
          ...account,
          pendingAmount: pending.amount,
          isPendingPayment: true,
          maturityAmount: pending.maturityAmount,
          totalPaidAmount: pending.totalPaidAmount,
          remainingMaturityAmount: pending.remainingMaturityAmount,
          pendingDetails: pending,
        });
      } else {
        setSelectedAccount({
          ...account,
          maturityAmount: pending.maturityAmount,
          totalPaidAmount: pending.totalPaidAmount,
          remainingMaturityAmount: pending.remainingMaturityAmount,
          pendingDetails: pending,
        });
      }
    } else {
      setSelectedAccount({
        ...account,
        maturityAmount: pending?.maturityAmount || 0,
        totalPaidAmount: pending?.totalPaidAmount || 0,
        remainingMaturityAmount: pending?.remainingMaturityAmount || 0,
        pendingDetails: pending,
      });
    }

    setReferenceNumber(generateReferenceNumber());
    setCustomAmount("");
    setIsCustomPayment(false);
    setShowPaymentModal(true);
  };

  const calculateCoveredPeriods = (pending, paymentAmount) => {
    if (!pending?.missedPeriods || paymentAmount <= 0) return [];
    let coveredAmount = 0;
    const coveredPeriods = [];

    for (const period of pending.missedPeriods) {
      if (coveredAmount + period.amount <= paymentAmount) {
        coveredAmount += period.amount;
        coveredPeriods.push(period);
      } else {
        break;
      }
    }
    return coveredPeriods;
  };

  const getValidMultiples = (planAmount, maxAmount) => {
    const multiples = [];
    let multiple = planAmount;
    while (multiple <= maxAmount) {
      multiples.push(multiple);
      multiple += planAmount;
    }
    return multiples;
  };

  const isValidMultiple = (amount, planAmount) => {
    return amount % planAmount === 0;
  };

  const handleCustomAmountChange = (value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setProcessingPayment(true);

      if (paymentMethod === "online" && !referenceNumber.trim()) {
        alert("Please enter a reference number for online payment");
        return;
      }

      let paymentAmount;
      let isPartialPayment = false;
      let remainingPendingAmount = 0;

      const pending = pendingPayments[selectedAccount._id];
      const maxPendingAmount =
        pending?.amount || selectedAccount.dailyAmount || 0;
      const minAmount = selectedAccount.dailyAmount || 0;

      if (isCustomPayment && customAmount) {
        const enteredAmount = parseFloat(customAmount);

        if (isNaN(enteredAmount) || enteredAmount < minAmount) {
          alert(`Minimum payment amount is ₹${minAmount}`);
          return;
        }

        if (enteredAmount > maxPendingAmount) {
          alert(
            `Payment amount cannot exceed pending amount of ₹${maxPendingAmount}`
          );
          return;
        }

        if (enteredAmount > pending.remainingMaturityAmount) {
          alert(
            `Payment amount cannot exceed remaining maturity amount of ₹${pending.remainingMaturityAmount}`
          );
          return;
        }

        if (!isValidMultiple(enteredAmount, minAmount)) {
          const validMultiples = getValidMultiples(minAmount, maxPendingAmount);
          alert(
            `Please enter a valid multiple of ₹${minAmount}. Valid amounts are: ${validMultiples.join(
              ", "
            )}`
          );
          return;
        }

        paymentAmount = enteredAmount;
        isPartialPayment = paymentAmount < maxPendingAmount;
        remainingPendingAmount = maxPendingAmount - paymentAmount;
      } else {
        paymentAmount = maxPendingAmount;
        if (paymentAmount > pending.remainingMaturityAmount) {
          paymentAmount = pending.remainingMaturityAmount;
          isPartialPayment = true;
          remainingPendingAmount = 0;
        }
      }

      const coveredPeriods = calculateCoveredPeriods(pending, paymentAmount);
      const isPendingPayment = selectedAccount.isPendingPayment;
      const paymentStatus = paymentMethod === "cash" ? "pending" : "completed";

      const paymentData = {
        accountId: selectedAccount._id,
        customerId: customer._id,
        amount: paymentAmount,
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber,
        status: paymentStatus,
        isPendingPayment: isPendingPayment,
        isPartialPayment: isPartialPayment,
        remainingPendingAmount: remainingPendingAmount,
        type: "deposit",
        date: new Date().toISOString(),
        paymentPeriod: isPendingPayment ? "pending" : "current",
        maturityAmount: pending.maturityAmount,
        totalPaidAmount: pending.totalPaidAmount,
        coveredPeriods: coveredPeriods,
      };

      const response = await processPayment(paymentData);

      if (response.data.success) {
        // Store paid periods in localStorage
        const storedPaidPeriods = JSON.parse(
          localStorage.getItem("paidPeriods") || "{}"
        );
        storedPaidPeriods[selectedAccount._id] = [
          ...(storedPaidPeriods[selectedAccount._id] || []),
          ...coveredPeriods.map((period) => ({
            periodId: period.periodId,
            date: period.date,
            amount: period.amount,
            type: period.type,
            paymentDate: new Date().toISOString(),
            paymentAmount: paymentAmount,
          })),
        ];
        localStorage.setItem("paidPeriods", JSON.stringify(storedPaidPeriods));
        setPaidPeriodsMap(storedPaidPeriods);

        let alertMessage = "";
        if (paymentMethod === "cash") {
          if (isPartialPayment) {
            alertMessage = `Partial cash payment recorded as PENDING!\nReference: ${referenceNumber}\nAmount Paid: ₹${paymentAmount}\nRemaining Pending: ₹${remainingPendingAmount}\nStatus: ${paymentStatus}\n\nOur collector will verify and mark this payment as completed.`;
          } else {
            alertMessage = `Cash payment recorded as PENDING!\nReference: ${referenceNumber}\nAmount: ₹${paymentAmount}\nStatus: ${paymentStatus}\n\nOur collector will verify and mark this payment as completed.`;
          }
          alertMessage += `\n\n💰 The amount ₹${paymentAmount} will be added to your current balance ONLY AFTER the collector verifies and marks it as completed.`;
        } else {
          if (isPartialPayment) {
            alertMessage = `Partial online payment completed successfully!\nReference: ${referenceNumber}\nAmount Paid: ₹${paymentAmount}\nRemaining Pending: ₹${remainingPendingAmount}\nStatus: ${paymentStatus}`;
          } else {
            alertMessage = `Online payment completed successfully!\nReference: ${referenceNumber}\nAmount: ₹${paymentAmount}\nStatus: ${paymentStatus}`;
          }
          alertMessage += `\n\n💰 The amount ₹${paymentAmount} has been added to your current balance.`;
        }

        if (coveredPeriods.length > 0) {
          const periodType = getPlanTypeFromAccount(selectedAccount);
          alertMessage += `\n\nThis payment covers ${
            coveredPeriods.length
          } ${periodType}${coveredPeriods.length > 1 ? "s" : ""}:`;
          coveredPeriods.forEach((period) => {
            const dateStr = period.date.toLocaleDateString();
            alertMessage += `\n• ${dateStr} - ₹${period.amount}`;
          });

          if (isPartialPayment && remainingPendingAmount > 0) {
            alertMessage += `\n\nRemaining pending: ${
              pending.missedPeriods.length - coveredPeriods.length
            } ${periodType}${
              pending.missedPeriods.length - coveredPeriods.length > 1
                ? "s"
                : ""
            } (₹${remainingPendingAmount})`;
          }
        }

        const newTotalPaid = pending.totalPaidAmount + paymentAmount;
        if (newTotalPaid >= pending.maturityAmount) {
          alertMessage += `\n\n🎉 Congratulations! You have reached the maturity amount of ₹${pending.maturityAmount}!`;
        }

        alert(alertMessage);

        handleClosePaymentModal();
        await loadCustomerAccounts(); // Refresh to get updated data
      } else {
        throw new Error("Payment processing failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (
      showPaymentModal &&
      selectedAccount &&
      isCustomPayment &&
      customAmount
    ) {
      const pending = pendingPayments[selectedAccount._id];
      if (pending) {
        const paymentAmount = parseFloat(customAmount);
        const coveredPeriods = calculateCoveredPeriods(pending, paymentAmount);
        setCoveredPeriodsMap((prev) => ({
          ...prev,
          [selectedAccount._id]: coveredPeriods,
        }));
      }
    }
  }, [
    customAmount,
    isCustomPayment,
    selectedAccount,
    showPaymentModal,
    pendingPayments,
  ]);

  const handleViewPaymentHistory = async (account) => {
    await loadPaymentHistory(account._id);
    setSelectedAccount(account);
    setShowHistoryModal(true);
  };

  const handleViewAccountDetails = (account) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
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

  // Account Details Modal Component
  const AccountDetailsModal = () => {
    if (!showDetailsModal || !selectedAccount) return null;

    const amountLabel = getAmountLabelFromAccount(selectedAccount);
    const durationDisplay = getDurationDisplayFromAccount(selectedAccount);
    const pending = pendingPayments[selectedAccount._id];
    const pendingTimeDisplay = getPendingTimeDisplay(selectedAccount, pending);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Account Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              {selectedAccount.accountNumber} - {selectedAccount.type}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Account Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {selectedAccount.type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedAccount.status === "active"
                        ? "bg-green-100 text-green-800"
                        : selectedAccount.status === "closed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedAccount.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600">Interest Rate</p>
                  <p className="font-semibold text-green-600">
                    {selectedAccount.planId?.interestRate ||
                      selectedAccount.interestRate ||
                      "N/A"}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    {amountLabel === "week"
                      ? "Weekly Amount"
                      : amountLabel === "month"
                      ? "Monthly Amount"
                      : "Daily Amount"}
                  </p>
                  <p className="font-semibold">
                    ₹{selectedAccount.dailyAmount || "0"}/{amountLabel}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {durationDisplay}
                  </p>
                </div>
                {selectedAccount.planId && (
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="font-semibold text-gray-900">
                      {selectedAccount.planId.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            {pending && (
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900">
                  Financial Information
                </h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-800">
                        Maturity Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        ₹{pending.totalPaidAmount} / ₹{pending.maturityAmount}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateProgress(
                            pending.totalPaidAmount,
                            pending.maturityAmount
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      {calculateProgress(
                        pending.totalPaidAmount,
                        pending.maturityAmount
                      ).toFixed(1)}
                      % Complete • {pendingTimeDisplay} remaining
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Balance</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹
                        {selectedAccount.currentBalance?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Maturity Amount</p>
                      <p className="font-semibold text-purple-600">
                        ₹{pending.maturityAmount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Paid</p>
                      <p className="font-semibold text-green-600">
                        ₹{pending.totalPaidAmount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className="font-semibold text-orange-600">
                        ₹
                        {pending.remainingMaturityAmount?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                  </div>

                  {pending.maturityCalculation && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">
                        Maturity Calculation
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Principal Amount</p>
                          <p className="font-semibold">
                            ₹{pending.principalAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Interest Amount</p>
                          <p className="font-semibold">
                            ₹{pending.interestAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="text-gray-600">Interest Rate</p>
                          <p className="font-semibold">
                            {pending.maturityCalculation.interestRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending Payment Information */}
                  {pending?.hasPending && !pending?.isMaturityReached && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-sm font-semibold text-red-800">
                          Pending Payments
                        </p>
                      </div>
                      <p className="text-sm text-red-700 mb-2">
                        {pending.count} pending{" "}
                        {getPlanTypeFromAccount(selectedAccount)} payment
                        {pending.count > 1 ? "s" : ""} - ₹{pending.amount}
                      </p>
                      {pending.missedPeriods &&
                        pending.missedPeriods.length > 0 && (
                          <div className="text-xs text-red-600">
                            <p className="font-semibold mb-1">Missed dates:</p>
                            {pending.missedPeriods
                              .slice(0, 5)
                              .map((period, index) => (
                                <div key={index}>
                                  • {period.date.toLocaleDateString()} - ₹
                                  {period.amount}
                                </div>
                              ))}
                            {pending.missedPeriods.length > 5 && (
                              <div>
                                ... and {pending.missedPeriods.length - 5} more
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  )}

                  {/* Time Remaining Information */}
                  {!pending.isMaturityReached && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-orange-800">
                          Estimated Time Remaining
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {pendingTimeDisplay}
                        </span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">
                        Based on {pending.pendingDays} payment
                        {pending.pendingDays > 1 ? "s" : ""} of ₹
                        {selectedAccount.dailyAmount || "0"} per {amountLabel}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Calculation: ₹{pending.remainingMaturityAmount} ÷ ₹
                        {selectedAccount.dailyAmount} = {pending.pendingDays}{" "}
                        {amountLabel}
                        {pending.pendingDays > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  {/* Maturity Reached Message */}
                  {pending?.isMaturityReached && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-green-800">
                        Maturity Amount Reached! 🎉
                      </p>
                      <p className="text-xs text-green-700">
                        No further payments required
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Collector Information */}
            {selectedAccount.collectorId && (
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900">
                  Collector Information
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-semibold">
                        {selectedAccount.collectorId.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Area</p>
                      <p className="font-semibold">
                        {selectedAccount.collectorId.area}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-semibold">
                        {selectedAccount.collectorId.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal || !selectedAccount) return null;

    const amountLabel = getAmountLabelFromAccount(selectedAccount);
    const regularAmount = selectedAccount.dailyAmount || 0;
    const pendingAmount = selectedAccount.pendingAmount || regularAmount;
    const isPendingPayment = selectedAccount.isPendingPayment;
    const minAmount = regularAmount;
    const maxAmount = Math.min(
      pendingAmount,
      selectedAccount.remainingMaturityAmount || pendingAmount
    );
    const maturityAmount = selectedAccount.maturityAmount || 0;
    const totalPaidAmount = selectedAccount.totalPaidAmount || 0;
    const remainingMaturityAmount =
      selectedAccount.remainingMaturityAmount || maturityAmount;
    const pendingDetails = selectedAccount.pendingDetails;
    const pending = pendingPayments[selectedAccount._id];
    const pendingTimeDisplay = getPendingTimeDisplay(selectedAccount, pending);
    const coveredPeriods = coveredPeriodsMap[selectedAccount._id] || [];

    const calculatedPaymentAmount =
      isCustomPayment && customAmount ? parseFloat(customAmount) : maxAmount;
    const remainingAmount =
      isCustomPayment && customAmount
        ? maxAmount - parseFloat(customAmount)
        : 0;

    const hasPendingPayments = pending?.hasPending;
    const validMultiples = getValidMultiples(minAmount, maxAmount);
    const isAmountValid = customAmount
      ? isValidMultiple(parseFloat(customAmount), minAmount)
      : true;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xl font-bold">
              {isPendingPayment ? "Pay Pending Amount" : "Make Payment"}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Account Information */}
              <div>
                <p className="text-sm text-gray-600">Account</p>
                <p className="font-semibold">
                  {selectedAccount.accountNumber} - {selectedAccount.type}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-semibold text-blue-800">
                        Maturity Progress
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      ₹{totalPaidAmount} / ₹{maturityAmount}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${calculateProgress(
                          totalPaidAmount,
                          maturityAmount
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Remaining: ₹{remainingMaturityAmount} •{" "}
                    {calculateProgress(totalPaidAmount, maturityAmount).toFixed(
                      1
                    )}
                    % Complete • {pendingTimeDisplay} remaining
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  {isPendingPayment
                    ? "Pending Amount"
                    : amountLabel === "week"
                    ? "Weekly Amount"
                    : amountLabel === "month"
                    ? "Monthly Amount"
                    : "Daily Amount"}
                  :<span className="font-semibold"> ₹{pendingAmount}</span>
                </p>
              </div>

              {/* Payment Amount Selection */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Amount</p>
                <div className="space-y-3">
                  {hasPendingPayments ? (
                    <>
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
                          Full Amount (₹{maxAmount})
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
                              Enter Amount (Multiples of ₹{minAmount})
                            </label>
                            <input
                              type="text"
                              value={customAmount}
                              onChange={(e) =>
                                handleCustomAmountChange(e.target.value)
                              }
                              placeholder={`Enter multiple of ₹${minAmount}`}
                              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-blue-500 ${
                                customAmount && !isAmountValid
                                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                                  : "border-gray-300 focus:ring-blue-500"
                              }`}
                            />
                            {customAmount && !isAmountValid && (
                              <p className="text-xs text-red-600 mt-1">
                                Please enter a multiple of ₹{minAmount}
                              </p>
                            )}
                          </div>

                          {customAmount && isAmountValid && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-600">Amount to Pay</p>
                                  <p className="font-semibold text-green-600">
                                    ₹{calculatedPaymentAmount}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">
                                    Remaining Pending
                                  </p>
                                  <p className="font-semibold text-orange-600">
                                    ₹{remainingAmount}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                        <p className="text-sm font-semibold text-blue-800">
                          Regular Payment Amount: ₹{maxAmount}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Selection */}
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

              {/* Online Payment Details */}
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
                      <button hidden
                        onClick={() =>
                          setReferenceNumber(generateReferenceNumber())
                        }
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300 whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Payment Details */}
              {paymentMethod === "cash" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-semibold">
                        Cash Payment - Status: PENDING
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please hand over ₹{calculatedPaymentAmount} to our
                        collector.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-yellow-600 mt-2 space-y-1">
                    <p className="font-mono">Reference: {referenceNumber}</p>
                    {selectedAccount.collectorId && (
                      <>
                        <p>Collector: {selectedAccount.collectorId.name}</p>
                        <p>Area: {selectedAccount.collectorId.area}</p>
                        <p>Phone: {selectedAccount.collectorId.phone}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleClosePaymentModal}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 text-sm font-medium"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={
                  processingPayment ||
                  (paymentMethod === "online" && !referenceNumber.trim()) ||
                  (hasPendingPayments &&
                    isCustomPayment &&
                    (!customAmount ||
                      parseFloat(customAmount) < minAmount ||
                      parseFloat(customAmount) > maxAmount ||
                      !isAmountValid))
                }
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium ${
                  processingPayment ||
                  (paymentMethod === "online" && !referenceNumber.trim()) ||
                  (hasPendingPayments &&
                    isCustomPayment &&
                    (!customAmount ||
                      parseFloat(customAmount) < minAmount ||
                      parseFloat(customAmount) > maxAmount ||
                      !isAmountValid))
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : isPendingPayment ? (
                  hasPendingPayments && isCustomPayment && customAmount ? (
                    "Pay Partial Amount"
                  ) : (
                    "Pay Pending Amount"
                  )
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Payment History Modal Component
  const PaymentHistoryModal = () => {
    if (!showHistoryModal || !selectedAccount) return null;

    const pending = pendingPayments[selectedAccount._id];

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
              {selectedAccount.accountNumber} - {selectedAccount.type}
            </p>

            {/* Current Balance Display */}
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 font-semibold">Current Balance</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{selectedAccount.currentBalance?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 font-semibold">Total Paid Amount</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{pending?.totalPaidAmount?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
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
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            {payment.status.toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              {new Date(payment.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{payment.amount}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Reference</p>
                          <p className="font-mono text-gray-900 text-xs">
                            {payment.referenceNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Method</p>
                          <p className="capitalize text-gray-900">
                            {payment.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="text-gray-900">
                            {payment.isPendingPayment
                              ? "Pending Payment"
                              : "Regular Payment"}
                          </p>
                        </div>
                      </div>
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

  // Loading State
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

  // Authentication Required State
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
            onClick={() => navigate("/auth")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
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
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Accounts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const pending = pendingPayments[account._id];

            return (
              <div
                key={account._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 relative"
              >
                {/* Maturity Reached Badge */}
                {pending?.isMaturityReached && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Matured
                    </span>
                  </div>
                )}

                {/* Pending Payment Badge */}
                {pending?.hasPending && !pending?.isMaturityReached && (
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
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewAccountDetails(account)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Account Details"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quick Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Current Balance
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{account.currentBalance?.toLocaleString() || "0"}
                      </span>
                    </div>

                    {pending && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-blue-800">
                            Maturity Progress
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {calculateProgress(
                              pending.totalPaidAmount,
                              pending.maturityAmount
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculateProgress(
                                pending.totalPaidAmount,
                                pending.maturityAmount
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewPaymentHistory(account)}
                      className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <Clock className="h-4 w-4" />
                      History
                    </button>
                    {account.status === "active" &&
                      account.dailyAmount > 0 &&
                      !pending?.isMaturityReached && (
                        <button
                          onClick={() => handlePayment(account)}
                          className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center gap-1 ${
                            pending?.hasPending
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          <DollarSign className="h-4 w-4" />
                          {pending?.hasPending ? "Pay Pending" : "Pay"}
                        </button>
                      )}
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

      {/* Account Details Modal */}
      <AccountDetailsModal />

      {/* Payment Modal */}
      <PaymentModal />

      {/* Payment History Modal */}
      <PaymentHistoryModal />
    </div>
  );
};

export default AccountsPage;
