'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, ChevronDown, Plus, Pencil, X as XIcon } from 'lucide-react';
import React, { useState } from 'react';

export default function BusinessStatusPage() {
  const [statuses, setStatuses] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('edunexus_registered_business_status');
      if (s) return JSON.parse(s);
    }
    return [
      { id: '1', nombre: 'Perdido', porcentaje: '0%', estado: 'Activo', canDelete: false },
      { id: '2', nombre: 'Presentación', porcentaje: '20%', estado: 'Activo', canDelete: true },
      { id: '3', nombre: 'En negociación', porcentaje: '50%', estado: 'Activo', canDelete: true },
      { id: '4', nombre: 'Cierre', porcentaje: '80%', estado: 'Activo', canDelete: true },
      { id: '5', nombre: 'Ganado', porcentaje: '100%', estado: 'Activo', canDelete: false },
    ];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filtered = statuses.filter((s: any) =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Buscar estados de negocio..." 
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
          style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', padding: '0 20px', height: '42px', borderRadius: '8px', marginLeft: 'auto', fontSize: '13px', fontWeight: '700' }}
        >
          <Plus size={16} /> Crear estado
        </button>
      </div>

      {showAdvanced && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', background: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            Incluir inactivos
          </label>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Porcentaje</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'center', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', width: '120px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '14px 20px', color: '#1f2937', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #cbd5e1', background: 'white' }}></div>
                  {s.nombre}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4b5563' }}>{s.porcentaje}</td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4b5563' }}>{s.estado}</td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}>
                      <Pencil size={15} />
                    </button>
                    {s.canDelete && (
                      <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}>
                        <XIcon size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                    No hay registros, verifique los filtros de la consulta
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
