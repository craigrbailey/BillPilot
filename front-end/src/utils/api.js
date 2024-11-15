import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Function to handle unauthorized/forbidden access
const handleAuthError = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Authentication required');
  }

  const data = await response.json();
  if (!response.ok) {
    if (data.error === 'Invalid token') {
      handleAuthError();
      throw new Error('Authentication required');
    }
    throw new Error(data.error || 'API request failed');
  }
  return data;
};

// Global fetch wrapper with error handling
const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Authentication required') {
      handleAuthError();
    }
    throw error;
  }
};

// Auth endpoints - Don't use fetchWithAuth for login/register
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

    // Store the token immediately
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const register = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const logout = async () => {
  return fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
  });
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

export const deleteBill = async (id, deleteAll = false) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/${id}?deleteAll=${deleteAll}`, {
    method: 'DELETE',
  });
};

export const markBillPaid = async (billId, paidDate) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/${billId}/pay`, {
    method: 'PUT',
    body: JSON.stringify({ paidDate }),
  });
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