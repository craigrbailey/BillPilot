import { API_BASE_URL, fetchWithAuth } from './baseAPI';

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