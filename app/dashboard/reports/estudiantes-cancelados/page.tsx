'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, Search, ChevronDown, UserX, Calendar, Info, Clock, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function EstudiantesCanceladosPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [cancelledStudents, setCancelledStudents] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Fechas',
    periodo: '2026 - 01',
    fechaRango: 'Hoy',
    sedeJornada: 'Todos', 
    programaId: 'Todos' 
  });

  useEffect(() => {
    // Load programs
    const savedPrograms = localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));

    // Load cancelled students
    const savedStudents = localStorage.getItem('edunexus_registered_students');
    if (savedStudents) {
      const all = JSON.parse(savedStudents);
      const cancelled = all.filter((s: any) => s.isActive === false && s.isEnrolled === false && !s.isGraduated);
      setCancelledStudents(cancelled);
      setFilteredData(cancelled);
    }
  }, []);

  const handleFilter = () => {
    let result = [...cancelledStudents];

    if (form.sedeJornada !== 'Todos') {
      result = result.filter(s => s.details?.campus === form.sedeJornada);
    }

    if (form.programaId !== 'Todos') {
      result = result.filter(s => (s.details?.program || 'Bachillerato Académico') === form.programaId);
    }

    setFilteredData(result);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte Estudiantes Cancelados exportado exitosamente a Excel.');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                Estudiantes Cancelados
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                Consulte y exporte la información de estudiantes que han anulado su matrícula o han sido retirados.
              </p>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <UserX size={20} style={{ color: '#ef4444' }} />
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Cancelados</div>
                 <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>{filteredData.length}</div>
               </div>
            </div>
         </div>

         {/* Filter Area */}
         <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
             <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Filtrar por</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.filtroFecha} onChange={e => handleChange('filtroFecha', e.target.value)}>
                    <option value="Período">Período</option>
                    <option value="Fechas">Fechas</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
             </div>

             {form.filtroFecha === 'Período' ? (
               <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Período</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                      <option>2026 - 01</option>
                      <option>2026 - 02</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
               </div>
             ) : (
               <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Rango de Fechas</label>
                  <DateRangePicker value={form.fechaRango} onChange={val => handleChange('fechaRango', val)} />
               </div>
             )}

             <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Programa</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option>Bachillerato Académico</option>
                    <option>Técnico en Sistemas</option>
                    {programs.map(p => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
             </div>

             <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <button onClick={handleFilter} className="btn-premium" style={{ flex: 1, height: '40px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '800', fontSize: '12px' }}>Consultar</button>
                <button onClick={handleExport} className="btn-premium" style={{ flex: 1, height: '40px', background: '#10b981', color: 'white', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} disabled={isExporting}>
                  <FileSpreadsheet size={16} /> {isExporting ? '...' : 'Excel'}
                </button>
             </div>
         </div>

         {/* Results Table */}
         <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
            {filteredData.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Fecha Retiro</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Estudiante</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Programa</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Calendar size={14} /> {s.cancellationDate || '2026-03-23'}
                         </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                         <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{s.name}</div>
                         <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {s.id}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155' }}>
                         {s.details?.program || 'Bachillerato Académico'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                         <span style={{ 
                           background: '#fff7ed', 
                           color: '#ea580c',
                           padding: '4px 10px', 
                           borderRadius: '12px', 
                           fontSize: '11px', 
                           fontWeight: '800',
                           textTransform: 'uppercase',
                           display: 'inline-flex',
                           gap: '4px',
                           alignItems: 'center'
                         }}>
                           <AlertTriangle size={12} /> {s.cancellationReason || 'Retiro Voluntario'}
                         </span>
                         {s.cancellationNote && (
                           <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>"{s.cancellationNote}"</div>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <Clock size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '700' }}>No se registran estudiantes cancelados para los criterios seleccionados.</p>
              </div>
            )}
         </div>

         <div style={{ marginTop: '24px', background: '#f0f9ff', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid #e0f2fe' }}>
            <Info size={20} style={{ color: '#0284c7', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#0369a1', lineHeight: '1.4' }}>
              <strong>Nota Técnica:</strong> Los estudiantes cancelados son aquellos cuya matrícula ha sido anulada mediante el proceso de <em>Cancelación Masiva</em>. Este reporte excluye graduados y desertores sin proceso formal de anulación.
            </p>
         </div>
      </div>

      <style jsx global>{`
        .glass-panel { border-radius: 20px; border: 1px solid #e2e8f0; }
        .input-premium { border-radius: 12px; outline: none; transition: 0.2s; padding: 0 16px; border: 1px solid #e2e8f0; font-size: 14px; }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .btn-premium { border-radius: 12px; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn-premium:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>
    </DashboardLayout>
  );
}
