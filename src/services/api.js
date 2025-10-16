import axios from 'axios';

// CORRECCIÓN: Remover /api del baseURL porque el backend no usa ese prefijo
const API_URL = import.meta.env.VITE_API_URL || 'https://prestamos-api-6a81.onrender.com';

console.log('🔧 API_URL configurada como:', API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  const isAuthRequest = config.url.includes('/auth/login') || 
                        config.url.includes('/auth/customer/login') || 
                        config.url.includes('/auth/register');
  
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('📤 Request:', config.method.toUpperCase(), config.baseURL + config.url);
  
  return config;
});

// Interceptor de response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/customer/login') || 
                          error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => {
    return api.post('/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  customerLogin: (credentials) => {
    return api.post('/auth/customer/login', credentials, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
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
  createAdmin: (data) => api.post('/payments/admin', data),
  approve: (paymentId) => api.put(`/payments/${paymentId}/approve`),
  reject: (paymentId) => api.put(`/payments/${paymentId}/reject`),
  getAll: () => api.get('/payments/')
};

export default api;