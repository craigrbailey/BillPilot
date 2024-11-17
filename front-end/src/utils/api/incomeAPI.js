import { API_BASE_URL, fetchWithAuth } from './baseAPI';

// Income Sources
export const fetchIncomeSources = async () => {
  return fetchWithAuth(`${API_BASE_URL}/income/sources`);
};

export const createIncomeSource = async (sourceData) => {
  return fetchWithAuth(`${API_BASE_URL}/income/sources`, {
    method: 'POST',
    body: JSON.stringify(sourceData),
  });
};

export const updateIncomeSource = async (id, sourceData) => {
  return fetchWithAuth(`${API_BASE_URL}/income/sources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sourceData),
  });
};

export const deleteIncomeSource = async (id) => {
  return fetchWithAuth(`${API_BASE_URL}/income/sources/${id}`, {
    method: 'DELETE',
  });
};

// Income Entries
export const fetchIncomeEntries = async () => {
  return fetchWithAuth(`${API_BASE_URL}/income/entries`);
};

export const createIncomeEntry = async (entryData) => {
  return fetchWithAuth(`${API_BASE_URL}/income/entries`, {
    method: 'POST',
    body: JSON.stringify(entryData),
  });
};

export const updateIncomeEntry = async (id, entryData) => {
  return fetchWithAuth(`${API_BASE_URL}/income/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entryData),
  });
};

export const deleteIncomeEntry = async (id) => {
  return fetchWithAuth(`${API_BASE_URL}/income/entries/${id}`, {
    method: 'DELETE',
  });
};

export const fetchFuturePayments = async () => {
  return fetchWithAuth(`${API_BASE_URL}/income/future-payments`);
}; 