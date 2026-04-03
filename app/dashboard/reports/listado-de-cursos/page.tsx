'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function ListadoCursosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [sedesJornadas, setSedesJornadas] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '', 
    fechaRango: 'Hoy',
    sedeJornada: 'Todos', 
    programaId: 'Todos',
    incluirArchivados: false
  });
  const [touched, setTouched] = useState({ 
    periodo: false,
    fechaRango: false
  });

  useEffect(() => {
    // Fetch programs and other data from Firestore with caching
    db.list('academic_programs', null, { cache: true }).then(setPrograms).catch(console.error);
    
    // Fetch Sedes to build Sede-Jornada options dynamically
    db.list('sedes', null, { cache: true }).then(data => {
      const options: any[] = [];
      data.forEach((s: any) => {
        (s.jornadas || []).forEach((j: any) => {
          options.push(`${s.nombre} - ${j.nombre}`);
        });
      });
      setSedesJornadas(options);
    }).catch(console.error);

    // Fetch periods with caching
    db.list('academic_periods', null, { cache: true }).then(setPeriods).catch(console.error);
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
      alert('Reporte de Listado de Cursos cargado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
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
             Listado de Cursos
           </h1>
           <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
             Permite ver los cursos que se encuentran creados en un período o rango de fechas específico.
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
                      {periods.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      <option value="Todos">Todos</option>
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
                Sede - jornada
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                  <option value="Todos">Todos</option>
                  {sedesJornadas.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Programa
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                  <option value="Todos">Todos</option>
                  {programs.map(p => (
                    <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                ¿Incluir archivados?
              </label>
              <div>
                 <div 
                   onClick={() => handleChange('incluirArchivados', !form.incluirArchivados)}
                   style={{ 
                     width: '64px', 
                     height: '24px', 
                     background: '#f1f5f9', 
                     borderRadius: '12px', 
                     display: 'flex', 
                     position: 'relative', 
                     cursor: 'pointer',
                     border: '1px solid #e2e8f0',
                     overflow: 'hidden'
                   }}
                 >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: form.incluirArchivados ? '#cbd5e1' : '#64748b', zIndex: 1 }}>No</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: form.incluirArchivados ? '#10b981' : '#cbd5e1', zIndex: 1 }}>Sí</div>
                    <div style={{ position: 'absolute', top: 0, left: form.incluirArchivados ? '50%' : 0, width: '50%', height: '100%', background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'left 0.2s ease' }}></div>
                 </div>
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
