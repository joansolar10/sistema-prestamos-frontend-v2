import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loansAPI, customerPortalAPI } from '../services/api';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pendingLoans, setPendingLoans] = useState([]);

  const cards = [
    { title: 'Clientes', icon: '👥', color: '#667eea', path: '/customers', description: 'Gestiona tu cartera de clientes' },
    { title: 'Préstamos', icon: '💳', color: '#f093fb', path: '/loans', description: 'Administra préstamos activos' }
  ];

  useEffect(() => {
    loadPendingLoans();
  }, []);

  const loadPendingLoans = async () => {
    try {
      const { data } = await loansAPI.getAll();
      setPendingLoans(data.filter(loan => loan.status === 'pending'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (loanId) => {
    try {
      await customerPortalAPI.approve(loanId);
      loadPendingLoans();
      alert('Préstamo aprobado');
    } catch (error) {
      alert('Error al aprobar');
    }
  };

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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          💰 Sistema de Préstamos
        </h1>
        <button onClick={logout} style={{
          padding: '0.5rem 1.5rem',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '2rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Cerrar Sesión
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Bienvenido al Panel de Control
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Selecciona una opción para comenzar</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => navigate(card.path)}
              style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: card.color,
                opacity: 0.1,
                borderRadius: '50%'
              }}></div>
              
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {card.icon}
              </div>
              
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: card.color,
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                {card.title}
              </h3>
              
              <p style={{
                color: '#6b7280',
                textAlign: 'center',
                fontSize: '0.95rem'
              }}>
                {card.description}
              </p>

              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: `${card.color}15`,
                borderRadius: '0.5rem',
                textAlign: 'center',
                color: card.color,
                fontWeight: '600'
              }}>
                Acceder →
              </div>
            </div>
          ))}
        </div>

        {pendingLoans.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              📋 Solicitudes Pendientes ({pendingLoans.length})
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingLoans.map(loan => (
                <div key={loan.id} style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#667eea' }}>{loan.loan_number}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      S/ {parseFloat(loan.principal_amount).toFixed(2)} • {loan.term_months} meses
                    </p>
                  </div>
                  <button onClick={() => handleApprove(loan.id)} style={{
                    padding: '0.5rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    ✓ Aprobar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}