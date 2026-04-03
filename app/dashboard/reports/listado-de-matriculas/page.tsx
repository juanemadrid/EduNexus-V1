'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import React, { useState, useEffect } from 'react';
import { FileDown, Table as TableIcon, Users } from 'lucide-react';
import { db } from '@/lib/db';

export default function ListadoMatriculasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [form, setForm] = useState({ 
    filtroFecha: 'Fechas', 
    fechaRango: 'Hoy',
    periodo: '2026-01',
    estado: 'Todos',
    programaId: 'Todos'
  });
  const [touched, setTouched] = useState({ periodo: false, fechaRango: false });

  useEffect(() => {
    // Fetch programs from Firestore
    db.list('academic_programs').then(setPrograms).catch(console.error);
  }, []);

  const handleCharge = async () => {
    setTouched({ periodo: true, fechaRango: true });
    
    const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid) return;

    setIsLoading(true);
    setHasLoaded(false);

    try {
      const students = await db.list<any>('registered_students');
      
      const filtered = students.filter(s => {
        if (form.estado !== 'Todos') {
          const studentStatus = s.isActive !== false ? 'Matriculado' : 'Cancelado';
          if (studentStatus !== form.estado) return false;
        }
        
        if (form.programaId !== 'Todos') {
          if (s.details?.programa !== form.programaId && s.programa !== form.programaId && s.programaId !== form.programaId) return false;
        }

        if (form.filtroFecha === 'Período' && form.periodo) {
          if (s.details?.periodo !== form.periodo && s.periodo !== form.periodo && s.periodoId !== form.periodo) return false;
        }

        return true;
      });

      setReportData(filtered);
      setHasLoaded(true);
    } catch (error) {
      console.error("Error generating report:", error);
      alert('Error al generar el reporte.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: string) => {
    if (field === 'periodo' && form.filtroFecha !== 'Período') return false;
    if (field === 'fechaRango' && form.filtroFecha !== 'Fechas') return false;
    return (touched as any)[field] && !(form as any)[field];
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
        <div className="glass-panel" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
               <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px' }}>
                  <TableIcon size={20} />
               </div>
               <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                Listado de Matrículas
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Permite generar un listado de los estudiantes matriculados en un programa específico, considerando la fecha de renovación, dentro del rango de fechas o periodo seleccionado.
            </p>
          </div>

          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Filtrar por</label>
                  <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={form.filtroFecha} onChange={e => handleChange('filtroFecha', e.target.value)}>
                    <option value="Período">Período</option>
                    <option value="Fechas">Fechas</option>
                  </select>
                </div>

                {form.filtroFecha === 'Período' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Período <span style={{ color: '#ef4444' }}>*</span></label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.periodo} 
                      onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      <option value="2026-01">2026-01</option>
                      <option value="2026-02">2026-02</option>
                    </select>
                    {isInvalid('periodo') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Rango de Fechas <span style={{ color: '#ef4444' }}>*</span></label>
                    <DateRangePicker 
                      value={form.fechaRango} 
                      onChange={(val) => { setTouched(p => ({...p, fechaRango: true})); handleChange('fechaRango', val); }} 
                    />
                    {isInvalid('fechaRango') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Estado</label>
                  <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={form.estado} onChange={e => handleChange('estado', e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="Matriculado">Matriculado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Programa</label>
                  <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                    <option value="Todos">Todos</option>
                    {programs.map(p => (
                      <option key={p.id || p.codigo} value={p.nombre}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ 
                background: '#10b981', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px 32px', 
                fontSize: '14px', 
                fontWeight: '800', 
                opacity: isLoading ? 0.7 : 1, 
                cursor: isLoading ? 'wait' : 'pointer', 
                border: 'none',
                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)'
              }} 
              onClick={handleCharge} 
              disabled={isLoading}
            >
              <FileDown size={18} />
              {isLoading ? 'Generando...' : 'Cargar reporte'}
            </button>
          </div>
        </div>

        {hasLoaded && (
          <div className="glass-panel animate-fade-in" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Users size={18} color="#10b981" /> Resultados ({reportData.length})
               </h3>
               <button className="btn-premium" style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', padding: '6px 14px', fontSize: '12px', boxShadow: 'none' }}>
                 Exportar Excel
               </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Nombre Estudiante</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Identificación</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Programa</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                        No se encontraron registros para los filtros seleccionados
                      </td>
                    </tr>
                  ) : reportData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 24px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{item.name}</td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{item.id}</td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{item.details?.programa || item.programa || '—'}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '8px', 
                          fontSize: '11px', 
                          fontWeight: '800',
                          background: item.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: item.isActive ? '#059669' : '#dc2626'
                        }}>
                          {item.isActive ? 'Matriculado' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
