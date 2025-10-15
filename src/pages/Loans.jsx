import { useState, useEffect } from 'react';
import { loansAPI, customersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '', principal_amount: '', interest_rate: '', interest_type: 'fixed',
    term_months: '', disbursement_date: '', first_payment_date: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadLoans();
    loadCustomers();
  }, []);

  const loadLoans = async () => {
    try {
      const { data } = await loansAPI.getAll();
      setLoans(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data } = await customersAPI.getAll();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loansAPI.create(formData);
      setShowForm(false);
      setFormData({ customer_id: '', principal_amount: '', interest_rate: '', interest_type: 'fixed', term_months: '', disbursement_date: '', first_payment_date: '' });
      loadLoans();
    } catch (error) {
      alert('Error al crear préstamo');
    }
  };

  const statusColors = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    approved: { bg: '#dbeafe', color: '#1e40af' },
    active: { bg: '#d1fae5', color: '#065f46' },
    completed: { bg: '#e9d5ff', color: '#6b21a8' },
    defaulted: { bg: '#fee2e2', color: '#991b1b' }
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>💳 Préstamos</h1>
        <button onClick={() => navigate('/dashboard')} style={{
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
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Cartera de Préstamos</h2>
            <p style={{ color: '#6b7280' }}>Total: {loans.length} préstamos</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '0.75rem 2rem',
            background: showForm ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '2rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {showForm ? '✕ Cancelar' : '+ Nuevo Préstamo'}
          </button>
        </div>

        {showForm && (
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
            <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', gridColumn: 'span 2' }}>
              <option value="">Seleccionar cliente *</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} - {c.dni}</option>)}
            </select>
            <input required type="number" placeholder="Monto *" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input required type="number" step="0.01" placeholder="Tasa (%) *" value={formData.interest_rate} onChange={e => setFormData({...formData, interest_rate: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input required type="number" placeholder="Plazo (meses) *" value={formData.term_months} onChange={e => setFormData({...formData, term_months: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <select required value={formData.interest_type} onChange={e => setFormData({...formData, interest_type: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }}>
              <option value="fixed">Interés Fijo</option>
              <option value="variable">Interés Variable</option>
            </select>
            <input required type="date" value={formData.disbursement_date} onChange={e => setFormData({...formData, disbursement_date: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input required type="date" value={formData.first_payment_date} onChange={e => setFormData({...formData, first_payment_date: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <button type="submit" style={{
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              gridColumn: 'span 2'
            }}>
              💾 Crear Préstamo
            </button>
          </form>
        )}

        <div style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>N° Préstamo</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Monto</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Tasa</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Plazo</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(l => (
                <tr 
                  key={l.id} 
                  onClick={() => {
                    console.log('Click en préstamo:', l.id);
                    navigate(`/loans/${l.id}`);
                  }}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#667eea' }}>{l.loan_number}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>S/ {parseFloat(l.principal_amount).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{l.interest_rate}%</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{l.term_months} meses</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '1rem',
                      background: statusColors[l.status]?.bg || '#e5e7eb',
                      color: statusColors[l.status]?.color || '#374151',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      {l.status}
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