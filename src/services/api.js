import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  // Siempre obtener token fresco de localStorage
  const token = localStorage.getItem('token');
  if (token && !config.url.includes('/auth/login') && !config.url.includes('/auth/customer/login') && !config.url.includes('/auth/register')) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),
  customerLogin: (credentials) => api.post('/auth/customer/login', credentials, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),
};

export const customersAPI = {
  getAll: () => api.get('/customers/'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
};

export const loansAPI = {
  getAll: () => api.get('/loans/'),
  getById: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans/', data),
};

export const customerPortalAPI = {
  getMyLoans: () => api.get('/customer-portal/loans'),
  getMyLoan: (id) => api.get(`/customer-portal/loans/${id}`),
  requestLoan: (data) => api.post('/customer-portal/loan-request', data),
  approve: (id) => api.put(`/loans/${id}/approve`),
};

export const paymentsAPI = {
  getByLoan: (loanId) => api.get(`/payments/loan/${loanId}`),
  create: (data) => api.post('/payments/', data),
  getAll: () => api.get('/payments/')
};

export default api;