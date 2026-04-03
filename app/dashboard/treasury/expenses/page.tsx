'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, X as XIcon, Info, Download, ChevronDown, Wallet, Calendar, User, Trash2, ArrowUpRight, TrendingDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddThirdPartyModal, setShowAddThirdPartyModal] = useState(false);
  const [newThirdPartyName, setNewThirdPartyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPayer, setSelectedPayer] = useState('');
  const [account, setAccount] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  
  const [thirdParties, setThirdParties] = useState([
    { value: 'tercero1', label: 'Proveedor Ejemplo S.A.' },
    { value: 'tercero2', label: 'Mantenimiento Juan' }
  ]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await db.list('expenses');
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPayer || !account || !value || !description) {
      alert('Por favor complete todos los campos obligatorios (*).');
      return;
    }
    const payerName = thirdParties.find(t => t.value === selectedPayer)?.label || 'Desconocido';
    const newExpense = {
      name: payerName,
      payerId: selectedPayer,
      account,
      value: parseFloat(value),
      description,
      date,
      createdAt: new Date().toISOString(),
      type: 'EXPENSE'
    };

    try {
      const docId = await db.create('expenses', newExpense);
      setExpenses(prev => [{ ...newExpense, id: docId, _docId: docId }, ...prev]);
      setShowModal(false);
      
      // Reset form
      setSelectedPayer('');
      setAccount('');
      setValue('');
      setDescription('');
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error al guardar el egreso.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este registro de egreso?')) {
      try {
        await db.delete('expenses', id);
        setExpenses(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const filtered = expenses.filter((m: any) =>
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = filtered.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.2)' }}>
              <TrendingDown size={28} />
           </div>
           <div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>Egresos y Gastos</h1>
             <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>Control de gastos operativos y pagos a proveedores</p>
           </div>
        </div>
        <button
          className="btn-premium"
          style={{ background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Registrar Egreso
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
         <div className="glass-panel" style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
               <Wallet size={24} />
            </div>
            <div>
               <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Periodo</div>
               <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>${totalExpenses.toLocaleString()}</div>
            </div>
         </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
           <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
           <input 
             type="text" 
             placeholder="Buscar por beneficiario o descripción..." 
             className="input-premium"
             style={{ width: '100%', height: '52px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', paddingLeft: '48px', outline: 'none', fontSize: '14px' }}
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
           />
        </div>
        <button style={{ height: '52px', padding: '0 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
           <Download size={18} /> Exportar
        </button>
      </div>

      <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
             <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
             <p style={{ marginTop: '16px', fontWeight: '800', color: '#64748b', fontSize: '14px' }}>Cargando información contable...</p>
          </div>
        ) : filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Beneficiario</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cuenta / Concepto</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</th>
                <th style={{ textAlign: 'right', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} className="table-row" style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                          <User size={18} />
                       </div>
                       <div>
                          <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{m.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{m.description}</div>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                     <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: '800' }}>{m.account}</span>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '15px', color: '#ef4444', fontWeight: '900' }}>
                    ${m.value.toLocaleString()}
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Calendar size={14} />
                       {new Date(m.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                     <button onClick={() => handleDelete(m.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff1f2', color: '#e11d48', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', margin: '0 auto 24px', border: '1px solid #f1f5f9' }}>
               <TrendingDown size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0' }}>Bandeja vacía</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', maxWidth: '300px', margin: '0 auto' }}>
              No se han registrado egresos o gastos recientemente.
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '550px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', animation: 'modalSlide 0.3s ease-out' }}>
            <div style={{ background: '#ef4444', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                     <TrendingDown size={20} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white' }}>Nuevo Egreso</h2>
               </div>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><XIcon size={24} /></button>
            </div>

            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Fecha del Gasto</label>
                  <input 
                    type="date"
                    className="input-premium"
                    style={{ width: '100%', height: '52px', background: '#f8fafc' }}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Valor $ *</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="input-premium" 
                    style={{ width: '100%', height: '52px', background: '#f8fafc', fontWeight: '900', color: '#ef4444' }}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Beneficiario / Tercero <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowAddThirdPartyModal(true); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Plus size={14} /> Nuevo Beneficiario
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '52px', fontSize: '14px', borderRadius: '14px', appearance: 'none', background: '#f8fafc', color: '#1e293b', fontWeight: '600' }}
                    value={selectedPayer}
                    onChange={(e) => setSelectedPayer(e.target.value)}
                  >
                    <option value="">Seleccione el beneficiario</option>
                    {thirdParties.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Cuenta Origen *</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '52px', background: '#f8fafc' }}
                      value={account}
                      onChange={e => setAccount(e.target.value)}
                    >
                      <option value="">Seleccione</option>
                      <option value="Caja Fuerte">Caja Fuerte</option>
                      <option value="Banco Principal">Banco Principal</option>
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Descripción / Concepto *</label>
                  <input 
                    type="text"
                    placeholder="Ej. Pago servicios mes de Marzo"
                    className="input-premium" 
                    style={{ width: '100%', height: '52px', background: '#f8fafc' }}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: '#f8fafc' }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.3)' }}
              >
                Guardar Egreso
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddThirdPartyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 3010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)', animation: 'modalSlide 0.2s ease-out' }}>
            <div style={{ background: '#1e293b', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'white' }}>Nuevo Beneficiario</h2>
              <button onClick={() => { setShowAddThirdPartyModal(false); setNewThirdPartyName(''); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><XIcon size={20} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Nombre Completo o Razón Social *</label>
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Ej. Cooperativa de Ahorro"
                style={{ width: '100%', height: '48px', background: '#f8fafc' }}
                value={newThirdPartyName}
                onChange={e => setNewThirdPartyName(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setShowAddThirdPartyModal(false); setNewThirdPartyName(''); }} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              <button 
                onClick={() => {
                  if (!newThirdPartyName.trim()) { alert('Debe ingresar un nombre'); return; }
                  const newValue = 'tercero_' + Date.now();
                  setThirdParties(prev => [...prev, { value: newValue, label: newThirdPartyName.trim() }]);
                  setSelectedPayer(newValue);
                  setShowAddThirdPartyModal(false);
                  setNewThirdPartyName('');
                }} 
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#1e293b', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                Crear Beneficiario
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; padding: 0 16px; }
        .input-premium:focus { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); background: white !important; }
        .table-row:hover { background-color: #f8fafc !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalSlide { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </DashboardLayout>
  );
}
