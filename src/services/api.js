import axios from 'axios';

// Usaremos la variable de entorno. La URL DEBE ser: http://127.0.0.1:8000/api
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000/api';

// LOG DE DEBUG
console.log('🔧 API_URL configurada como:', API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Lista de rutas que NO requieren token (login/register)
  const isAuthRequest = config.url.includes('/auth/login') || 
                        config.url.includes('/auth/customer/login') || 
                        config.url.includes('/auth/register');
  
  if (token && !isAuthRequest) {
    // Esto es lo que resuelve el 401 (Unauthorized) al enviar el token.
    config.headers.Authorization = `Bearer ${token}`; 
  }
  
  // El log debería mostrar: http://127.0.0.1:8000/api/payments/admin
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
    
    // Si obtenemos 401 y no es un intento de login/registro, redirigir
    // Esta lógica es la que podría causar un loop si falla la carga inicial de datos.
    if (error.response?.status === 401 && !isAuthRequest) {
      console.error("401 Unauthorized. Clearing session and redirecting to login.");
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
  // Esto ahora apuntará a /api/payments/admin si la baseURL es /api
  createAdmin: (data) => api.post('/payments/admin', data),
  approve: (paymentId) => api.put(`/payments/${paymentId}/approve`),
  reject: (paymentId) => api.put(`/payments/${paymentId}/reject`),
  getAll: () => api.get('/payments/')
};

export default api;