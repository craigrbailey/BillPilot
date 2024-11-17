import { useNavigate } from 'react-router-dom';

export const API_BASE_URL = 'http://localhost:3000/api';

// Function to handle unauthorized/forbidden access
const handleAuthError = () => {
  // Clear stored credentials
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Global fetch wrapper with error handling
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  } catch (error) {
    // Check if error is auth-related
    if (error.message === 'Authentication required' || 
        error.message === 'Invalid token' ||
        error.message === 'Token expired') {
      handleAuthError();
    }
    throw error;
  }
};

// Auth endpoints
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store credentials on successful login
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  } finally {
    // Always clear credentials on logout attempt
    handleAuthError();
  }
};

// Check auth status
export const checkAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    handleAuthError();
    return false;
  }
  return true;
};

// Bills endpoints
export const fetchBills = async () => {
  return fetchWithAuth(`${API_BASE_URL}/bills`);
};

export const createBill = async (billData) => {
  return fetchWithAuth(`${API_BASE_URL}/bills`, {
    method: 'POST',
    body: JSON.stringify(billData),
  });
};

export const updateBill = async (id, billData) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(billData),
  });
};

export const deleteBill = async (id) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/${id}`, {
    method: 'DELETE',
  });
};

export const markBillPaid = async (billId, paymentDate) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/${billId}/pay`, {
    method: 'PUT',
    body: JSON.stringify({ paymentDate }),
  });
};

export const markBillUnpaid = async (billId) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/${billId}/unpay`, {
    method: 'PUT',
  });
};

export const getBillPayments = async (billId) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/${billId}/payments`);
};

// Function to generate recurring bills
export const generateRecurringBills = async (payeeId) => {
  return fetchWithAuth(`${API_BASE_URL}/payees/${payeeId}/generate-bills`, {
    method: 'POST',
  });
};

// Function to get bills by payee
export const getBillsByPayee = async (payeeId) => {
  return fetchWithAuth(`${API_BASE_URL}/payees/${payeeId}/bills`);
};

// Function to get upcoming bills
export const getUpcomingBills = async () => {
  return fetchWithAuth(`${API_BASE_URL}/bills/upcoming`);
};

// Function to get overdue bills
export const getOverdueBills = async () => {
  return fetchWithAuth(`${API_BASE_URL}/bills/overdue`);
};

// Function to get bill history
export const getBillHistory = async () => {
  return fetchWithAuth(`${API_BASE_URL}/bills/history`);
};

// Income endpoints
export const fetchIncomes = async () => {
  return fetchWithAuth(`${API_BASE_URL}/income`);
};

export const createIncome = async (incomeData) => {
  return fetchWithAuth(`${API_BASE_URL}/income`, {
    method: 'POST',
    body: JSON.stringify(incomeData),
  });
};

export const updateIncome = async (id, incomeData) => {
  return fetchWithAuth(`${API_BASE_URL}/income/${id}`, {
    method: 'PUT',
    body: JSON.stringify(incomeData),
  });
};

export const deleteIncome = async (id) => {
  return fetchWithAuth(`${API_BASE_URL}/income/${id}`, {
    method: 'DELETE',
  });
};

// Categories endpoints
export const fetchCategories = async () => {
  return fetchWithAuth(`${API_BASE_URL}/categories`);
};

