'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, X as XIcon, Info, Download, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('edunexus_registered_expenses');
      return s ? JSON.parse(s) : [];
    }
    return [];
  });
  
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

  const handleSave = () => {
    if (!selectedPayer || !account || !value || !description) {
      alert('Por favor complete todos los campos obligatorios (*).');
      return;
    }
    const payerName = thirdParties.find(t => t.value === selectedPayer)?.label || 'Desconocido';
    const newExpense = {
      id: Date.now().toString(),
      name: payerName,
      account,
      value: parseFloat(value),
      description,
      date,
      createdAt: new Date().toISOString(),
    };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    localStorage.setItem('edunexus_registered_expenses', JSON.stringify(updated));
    alert('Egreso guardado exitosamente');
    setShowModal(false);
    
    // Reset form
    setSelectedPayer('');
    setAccount('');
    setValue('');
    setDescription('');
  };

  const filtered = expenses.filter((m: any) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Buscar egreso..." 
            className="input-premium"
            style={{ flex: 1, height: '38px', background: 'white', borderRadius: '4px 0 0 4px', border: '1px solid #e5e7eb', borderRight: 'none', fontSize: '13px', paddingLeft: '12px' }}
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          <button style={{ width: '40px', height: '38px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Search size={16} />
          </button>
        </div>

        <button style={{ height: '38px', padding: '0 16px', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', borderRight: '1px solid #e5e7eb' }}>
          <Download size={14} /> Exportar
        </button>

        <button 
          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Búsqueda avanzada <ChevronDown size={14} />
        </button>

        <button
          className="btn-premium"
          style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', padding: '0 20px', height: '42px', borderRadius: '8px', marginLeft: 'auto', fontSize: '13px', fontWeight: '700' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Agregar egreso
        </button>
      </div>

      <div style={{ marginBottom: '16px', width: '300px' }}>
        <select className="input-premium" style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', appearance: 'none', background: 'white', color: '#374151' }}>
          <option>Fechas: Todas</option>
          <option>Hoy</option>
          <option>Esta semana</option>
          <option>Este mes</option>
        </select>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', border: '1px solid #e5e7eb', minHeight: '120px', borderRadius: '8px' }}>
        {filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>NOMBRE</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>CUENTA</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>VALOR</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>FECHA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 20px', color: '#1f2937', fontWeight: '600', fontSize: '13px' }}>
                    {m.name}
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', fontWeight: '500' }}>{m.description}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4b5563', fontWeight: '500' }}>
                    {m.account}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>
                    ${m.value.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>
                    {new Date(m.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'left' }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              No hay registros, verifique los filtros de la consulta o <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => setShowModal(true)}>cree uno nuevo</span>
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '550px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Agregar egreso</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><XIcon size={20} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ width: '50%' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Fecha
                </label>
                <input 
                  type="date"
                  className="input-premium"
                  style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', background: 'white', color: '#6b7280' }}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                    Nombre <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowAddThirdPartyModal(true); }}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <Plus size={14} /> Agregar tercero
                  </button>
                </div>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', appearance: 'none', background: 'white', color: '#6b7280' }}
                  value={selectedPayer}
                  onChange={(e) => setSelectedPayer(e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {thirdParties.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Cuenta <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', appearance: 'none', background: 'white', color: '#6b7280' }}
                    value={account}
                    onChange={e => setAccount(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    <option value="Caja Fuerte">Caja Fuerte</option>
                    <option value="Banco Principal">Banco Principal</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Valor <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="number"
                    className="input-premium" 
                    style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', background: 'white', color: '#374151' }}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Descripción <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text"
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', background: 'white', color: '#374151' }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#4b5563', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddThirdPartyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 3010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '380px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)' }}>
            <div style={{ background: 'var(--primary)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'white' }}>Agregar tercero</h2>
              <button 
                onClick={() => { setShowAddThirdPartyModal(false); setNewThirdPartyName(''); }} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}
              >
                <XIcon size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Nombre completo <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Ej. Juan Pérez"
                style={{ width: '100%', height: '40px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px' }}
                value={newThirdPartyName}
                onChange={e => setNewThirdPartyName(e.target.value)}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && newThirdPartyName.trim()) {
                    const newValue = 'tercero_' + Date.now();
                    setThirdParties(prev => [...prev, { value: newValue, label: newThirdPartyName.trim() }]);
                    setSelectedPayer(newValue);
                    setShowAddThirdPartyModal(false);
                    setNewThirdPartyName('');
                  }
                }}
              />
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f9fafb' }}>
              <button 
                onClick={() => { setShowAddThirdPartyModal(false); setNewThirdPartyName(''); }} 
                style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', color: '#4b5563', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (!newThirdPartyName.trim()) {
                    alert('Debe ingresar un nombre');
                    return;
                  }
                  const newValue = 'tercero_' + Date.now();
                  setThirdParties(prev => [...prev, { value: newValue, label: newThirdPartyName.trim() }]);
                  setSelectedPayer(newValue);
                  setShowAddThirdPartyModal(false);
                  setNewThirdPartyName('');
                }} 
                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
