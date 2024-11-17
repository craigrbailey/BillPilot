import { API_BASE_URL, fetchWithAuth } from './baseAPI';

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

export const fetchBillPaymentHistory = async () => {
  return fetchWithAuth(`${API_BASE_URL}/bills/payment-history`);
};

export const deletePayment = async (paymentId) => {
  return fetchWithAuth(`${API_BASE_URL}/bills/payments/${paymentId}`, {
    method: 'DELETE',
  });
}; 