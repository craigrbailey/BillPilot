import { API_BASE_URL, fetchWithAuth } from './baseAPI';

export const fetchSettings = async () => {
  return fetchWithAuth(`${API_BASE_URL}/settings`);
};

export const updateSettings = async (settings) => {
  return fetchWithAuth(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

export const resetDatabase = async () => {
  return fetchWithAuth(`${API_BASE_URL}/settings/reset-database`, {
    method: 'POST',
  });
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