'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { 
  FileDown, 
  Search, 
  ChevronDown, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  BookOpen
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function AsistenciaDetalladaEstudiantePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Data State
  const [periods, setPeriods] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  
  // Filtered State
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  // Form State
  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: 'Todos', 
    fechaRango: 'Hoy',
    programaId: 'Todos', 
    pensum: 'Todos', 
    asignatura: 'Todos'
  });

  useEffect(() => {
    // Concurrent data fetching
    Promise.all([
      db.list('academic_periods'),
      db.list('academic_programs'),
      db.list('sedes'),
      db.list('cursos'),
      db.list('academic_subjects')
    ]).then(([periodsData, programsData, sedesData, coursesData, subjectsData]) => {
      setPeriods(periodsData);
      setPrograms(programsData);
      setSedes(sedesData);
      setAllCourses(coursesData);
      // Sort subjects alphabetically for better UX
      setAllSubjects(subjectsData.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)));
    }).catch(console.error);
  }, []);

  // Update Subjects when Program changes
  useEffect(() => {
    let filtered = allCourses;
    if (form.programaId !== 'Todos') {
      filtered = filtered.filter(c => c.programaId === form.programaId || c.programa === form.programaId);
    }
    setFilteredCourses(filtered);
    if (form.asignatura !== 'Todos' && !filtered.find(c => c.id === form.asignatura)) {
      setForm(prev => ({ ...prev, asignatura: 'Todos' }));
    }
  }, [form.programaId, allCourses]);

  const handleCharge = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      // 1. Fetch attendance records
      const rawRecords = await db.list('attendance_records');
      
      // 2. Fetch students
      const students = await db.list('students');

      // 3. Filtering logic
      let filtered = rawRecords;

      // Filter by period
      if (form.filtroFecha === 'Período' && form.periodo !== 'Todos') {
        filtered = filtered.filter((r: any) => r.periodo === form.periodo || r.periodoId === form.periodo);
      }

      // Filter by subject if specific one selected (Master Subject Name or Code)
      if (form.asignatura !== 'Todos') {
        const subject = allSubjects.find(s => s.codigo === form.asignatura || s.id === form.asignatura);
        if (subject) {
          // Find all courses associated with this subject (using name or code matching)
          const relatedCourseIds = allCourses
            .filter(c => c.asignaturaNombre === subject.nombre || c.codigo?.startsWith(subject.codigo))
            .map(c => c.id);
          
          filtered = filtered.filter((r: any) => relatedCourseIds.includes(r.cursoId) || relatedCourseIds.includes(r.groupId));
        }
      } else if (form.programaId !== 'Todos') {
        const programSubjects = allCourses.filter(c => c.programaId === form.programaId).map(c => c.id);
        filtered = filtered.filter((r: any) => programSubjects.includes(r.cursoId) || programSubjects.includes(r.groupId));
      }

      // 4. Grouping logic (Students with their assignments)
      const studentMap = new Map();
      
      filtered.forEach((r: any) => {
        const studentId = r.studentId;
        if (!studentMap.has(studentId)) {
          const studentInfo = students.find((s: any) => s.id === studentId) as any;
          studentMap.set(studentId, {
            id: studentId,
            name: r.studentName || (studentInfo ? (studentInfo.name || `${studentInfo.nombres || ''} ${studentInfo.apellidos || ''}`.trim()) : 'Estudiante Desconocido'),
            document: studentInfo?.documento || studentId,
            assignments: new Map()
          });
        }
        
        const studentData = studentMap.get(studentId);
        const cursoId = r.cursoId || r.groupId;
        
        if (!studentData.assignments.has(cursoId)) {
          const courseInfo = allCourses.find(c => c.id === cursoId || c.codigo === cursoId);
          studentData.assignments.set(cursoId, {
            id: cursoId,
            name: courseInfo?.asignaturaNombre || courseInfo?.nombre || courseInfo?.name || r.cursoNombre || cursoId,
            A: 0, I: 0, T: 0, J: 0, total: 0
          });
        }
        
        const assign = studentData.assignments.get(cursoId);
        assign[r.status] = (assign[r.status] || 0) + 1;
        assign.total++;
      });

      // Convert maps to flat array for rendering
      const finalResults = Array.from(studentMap.values()).map(s => ({
        ...s,
        assignments: Array.from(s.assignments.values()).map((a: any) => ({
          ...a,
          percent: ((a.A / a.total) * 100).toFixed(1)
        }))
      }));

      // Sort by Name
      finalResults.sort((a,b) => a.name.localeCompare(b.name));
      setResults(finalResults);
    } catch (error) {
      console.error("Error generating student attendance report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;
    
    let csvContent = "Estudiante;Documento;Asignatura;A;I;T;J;Total;% Asist.\n";
    results.forEach(s => {
      s.assignments.forEach((a: any) => {
        csvContent += `${s.name};${s.document};${a.name};${a.A};${a.I};${a.T};${a.J};${a.total};${a.percent}%\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `asistencia_por_estudiante_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Header Navigation */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
           <button 
             onClick={() => window.history.back()}
             style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
             className="btn-hover-shadow"
           >
             <ArrowLeft size={18} color="#64748b" />
           </button>
           <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                Asistencia / Inasistencia detallada por estudiante
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Listado de cada estudiante con las asignaturas matriculadas y el detalle de asistencias.
              </p>
           </div>
        </div>

        {/* Filters Panel - Centered Premium Card */}
        <div className="glass-panel" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '32px', padding: '48px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', alignItems: 'center' }}>
                
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Filtrar por
                </label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none', background: '#f8fafc' }} value={form.filtroFecha} onChange={e => handleChange('filtroFecha', e.target.value)}>
                    <option value="Período">Período</option>
                    <option value="Fechas">Fechas</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>

                {form.filtroFecha === 'Período' ? (
                  <>
                    <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período *</label>
                    <div style={{ position: 'relative' }}>
                      <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none', background: '#f8fafc' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                        <option value="Todos">Todos</option>
                        {periods.map(p => <option key={p.id} value={p.nombre || p.name}>{p.nombre || p.name}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                  </>
                ) : (
                  <>
                    <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Fechas *</label>
                    <div>
                      <DateRangePicker value={form.fechaRango} onChange={val => handleChange('fechaRango', val)} />
                    </div>
                  </>
                )}

                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Programa *</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none', background: '#f8fafc' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                    <option value="Todos">Todos</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>

                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Pensum *</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none', background: '#f8fafc' }} value={form.pensum} onChange={e => handleChange('pensum', e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="Standard">PENSUM ESTÁNDAR 2026</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>

                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Asignatura</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none', background: '#f8fafc' }} value={form.asignatura} onChange={e => handleChange('asignatura', e.target.value)}>
                    <option value="Todos">Todas las asignaturas registradas</option>
                    {allSubjects.map(s => (
                      <option key={s.id} value={s.codigo || s.id}>
                        {s.nombre} ({s.codigo || 'SIN-COD'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>

             </div>

             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
                <button 
                  onClick={handleCharge}
                  className="btn-premium"
                  disabled={isLoading}
                  style={{ background: '#22c55e', color: 'white', padding: '14px 40px', fontWeight: '900', borderRadius: '14px', fontSize: '15px' }}
                >
                  {isLoading ? 'GENERANDO REPORTE...' : 'CARGAR REPORTE'}
                </button>
             </div>
          </div>
        </div>

        {/* Results Area */}
        {hasSearched && (
          <div style={{ marginTop: '50px', animation: 'fadeUp 0.4s ease-out' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Relación de Detallada por Estudiante</h2>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>{results.length} estudiantes listados.</p>
                  </div>
                  {results.length > 0 && (
                    <button onClick={handleExport} className="btn-premium" style={{ border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <FileDown size={18} /> Exportar Excel
                    </button>
                  )}
               </div>

               {results.length > 0 ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   {results.map((student, sIdx) => (
                     <div key={student.id} className="glass-panel" style={{ background: 'white', padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                        {/* Student Header */}
                        <div style={{ padding: '24px 30px', background: 'rgba(248, 250, 252, 0.5)', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <User size={24} color="#3b82f6" />
                              </div>
                              <div>
                                 <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{student.name}</div>
                                 <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>DOC: {student.document}</div>
                              </div>
                           </div>
                           <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ textAlign: 'right' }}>
                                 <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>Asignaturas</div>
                                 <div style={{ fontSize: '14px', fontWeight: '800', color: '#334155' }}>{student.assignments.length}</div>
                              </div>
                           </div>
                        </div>

                        {/* Assignments Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                           <thead>
                              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfcfd' }}>
                                 <th style={{ padding: '16px 30px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>Asignatura</th>
                                 <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '11px', color: '#16a34a', fontWeight: '900' }}>A</th>
                                 <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '11px', color: '#dc2626', fontWeight: '900' }}>I</th>
                                 <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '11px', color: '#d97706', fontWeight: '900' }}>T</th>
                                 <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '11px', color: '#2563eb', fontWeight: '900' }}>J</th>
                                 <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '900' }}>TOTAL</th>
                                 <th style={{ padding: '16px 30px', textAlign: 'right', fontSize: '11px', color: '#64748b', fontWeight: '900' }}>% ASIS</th>
                              </tr>
                           </thead>
                           <tbody>
                              {student.assignments.map((a: any) => (
                                <tr key={a.id} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                   <td style={{ padding: '16px 30px', fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <BookOpen size={14} color="#94a3b8" /> {a.name}
                                   </td>
                                   <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '800', color: '#059669' }}>{a.A}</td>
                                   <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '800', color: '#dc2626' }}>{a.I}</td>
                                   <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '800', color: '#d97706' }}>{a.T}</td>
                                   <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '800', color: '#2563eb' }}>{a.J}</td>
                                   <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>{a.total}</td>
                                   <td style={{ padding: '16px 30px', textAlign: 'right' }}>
                                      <span style={{ 
                                        background: parseFloat(a.percent) >= 80 ? '#dcfce7' : '#fee2e2', 
                                        color: parseFloat(a.percent) >= 80 ? '#059669' : '#dc2626',
                                        padding: '4px 10px', 
                                        borderRadius: '8px', 
                                        fontSize: '12px', 
                                        fontWeight: '900'
                                      }}>
                                        {a.percent}%
                                      </span>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div style={{ padding: '100px 40px', background: 'white', borderRadius: '32px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <Info size={48} color="#cbd5e1" style={{ margin: '0 auto 20px' }} />
                    <h3 style={{ margin: 0, color: '#64748b' }}>No se encontraron registros de asistencia</h3>
                    <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '14px' }}>Verifique que existan registros de asistencia en el curso y periodo seleccionados.</p>
                 </div>
          )}
          </div>
        )}

        <div style={{ marginTop: '40px', padding: '24px', background: '#f8fafc', borderRadius: '16px', display: 'flex', gap: '32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#16a34a' }}></div> **A**: Asistió
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dc2626' }}></div> **I**: Inasistencia (Falla)
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d97706' }}></div> **T**: Tardanza
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2563eb' }}></div> **J**: Justificada
           </div>
        </div>
      </div>

      <style jsx global>{`
        .input-premium {
          border-radius: 12px; border: 1px solid #e2e8f0; outline: none; padding: 0 16px; font-size: 14px; transition: 0.2s;
        }
        .input-premium:focus {
          border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .btn-premium {
          border: none; cursor: pointer; transition: 0.2s; border-radius: 12px;
        }
        .btn-premium:hover:not(:disabled) {
          transform: translateY(-1px); filter: brightness(1.05);
        }
        .btn-hover-shadow:hover {
          background: #f8fafc !important;
          border-color: #3b82f6 !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
