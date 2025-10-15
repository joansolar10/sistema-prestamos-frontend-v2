import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerPortalAPI, paymentsAPI } from '../services/api';

export default function CustomerPayments() {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState('');
  const [paymentData, setPaymentData] = useState({
    payment_method: 'transfer',
    reference_number: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const { data } = await customerPortalAPI.getMyLoans();
      console.log('Loans data:', data); // DEBUG
      const activeLoans = data.filter(l => l.status === 'active' || l.status === 'approved');
      console.log('Active loans:', activeLoans); // DEBUG
      console.log('First loan schedule:', activeLoans[0]?.payment_schedule); // DEBUG
      setLoans(activeLoans);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoan || !selectedInstallment) {
      alert('Selecciona un préstamo y una cuota');
      return;
    }

    const loan = loans.find(l => l.id === selectedLoan);
    const installment = loan.payment_schedule.find(p => p.id === selectedInstallment);
    
    // Cálculo del monto pendiente (total - pagado)
    const paidAmount = parseFloat(installment.paid_amount) || 0;
    const amountToPay = parseFloat(installment.total_amount) - paidAmount;
    
    if (amountToPay <= 0) {
      alert('Error: La cuota seleccionada ya está pagada o el monto pendiente es cero.');
      loadLoans(); // Recarga para limpiar si es un error de UI/Cache
      return;
    }

    // DEBUG - Agrega estas líneas
    console.log('Token:', localStorage.getItem('token'));
    console.log('Payload:', {
      loan_id: selectedLoan,
      schedule_id: selectedInstallment,
      amount: amountToPay.toFixed(2), // Usamos el monto pendiente
      payment_date: new Date().toISOString().split('T')[0], // Usamos la fecha actual para el pago
      ...paymentData
    });

    try {
      await paymentsAPI.create({
        loan_id: selectedLoan,
        schedule_id: selectedInstallment,
        amount: amountToPay.toFixed(2), // Enviamos el monto pendiente
        // Mejor usar la fecha actual para la transacción
        payment_date: new Date().toISOString().split('T')[0], 
        ...paymentData
      });

      alert('Pago registrado exitosamente. Se reflejará en tu cronograma.');
      setSelectedLoan('');
      setSelectedInstallment('');
      setPaymentData({
        payment_method: 'transfer',
        reference_number: '',
        notes: ''
      });
      // Importante: Volvemos a cargar los préstamos para refrescar la lista de cuotas
      loadLoans(); 
    } catch (error) {
      console.error('Error completo:', error); // DEBUG
      alert('Error al registrar pago: ' + (error.response?.data?.detail || 'Error desconocido'));
    }
  };

  const selectedLoanData = loans.find(l => l.id === selectedLoan);
  // FILTRO CORREGIDO: Incluye 'pending' y 'partial' para permitir pagos restantes.
  const pendingInstallments = selectedLoanData?.payment_schedule?.filter(
    p => p.status === 'pending' || p.status === 'partial'
  ) || [];
  
  const selectedInstallmentData = pendingInstallments.find(p => p.id === selectedInstallment);
  
  // Cálculo del monto pendiente para mostrar en el detalle
  const displayAmount = selectedInstallmentData 
    ? parseFloat(selectedInstallmentData.total_amount) - (parseFloat(selectedInstallmentData.paid_amount) || 0)
    : 0;

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
          💳 Realizar Pago
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

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {loans.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '1rem' }}>
              No tienes préstamos activos
            </p>
            <button onClick={() => navigate('/customer/dashboard')} style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Ir al dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
              Información del Pago
            </h2>

            {/* Selección de préstamo */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>
                Seleccionar Préstamo *
              </label>
              <select 
                required 
                value={selectedLoan} 
                onChange={e => {
                  setSelectedLoan(e.target.value);
                  setSelectedInstallment('');
                }}
                style={{ 
                  width: '100%',
                  padding: '0.75rem', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  fontSize: '1rem' 
                }}
              >
                <option value="">-- Selecciona un préstamo --</option>
                {loans.map(loan => (
                  <option key={loan.id} value={loan.id}>
                    {loan.loan_number} - S/ {parseFloat(loan.outstanding_balance).toFixed(2)} pendiente
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de cuota */}
            {selectedLoan && (
              <div style={{ marginBottom: '1.5rem' }}>
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
                      Cuota #{inst.installment_number} - Vence: {new Date(inst.due_date).toLocaleDateString('es-PE')} - Pendiente: S/ {
                        (parseFloat(inst.total_amount) - (parseFloat(inst.paid_amount) || 0)).toFixed(2)
                      }
                    </option>
                  ))}
                </select>
                {pendingInstallments.length === 0 && (
                  <p style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.875rem' }}>
                    ✓ Todas las cuotas están pagadas
                  </p>
                )}
              </div>
            )}

            {/* Detalle de cuota seleccionada */}
            {selectedInstallmentData && (
              <div style={{ 
                marginBottom: '1.5rem',
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                borderRadius: '0.75rem',
                border: '2px solid #0ea5e9'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#0369a1', fontSize: '1.125rem', fontWeight: 'bold' }}>
                  📋 Detalle de la Cuota (Monto Pendiente)
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1rem', 
                  marginBottom: '1rem' 
                }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Fecha Vencimiento</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {new Date(selectedInstallmentData.due_date).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Capital Pendiente</p>
                    {/* Nota: Mostrar el desglose exacto de capital e interés pendiente es complejo si hubo pagos parciales,
                        ya que el pago parcial se aplica primero a interés. Por ahora, solo mostramos el total. 
                        Tu backend maneja la lógica de aplicación internamente.
                    */}
                    <p style={{ fontWeight: 'bold', fontSize: '1rem', color: '#6b7280' }}>
                      (Ver en Cronograma)
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Interés Pendiente</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1rem', color: '#6b7280' }}>
                      (Ver en Cronograma)
                    </p>
                  </div>
                </div>
                <div style={{ 
                  padding: '1rem', 
                  background: 'white', 
                  borderRadius: '0.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Pendiente a Pagar</p>
                  <p style={{ fontWeight: 'bold', fontSize: '2rem', color: '#0369a1' }}>
                    S/ {displayAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Información del pago (método, referencia, notas) */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>
                  Método de Pago *
                </label>
                <select 
                  required 
                  value={paymentData.payment_method} 
                  onChange={e => setPaymentData({...paymentData, payment_method: e.target.value})} 
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    fontSize: '1rem' 
                  }}
                >
                  <option value="transfer">🏦 Transferencia Bancaria</option>
                  <option value="cash">💵 Efectivo</option>
                  <option value="card">💳 Tarjeta</option>
                  <option value="check">📝 Cheque</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>
                  Número de Referencia / Operación
                </label>
                <input 
                  placeholder="Ej: OP-123456789" 
                  value={paymentData.reference_number} 
                  onChange={e => setPaymentData({...paymentData, reference_number: e.target.value})} 
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    fontSize: '1rem' 
                  }} 
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Código de operación de tu transferencia o comprobante de pago
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>
                  Notas Adicionales
                </label>
                <textarea 
                  placeholder="Información adicional sobre el pago..." 
                  value={paymentData.notes} 
                  onChange={e => setPaymentData({...paymentData, notes: e.target.value})} 
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }} 
                />
              </div>

              <div style={{
                padding: '1rem',
                background: '#e0f7f4', // Color más neutral, ya que ahora es automático
                borderRadius: '0.5rem',
                border: '1px solid #10b981'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#065f46' }}>
                  ✅ <strong>Notificación:</strong> El pago se registra y se aplica automáticamente al cronograma.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={!selectedInstallment}
                style={{
                  padding: '1rem',
                  background: selectedInstallment 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: selectedInstallment ? 'pointer' : 'not-allowed',
                  transition: 'transform 0.2s',
                  boxShadow: selectedInstallment ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedInstallment) e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  if (selectedInstallment) e.target.style.transform = 'scale(1)';
                }}
              >
                💰 Registrar Pago por S/ {displayAmount.toFixed(2)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}