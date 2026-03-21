'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import DateRangePicker from '@/components/DateRangePicker';

export default function PreinscritosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    fechaRango: 'Hoy',
    estado: 'Todos',
    incluirPersonalizaciones: false
  });

  const handleExport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Preinscritos exportado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const labelStyle: React.CSSProperties = { textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' };
  const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Preinscritos
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite exportar a un archivo de Excel la información de las personas que se encuentran preinscritas en el rango de fechas seleccionado.
          </p>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Fechas */}
          <div style={rowStyle}>
            <label style={labelStyle}>Fechas</label>
            <div>
              <DateRangePicker 
                value={form.fechaRango} 
                onChange={(val: string) => handleChange('fechaRango', val)} 
              />
            </div>
          </div>

          {/* Estado */}
          <div style={rowStyle}>
            <label style={labelStyle}>Estado</label>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              {['Todos', 'Inscritos', 'Pendientes por inscribir'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  <input type="radio" name="estado" value={opt} checked={form.estado === opt} onChange={() => handleChange('estado', opt)} style={{ accentColor: '#10b981', width: '15px', height: '15px' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Incluir personalizaciones */}
          <div style={{ ...rowStyle, marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <label style={labelStyle}>Incluir Personalizaciones</label>
            <div>
              <div
                onClick={() => handleChange('incluirPersonalizaciones', !form.incluirPersonalizaciones)}
                style={{ width: '60px', height: '24px', background: form.incluirPersonalizaciones ? '#10b981' : '#f1f5f9', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: form.incluirPersonalizaciones ? 'flex-end' : 'flex-start', padding: '0 2px', transition: 'background 0.2s' }}
              >
                <div style={{ width: '28px', height: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: form.incluirPersonalizaciones ? '#10b981' : '#64748b' }}>
                  {form.incluirPersonalizaciones ? 'Si' : 'No'}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px' }}>
          <button className="btn-premium" style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none' }} onClick={handleExport} disabled={isLoading}>
            <FileDown size={18} />
            {isLoading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
