import { API_BASE_URL, fetchWithAuth } from './baseAPI';

export const fetchPayees = async () => {
  return fetchWithAuth(`${API_BASE_URL}/payees`);
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

export const generateRecurringBills = async (payeeId) => {
  return fetchWithAuth(`${API_BASE_URL}/payees/${payeeId}/generate-bills`, {
    method: 'POST',
  });
};

export const getBillsByPayee = async (payeeId) => {
  return fetchWithAuth(`${API_BASE_URL}/payees/${payeeId}/bills`);
}; 