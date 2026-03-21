'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Download, ChevronDown, ChevronUp, X as XIcon } from 'lucide-react';
import React, { useState } from 'react';

export default function TaxesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [taxes, setTaxes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Modal Form State
  const [form, setForm] = useState({
    tipo: '',
    nombre: '',
    porcentaje: '',
    estado: 'Activo'
  });

  // Búsqueda avanzada
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  const filtered = taxes.filter((m: any) =>
    m.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.nombre || !form.porcentaje) {
      alert('Por favor complete los campos obligatorios (*).');
      return;
    }
    setTaxes([...taxes, { id: Date.now(), ...form }]);
    setShowModal(false);
    setForm({ tipo: '', nombre: '', porcentaje: '', estado: 'Activo' });
    alert('Impuesto creado exitosamente.');
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Buscar impuestos..." 
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
        <button style={{ height: '38px', padding: '0 16px', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', borderRight: '1px solid #e5e7eb' }}>
          <Download size={14} /> Exportar
        </button>

        {/* Búsqueda avanzada Toggle */}
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Búsqueda avanzada {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Crear impuesto */}
        <button
          className="btn-premium"
          style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', padding: '0 16px', height: '38px', borderRadius: '6px', marginLeft: 'auto', fontSize: '13px', fontWeight: '700' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Crear impuesto
        </button>

      </div>

      {/* Panel Búsqueda Avanzada */}
      {showAdvanced && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', width: '100%', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
            <input 
              type="checkbox" 
              checked={incluirInactivos} 
              onChange={() => setIncluirInactivos(!incluirInactivos)} 
              style={{ width: '16px', height: '16px', accentColor: '#10b981' }} 
            />
            ¿Incluir impuestos inactivos?
          </label>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', border: '1px solid #e5e7eb', minHeight: '120px', borderRadius: '8px' }}>
        {filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>NOMBRE</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>TIPO</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>PORCENTAJE</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 20px', color: '#1f2937', fontWeight: '600', fontSize: '13px' }}>{m.nombre}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4b5563' }}>{m.tipo}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4b5563' }}>{m.porcentaje}%</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: m.estado === 'Activo' ? '#dcfce7' : '#f1f5f9', color: m.estado === 'Activo' ? '#16a34a' : '#64748b' }}>
                      {m.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '24px', textAlign: 'left' }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              No hay registros, verifique los filtros de la consulta o <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => setShowModal(true)}>cree uno nuevo</span>
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
          <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#5bba6f', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'white' }}>Crear impuesto</h2>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <XIcon size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Tipo</label>
                <select 
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', background: 'white', color: '#374151' }}
                  value={form.tipo}
                  onChange={e => setForm(p => ({...p, tipo: e.target.value}))}
                >
                  <option value="">Seleccione</option>
                  <option value="Nacional">Nacional</option>
                  <option value="Municipal">Municipal</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Nombre <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.nombre}
                  onChange={e => setForm(p => ({...p, nombre: e.target.value}))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Porcentaje <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="number"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.porcentaje}
                  onChange={e => setForm(p => ({...p, porcentaje: e.target.value}))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Estado <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '38px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" name="estado" value="Activo" checked={form.estado === 'Activo'} onChange={() => setForm(p => ({...p, estado: 'Activo'}))} style={{ accentColor: '#3b82f6', width: '14px', height: '14px' }} />
                    Activo
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" name="estado" value="Inactivo" checked={form.estado === 'Inactivo'} onChange={() => setForm(p => ({...p, estado: 'Inactivo'}))} style={{ accentColor: '#3b82f6', width: '14px', height: '14px' }} />
                    Inactivo
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
                onClick={handleCreate}
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
