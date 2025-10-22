import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Collectors API
export const getCollectors = () => API.get('/collectors');
export const createCollector = (collectorData) => API.post('/collectors', collectorData);
export const updateCollector = (id, collectorData) => API.put(`/collectors/${id}`, collectorData);
export const deleteCollector = (id) => API.delete(`/collectors/${id}`);

// Customers API
export const getCustomers = (params = {}) => API.get('/customers', { params });
export const createCustomer = (customerData) => API.post('/customers', customerData);
export const updateCustomer = (id, customerData) => API.put(`/customers/${id}`, customerData);
export const getCustomersByCollector = (collectorId) => API.get(`/customers/collector/${collectorId}`);

// Accounts API
export const getAccounts = () => API.get('/accounts');
export const createAccount = (data) => API.post('/accounts', data);
export const updateAccount = (id, data) => API.put(`/accounts/${id}`, data);
export const getAccountById = (id) => API.get(`/accounts/${id}`);

// Transactions API
export const getTransactions = (params = {}) => API.get('/transactions', { params });
export const addTransaction = (transactionData) => API.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

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

export default API;