'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, ChevronDown, Plus, Download, X, Save, Eye } from 'lucide-react';
import React, { useState } from 'react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('edunexus_registered_opportunities');
      return s ? JSON.parse(s) : [];
    }
    return [];
  });
  
  const [showModal, setShowModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOppName, setNewOppName] = useState('');

  const handleSave = () => {
    if (!newOppName.trim()) {
      alert('Debe ingresar un nombre o detalle para la oportunidad.');
      return;
    }
    const newOpp = {
      id: Date.now().toString(),
      name: newOppName.toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'Activo',
    };
    const updated = [...opportunities, newOpp];
    setOpportunities(updated);
    localStorage.setItem('edunexus_registered_opportunities', JSON.stringify(updated));
    setRegisterSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setRegisterSuccess(false);
      setNewOppName('');
    }, 1500);
  };

  const filtered = opportunities.filter((m: any) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Buscar oportunidades..." 
            className="input-premium"
            style={{ flex: 1, height: '38px', background: 'white', borderRadius: '4px 0 0 4px', border: '1px solid #e5e7eb', borderRight: 'none', fontSize: '13px', paddingLeft: '12px' }}
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          <button style={{ width: '40px', height: '38px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Search size={16} />
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <select style={{ appearance: 'none', height: '38px', padding: '0 30px 0 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '13px', color: '#374151', cursor: 'pointer', outline: 'none' }}>
            <option>Todos</option>
            <option>Activos</option>
            <option>Inactivos</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
        </div>

        <button style={{ height: '38px', padding: '0 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <Download size={14} /> Exportar
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
            Actividades programadas
            <span style={{ background: '#3b82f6', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '12px' }}>0</span>
            <span style={{ background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '12px' }}>0</span>
          </div>
          <button
            className="btn-premium"
            style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', padding: '0 20px', height: '42px', borderRadius: '8px', marginLeft: 'auto', fontSize: '13px', fontWeight: '600' }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Registrar oportunidad
          </button>
        </div>
      </div>

      {/* Table Panel */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
        {filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Oportunidad</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Fecha Registro</th>
                <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 20px', color: '#1f2937', fontWeight: '600', fontSize: '13px' }}>{m.name}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button title="Ver/Editar" style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              No hay registros, verifique los filtros de la consulta o <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => setShowModal(true)}>cree uno nuevo</span>
            </p>
          </div>
        )}
      </div>

      {/* Floating Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Registrar oportunidad</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>

            <div style={{ padding: '30px 24px' }}>
              {registerSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ background: '#ecfdf5', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Save size={28} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', margin: '0 0 8px' }}>¡Guardado Exitoso!</h3>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>La oportunidad se ha registrado correctamente.</p>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Detalles de la oportunidad *</label>
                  <input 
                    type="text" 
                    className="input-premium" 
                    placeholder="Ej. Interesado en diplomado..."
                    style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px' }}
                    value={newOppName} 
                    onChange={e => setNewOppName(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {!registerSuccess && (
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
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
