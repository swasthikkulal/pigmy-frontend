import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add appropriate auth token
API.interceptors.request.use(
    (config) => {
        // Check if it's a customer route
        const isCustomerRoute = config.url.includes('/auth/customer') || 
                               config.url.includes('/customer/');
        
        if (isCustomerRoute) {
            // Use customer token for customer routes
            const customerToken = localStorage.getItem('customerToken');
            if (customerToken) {
                config.headers.Authorization = `Bearer ${customerToken}`;
            }
        } else {
            // Use admin token for all other routes
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration - UPDATED PATHS
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if it's a customer route
            const isCustomerRoute = error.config.url.includes('/auth/customer') || 
                                   error.config.url.includes('/customer/');
            
            if (isCustomerRoute) {
                // Clear customer tokens and redirect to customer login
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerData');
                // Updated to redirect to /auth instead of /customer/login
                if (window.location.pathname.startsWith('/customer') || window.location.pathname === '/auth') {
                    window.location.href = '/auth';
                }
            } else {
                // Clear admin tokens and redirect to admin login
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================

// Admin Auth API
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);
export const registerAdmin = (adminData) => API.post('/auth/register', adminData);
export const getAdminProfile = () => API.get('/auth/me');
export const updateAdminProfile = (profileData) => API.put('/auth/profile', profileData);
export const changeAdminPassword = (passwordData) => API.put('/auth/change-password', passwordData);
export const logoutAdmin = () => API.post('/auth/logout');

// Customer Auth API
export const loginCustomer = (credentials) => API.post('/auth/customer/login', credentials);
export const getCustomerProfile = () => API.get('/auth/customer/me');
export const changeCustomerPassword = (passwordData) => API.put('/auth/customer/change-password', passwordData);
export const logoutCustomer = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    return Promise.resolve();
};

// ==================== CUSTOMER PLANS API ====================

export const getCustomerPlans = () => API.get('/customer/plans');
export const getCustomerPlanDetails = (planId) => API.get(`/customer/plans/${planId}`);
export const makePlanPayment = (paymentData) => API.post('/customer/payments', paymentData);
export const getCustomerTransactions = (params = {}) => API.get('/customer/transactions', { params });
export const getCustomerPaymentHistory = () => API.get('/customer/payments/history');

// ==================== COLLECTORS API ====================

export const getCollectors = (params = {}) => API.get('/collectors', { params });
export const createCollector = (collectorData) => API.post('/collectors', collectorData);
export const updateCollector = (id, collectorData) => API.put(`/collectors/${id}`, collectorData);
export const deleteCollector = (id) => API.delete(`/collectors/${id}`);
export const getCollectorStats = () => API.get('/collectors/stats/overview');
export const getCollectorById = (id) => API.get(`/collectors/${id}`);

// ==================== CUSTOMERS API ====================

export const getCustomers = (params = {}) => API.get('/customers', { params });
export const createCustomer = (customerData) => API.post('/customers', customerData);
export const updateCustomer = (id, customerData) => API.put(`/customers/${id}`, customerData);
export const getCustomerById = (id) => API.get(`/customers/${id}`);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
export const getCustomersByCollector = (collectorId) => API.get(`/customers/collector/${collectorId}`);
export const resetCustomerPassword = (id) => API.put(`/customers/${id}/reset-password`);
export const getCustomerStats = () => API.get('/customers/stats/overview');
export const searchCustomers = (query) => API.get(`/customers/search?q=${query}`);

// ==================== ACCOUNTS API ====================

export const getAccounts = (params = {}) => API.get('/accounts', { params });
export const createAccount = (data) => API.post('/accounts', data);
export const updateAccount = (id, data) => API.put(`/accounts/${id}`, data);
export const getAccountById = (id) => API.get(`/accounts/${id}`);
export const deleteAccount = (id) => API.delete(`/accounts/${id}`);
export const getAccountStats = () => API.get('/accounts/stats/overview');
export const getAccountsByCustomer = (customerId) => API.get(`/accounts/customer/${customerId}`);
export const getAccountByNumber = (accountNumber) => API.get(`/accounts/number/${accountNumber}`);

// ==================== TRANSACTIONS API ====================

export const getTransactions = (params = {}) => API.get('/transactions', { params });
export const addTransaction = (transactionData) => API.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getTransactionStats = () => API.get('/transactions/stats/overview');
export const getTransactionsByAccount = (accountId) => API.get(`/transactions/account/${accountId}`);
export const getTransactionsByCustomer = (customerId) => API.get(`/transactions/customer/${customerId}`);
export const getRecentTransactions = (limit = 10) => API.get(`/transactions/recent?limit=${limit}`);

// ==================== PLANS API ====================

export const getPlans = (params = {}) => API.get('/plans', { params });
export const getPlanById = (id) => API.get(`/plans/${id}`);
export const createPlan = (planData) => API.post('/plans', planData);
export const updatePlan = (id, planData) => API.put(`/plans/${id}`, planData);
export const deletePlan = (id) => API.delete(`/plans/${id}`);
export const updatePlanStatus = (id, statusData) => API.patch(`/plans/${id}/status`, statusData);
export const getPlanStats = () => API.get('/plans/stats/overview');
export const getPlansByType = (type) => API.get(`/plans/type/${type}`);
export const calculateMaturity = (id, data) => API.post(`/plans/${id}/calculate-maturity`, data);
export const getActivePlans = () => API.get('/plans/active');
export const getPlanSubscribers = (planId) => API.get(`/plans/${planId}/subscribers`);

// ==================== PAYMENTS API ====================

export const getPayments = (params = {}) => API.get('/payments', { params });
export const createPayment = (paymentData) => API.post('/payments', paymentData);
export const updatePayment = (id, paymentData) => API.put(`/payments/${id}`, paymentData);
export const deletePayment = (id) => API.delete(`/payments/${id}`);
export const getPaymentStats = () => API.get('/payments/stats/overview');
export const getPaymentsByCustomer = (customerId) => API.get(`/payments/customer/${customerId}`);
export const getPaymentsByCollector = (collectorId) => API.get(`/payments/collector/${collectorId}`);
export const processBulkPayments = (paymentsData) => API.post('/payments/bulk', paymentsData);

// ==================== REPORTS API ====================

export const getReports = (params = {}) => API.get('/reports', { params });
export const generateReport = (reportData) => API.post('/reports/generate', reportData);
export const getDashboardStats = () => API.get('/reports/dashboard-stats');
export const getCollectionReport = (params = {}) => API.get('/reports/collections', { params });
export const getCustomerReport = (params = {}) => API.get('/reports/customers', { params });
export const getFinancialReport = (params = {}) => API.get('/reports/financial', { params });

// ==================== FEEDBACK API ====================

export const getFeedback = (params = {}) => API.get('/feedback', { params });
export const submitFeedback = (feedbackData) => API.post('/feedback', feedbackData);
export const updateFeedbackStatus = (id, statusData) => API.patch(`/feedback/${id}/status`, statusData);
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);
export const getFeedbackStats = () => API.get('/feedback/stats/overview');

// ==================== UTILITY FUNCTIONS ====================

// Helper function to get current user type
export const getCurrentUserType = () => {
    if (localStorage.getItem('adminToken')) return 'admin';
    if (localStorage.getItem('customerToken')) return 'customer';
    return null;
};

// Helper function to get current user token
export const getCurrentToken = () => {
    const userType = getCurrentUserType();
    if (userType === 'admin') return localStorage.getItem('adminToken');
    if (userType === 'customer') return localStorage.getItem('customerToken');
    return null;
};

// Helper function to logout all users
export const logoutAll = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
    return !!(localStorage.getItem('adminToken') || localStorage.getItem('customerToken'));
};

// Helper function to get user data
export const getUserData = () => {
    const userType = getCurrentUserType();
    if (userType === 'admin') {
        const adminData = localStorage.getItem('adminData');
        return adminData ? JSON.parse(adminData) : null;
    }
    if (userType === 'customer') {
        const customerData = localStorage.getItem('customerData');
        return customerData ? JSON.parse(customerData) : null;
    }
    return null;
};

export default API;