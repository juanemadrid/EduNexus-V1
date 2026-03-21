'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Download, ChevronDown, ChevronUp, Pencil, X as XIcon } from 'lucide-react';
import React, { useState } from 'react';

const MOCK_ACCOUNTS = [
  { id: '1', name: 'NEQUI', number: '3008491907', abbreviation: 'NQ', paymentMethods: 'Consignación', type: 'Banco', status: 'Activa' }
];

export default function AccountsPage() {
  const [accountsList, setAccountsList] = useState(MOCK_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Búsqueda Avanzada
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [incluirInactivas, setIncluirInactivas] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create');
  
  const [form, setForm] = useState({
    id: '',
    type: '',
    number: '',
    name: '',
    abbreviation: '',
    paymentMethods: '',
    status: 'Activa'
  });

  const filtered = accountsList.filter((m: any) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.number?.includes(searchTerm) ||
    m.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar esta cuenta?')) {
      setAccountsList(prev => prev.filter(p => p.id !== id));
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setForm({ id: '', type: '', number: '', name: '', abbreviation: '', paymentMethods: '', status: 'Activa' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setForm({
      id: item.id,
      type: item.type,
      number: item.number,
      name: item.name,
      abbreviation: item.abbreviation,
      paymentMethods: item.paymentMethods,
      status: item.status
    });
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', width: '380px' }}>
          <input 
            type="text" 
            placeholder="Buscar cuentas..." 
            className="input-premium"
            style={{ flex: 1, height: '38px', background: 'white', borderRadius: '4px 0 0 4px', border: '1px solid #e5e7eb', borderRight: 'none', fontSize: '13px', paddingLeft: '12px', outline: 'none' }}
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          <button style={{ width: '40px', height: '38px', background: '#10b981', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Search size={16} />
          </button>
        </div>

        {/* Exportar */}
        <button 
          onClick={() => alert(`Exportando ${filtered.length} cuentas...`)}
          style={{ height: '38px', padding: '0 16px', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', borderRight: '1px solid #e5e7eb' }}
        >
          <Download size={14} /> Exportar
        </button>

        {/* Búsqueda avanzada */}
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Búsqueda avanzada {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Crear cuenta */}
        <button
          onClick={openCreateModal}
          className="btn-premium"
          style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', padding: '0 16px', height: '38px', borderRadius: '6px', marginLeft: 'auto', fontSize: '13px', fontWeight: '700' }}
        >
          <Plus size={16} /> Crear cuenta
        </button>

      </div>

      {/* Panel Búsqueda Avanzada */}
      {showAdvanced && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
            <input 
              type="checkbox" 
              checked={incluirInactivas} 
              onChange={() => setIncluirInactivas(!incluirInactivas)} 
              style={{ width: '16px', height: '16px', accentColor: '#10b981' }} 
            />
            ¿Incluir cuentas inactivas?
          </label>
        </div>
      )}

      {/* Tabla Principal */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', minHeight: '120px', borderRadius: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Número</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Abreviación</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Formas de pago</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Estado</th>
              <th style={{ textAlign: 'center', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '13px' }}>
                  No hay registros.
                </td>
              </tr>
            ) : (
              filtered.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 20px', color: '#374151', fontSize: '12px' }}>{m.name}</td>
                  <td style={{ padding: '10px 20px', color: '#6b7280', fontSize: '12px' }}>{m.number}</td>
                  <td style={{ padding: '10px 20px', color: '#6b7280', fontSize: '12px' }}>{m.abbreviation}</td>
                  <td style={{ padding: '10px 20px', color: '#6b7280', fontSize: '12px' }}>{m.paymentMethods}</td>
                  <td style={{ padding: '10px 20px', fontSize: '12px', color: '#6b7280' }}>{m.type}</td>
                  <td style={{ padding: '10px 20px', fontSize: '12px', color: '#6b7280' }}>{m.status}</td>
                  <td style={{ padding: '10px 20px', display: 'flex', justifyContent: 'center', gap: '8px', color: '#9ca3af' }}>
                    <button 
                      onClick={() => openEditModal(m)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Eliminar"
                    >
                      <XIcon size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar Cuenta */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
          <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '540px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
            
            <div style={{ background: '#5bba6f', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'white' }}>
                {modalMode === 'create' ? 'Crear cuenta' : 'Editar cuenta'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <XIcon size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Tipo <span style={{ color: '#ef4444' }}>*</span></label>
                <select 
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', background: 'white', color: '#374151', outline: 'none' }}
                  value={form.type}
                  onChange={e => setForm(p => ({...p, type: e.target.value}))}
                >
                  <option value="">Seleccione</option>
                  <option value="Banco">Banco</option>
                  <option value="Caja">Caja</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Número</label>
                <input 
                  type="text"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.number}
                  onChange={e => setForm(p => ({...p, number: e.target.value}))}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Nombre <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Abreviación <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.abbreviation}
                  onChange={e => setForm(p => ({...p, abbreviation: e.target.value}))}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Formas de pago <span style={{ color: '#ef4444' }}>*</span></label>
                <select 
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', background: 'white', color: '#374151', outline: 'none' }}
                  value={form.paymentMethods}
                  onChange={e => setForm(p => ({...p, paymentMethods: e.target.value}))}
                >
                  <option value="">Seleccione</option>
                  <option value="Consignación">Consignación</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="PSE">PSE</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Estado <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '38px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" value="Activa" checked={form.status === 'Activa'} onChange={() => setForm(p => ({...p, status: 'Activa'}))} style={{ accentColor: '#3b82f6', width: '14px', height: '14px' }} />
                    Activa
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" value="Inactiva" checked={form.status === 'Inactiva'} onChange={() => setForm(p => ({...p, status: 'Inactiva'}))} style={{ accentColor: '#3b82f6', width: '14px', height: '14px' }} />
                    Inactiva
                  </label>
                </div>
              </div>

            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '6px 16px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (modalMode === 'create') {
                    setAccountsList([...accountsList, { ...form, id: Date.now().toString() }]);
                  } else {
                    setAccountsList(accountsList.map(d => d.id === form.id ? form : d));
                  }
                  setShowModal(false);
                }}
                style={{ padding: '6px 16px', borderRadius: '4px', border: 'none', background: '#5bba6f', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
