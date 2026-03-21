'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function HabilitacionesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '2026 - 01', 
    fechaRango: 'Hoy',
    docente: 'Todos',
    asignatura: 'Todos',
    estado: 'Todos'
  });
  const [touched, setTouched] = useState({ 
    periodo: false,
    fechaRango: false
  });

  useEffect(() => {
    const savedSubjects = localStorage.getItem('edunexus_academic_subjects');
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
  }, []);

  const handleCharge = () => {
    setTouched({ 
      periodo: true,
      fechaRango: true
    });
    
    const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Habilitaciones cargado exitosamente.');
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
             Habilitaciones
           </h1>
           <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
             Permite visualizar el listado de estudiantes que se les han registrado habilitaciones en un período o rango de fechas específico.
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
                Docente
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.docente} onChange={e => handleChange('docente', e.target.value)}>
                  <option value="Todos">Todos</option>
                </select>
              </div>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Asignatura
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.asignatura} onChange={e => handleChange('asignatura', e.target.value)}>
                  <option value="Todos">Todos</option>
                  {subjects.map(s => (
                    <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Estado
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.estado} onChange={e => handleChange('estado', e.target.value)}>
                  <option value="Todos">Todos</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Reprobado">Reprobado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none' }}
              onClick={handleCharge}
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
