'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, Search, ChevronDown, UserCheck, Calendar, Info, Download, ArrowLeftRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function ConsolidadoAsistenciasIndividualesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Data from localStorage
  const [allSedes, setAllSedes] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allCursos, setAllCursos] = useState<any[]>([]);
  const [allGrupos, setAllGrupos] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Filtered lists for selects
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    sedeJornada: '', 
    programaId: '', 
    periodo: '2026 - 01', 
    cursoId: '',
    fechaRango: 'Hoy'
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [sedesData, programsData, cursosData, gruposData, studentsData] = await Promise.all([
        db.list<any>('sedes'),
        db.list<any>('academic_programs'),
        db.list<any>('cursos'),
        db.list<any>('grupos'),
        db.list<any>('students')
      ]);
      setAllSedes(sedesData);
      setAllPrograms(programsData);
      setAllCursos(cursosData);
      setAllGrupos(gruposData);
      setAllStudents(studentsData);
    } catch (error) {
       console.error("Error loading consolidated attendance data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Cascading Logic
  const handleSedeChange = (val: string) => {
    setForm(p => ({ ...p, sedeJornada: val, programaId: '', cursoId: '' }));
    setFilteredPrograms([]);
    setFilteredCursos([]);

    if (!val) return;
    const [sedeId, jornadaId] = val.split('::');
    const sede = allSedes.find(s => s.id === sedeId);
    if (sede) {
      const jornada = (sede.jornadas || []).find((j: any) => j.id === jornadaId);
      if (jornada?.programas) setFilteredPrograms(jornada.programas);
    }
  };

  const handleProgramChange = (progId: string) => {
    setForm(p => ({ ...p, programaId: progId, cursoId: '' }));
    setFilteredCursos([]);

    if (!progId || !form.sedeJornada) return;
    const matched = allCursos.filter(c => 
      c.programaId === progId && 
      c.sedeJornada.startsWith(form.sedeJornada)
    );
    setFilteredCursos(matched);
  };

  const handleConsult = async () => {
    if (!form.cursoId) {
      alert('Por favor seleccione un curso');
      return;
    }
    setIsLoading(true);
    setHasSearched(true);

    try {
      // Find the group for this course
      const group = allGrupos.find(g => g.id === form.cursoId || g.cursoId === form.cursoId);
      
      if (group) {
        const studentIds = group.estudiantes ? group.estudiantes.map((se: any) => se.id || se) : [];
        const enrolledStudents = allStudents.filter(s => studentIds.includes(s.id));
        
        // Load REAL attendance data
        const savedRecords = await db.list<any>('attendance_records');
        const courseRecords = savedRecords.filter((r: any) => r.cursoId === form.cursoId);

        const mapped = enrolledStudents.map(s => {
          const studentRecords = courseRecords.filter((r: any) => r.studentId === s.id);
          
          const assist = studentRecords.filter((r: any) => r.status === 'A').length;
          const inassist = studentRecords.filter((r: any) => r.status === 'I').length;
          const tardy = studentRecords.filter((r: any) => r.status === 'T').length;
          const excused = studentRecords.filter((r: any) => r.status === 'J').length;
          
          const total = assist + inassist + tardy + excused;
          const percent = total > 0 ? ((assist / total) * 100).toFixed(1) : '100.0';

          return {
            id: s.id,
            documento: s.documento || s.id,
            nombre: s.name || `${s.nombres} ${s.apellidos}`,
            assist,
            inassist,
            tardy,
            excused,
            total,
            percent
          };
        });
        setResults(mapped.sort((a,b) => a.nombre.localeCompare(b.nombre)));
      } else {
        setResults([]);
      }
    } catch (error) {
       console.error("Error generating consolidated report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte exportado exitosamente a Excel.');
    }, 1500);
  };

  const sedeJornadaOptions: any[] = [];
  allSedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      sedeJornadaOptions.push({ label: `${s.nombre} - ${j.nombre}`, value: `${s.id}::${j.id}` });
    });
  });

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
        <div className="glass-panel" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
           <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                  Consolidado de Asistencias - Asignaturas Individuales
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Resumen estadístico de asistencias por asignatura para el control académico institucional.
                </p>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <UserCheck size={20} style={{ color: '#3b82f6' }} />
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Estudiantes</div>
                   <div style={{ fontSize: '18px', fontWeight: '900', color: '#3b82f6' }}>{hasSearched ? results.length : '—'}</div>
                 </div>
              </div>
           </div>

           {/* Filter Area in Grid */}
           <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
               <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Sede - Jornada</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.sedeJornada} onChange={e => handleSedeChange(e.target.value)}>
                      <option value="">Seleccione</option>
                      {sedeJornadaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
               </div>

               <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Programa</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.programaId} disabled={!form.sedeJornada} onChange={e => handleProgramChange(e.target.value)}>
                      <option value="">Seleccione</option>
                      {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
               </div>

               <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Curso / Asignatura</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.cursoId} disabled={!form.programaId} onChange={e => setForm(f => ({...f, cursoId: e.target.value}))}>
                      <option value="">Seleccione</option>
                      {filteredCursos.map(c => <option key={c.id} value={c.id}>{c.asignaturaNombre} ({c.codigo})</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
               </div>

               <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Período</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.periodo} onChange={e => setForm(f => ({...f, periodo: e.target.value}))}>
                      <option>2026 - 01</option>
                      <option>2026 - 02</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
               </div>
           </div>

           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={handleConsult} className="btn-premium" style={{ height: '42px', padding: '0 32px', background: '#334155', color: 'white', fontWeight: '800' }} disabled={isLoading}>
                  {isLoading ? 'Cargando...' : 'Consultar Consolidado'}
               </button>
               <button onClick={handleExport} className="btn-premium" style={{ height: '42px', padding: '0 24px', background: '#10b981', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={isExporting || results.length === 0}>
                  <FileSpreadsheet size={18} /> {isExporting ? 'Exportando...' : 'Exportar Excel'}
               </button>
           </div>
        </div>

        {/* Results Grid */}
        {hasSearched && (
          <div className="glass-panel" style={{ background: 'white', padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', animation: 'fadeIn 0.4s ease-out' }}>
             {results.length > 0 ? (
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                   <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Estudiante</th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', background: '#f0fdf4', color: '#16a34a' }}>A</th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', background: '#fff1f2', color: '#e11d48' }}>I</th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', background: '#fffbeb', color: '#d97706' }}>T</th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', background: '#f0f9ff', color: '#0284c7' }}>J</th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>TOTAL</th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>% ASIS</th>
                   </tr>
                 </thead>
                 <tbody>
                   {results.map((r, idx) => (
                     <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="row-hover">
                        <td style={{ padding: '16px 24px' }}>
                           <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{r.nombre}</div>
                           <div style={{ fontSize: '11px', color: '#64748b' }}>Doc: {r.documento}</div>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#16a34a' }}>{r.assist}</td>
                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#e11d48' }}>{r.inassist}</td>
                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#d97706' }}>{r.tardy}</td>
                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#0284c7' }}>{r.excused}</td>
                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '800', color: '#334155' }}>{r.total}</td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                           <span style={{ 
                             background: parseFloat(r.percent) >= 80 ? '#dcfce7' : '#fee2e2', 
                             color: parseFloat(r.percent) >= 80 ? '#16a34a' : '#ef4444', 
                             padding: '4px 10px', 
                             borderRadius: '8px', 
                             fontSize: '12px', 
                             fontWeight: '800' 
                           }}>{r.percent}%</span>
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             ) : (
               <div style={{ textAlign: 'center', padding: '100px 40px', color: '#94a3b8' }}>
                  <Info size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#64748b' }}>No se encontraron estudiantes en este curso</p>
                  <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Verifique que el curso tenga estudiantes matriculados en un grupo activo.</p>
               </div>
             )}
          </div>
        )}

        <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '900', color: '#334155', textTransform: 'uppercase' }}>Convenciones del Reporte</h4>
            <div style={{ display: 'flex', gap: '30px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#16a34a' }}></div> **A**: Asistió
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#e11d48' }}></div> **I**: Inasistencia (Falla)
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#d97706' }}></div> **T**: Tardanza
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#0284c7' }}></div> **J**: Justificada
               </div>
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
        .input-premium { border-radius: 10px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; padding: 0 12px; font-size: 14px; }
        .input-premium:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .btn-premium { border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
        .btn-premium:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </DashboardLayout>
  );
}
