'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle, Search, Download } from 'lucide-react';

export default function EvaluationsPage() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>({}); 

  const [selectedSedeJornada, setSelectedSedeJornada] = useState('');
  const [selectedAsignatura, setSelectedAsignatura] = useState('');
  const [selectedCursoId, setSelectedCursoId] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedSedes = localStorage.getItem('edunexus_sedes');
    if (savedSedes) setSedes(JSON.parse(savedSedes));

    const savedCursos = localStorage.getItem('edunexus_cursos');
    if (savedCursos) setCursos(JSON.parse(savedCursos));

    const savedGrupos = localStorage.getItem('edunexus_grupos');
    if (savedGrupos) setGrupos(JSON.parse(savedGrupos));

    const savedStudents = localStorage.getItem('edunexus_registered_students');
    if (savedStudents) setStudents(JSON.parse(savedStudents));

    const savedGrades = localStorage.getItem('edunexus_grades');
    if (savedGrades) setGrades(JSON.parse(savedGrades));
  }, []);

  const handleSave = () => {
    localStorage.setItem('edunexus_grades', JSON.stringify(grades));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Build Sede-Jornada options
  const sedeJornadaOptions: { label: string; value: string }[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      sedeJornadaOptions.push({
        label: `${s.nombre} - ${j.nombre}`,
        value: `${s.id}::${j.id}`
      });
    });
  });

  // Handle Cascading Logic
  const cursosForSede = selectedSedeJornada ? cursos.filter(c => c.sedeJornada && c.sedeJornada.startsWith(selectedSedeJornada)) : [];
  const asignaturasOptions = Array.from(new Set(cursosForSede.map(c => c.asignaturaNombre))).filter(Boolean) as string[];
  const cursosForAsignatura = selectedAsignatura ? cursosForSede.filter(c => c.asignaturaNombre === selectedAsignatura) : [];

  // Handle active selections
  const activeCurso = cursos.find(c => c.id === selectedCursoId);
  const activeGrupo = grupos.find(g => g.cursoId === selectedCursoId);
  const activeStudentIds = activeGrupo?.estudiantes || [];
  
  // Sort students alphabetically
  const activeStudents = students
    .filter(s => activeStudentIds.includes(s.id))
    .sort((a, b) => {
        const nameA = a.name || `${a.nombres} ${a.apellidos}`;
        const nameB = b.name || `${b.nombres} ${b.apellidos}`;
        return nameA.localeCompare(nameB);
    });

  // Grade Input Handler
  const handleGradeChange = (studentId: string, param: string, value: string) => {
    const num = parseFloat(value);
    // Allow empty string or numbers between 0.0 and 5.0
    if (value !== '' && (isNaN(num) || num < 0 || num > 5)) return; 
    
    // Validar formato (max 1 decimal)
    if (value.includes('.') && (value.split('.')[1]?.length ?? 0) > 1) return;

    const key = `${selectedCursoId}_${studentId}`;
    setGrades((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [param]: value
      }
    }));
  };

  const calculateDefinitiva = (studentId: string) => {
    const key = `${selectedCursoId}_${studentId}`;
    const studentGrades = grades[key] || {};
    const c1 = parseFloat(studentGrades.c1) || 0;
    const c2 = parseFloat(studentGrades.c2) || 0;
    const final = parseFloat(studentGrades.final) || 0;
    
    const def = (c1 * 0.3) + (c2 * 0.3) + (final * 0.4);
    return def.toFixed(1);
  };

  const handleExport = () => {
    if (!activeStudents.length) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID/Documento,Estudiante,Corte 1 (30%),Corte 2 (30%),Examen Final (40%),Definitiva\n";

    activeStudents.forEach(s => {
      const def = parseFloat(calculateDefinitiva(s.id));
      const g = grades[`${selectedCursoId}_${s.id}`] || {};
      const c1 = g.c1 || '';
      const c2 = g.c2 || '';
      const f = g.final || '';
      const name = s.name || `${s.nombres} ${s.apellidos}`;
      const id = s.id || s.documento;
      
      csvContent += `="${id}","${name}",${c1},${c2},${f},${def.toFixed(1)}\n`;
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
              Evaluaciones
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Ingreso de calificaciones y planillas de control para docentes.
            </p>
          </div>
          {selectedCursoId && (
            <button 
              onClick={handleSave}
              className="btn-premium" 
              style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={18} /> Guardar Planilla
            </button>
          )}
        </div>

        {showSuccess && (
          <div className="animate-fade" style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <CheckCircle size={20} />
            Calificaciones guardadas exitosamente para este grupo.
          </div>
        )}
        
        {/* Filtros en Cascada */}
        <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
              Sede - Jornada
            </label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '44px', fontSize: '13px' }}
              value={selectedSedeJornada}
              onChange={e => {
                setSelectedSedeJornada(e.target.value);
                setSelectedAsignatura('');
                setSelectedCursoId('');
              }}
            >
              <option value="">Seleccione Sede - jornada</option>
              {sedeJornadaOptions.map(opt => (
                <option key={opt.value} value={opt.value.split('__')[0]}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
              Asignatura / Materia
            </label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '44px', fontSize: '13px' }}
              value={selectedAsignatura}
              onChange={e => {
                setSelectedAsignatura(e.target.value);
                setSelectedCursoId('');
              }}
              disabled={!selectedSedeJornada}
            >
              <option value="">Seleccione asignatura</option>
              {asignaturasOptions.map(asig => (
                <option key={asig} value={asig}>{asig}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
              Curso Dictado
            </label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '44px', fontSize: '13px' }}
              value={selectedCursoId}
              onChange={e => setSelectedCursoId(e.target.value)}
              disabled={!selectedAsignatura}
            >
              <option value="">Seleccione curso (grupo)</option>
              {cursosForAsignatura.map(c => (
                <option key={c.id} value={c.id}>{c.codigo} — Docente: {c.docenteNombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Planilla de Notas */}
        {selectedCursoId ? (
          activeGrupo ? (
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                    Planilla de Calificaciones — {activeCurso?.codigo}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    {activeGrupo.nombre} • {activeStudents.length} {activeStudents.length === 1 ? 'estudiante matriculado' : 'estudiantes matriculados'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleExport} style={{ height: '36px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    <Download size={14} /> Exportar Planilla (CSV)
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', background: '#f8fafc' }}>
                        Estudiante
                      </th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', width: '120px' }}>
                        Corte 1<br/><span style={{ color: 'var(--primary)', fontSize: '10px' }}>(30%)</span>
                      </th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', width: '120px' }}>
                        Corte 2<br/><span style={{ color: 'var(--primary)', fontSize: '10px' }}>(30%)</span>
                      </th>
                      <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', width: '120px' }}>
                        Examen Final<br/><span style={{ color: 'var(--primary)', fontSize: '10px' }}>(40%)</span>
                      </th>
                      <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', width: '140px', background: '#f1f5f9' }}>
                        Definitiva<br/><span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>(100%)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8' }}>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>No hay estudiantes vinculados a este grupo aún.</p>
                          <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Inscribe estudiantes desde el módulo de Grupos primero.</p>
                        </td>
                      </tr>
                    ) : (
                      activeStudents.map((s, index) => {
                        const def = parseFloat(calculateDefinitiva(s.id));
                        const isApproved = def >= 3.0;
                        const hasGrades = Object.values(grades[`${selectedCursoId}_${s.id}`] || {}).some(v => v !== '');

                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                          >
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                                  {index + 1}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                                    {s.name || `${s.nombres} ${s.apellidos}`}
                                  </p>
                                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                                    ID: {s.id || s.documento}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <input 
                                type="number" 
                                min="0" max="5" step="0.1"
                                className="input-premium"
                                style={{ width: '100%', height: '36px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}
                                placeholder="—"
                                value={grades[`${selectedCursoId}_${s.id}`]?.c1 || ''}
                                onChange={e => handleGradeChange(s.id, 'c1', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <input 
                                type="number" 
                                min="0" max="5" step="0.1"
                                className="input-premium"
                                style={{ width: '100%', height: '36px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}
                                placeholder="—"
                                value={grades[`${selectedCursoId}_${s.id}`]?.c2 || ''}
                                onChange={e => handleGradeChange(s.id, 'c2', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <input 
                                type="number" 
                                min="0" max="5" step="0.1"
                                className="input-premium"
                                style={{ width: '100%', height: '36px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}
                                placeholder="—"
                                value={grades[`${selectedCursoId}_${s.id}`]?.final || ''}
                                onChange={e => handleGradeChange(s.id, 'final', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'center', background: '#f8fafc', borderLeft: '1px solid #e2e8f0' }}>
                              <span style={{ 
                                display: 'inline-block', 
                                padding: '6px 16px', 
                                borderRadius: '8px', 
                                fontSize: '14px', 
                                fontWeight: '800',
                                background: !hasGrades ? '#e2e8f0' : (isApproved ? '#dcfce7' : '#fee2e2'),
                                color: !hasGrades ? '#64748b' : (isApproved ? '#059669' : '#dc2626') 
                              }}>
                                {def.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ padding: '60px 40px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
              <div style={{ background: '#fef3c7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', margin: '0 auto 16px' }}>
                <AlertTriangle size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>El curso seleccionado no tiene un grupo vinculado</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Ve a "Estructuración &gt; Grupos" para crear un grupo y asignarle este curso.</p>
            </div>
          )
        ) : (
          <div style={{ padding: '80px 40px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', margin: '0 auto 20px' }}>
              <Search size={36} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0' }}>Selecciona un curso para evaluar</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Usa los filtros superiores para encontrar la planilla que deseas revisar.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
