import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerPortalAPI } from '../services/api';

export default function CustomerDashboard() {
  const [loans, setLoans] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    principal_amount: '',
    interest_rate: '',
    term_months: '',
    disbursement_date: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const { data } = await customerPortalAPI.getMyLoans();
      setLoans(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await customerPortalAPI.requestLoan(formData);
      setShowRequestForm(false);
      setFormData({ principal_amount: '', interest_rate: '', term_months: '', disbursement_date: '' });
      loadLoans();
      alert('Solicitud enviada. Espera aprobación del administrador.');
    } catch (error) {
      alert('Error al enviar solicitud');
    }
  };

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  window.location.href = '/login';
};

  const statusColors = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    approved: { bg: '#dbeafe', color: '#1e40af' },
    active: { bg: '#d1fae5', color: '#065f46' },
    completed: { bg: '#e9d5ff', color: '#6b21a8' },
    defaulted: { bg: '#fee2e2', color: '#991b1b' }
  };

  const totalPrincipal = loans.reduce((sum, loan) => sum + parseFloat(loan.principal_amount), 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + parseFloat(loan.outstanding_balance), 0);
  const totalPaid = loans.reduce((sum, loan) => sum + parseFloat(loan.paid_amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <nav style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>
          💰 Mis Préstamos
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/customer/payments')} style={{
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '2rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            💳 Realizar Pago
          </button>
          <button onClick={handleLogout} style={{
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '2rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Resumen */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Prestado</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              S/ {totalPrincipal.toFixed(2)}
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Pagado</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              S/ {totalPaid.toFixed(2)}
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Saldo Pendiente</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              S/ {totalOutstanding.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Lista de préstamos */}
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              Mis Préstamos Activos
            </h2>
            <p style={{ color: '#6b7280' }}>Total: {loans.length} préstamos</p>
          </div>
          <button 
            onClick={() => setShowRequestForm(true)}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            + Solicitar Préstamo
          </button>
        </div>

        {showRequestForm && (
          <form onSubmit={handleSubmit} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <h3 style={{ gridColumn: '1 / -1', fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
              Solicitar Nuevo Préstamo
            </h3>
            <input 
              required 
              type="number" 
              placeholder="Monto solicitado *" 
              value={formData.principal_amount} 
              onChange={e => setFormData({...formData, principal_amount: e.target.value})} 
              style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} 
            />
            <input 
              required 
              type="number" 
              step="0.01" 
              placeholder="Tasa de interés (%) *" 
              value={formData.interest_rate} 
              onChange={e => setFormData({...formData, interest_rate: e.target.value})} 
              style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} 
            />
            <input 
              required 
              type="number" 
              placeholder="Plazo (meses) *" 
              value={formData.term_months} 
              onChange={e => setFormData({...formData, term_months: e.target.value})} 
              style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} 
            />
            <input 
              required 
              type="date" 
              placeholder="Fecha de desembolso *"
              value={formData.disbursement_date} 
              onChange={e => setFormData({...formData, disbursement_date: e.target.value})} 
              style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} 
            />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
              <button type="submit" style={{
                flex: 1,
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                📤 Enviar Solicitud
              </button>
              <button type="button" onClick={() => setShowRequestForm(false)} style={{
                flex: 1,
                padding: '0.875rem',
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {loans.map(loan => (
            <div
              key={loan.id}
              onClick={() => navigate(`/customer/loans/${loan.id}`)}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' }}>
                    {loan.loan_number}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {loan.term_months} meses • {loan.interest_rate}% interés
                  </p>
                </div>
                <span style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '1rem',
                  background: statusColors[loan.status]?.bg || '#e5e7eb',
                  color: statusColors[loan.status]?.color || '#374151',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textTransform: 'capitalize'
                }}>
                  {loan.status}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Monto</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                    S/ {parseFloat(loan.principal_amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Pagado</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                    S/ {parseFloat(loan.paid_amount || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Saldo</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
                    S/ {parseFloat(loan.outstanding_balance).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loans.length === 0 && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '1.5rem', color: '#6b7280' }}>
              No tienes préstamos registrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}