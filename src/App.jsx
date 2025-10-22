import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PigmyXpressDashboard from "./components/PigmyXpressDashboard";
import PaymentPage from "./components/PaymentPage";
import AccountsPage from "./components/AccountsPage";
import Withdrawal from "./components/withDrawal";
import Feedback from "./components/Feedback";
import Auth from "./components/Auth";
import AdminLayout from "./admincomponents/AdminLayout";
import AdminDashboard from "./admincomponents/AdminDashboard";
import ManageCollectors from "./admincomponents/ManageCollectors";
import ManageCustomers from "./admincomponents/ManageCustomers";
import ManageAccounts from "./admincomponents/ManageAccounts";
import ManagePlans from "./admincomponents/ManagePlans";
import Reports from "./admincomponents/Reports";
import AdminFeedback from "./admincomponents/AdminFeedback";
import ManagePayments from "./admincomponents/ManagePayments";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PigmyXpressDashboard />} />
          <Route path="/paymentpage" element={<PaymentPage />} />
          <Route path="/accountspage" element={<AccountsPage />} />
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/auth" element={<Auth />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="collectors" element={<ManageCollectors />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="accounts" element={<ManageAccounts />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="plans" element={<ManagePlans />} />
            <Route path="reports" element={<Reports />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
