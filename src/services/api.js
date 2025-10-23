import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add auth token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            // Redirect to admin login if we're on an admin page
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);
export const registerAdmin = (adminData) => API.post('/auth/register', adminData);
export const getAdminProfile = () => API.get('/auth/me');
export const updateAdminProfile = (profileData) => API.put('/auth/profile', profileData);
export const changePassword = (passwordData) => API.put('/auth/change-password', passwordData);
export const logoutAdmin = () => API.post('/auth/logout');

// Collectors API
export const getCollectors = (params = {}) => API.get('/collectors', { params });
export const createCollector = (collectorData) => API.post('/collectors', collectorData);
export const updateCollector = (id, collectorData) => API.put(`/collectors/${id}`, collectorData);
export const deleteCollector = (id) => API.delete(`/collectors/${id}`);
export const getCollectorStats = () => API.get('/collectors/stats/overview');

// Customers API
export const getCustomers = (params = {}) => API.get('/customers', { params });
export const createCustomer = (customerData) => API.post('/customers', customerData);
export const updateCustomer = (id, customerData) => API.put(`/customers/${id}`, customerData);
export const getCustomerById = (id) => API.get(`/customers/${id}`);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
export const getCustomersByCollector = (collectorId) => API.get(`/customers/collector/${collectorId}`);
export const getCustomerStats = () => API.get('/customers/stats/overview');

// Accounts API
export const getAccounts = (params = {}) => API.get('/accounts', { params });
export const createAccount = (data) => API.post('/accounts', data);
export const updateAccount = (id, data) => API.put(`/accounts/${id}`, data);
export const getAccountById = (id) => API.get(`/accounts/${id}`);
export const deleteAccount = (id) => API.delete(`/accounts/${id}`);
export const getAccountStats = () => API.get('/accounts/stats/overview');
export const getAccountsByCustomer = (customerId) => API.get(`/accounts/customer/${customerId}`);

// Transactions API
export const getTransactions = (params = {}) => API.get('/transactions', { params });
export const addTransaction = (transactionData) => API.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getTransactionStats = () => API.get('/transactions/stats/overview');
export const getTransactionsByAccount = (accountId) => API.get(`/transactions/account/${accountId}`);

// Payments API
export const getPayments = (params = {}) => API.get('/payments', { params });
export const createPayment = (paymentData) => API.post('/payments', paymentData);
export const updatePayment = (id, paymentData) => API.put(`/payments/${id}`, paymentData);
export const deletePayment = (id) => API.delete(`/payments/${id}`);
export const getPaymentStats = () => API.get('/payments/stats/overview');

// Plans API
export const getPlans = (params = {}) => API.get('/plans', { params });
export const getPlanById = (id) => API.get(`/plans/${id}`);
export const createPlan = (planData) => API.post('/plans', planData);
export const updatePlan = (id, planData) => API.put(`/plans/${id}`, planData);
export const deletePlan = (id) => API.delete(`/plans/${id}`);
export const updatePlanStatus = (id, statusData) => API.patch(`/plans/${id}/status`, statusData);
export const getPlanStats = () => API.get('/plans/stats/overview');
export const getPlansByType = (type) => API.get(`/plans/type/${type}`);
export const calculateMaturity = (id, data) => API.post(`/plans/${id}/calculate-maturity`, data);

// Reports API
export const getReports = (params = {}) => API.get('/reports', { params });
export const generateReport = (reportData) => API.post('/reports/generate', reportData);
export const getDashboardStats = () => API.get('/reports/dashboard-stats');

// Feedback API
export const getFeedback = (params = {}) => API.get('/feedback', { params });
export const updateFeedbackStatus = (id, statusData) => API.patch(`/feedback/${id}/status`, statusData);
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);
export const getFeedbackStats = () => API.get('/feedback/stats/overview');

export default API;