'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown, Printer, Users } from 'lucide-react';
import { db } from '@/lib/db';

export default function EstudiantesPorCursoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  
  const [results, setResults] = useState<Record<string, any[]>>({});
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [form, setForm] = useState({ 
    sedeJornada: 'Todos', 
    programaId: 'Todos',
    periodo: 'Todos', // Defaulting to 'Todos' as per Q10 image
    cursoId: 'Todos'
  });

  useEffect(() => {
    Promise.all([
      db.list<any>('academic_programs'),
      db.list<any>('cursos'),
      db.list<any>('grupos'),
      db.list<any>('sedes'),
      db.list<any>('academic_periods')
    ]).then(([p, c, g, s, per]) => {
      setPrograms(p);
      setCourses(c);
      setGroups(g);
      setSedes(s);
      setPeriods(per);
      
      // Default period mapping removed to match Q10's 'Todos'
    }).catch(console.error).finally(() => setIsInitialLoading(false));
  }, []);

  const handleCharge = async () => {
    setIsLoading(true);
    setHasSearched(false);
    try {
      const allStudents = await db.list<any>('students');
      
      // Build a fast lookup map: studentId -> student object
      const studentMap: Record<string, any> = {};
      allStudents.forEach((s: any) => { studentMap[s.id] = s; });

      // Build a map: studentId -> Set of grupoIds (from groups.estudiantes arrays)
      const studentGrupos: Record<string, string[]> = {};
      groups.forEach((g: any) => {
        const estu: string[] = g.estudiantes || [];
        estu.forEach(sid => {
          if (!studentGrupos[sid]) studentGrupos[sid] = [];
          studentGrupos[sid].push(g.id);
        });
      });

      const mappedResults: Record<string, any[]> = {};
      let studentCount = 0;

      // Filter courses by user selectors
      const matchingCourses = courses.filter((c: any) => {
        if (form.cursoId !== 'Todos' && c.id !== form.cursoId) return false;
        if (form.programaId !== 'Todos' && c.programaId !== form.programaId) return false;
        if (form.periodo !== 'Todos' && c.periodo !== form.periodo) return false;
        if (form.sedeJornada !== 'Todos' && !c.sedeJornada?.includes(form.sedeJornada.split('::')[0])) return false;
        return true;
      });

      matchingCourses.forEach(curso => {
        // Find grupos that belong to this course's program + period
        const linkedGrupos = groups.filter(g =>
          g.programaId === curso.programaId &&
          (!g.periodo || !curso.periodo || g.periodo === curso.periodo)
        );
        const linkedGrupoIds = new Set(linkedGrupos.map((g: any) => g.id));

        // Collect unique students for this curso via 3-tier approach:
        const seenIds = new Set<string>();
        const studentsInCourse: any[] = [];

        allStudents.forEach((s: any) => {
          if (seenIds.has(s.id)) return;

          // Tier 1: Explicit cursoId on student
          const explicitMatch =
            s.cursoId === curso.id ||
            s.idCurso === curso.id ||
            s.details?.cursoId === curso.id ||
            (Array.isArray(s.cursos) && s.cursos.includes(curso.id));

          // Tier 2: Student is in an array `estudiantes` in one of the matching grupos
          const grupoArrayMatch =
            s.grupoId && linkedGrupoIds.has(s.grupoId);

          // Tier 3: The grupo has this student in its `estudiantes` array
          const reverseGrupoMatch =
            (studentGrupos[s.id] || []).some(gid => linkedGrupoIds.has(gid));

          if (explicitMatch || grupoArrayMatch || reverseGrupoMatch) {
            seenIds.add(s.id);
            studentsInCourse.push(s);
          }
        });

        if (studentsInCourse.length > 0) {
          const key = curso.nombre || curso.codigo || curso.id;
          studentsInCourse.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          mappedResults[key] = studentsInCourse;
          studentCount += studentsInCourse.length;
        }
      });

      setResults(mappedResults);
      setTotalStudents(studentCount);
      setHasSearched(true);

    } catch (error) {
      console.error("Error generating students-per-course report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
        
        {/* Input Form Panel */}
        <div className="glass-panel no-print" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>Estudiantes por Cursos</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Permite observar los estudiantes que hacen parte de un curso en específico.</p>
          </div>

          <div style={{ padding: '0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Sede - jornada</label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                <option value="Todos">Todos</option>
                {sedes.map(s => (s.jornadas || []).map((j: any) => <option key={`${s.id}::${j.id}`} value={`${s.id}::${j.id}`}>{s.nombre} - {j.nombre}</option>))}
              </select>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Programa</label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                <option value="Todos">Todos</option>
                {programs.map(p => <option key={p.id || p.codigo} value={p.id || p.codigo}>{p.nombre}</option>)}
              </select>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período</label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                <option value="Todos">Todos</option>
                {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
              </select>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Curso</label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.cursoId} onChange={e => handleChange('cursoId', e.target.value)}>
                <option value="Todos">Todos</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button className="btn-premium" style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', fontSize: '14px', fontWeight: '800', opacity: isLoading || isInitialLoading ? 0.7 : 1, cursor: isLoading || isInitialLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '12px', boxShadow: '0 8px 16px -5px rgba(16,185,129,0.3)' }} onClick={handleCharge} disabled={isLoading || isInitialLoading}>
              <FileDown size={18} />
              {isLoading ? 'Cargando...' : 'Cargar reporte'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {hasSearched && (
          <div id="print-area" className="glass-panel" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.06)' }}>
            
            {/* Header Toolbar */}
            <div className="no-print" style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#10b981" /> Resultados ({totalStudents} estudiantes generados)
              </h3>
              <button onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                <Printer size={15} /> Imprimir
              </button>
            </div>

            {/* Print Document Header */}
            <div className="print-header" style={{ padding: '30px 40px 20px', display: 'none', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>EduNexus</h1>
                   <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginTop: '2px', textTransform: 'uppercase' }}>Sistema de Gestión Académica</div>
                 </div>
                 <div style={{ textAlign: 'center', flex: 1 }}>
                   <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase' }}>Estudiantes por Curso</h2>
                   <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                     {form.cursoId === 'Todos' ? 'Consolidado General de Cursos Activos' : `Curso Filtrado: ${courses.find(c => c.id === form.cursoId)?.nombre ?? ''}`}
                   </div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Generado: {new Date().toLocaleDateString('es-CO')}</div>
                 </div>
               </div>
            </div>

            <div style={{ padding: '24px 32px' }}>
                {Object.keys(results).length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                      No se encontraron estudiantes registrados en las asignaturas seleccionadas.
                    </div>
                ) : (
                    Object.keys(results).map((cursoName, idx) => (
                        <div key={idx} style={{ marginBottom: '32px' }}>
                           {/* Grouper Title */}
                           <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '6px 12px', background: '#f1f5f9', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                               <span style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '11px' }}>Curso:</span> {cursoName}
                           </div>

                           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                             <thead>
                               <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                                 <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Sede/Jornada</th>
                                 <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Programa</th>
                                 <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Identificación</th>
                                 <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Estudiante</th>
                                 <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
                               </tr>
                             </thead>
                             <tbody>
                               {results[cursoName].map((s: any, i: number) => (
                                  <tr key={s.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#64748b' }}>
                                         {sedes.find(se => se.id === s.sedeId)?.nombre || s.sedeJornadaLabel || s.sede || '—'}
                                      </td>
                                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#64748b' }}>
                                         {programs.find(p => p.id === s.programaId || p.codigo === s.programaId)?.nombre || s.programa || '—'}
                                      </td>
                                      <td style={{ padding: '10px 14px', fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>
                                         {s.documento || s.identificacion || s.id}
                                      </td>
                                      <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                                         {s.name || `${s.nombres || ''} ${s.apellidos || ''}`.trim()}
                                      </td>
                                      <td style={{ padding: '10px 14px' }}>
                                         <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: '800', 
                                            background: s.isActive !== false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                                            color: s.isActive !== false ? '#059669' : '#dc2626' }}>
                                            {s.isActive !== false ? 'Activo' : 'Inactivo'}
                                         </span>
                                      </td>
                                  </tr>
                               ))}
                             </tbody>
                           </table>
                        </div>
                    ))
                )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 12px; }
        .input-premium:focus { border-color: #10b981; background: white !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        .btn-premium { border-radius: 10px; transition: 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }

        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: auto; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            border-radius: 0 !important;
          }
          .print-header { display: block !important; }
          table { width: 100% !important; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          th { background-color: white !important; border-bottom: 2px solid #000 !important; color: #000 !important; padding: 6px !important; font-size: 10px !important; }
          td { border-bottom: 1px solid #ccc !important; padding: 6px !important; font-size: 11px !important; color: #000 !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
