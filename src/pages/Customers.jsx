import { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editScore, setEditScore] = useState('');
  const [formData, setFormData] = useState({
    dni: '', full_name: '', phone: '', email: '', address: '',
    monthly_income: '', employment_status: '', employer_name: '', credit_score: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

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
      await customersAPI.create(formData);
      setShowForm(false);
      setFormData({ dni: '', full_name: '', phone: '', email: '', address: '', monthly_income: '', employment_status: '', employer_name: '', credit_score: '' });
      loadCustomers();
    } catch (error) {
      alert('Error al crear cliente');
    }
  };

  const handleRowClick = (customer) => {
    setEditingCustomer(customer.id);
    setEditScore(customer.credit_score || '');
  };

  const handleScoreUpdate = async (customerId) => {
    try {
      await customersAPI.update(customerId, { credit_score: editScore });
      setEditingCustomer(null);
      loadCustomers();
    } catch (error) {
      alert('Error al actualizar score');
    }
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditScore('');
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>👥 Clientes</h1>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Gestión de Clientes</h2>
            <p style={{ color: '#6b7280' }}>Total: {customers.length} clientes</p>
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
            {showForm ? '✕ Cancelar' : '+ Nuevo Cliente'}
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
            <input required placeholder="DNI *" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input required placeholder="Nombre completo *" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input placeholder="Teléfono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input placeholder="Dirección" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', gridColumn: 'span 2' }} />
            <input type="number" placeholder="Ingreso mensual" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input placeholder="Estado laboral" value={formData.employment_status} onChange={e => setFormData({...formData, employment_status: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input placeholder="Empresa" value={formData.employer_name} onChange={e => setFormData({...formData, employer_name: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
            <input type="number" placeholder="Score crediticio" value={formData.credit_score} onChange={e => setFormData({...formData, credit_score: e.target.value})} style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
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
              💾 Guardar Cliente
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
            <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>DNI</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Teléfono</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => handleRowClick(c)}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    background: editingCustomer === c.id ? '#f0f9ff' : 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (editingCustomer !== c.id) e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    if (editingCustomer !== c.id) e.currentTarget.style.background = 'white';
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{c.dni}</td>
                  <td style={{ padding: '1rem' }}>{c.full_name}</td>
                  <td style={{ padding: '1rem' }}>{c.phone}</td>
                  <td style={{ padding: '1rem', color: '#667eea' }}>{c.email}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    {editingCustomer === c.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={editScore}
                          onChange={(e) => setEditScore(e.target.value)}
                          style={{
                            width: '80px',
                            padding: '0.5rem',
                            border: '2px solid #667eea',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleScoreUpdate(c.id)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        background: c.credit_score > 700 ? '#d1fae5' : c.credit_score ? '#fee2e2' : '#e5e7eb',
                        color: c.credit_score > 700 ? '#065f46' : c.credit_score ? '#991b1b' : '#6b7280',
                        fontWeight: '600'
                      }}>
                        {c.credit_score || 'N/A'}
                      </span>
                    )}
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