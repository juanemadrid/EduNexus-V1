'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet } from 'lucide-react';
import React, { useState } from 'react';

export default function SeguimientosEgresadosPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [form, setForm] = useState({ 
    filtroFecha: 'Fechas',
    periodo: '',
    fechaRango: 'Hoy',
    usuario: ''
  });
  const [touched, setTouched] = useState({ 
    periodo: false,
    fechaRango: false
  });

  const handleExport = () => {
    setTouched({ 
      periodo: true,
      fechaRango: true
    });
    
    const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid) return;

    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte Seguimientos egresados exportado a Excel.');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: keyof typeof form) => {
    if (field === 'periodo' && form.filtroFecha !== 'Período') return false;
    if (field === 'fechaRango' && form.filtroFecha !== 'Fechas') return false;
    return touched[field as keyof typeof touched] && !form[field];
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
             Seguimientos egresados
           </h1>
           <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
             Permite exportar a Excel el seguimiento realizado a los egresados en un rango de fechas o período específico.
           </p>
         </div>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Filtrar por
              </label>
              <div>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                  value={form.filtroFecha} 
                  onChange={e => handleChange('filtroFecha', e.target.value)}
                >
                  <option value="Período">Período</option>
                  <option value="Fechas">Fechas</option>
                </select>
              </div>

              {form.filtroFecha === 'Período' ? (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Período <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.periodo} 
                      onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      <option value="2026 - 01">2026 - 01</option>
                      <option value="2026 - 02">2026 - 02</option>
                    </select>
                    {isInvalid('periodo') && (
                       <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Fechas <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div>
                    <DateRangePicker 
                      value={form.fechaRango} 
                      onChange={(val) => { setTouched(p => ({...p, fechaRango: true})); handleChange('fechaRango', val); }} 
                    />
                    {isInvalid('fechaRango') && (
                       <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
                    )}
                  </div>
                </>
              )}

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Usuario
              </label>
              <div>
                <input 
                  type="text"
                  className="input-premium" 
                  placeholder="Todos"
                  style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', paddingLeft: '14px' }} 
                  value={form.usuario}
                  onChange={e => handleChange('usuario', e.target.value)}
                />
              </div>
              
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isExporting ? 0.7 : 1, cursor: isExporting ? 'wait' : 'pointer', border: 'none' }}
              onClick={handleExport}
              disabled={isExporting}
            >
               <FileSpreadsheet size={16} /> 
              {isExporting ? 'Exportando Excel...' : 'Exportar reporte'}
            </button>
         </div>
      </div>
    </DashboardLayout>
  );
}
