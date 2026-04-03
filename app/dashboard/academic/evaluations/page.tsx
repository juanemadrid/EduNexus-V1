'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle, Search, Download, Calculator } from 'lucide-react';
import { db } from '@/lib/db';

export default function EvaluationsPage() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [evalParams, setEvalParams] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>({}); 

  const [selectedSedeJornada, setSelectedSedeJornada] = useState('');
  const [selectedAsignatura, setSelectedAsignatura] = useState('');
  const [selectedCursoId, setSelectedCursoId] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = async () => {
    const [sData, cData, gData, stData, epData, grData] = await Promise.all([
      db.list('sedes'),
      db.list('cursos'),
      db.list('grupos'),
      db.list('registered_students'),
      db.list('eval_params'),
      db.list('academic_grades')
    ]);
    setSedes(sData);
    setCursos(cData);
    setGrupos(gData);
    setStudents(stData);
    setEvalParams(epData);
    
    if (grData && grData.length > 0) {
      const mergedGrades = grData.reduce((acc, curr) => ({ ...acc, ...curr.grades }), {});
      setGrades(mergedGrades);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeCurso = cursos.find(c => c.id === selectedCursoId);
  const activeEvalParams = evalParams.filter(p => 
    p.programId === activeCurso?.programaId && 
    p.sedeJornadaId === activeCurso?.sedeJornada &&
    p.estado === 'Activo'
  ).sort((a,b) => a.nombre.localeCompare(b.nombre));

  const handleSave = async () => {
    if (!selectedCursoId) return;
    const courseGrades = Object.keys(grades)
      .filter(key => key.startsWith(`${selectedCursoId}_`))
      .reduce((obj, key) => {
        obj[key] = grades[key];
        return obj;
      }, {} as any);

    await db.update('academic_grades', selectedCursoId, { grades: courseGrades });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const sedeJornadaOptions: { label: string; value: string }[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      sedeJornadaOptions.push({
        label: `${s.nombre} - ${j.nombre}`,
        value: `${s.id}::${j.id}`
      });
    });
  });

  const cursosForSede = selectedSedeJornada ? cursos.filter(c => c.sedeJornada && c.sedeJornada.startsWith(selectedSedeJornada)) : [];
  const asignaturasOptions = Array.from(new Set(cursosForSede.map(c => c.asignaturaNombre))).filter(Boolean) as string[];
  const cursosForAsignatura = selectedAsignatura ? cursosForSede.filter(c => c.asignaturaNombre === selectedAsignatura) : [];

  const activeGrupo = grupos.find(g => g.cursoId === selectedCursoId);
  const activeStudentIds = activeGrupo?.estudiantes || [];
  
  const activeStudents = students
    .filter(s => activeStudentIds.includes(s.id))
    .sort((a, b) => {
        const nameA = a.name || `${a.nombres} ${a.apellidos}`;
        const nameB = b.name || `${b.nombres} ${b.apellidos}`;
        return nameA.localeCompare(nameB);
    });

  const handleGradeChange = (studentId: string, paramId: string, value: string) => {
    const num = parseFloat(value);
    if (value !== '' && (isNaN(num) || num < 0 || num > 5)) return; 
    if (value.includes('.') && (value.split('.')[1]?.length ?? 0) > 1) return;

    const key = `${selectedCursoId}_${studentId}`;
    setGrades((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [paramId]: value
      }
    }));
  };

  const calculateDefinitiva = (studentId: string) => {
    const key = `${selectedCursoId}_${studentId}`;
    const studentGrades = grades[key] || {};
    
    let def = 0;
    let totalPct = 0;
    
    activeEvalParams.forEach(p => {
      const val = parseFloat(studentGrades[p.id]) || 0;
      def += (val * (p.porcentaje / 100));
      totalPct += p.porcentaje;
    });

    if (totalPct === 0) return "0.0";
    return def.toFixed(1);
  };

  const handleExport = () => {
    if (!activeStudents.length) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    let header = "ID/Documento,Estudiante";
    activeEvalParams.forEach(p => header += `,${p.nombre} (${p.porcentaje}%)`);
    header += ",Definitiva\n";
    csvContent += header;

    activeStudents.forEach(s => {
      const def = calculateDefinitiva(s.id);
      const g = grades[`${selectedCursoId}_${s.id}`] || {};
      const name = s.name || `${s.nombres} ${s.apellidos}`;
      const id = s.id || s.documento;
      
      let row = `="${id}","${name}"`;
      activeEvalParams.forEach(p => row += `,${g[p.id] || ''}`);
      row += `,${def}\n`;
      csvContent += row;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Planilla_${activeCurso?.codigo || 'Curso'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>
              Evaluaciones Dinámicas
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Planilla sincronizada con los parámetros de evaluación del programa {activeCurso ? `(${activeCurso.codigo})` : ''}.
            </p>
          </div>
          {selectedCursoId && (
            <button onClick={handleSave} className="btn-premium" style={{ background: 'var(--primary)', color: 'white' }}>
              <Save size={18} /> Guardar Planilla
            </button>
          )}
        </div>

        {showSuccess && (
          <div className="animate-fade" style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <CheckCircle size={20} /> Calificaciones guardadas exitosamente.
          </div>
        )}
        
        {/* Filtros */}
        <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Sede - Jornada</label>
            <select className="input-premium" style={{ width: '100%', height: '44px' }} value={selectedSedeJornada} onChange={e => { setSelectedSedeJornada(e.target.value); setSelectedAsignatura(''); setSelectedCursoId(''); }}>
              <option value="">Seleccione...</option>
              {sedeJornadaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Asignatura</label>
            <select className="input-premium" style={{ width: '100%', height: '44px' }} value={selectedAsignatura} onChange={e => { setSelectedAsignatura(e.target.value); setSelectedCursoId(''); }} disabled={!selectedSedeJornada}>
              <option value="">Seleccione...</option>
              {asignaturasOptions.map(asig => <option key={asig} value={asig}>{asig}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Curso / Grupo</label>
            <select className="input-premium" style={{ width: '100%', height: '44px' }} value={selectedCursoId} onChange={e => setSelectedCursoId(e.target.value)} disabled={!selectedAsignatura}>
              <option value="">Seleccione...</option>
              {cursosForAsignatura.map(c => <option key={c.id} value={c.id}>{c.codigo} — {c.docenteNombre}</option>)}
            </select>
          </div>
        </div>

        {/* Planilla */}
        {selectedCursoId ? (
          activeGrupo ? (
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                    {activeCurso?.codigo} — {activeGrupo.nombre}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {activeEvalParams.map(p => (
                      <span key={p.id} style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#64748b', fontWeight: '700' }}>
                        {p.nombre}: {p.porcentaje}%
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={handleExport} style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={14} /> CSV
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', width: '250px' }}>ESTUDIANTE</th>
                      {activeEvalParams.map(p => (
                        <th key={p.id} style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', color: '#64748b', fontWeight: '800', width: '120px' }}>
                          {p.nombre}<br/><span style={{ color: 'var(--primary)', fontSize: '10px' }}>({p.porcentaje}%)</span>
                        </th>
                      ))}
                      <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', width: '140px', background: '#f1f5f9' }}>DEFINITIVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.map((s, idx) => {
                        const defStr = calculateDefinitiva(s.id);
                        const defNum = parseFloat(defStr);
                        const isApproved = defNum >= 3.0;
                        const hasGrades = Object.values(grades[`${selectedCursoId}_${s.id}`] || {}).some(v => v !== '');

                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>{idx + 1}</div>
                                <span style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{s.name || `${s.nombres} ${s.apellidos}`}</span>
                              </div>
                            </td>
                            {activeEvalParams.map(p => (
                              <td key={p.id} style={{ padding: '10px 12px' }}>
                                <input 
                                  type="number" step="0.1"
                                  className="input-premium"
                                  style={{ width: '100%', height: '36px', textAlign: 'center', fontWeight: '700' }}
                                  value={grades[`${selectedCursoId}_${s.id}`]?.[p.id] || ''}
                                  onChange={e => handleGradeChange(s.id, p.id, e.target.value)}
                                  placeholder="—"
                                />
                              </td>
                            ))}
                            <td style={{ padding: '16px 24px', textAlign: 'center', background: '#f8fafc', borderLeft: '1px solid #e2e8f0' }}>
                              <span style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '800', background: !hasGrades ? '#f1f5f9' : (isApproved ? '#dcfce7' : '#fee2e2'), color: !hasGrades ? '#94a3b8' : (isApproved ? '#059669' : '#dc2626') }}>
                                {defStr}
                              </span>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0', textAlign: 'center' }}>
               <AlertTriangle size={48} style={{ color: '#f59e0b', margin: '0 auto 16px', opacity: 0.5 }} />
               <h3 style={{ fontSize: '18px', fontWeight: '800' }}>No hay un grupo vinculado a este curso</h3>
               <p style={{ color: '#64748b' }}>Crea el grupo en Estructuración &gt; Grupos para habilitar la planilla.</p>
            </div>
          )
        ) : (
          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '100px 40px', textAlign: 'center', color: '#94a3b8' }}>
            <Calculator size={56} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Selecciona una planilla para calificar</h3>
            <p>Elige sede, asignatura y grupo de los menús superiores.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
