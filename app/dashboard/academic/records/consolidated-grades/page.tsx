'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Search, Download, Calculator, Filter, User, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';

export default function ConsolidatedGradesPage() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [evalParams, setEvalParams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [gradesData, setGradesData] = useState<any[]>([]);

  const [selectedSede, setSelectedSede] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedGrupoId, setSelectedGrupoId] = useState('');

  const fetchData = async () => {
    const [sData, perData, gData, cData, epData, stData, grData] = await Promise.all([
      db.list('sedes'),
      db.list('periods'),
      db.list('grupos'),
      db.list('cursos'),
      db.list('eval_params'),
      db.list('registered_students'),
      db.list('academic_grades')
    ]);
    setSedes(sData);
    setPeriods(perData);
    setGrupos(gData);
    setCursos(cData);
    setEvalParams(epData);
    setStudents(stData);
    setGradesData(grData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filters Cascade
  const sjOptions: any[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
        sjOptions.push({ label: `${s.nombre} - ${j.nombre}`, value: `${s.id}::${j.id}` });
    });
  });

  const filteredGrupos = grupos.filter(g => g.sedeJornada === selectedSede);
  const activeGrupo = grupos.find(g => g.id === selectedGrupoId);
  
  // All subjects/cursos in this grupo
  const grupoCursos = cursos.filter(c => c.id === activeGrupo?.cursoId || c.parentId === activeGrupo?.cursoId); 
  // Wait, groups usually have ONE curso plan, but multiple materias.
  // Actually, our 'cursos' documents store the specific instances (Subject + Teacher).
  // Groups are linked to multiple subjects.
  // In our schema: 'grupos' has multiple students, and is linked to the base course degree.
  // Let's assume cursos with the same sedeJornada and related to the group's "degree" are the columns.
  
  // For simplicity, find all cursos associated with the active group's SEDE and PERIOD.
  // We'll show all subjects available in that Sede-Jornada context.
  const activeSubjects = Array.from(new Set(grupoCursos.map(c => c.asignaturaNombre))).filter(Boolean) as string[];

  // Calculation Logic
  const getSubjectGrade = (studentId: string, subjectName: string) => {
    const course = grupoCursos.find(c => c.asignaturaNombre === subjectName);
    if (!course) return "0.0";
    
    const courseGradesDoc = gradesData.find(g => g.id === course.id);
    const studentGrades = courseGradesDoc?.grades?.[`${course.id}_${studentId}`] || {};
    
    const params = evalParams.filter(p => p.programId === course.programaId && p.sedeJornadaId === course.sedeJornada);
    
    let def = 0;
    let totalPct = 0;
    params.forEach(p => {
      const val = parseFloat(studentGrades[p.id]) || 0;
      def += (val * (p.porcentaje / 100));
      totalPct += p.porcentaje;
    });

    return def === 0 ? "—" : def.toFixed(1);
  };

  const getGeneralAverage = (studentId: string) => {
    let sum = 0;
    let count = 0;
    activeSubjects.forEach(sub => {
      const grade = getSubjectGrade(studentId, sub);
      if (grade !== "—") {
        sum += parseFloat(grade);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : "0.00";
  };

  const getColorRange = (gradeStr: string) => {
    const grade = parseFloat(gradeStr);
    if (grade >= 4.6) return { color: '#059669', bg: '#ecfdf5' }; // Superior
    if (grade >= 4.0) return { color: '#0284c7', bg: '#f0f9ff' }; // Alto
    if (grade >= 3.0) return { color: '#d97706', bg: '#fffbeb' }; // Basico
    if (grade > 0) return { color: '#dc2626', bg: '#fef2f2' }; // Bajo
    return { color: '#94a3b8', bg: '#f8fafc' };
  };

  const activeStudentIds = activeGrupo?.estudiantes || [];
  const activeStudentsList = students
    .filter(s => activeStudentIds.includes(s.id))
    .sort((a,b) => (a.name || `${a.nombres} ${a.apellidos}`).localeCompare(b.name || `${b.nombres} ${b.apellidos}`));

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Consolidado de Notas</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Sábana global de calificaciones por periodo y grupo.</p>
          </div>
          <button className="btn-premium" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <Download size={18} /> Exportar Sábana
          </button>
        </div>

        {/* Filters Panel */}
        <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Sede - Jornada</label>
            <select className="input-premium" style={{ width: '100%', height: '44px' }} value={selectedSede} onChange={e => { setSelectedSede(e.target.value); setSelectedGrupoId(''); }}>
              <option value="">Seleccione...</option>
              {sjOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Periodo Académico</label>
            <select className="input-premium" style={{ width: '100%', height: '44px' }} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
              <option value="">Seleccione Periodo...</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.anio})</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Grupo / Grado</label>
            <select className="input-premium" style={{ width: '100%', height: '44px' }} value={selectedGrupoId} onChange={e => setSelectedGrupoId(e.target.value)} disabled={!selectedSede}>
              <option value="">Seleccione Grupo...</option>
              {filteredGrupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* Grades Table (Sábana) */}
        {!selectedGrupoId || !selectedPeriod ? (
          <div style={{ background: 'white', padding: '100px 40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
            <Calculator size={60} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>Define los filtros para generar la sábana</h3>
            <p style={{ margin: '8px 0 0', fontSize: '15px' }}>Selecciona el periodo y grupo para promediar las calificaciones.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
               <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Sábana de Calificaciones — {activeGrupo?.nombre}</h3>
               <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Periodo: {periods.find(p => p.id === selectedPeriod)?.nombre} • {activeStudentsList.length} estudiantes</p>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', width: '250px', background: '#f1f5f9', position: 'sticky', left: 0, zIndex: 10 }}>ESTUDIANTE</th>
                  {activeSubjects.map(sub => (
                    <th key={sub} style={{ textAlign: 'center', padding: '16px 12px', fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', minWidth: '100px' }}>{sub}</th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#1e293b', fontWeight: '900', background: '#f1f5f9', borderLeft: '2px solid #e2e8f0' }}>PROMEDIO</th>
                </tr>
              </thead>
              <tbody>
                {activeStudentsList.map((s, idx) => {
                    const avg = getGeneralAverage(s.id);
                    const avgColors = getColorRange(avg);
                    
                    return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 24px', fontWeight: '800', fontSize: '13px', color: '#1e293b', position: 'sticky', left: 0, background: 'inherit', zIndex: 5, borderRight: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{idx + 1}.</span>
                                    {s.name || `${s.nombres} ${s.apellidos}`}
                                </div>
                            </td>
                            {activeSubjects.map(sub => {
                                const gradeStr = getSubjectGrade(s.id, sub);
                                const colors = getColorRange(gradeStr === '—' ? '0' : gradeStr);
                                
                                return (
                                    <td key={sub} style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: gradeStr === '—' ? '#cbd5e1' : colors.color }}>
                                            {gradeStr}
                                        </span>
                                    </td>
                                );
                            })}
                            <td style={{ padding: '14px 24px', textAlign: 'center', borderLeft: '2px solid #e2e8f0', background: avgColors.bg }}>
                                <span style={{ fontSize: '15px', fontWeight: '900', color: avgColors.color }}>
                                    {avg}
                                </span>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
