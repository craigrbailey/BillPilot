import { API_BASE_URL, fetchWithAuth } from './baseAPI';

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