import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PigmyXpressDashboard from "./components/PigmyXpressDashboard";
import PaymentPage from "./components/PaymentPage";
import AccountsPage from "./components/AccountsPage";
import Withdrawal from "./components/withDrawal";
import Feedback from "./components/Feedback";
import Auth from "./components/Auth";

// Admin Components
import AdminLayout from "./admincomponents/AdminLayout";
import AdminDashboard from "./admincomponents/AdminDashboard";
import ManageCollectors from "./admincomponents/ManageCollectors";
import ManageCustomers from "./admincomponents/ManageCustomers";
import ManageAccounts from "./admincomponents/ManageAccounts";
import ManagePlans from "./admincomponents/ManagePlans";
import Reports from "./admincomponents/Reports";
import AdminFeedback from "./admincomponents/AdminFeedback";
import ManagePayments from "./admincomponents/ManagePayments";

// Auth Components

import ProtectedRoute from "./admincomponents/ProtectedRoute";
import Login from "./admincomponents/Login";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PigmyXpressDashboard />} />
          <Route path="/paymentpage" element={<PaymentPage />} />
          <Route path="/accountspage" element={<AccountsPage />} />
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/auth" element={<Auth />} />

          {/* Admin Authentication Routes */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="collectors" element={<ManageCollectors />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="accounts" element={<ManageAccounts />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="plans" element={<ManagePlans />} />
            <Route path="reports" element={<Reports />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>

          {/* Redirects */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
