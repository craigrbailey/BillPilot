// Base API utilities and common functions
export const API_BASE_URL = 'http://localhost:3000/api';

// Function to handle unauthorized/forbidden access
export const handleAuthError = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Global fetch wrapper with error handling
export const fetchWithAuth = async (url, options = {}) => {
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
    if (error.message === 'Authentication required' || 
        error.message === 'Invalid token' ||
        error.message === 'Token expired') {
      handleAuthError();
    }
    throw error;
  }
}; 