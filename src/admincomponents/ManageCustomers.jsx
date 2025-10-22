import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Loader,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  getCollectors,
  getPlans,
} from "../services/api";

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollector, setFilterCollector] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    gender: "male",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    aadhaarNumber: "",
    panNumber: "",
    planType: "",
    dailyAmount: "",
    depositMode: "cash",
    collectorId: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeContact: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersRes, collectorsRes, plansRes] = await Promise.all([
        getCustomers(),
        getCollectors(),
        getPlans({ status: "active" }),
      ]);

      setCustomers(customersRes.data.data || []);
      setCollectors(collectorsRes.data.data || []);
      setPlans(plansRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateCustomerId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `CUST${timestamp}`;
  };

  const handlePlanChange = (planType) => {
    const selectedPlan = plans.find((plan) => plan.type === planType);
    setFormData((prev) => ({
      ...prev,
      planType,
      dailyAmount: selectedPlan?.amount || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, formData);
        alert("Customer updated successfully!");
      } else {
        await createCustomer(formData);
        alert("Customer created successfully!");
      }
      setShowModal(false);
      setEditingCustomer(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving customer");
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.phone.trim() || formData.phone.length !== 10)
      errors.phone = "Valid 10-digit phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.aadhaarNumber.trim() || formData.aadhaarNumber.length !== 12)
      errors.aadhaarNumber = "Valid 12-digit Aadhaar number is required";
    if (!formData.planType) errors.planType = "Please select a plan";
    if (!formData.dailyAmount || formData.dailyAmount < 10)
      errors.dailyAmount = "Daily amount must be at least ₹10";
    if (!formData.collectorId)
      errors.collectorId = "Collector assignment is required";
    if (!formData.nomineeName.trim())
      errors.nomineeName = "Nominee name is required";
    if (!formData.nomineeRelation.trim())
      errors.nomineeRelation = "Nominee relation is required";
    if (!formData.nomineeContact.trim())
      errors.nomineeContact = "Nominee contact is required";

    return errors;
  };

  const resetForm = () => {
    setFormData({
      customerId: generateCustomerId(),
      name: "",
      gender: "male",
      dateOfBirth: "",
      phone: "",
      email: "",
      address: "",
      aadhaarNumber: "",
      panNumber: "",
      planType: "",
      dailyAmount: "",
      depositMode: "cash",
      collectorId: "",
      nomineeName: "",
      nomineeRelation: "",
      nomineeContact: "",
      status: "active",
    });
    setFormErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCustomer(null);
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customerId: customer.customerId,
      name: customer.name,
      gender: customer.gender || "male",
      dateOfBirth: customer.dateOfBirth
        ? new Date(customer.dateOfBirth).toISOString().split("T")[0]
        : "",
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address,
      aadhaarNumber: customer.aadhaarNumber || "",
      panNumber: customer.panNumber || "",
      planType: customer.planType || "",
      dailyAmount: customer.dailyAmount || "",
      depositMode: customer.depositMode || "cash",
      collectorId: customer.collectorId?._id || customer.collectorId,
      nomineeName: customer.nomineeName || "",
      nomineeRelation: customer.nomineeRelation || "",
      nomineeContact: customer.nomineeContact || "",
      status: customer.status || "active",
    });
    setShowModal(true);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesCollector =
      !filterCollector || customer.collectorId?._id === filterCollector;

    return matchesSearch && matchesCollector;
  });

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
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
              Manage Customers
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage pigmy customers
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCollector}
              onChange={(e) => setFilterCollector(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Collectors</option>
              {collectors.map((collector) => (
                <option key={collector._id} value={collector._id}>
                  {collector.name} - {collector.area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customers Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {customer.customerId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">
                      {customer.email || "No email"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span className="flex-1">{customer.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Collector</p>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.collectorId?.name || "Not assigned"}
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal(customer)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {customers.length === 0
                ? "No customers yet"
                : "No customers found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {customers.length === 0
                ? "Get started by creating your first customer."
                : "Try adjusting your search criteria."}
            </p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Your First Customer
            </button>
          </div>
        )}

        {/* Customer Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCustomer(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Personal Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.customerId}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Enter full name"
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        {formErrors.dateOfBirth && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.dateOfBirth}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="10-digit mobile number"
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Optional email address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aadhaar Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.aadhaarNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              aadhaarNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="12-digit Aadhaar"
                        />
                        {formErrors.aadhaarNumber && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.aadhaarNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={formData.panNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              panNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="PAN number (optional)"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Full residential address"
                        rows="3"
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Pigmy Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Plan *
                        </label>
                        <select
                          required
                          value={formData.planType}
                          onChange={(e) => handlePlanChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Choose a plan...</option>
                          {plans.map((plan) => (
                            <option key={plan._id} value={plan.type}>
                              {plan.name} - ₹{plan.amount}/{plan.type}
                            </option>
                          ))}
                        </select>
                        {formErrors.planType && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.planType}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Daily Amount (₹) *
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Enter amount"
                        />
                        {formErrors.dailyAmount && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.dailyAmount}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deposit Mode *
                        </label>
                        <select
                          value={formData.depositMode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              depositMode: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="cash">Cash</option>
                          <option value="online">Online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assigned Collector *
                        </label>
                        <select
                          required
                          value={formData.collectorId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              collectorId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Collector</option>
                          {collectors.map((collector) => (
                            <option key={collector._id} value={collector._id}>
                              {collector.name} - {collector.area}
                            </option>
                          ))}
                        </select>
                        {formErrors.collectorId && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.collectorId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nominee Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Nominee Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nominee Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomineeName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomineeName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Nominee full name"
                        />
                        {formErrors.nomineeName && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.nomineeName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relation with Nominee *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomineeRelation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomineeRelation: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="e.g., Spouse, Son, Daughter"
                        />
                        {formErrors.nomineeRelation && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.nomineeRelation}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nominee Contact *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomineeContact}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomineeContact: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Phone number"
                        />
                        {formErrors.nomineeContact && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.nomineeContact}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingCustomer(null);
                        resetForm();
                      }}
                      className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitting
                        ? "Saving..."
                        : editingCustomer
                        ? "Update"
                        : "Create"}
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

export default ManageCustomers;