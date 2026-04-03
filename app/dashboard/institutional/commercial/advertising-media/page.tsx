'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, ChevronDown, Plus, X, Save, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdvertisingMediaPage() {
  const [mediaList, setMediaList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('edunexus_registered_media');
      return s ? JSON.parse(s) : [];
    }
    return [];
  });
  
  const [showModal, setShowModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newMediaName, setNewMediaName] = useState('');

  const handleSave = () => {
    if (!newMediaName.trim()) {
      alert('Debe ingresar un nombre para el medio publicitario.');
      return;
    }
    const newMedia = {
      id: Date.now().toString(),
      name: newMediaName.toUpperCase(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    const updated = [...mediaList, newMedia];
    setMediaList(updated);
    localStorage.setItem('edunexus_registered_media', JSON.stringify(updated));
    setRegisterSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setRegisterSuccess(false);
      setNewMediaName('');
    }, 1500);
  };

  const filtered = mediaList.filter((m: any) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header and Search */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Buscar medios publicitarios..." 
            className="input-premium"
            style={{ paddingLeft: '44px', height: '42px', background: 'white', width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
        <button
          className="btn-premium"
          style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', padding: '0 20px', height: '42px', borderRadius: '8px', marginLeft: 'auto', fontSize: '13px', fontWeight: '700' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Registrar medio publicitario
        </button>
      </div>

      {/* Advanced Search Panel */}
      {showAdvanced && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', background: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            Incluir inactivos
          </label>
        </div>
      )}

      {/* Table Panel */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        {filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Fecha Registro</th>
                <th style={{ textAlign: 'center', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
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
                    <span style={{ background: m.isActive ? '#dcfce7' : '#fef2f2', color: m.isActive ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                      {m.isActive ? 'ACTIVO' : 'INACTIVO'}
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
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              No hay registros, verifique los filtros de la consulta
            </p>
          </div>
        )}
      </div>

      {/* Floating Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Registrar medio publicitario</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>

            <div style={{ padding: '30px 24px' }}>
              {registerSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ background: '#ecfdf5', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Save size={28} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', margin: '0 0 8px' }}>¡Guardado Exitoso!</h3>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>El medio publicitario se ha registrado correctamente.</p>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Nombre del medio publicitario *</label>
                  <input 
                    type="text" 
                    className="input-premium" 
                    placeholder="Ej. Facebook Ads, Volantes, Radio..."
                    style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px' }}
                    value={newMediaName} 
                    onChange={e => setNewMediaName(e.target.value)} 
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
