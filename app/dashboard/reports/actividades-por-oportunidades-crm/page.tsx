'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';

export default function ActividadesPorOportunidadesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    fechaRango: 'Este mes',
    asesor: 'Todos',
    actividades: 'Todas',
    incluirArchivados: false
  });

  const handleCharge = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Actividades por oportunidades cargado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Actividades por Oportunidades
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite observar los seguimientos o actividades realizados a cada oportunidad por parte de un asesor.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Fechas
            </label>
            <div>
              <DateRangePicker
                value={form.fechaRango}
                onChange={(val) => handleChange('fechaRango', val)}
              />
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Asesor
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.asesor} onChange={e => handleChange('asesor', e.target.value)}>
                <option value="Todos">Todos</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Actividades a mostrar
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.actividades} onChange={e => handleChange('actividades', e.target.value)}>
                <option value="Todas">Todas</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              ¿Incluir archivados?
            </label>
            <div>
              <div
                onClick={() => handleChange('incluirArchivados', !form.incluirArchivados)}
                style={{
                  width: '60px', height: '24px',
                  background: form.incluirArchivados ? '#10b981' : '#f1f5f9',
                  borderRadius: '12px', position: 'relative', cursor: 'pointer',
                  border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                  justifyContent: form.incluirArchivados ? 'flex-end' : 'flex-start',
                  padding: '0 2px', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '28px', height: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: form.incluirArchivados ? '#10b981' : '#64748b' }}>
                  {form.incluirArchivados ? 'Si' : 'No'}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button
            className="btn-premium"
            style={{
              background: '#10b981', color: 'white', display: 'flex', alignItems: 'center',
              gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700',
              opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none'
            }}
            onClick={handleCharge}
            disabled={isLoading}
          >
            <FileDown size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