export const createCategory = async (categoryData) => {
  return fetchWithAuth(`${API_BASE_URL}/categories`, {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

export const updateCategory = async (id, categoryData) => {
  return fetchWithAuth(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
};

export const deleteCategory = async (id) => {
  return fetchWithAuth(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  });
};

// Settings endpoints
export const fetchSettings = async () => {
  return fetchWithAuth(`${API_BASE_URL}/settings`);
};

export const updateSettings = async (settings) => {
  return fetchWithAuth(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// Add function to fetch payment history
export const fetchPaymentHistory = async () => {
  return fetchWithAuth(`${API_BASE_URL}/bills/payments`);
};

export const deletePayment = async (paymentId) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/payments/${paymentId}`, {
    method: 'DELETE',
  });
};

// Add to your existing API functions
export const checkRecurringItems = async () => {
  return fetchWithAuth(`${API_BASE_URL}/check-recurring`);
};

export const testEmailSettings = async (settings) => {
  return fetchWithAuth(`${API_BASE_URL}/settings/test-email`, {
    method: 'POST',
    body: JSON.stringify(settings),
  });
};

export const addEmailRecipient = async (recipientData) => {
  return fetchWithAuth(`${API_BASE_URL}/settings/email-recipients`, {
    method: 'POST',
    body: JSON.stringify(recipientData),
  });
};

export const deleteEmailRecipient = async (recipientId) => {
  return fetchWithAuth(`${API_BASE_URL}/settings/email-recipients/${recipientId}`, {
    method: 'DELETE',
  });
};

// Add these new income-related functions to your existing api.js file

// Income Sources
export const fetchIncomeSources = async () => {
  const response = await fetch('/api/income/sources', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch income sources');
  return response.json();
};

export const createIncomeSource = async (sourceData) => {
  const response = await fetch('/api/income/sources', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sourceData),
  });
  if (!response.ok) throw new Error('Failed to create income source');
  return response.json();
};

export const updateIncomeSource = async (id, sourceData) => {
  const response = await fetch(`/api/income/sources/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sourceData),
  });
  if (!response.ok) throw new Error('Failed to update income source');
  return response.json();
};

export const deleteIncomeSource = async (id) => {
  const response = await fetch(`/api/income/sources/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete income source');
  return response.json();
};

// Income Entries
export const fetchIncomeEntries = async () => {
  const response = await fetch('/api/income/entries', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch income entries');
  return response.json();
};

export const createIncomeEntry = async (entryData) => {
  const response = await fetch('/api/income/entries', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entryData),
  });
  if (!response.ok) throw new Error('Failed to create income entry');
  return response.json();
};

export const updateIncomeEntry = async (id, entryData) => {
  const response = await fetch(`/api/income/entries/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entryData),
  });
  if (!response.ok) throw new Error('Failed to update income entry');
  return response.json();
};

export const deleteIncomeEntry = async (id) => {
  const response = await fetch(`/api/income/entries/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete income entry');
  return response.json();
};

// Payee operations
export const fetchPayees = async () => {
  const response = await fetchWithAuth(`${API_BASE_URL}/payees`);
  return response;
};

export const createPayee = async (payeeData) => {
  return fetchWithAuth(`${API_BASE_URL}/payees`, {
    method: 'POST',
    body: JSON.stringify(payeeData),
  });
};

export const updatePayee = async (id, payeeData) => {
  return fetchWithAuth(`${API_BASE_URL}/payees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payeeData),
  });
};

export const deletePayee = async (id) => {
  return fetchWithAuth(`${API_BASE_URL}/payees/${id}`, {
    method: 'DELETE',
  });
};

// Add this function to your existing api.js
export const resetDatabase = async () => {
  return fetchWithAuth(`${API_BASE_URL}/settings/reset-database`, {
    method: 'POST',
  });
};

// Add these to your existing api.js file

export const fetchNotificationSettings = async () => {
  return fetchWithAuth(`${API_BASE_URL}/settings/notifications`);
};

export const updateNotificationProvider = async (providerType, settings) => {
  return fetchWithAuth(`${API_BASE_URL}/settings/notifications/provider/${providerType}`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

export const updateNotificationType = async (type, settings) => {
  return fetchWithAuth(`${API_BASE_URL}/settings/notifications/type/${type}`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

export const testNotificationProvider = async (providerType) => {
  return fetchWithAuth(`${API_BASE_URL}/settings/notifications/test/${providerType}`, {
    method: 'POST',
  });
};
  