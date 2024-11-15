const API_BASE_URL = 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Auth
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
};

export const register = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Logout failed');
  return response.json();
};

// Settings
export const updateSettings = async (settings) => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
};

// Categories
export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const createCategory = async (categoryData) => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }
  return response.json();
};

export const updateCategory = async (id, categoryData) => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }
  return response.json();
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
  return response.json();
};

// Bills
export const fetchBills = async () => {
  const response = await fetch(`${API_BASE_URL}/bills`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch bills');
  return response.json();
};

export const createBill = async (billData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(billData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create bill');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateBill = async (id, billData) => {
  const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(billData),
  });
  if (!response.ok) throw new Error('Failed to update bill');
  return response.json();
};

export const deleteBill = async (id) => {
  const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete bill');
  return response.json();
};

// Income
export const fetchIncomes = async () => {
  const response = await fetch(`${API_BASE_URL}/income`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch incomes');
  return response.json();
};

export const createIncome = async (incomeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/income`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(incomeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create income');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateIncome = async (id, incomeData) => {
  const response = await fetch(`${API_BASE_URL}/income/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(incomeData),
  });
  if (!response.ok) throw new Error('Failed to update income');
  return response.json();
};

export const deleteIncome = async (id) => {
  const response = await fetch(`${API_BASE_URL}/income/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete income');
  return response.json();
};

export const markIncomePaid = async (id) => {
  const response = await fetch(`${API_BASE_URL}/income/${id}/paid`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to mark income as paid');
  return response.json();
}; 