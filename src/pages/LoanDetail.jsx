import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loansAPI, paymentsAPI } from '../services/api';

export default function LoanDetail() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState('');
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    try {
      const { data } = await loansAPI.getById(id);
      setLoan(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedInstallment) {
      alert('Selecciona una cuota');
      return;
    }

    const installment = loan.payment_schedule.find(p => p.id === selectedInstallment);
    
    try {
      await paymentsAPI.create({
        loan_id: id,
        schedule_id: selectedInstallment,
        amount: installment.total_amount,
        ...paymentData
      });
      
      setShowPaymentForm(false);
      setSelectedInstallment('');
      setPaymentData({ 
        payment_date: new Date().toISOString().split('T')[0], 
        payment_method: 'cash', 
        reference_number: '', 
        notes: '' 
      });
      loadLoan();
      alert('Pago registrado exitosamente');
    } catch (error) {
      alert('Error al registrar pago: ' + (error.response?.data?.detail || 'Error desconocido'));
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

  const pendingInstallments = loan.payment_schedule?.filter(p => p.status === 'pending') || [];
  const selectedInstallmentData = loan.payment_schedule?.find(p => p.id === selectedInstallment);

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
        <button onClick={() => navigate('/loans')} style={{
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

        {/* Botón de registrar pago */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Cronograma de Pagos</h2>
          {pendingInstallments.length > 0 && (
            <button onClick={() => setShowPaymentForm(!showPaymentForm)} style={{
              padding: '0.75rem 2rem',
              background: showPaymentForm ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {showPaymentForm ? '✕ Cancelar' : '+ Registrar Pago'}
            </button>
          )}
        </div>

        {/* Formulario de pago */}
        {showPaymentForm && (
          <form onSubmit={handlePayment} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>
                Seleccionar Cuota *
              </label>
              <select 
                required 
                value={selectedInstallment} 
                onChange={e => setSelectedInstallment(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.75rem', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  fontSize: '1rem' 
                }}
              >
                <option value="">-- Selecciona una cuota pendiente --</option>
                {pendingInstallments.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    Cuota #{inst.installment_number} - {new Date(inst.due_date).toLocaleDateString('es-PE')} - S/ {parseFloat(inst.total_amount).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {selectedInstallmentData && (
              <div style={{ 
                gridColumn: '1 / -1', 
                padding: '1rem', 
                background: '#f0f9ff', 
                borderRadius: '0.5rem',
                border: '2px solid #0ea5e9'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#0369a1' }}>Detalle de la cuota</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Capital</p>
                    <p style={{ fontWeight: 'bold' }}>S/ {parseFloat(selectedInstallmentData.principal_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Interés</p>
                    <p style={{ fontWeight: 'bold' }}>S/ {parseFloat(selectedInstallmentData.interest_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total a pagar</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#0369a1' }}>
                      S/ {parseFloat(selectedInstallmentData.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <input 
              required 
              type="date" 
              value={paymentData.payment_date} 
              onChange={e => setPaymentData({...paymentData, payment_date: e.target.value})} 
              style={{ 
                padding: '0.75rem', 
                border: '2px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                fontSize: '1rem' 
              }} 
            />
            
            <select 
              required 
              value={paymentData.payment_method} 
              onChange={e => setPaymentData({...paymentData, payment_method: e.target.value})} 
              style={{ 
                padding: '0.75rem', 
                border: '2px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                fontSize: '1rem' 
              }}
            >
              <option value="cash">💵 Efectivo</option>
              <option value="transfer">🏦 Transferencia</option>
              <option value="check">📝 Cheque</option>
              <option value="card">💳 Tarjeta</option>
            </select>
            
            <input 
              placeholder="N° Referencia" 
              value={paymentData.reference_number} 
              onChange={e => setPaymentData({...paymentData, reference_number: e.target.value})} 
              style={{ 
                padding: '0.75rem', 
                border: '2px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                fontSize: '1rem' 
              }} 
            />
            
            <textarea 
              placeholder="Notas adicionales" 
              value={paymentData.notes} 
              onChange={e => setPaymentData({...paymentData, notes: e.target.value})} 
              style={{ 
                padding: '0.75rem', 
                border: '2px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                fontSize: '1rem',
                gridColumn: 'span 2',
                minHeight: '80px',
                resize: 'vertical'
              }} 
            />
            
            <button type="submit" style={{
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              gridColumn: 'span 2'
            }}>
              💾 Guardar Pago
            </button>
          </form>
        )}

        {/* Tabla de cronograma */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
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
                  transition: 'background 0.2s',
                  background: selectedInstallment === p.id ? '#f0f9ff' : 'white'
                }}
                onMouseEnter={(e) => {
                  if (selectedInstallment !== p.id) e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (selectedInstallment !== p.id) e.currentTarget.style.background = 'white';
                }}
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