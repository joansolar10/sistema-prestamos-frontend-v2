import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerPortalAPI } from '../services/api';

export default function CustomerLoanDetail() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    try {
      const { data } = await customerPortalAPI.getMyLoan(id);
      setLoan(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!loan) return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ fontSize: '1.5rem', color: '#667eea', fontWeight: 'bold' }}>
        Cargando...
      </div>
    </div>
  );

  const statusColors = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    paid: { bg: '#d1fae5', color: '#065f46' },
    overdue: { bg: '#fee2e2', color: '#991b1b' },
    partial: { bg: '#dbeafe', color: '#1e40af' }
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>
          Préstamo {loan.loan_number}
        </h1>
        <button onClick={() => navigate('/customer/dashboard')} style={{
          padding: '0.5rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '2rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          ← Volver
        </button>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Resumen del préstamo */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>
              S/ {parseFloat(loan.principal_amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tasa de interés</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>
              {loan.interest_rate}%
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Plazo</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>
              {loan.term_months} meses
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pagado</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              S/ {parseFloat(loan.paid_amount || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Saldo</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
              S/ {parseFloat(loan.outstanding_balance).toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Estado</p>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              background: statusColors[loan.status]?.bg || '#e5e7eb',
              color: statusColors[loan.status]?.color || '#374151',
              fontWeight: '600',
              fontSize: '1rem',
              textTransform: 'capitalize'
            }}>
              {loan.status}
            </span>
          </div>
        </div>

        {/* Cronograma */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Cronograma de Pagos
          </h2>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'center' }}>#</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Capital</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Interés</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Cuota</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Saldo</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loan.payment_schedule?.map(p => (
                <tr key={p.installment_number} style={{
                  borderBottom: '1px solid #e5e7eb',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                    {p.installment_number}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(p.due_date).toLocaleDateString('es-PE', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    S/ {parseFloat(p.principal_amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    S/ {parseFloat(p.interest_amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    S/ {parseFloat(p.total_amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#6b7280' }}>
                    S/ {parseFloat(p.remaining_balance).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '1rem',
                      background: statusColors[p.status]?.bg || '#e5e7eb',
                      color: statusColors[p.status]?.color || '#374151',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      textTransform: 'capitalize'
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}