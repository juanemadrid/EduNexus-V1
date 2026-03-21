'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileDown } from 'lucide-react';
import React, { useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';

export default function OportunidadesComercialesCRMPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ 
    filtrarPor: 'Fechas',
    periodo: '2026-01',
    fechaRango: 'Hoy',
    estado: 'Todos'
  });

  const handleExport = () => {
    setIsLoading(true);
    setTimeout(() => { 
      setIsLoading(false); 
      alert('Reporte cargado exitosamente.'); 
    }, 1500);
  };
  
  const handleChange = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 30px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           Oportunidades comerciales - CRM
         </h1>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
              
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155', paddingTop: '12px' }}>
                Filtrar por
              </label>
              <div>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                  value={form.filtrarPor} 
                  onChange={e => handleChange('filtrarPor', e.target.value)}
                >
                  <option value="Fechas">Fechas</option>
                  <option value="Período">Período</option>
                </select>
              </div>

              {form.filtrarPor === 'Fechas' ? (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155', paddingTop: '12px' }}>
                    Fechas
                  </label>
                  <div>
                    <DateRangePicker 
                      value={form.fechaRango} 
                      onChange={(val) => handleChange('fechaRango', val)} 
                    />
                  </div>
                </>
              ) : (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155', paddingTop: '12px' }}>
                    Período
                  </label>
                  <div>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                      value={form.periodo} 
                      onChange={e => handleChange('periodo', e.target.value)}
                    >
                      <option value="2026-01">2026-01</option>
                      <option value="2026-02">2026-02</option>
                    </select>
                  </div>
                </>
              )}

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155', paddingTop: '12px' }}>
                Estado
              </label>
              <div>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                  value={form.estado} 
                  onChange={e => handleChange('estado', e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Abierta">Abierta</option>
                  <option value="Ganada">Ganada</option>
                  <option value="Perdida">Perdida</option>
                </select>
              </div>

           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '6px' }}
              onClick={handleExport}
              disabled={isLoading}
            >
              <FileDown size={18} />
              {isLoading ? 'Cargando reporte...' : 'Cargar reporte'}
            </button>
         </div>
      </div>
    </DashboardLayout>
  );
}
