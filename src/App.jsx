import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Loans from './pages/Loans';
import LoanDetail from './pages/LoanDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerLoanDetail from './pages/CustomerLoanDetail';
import CustomerPayments from './pages/CustomerPayments';


function PrivateRoute({ children, allowedType = 'admin' }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.userType !== allowedType) return <Navigate to="/login" />;
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
          <Route path="/loans" element={<PrivateRoute><Loans /></PrivateRoute>} />
          <Route path="/loans/:id" element={<PrivateRoute><LoanDetail /></PrivateRoute>} />
          <Route path="/customer/dashboard" element={<PrivateRoute allowedType="customer"><CustomerDashboard /></PrivateRoute>} />
          <Route path="/customer/loans/:id" element={<PrivateRoute allowedType="customer"><CustomerLoanDetail /></PrivateRoute>} />
          <Route path="/customer/payments" element={<PrivateRoute allowedType="customer"><CustomerPayments /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;