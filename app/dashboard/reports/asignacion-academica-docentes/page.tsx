'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, Search, ChevronDown, BookOpen, User, Clock, Calendar, CheckCircle2, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function AsignacionAcademicaDocentesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cursos, setCursos] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '2026 - 01', 
    fechaRango: 'Hoy',
    sedeJornada: 'Todos', 
    docenteTerm: '' 
  });

  useEffect(() => {
    // Load data from localStorage
    const savedCursos = localStorage.getItem('edunexus_cursos');
    if (savedCursos) setCursos(JSON.parse(savedCursos));

    const savedTeachers = localStorage.getItem('edunexus_registered_teachers');
    if (savedTeachers) setTeachers(JSON.parse(savedTeachers));

    const savedSedes = localStorage.getItem('edunexus_sedes');
    if (savedSedes) setSedes(JSON.parse(savedSedes));
  }, []);

  // Build sede-jornada dropdown options (Cascading not needed here as it's a filter, but we use the existing ones)
  const sedeJornadaOptions: string[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      sedeJornadaOptions.push(`${s.nombre} - ${j.nombre}`);
    });
  });

  const handleCharge = () => {
    setIsLoading(true);
    setHasSearched(true);
    
    setTimeout(() => {
      let filtered = [...cursos];

      // Filter by Period
      if (form.filtroFecha === 'Período') {
        filtered = filtered.filter(c => c.periodo === form.periodo);
      }

      // Filter by Sede-Jornada
      if (form.sedeJornada !== 'Todos') {
        filtered = filtered.filter(c => c.sedeJornadaLabel === form.sedeJornada);
      }

      // Filter by Docente
      if (form.docenteTerm) {
        const term = form.docenteTerm.toLowerCase();
        filtered = filtered.filter(c => 
          (c.docenteNombre?.toLowerCase().includes(term)) || 
          (c.docenteId?.toLowerCase().includes(term))
        );
      }

      setResults(filtered);
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    if (results.length === 0) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte de asignación académica exportado exitosamente a Excel.');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
        <div className="glass-panel" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
           <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                  Asignación Académica Docentes
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Visualización detallada de la carga académica y periodos de enseñanza para el cuerpo docente.
                </p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <BookOpen size={20} style={{ color: '#16a34a' }} />
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Cursos Asignados</div>
                   <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{hasSearched ? results.length : '—'}</div>
                 </div>
              </div>
           </div>

           {/* Filter Area */}
           <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Sede - Jornada</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                      <option value="Todos">Todos</option>
                      {sedeJornadaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
               </div>

               <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Docente</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Nombre o ID..." 
                      className="input-premium" 
                      style={{ width: '100%', height: '40px', paddingLeft: '34px' }} 
                      value={form.docenteTerm}
                      onChange={e => handleChange('docenteTerm', e.target.value)}
                    />
                  </div>
               </div>
           </div>

           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={handleCharge} className="btn-premium" style={{ height: '42px', padding: '0 32px', background: '#334155', color: 'white', fontWeight: '800' }} disabled={isLoading}>
                  {isLoading ? 'Cargando...' : 'Consultar Reporte'}
               </button>
               <button onClick={handleExport} className="btn-premium" style={{ height: '42px', padding: '0 24px', background: '#10b981', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={isExporting || results.length === 0}>
                  <FileSpreadsheet size={18} /> {isExporting ? 'Exportando...' : 'Exportar Excel'}
               </button>
           </div>
        </div>

        {/* Results Area */}
        {hasSearched && (
          <div className="glass-panel" style={{ background: 'white', padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', animation: 'fadeIn 0.4s ease-out' }}>
             {results.length > 0 ? (
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                   <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Docente</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Asignatura / Plan</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Sede - Jornada</th>
                      <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Período</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Programación</th>
                   </tr>
                 </thead>
                 <tbody>
                   {results.map((r, idx) => (
                     <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="row-hover">
                        <td style={{ padding: '16px 24px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                 <User size={20} />
                              </div>
                              <div>
                                 <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{r.docenteNombre}</div>
                                 <div style={{ fontSize: '11px', color: '#64748b' }}>Cód: {r.docenteId}</div>
                              </div>
                           </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                           <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{r.asignaturaNombre}</div>
                           <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.programaNombre}</div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                           <div style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{r.sedeJornadaLabel}</div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                           <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>{r.periodo}</span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                              <Calendar size={12} /> {r.fechaInicio}
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                              <Clock size={12} /> Finaliza: {r.fechaFin}
                           </div>
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             ) : (
               <div style={{ textAlign: 'center', padding: '100px 40px', color: '#94a3b8' }}>
                  <Info size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#64748b' }}>No se encontraron asignaciones académicas</p>
                  <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Asegúrese de que los docentes estén asignados a cursos activos en el período seleccionado.</p>
               </div>
             )}
          </div>
        )}

        <div style={{ marginTop: '30px', background: '#eff6ff', padding: '20px', borderRadius: '16px', border: '1px solid #dbeafe', display: 'flex', gap: '15px' }}>
           <CheckCircle2 size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
           <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', fontWeight: '600', lineHeight: '1.5' }}>
                 Usted está visualizando la carga académica institucional. 
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#3b82f6', opacity: 0.8 }}>
                 Las horas totales se calculan con base en la intensidad horaria definida en el pénsum de cada programa.
              </p>
           </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row-hover:hover {
          background-color: #f8fafc !important;
        }
        .glass-panel { border: 1px solid #e2e8f0; }
        .input-premium { border-radius: 10px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; padding: 0 12px; font-size: 14px; }
        .input-premium:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .btn-premium { border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
        .btn-premium:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </DashboardLayout>
  );
}
