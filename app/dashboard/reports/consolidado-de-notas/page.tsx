'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, FileDown, ChevronDown, GraduationCap, BookOpen, UserCheck, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function ConsolidadoNotasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Storage data
  const [allSedes, setAllSedes] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [allPeriods, setAllPeriods] = useState<any[]>([]);

  // Filtered lists
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([]);
  const [filteredPensums, setFilteredPensums] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [evalParams, setEvalParams] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtro: 'Período',
    periodo: '', 
    fechaRango: 'Hoy',
    tipoFiltro: 'Programa' as 'Programa' | 'Asignatura', 
    sedeJornada: '', 
    programaId: '', 
    pensum: '',
    subjectId: '',
    teacherId: ''
  });
  
  const [touched, setTouched] = useState({ 
    periodo: false, 
    fechaRango: false,
    sedeJornada: false, 
    programaId: false, 
    pensum: false,
    subjectId: false,
    teacherId: false
  });

  useEffect(() => {
    // Load all required data from Firestore in parallel
    Promise.all([
      db.list('sedes'),
      db.list('academic_programs'),
      db.list('academic_subjects'),
      db.list('registered_teachers'),
      db.list('academic_periods'),
      db.list('eval_params'),
      db.list('registered_students')
    ]).then(([sedesData, programsData, subjectsData, teachersData, periodsData, evalData, studentsData]) => {
      setAllSedes(sedesData);
      setAllPrograms(programsData);
      setAllSubjects(subjectsData);
      setAllTeachers(teachersData);
      setAllPeriods(periodsData);
      setEvalParams(evalData);
      setAllStudents(studentsData);
      
      // Auto-select first period if available
      if (periodsData.length > 0) {
        setForm(p => ({ ...p, periodo: (periodsData[0] as any).name || (periodsData[0] as any).id }));
      }
    }).catch(console.error);
  }, []);

  const handleSedeChange = (val: string) => {
    setForm(p => ({ ...p, sedeJornada: val, programaId: '', pensum: '', subjectId: '', teacherId: '' }));
    setFilteredPrograms([]);
    
    if (!val) return;
    
    const [sedeId, jornadaId] = val.split('::');
    const sede = allSedes.find(s => s.id === sedeId);
    if (!sede) return;
    
    // In some institutions, programs are linked directly to the institution or to jornadas 
    // We'll show all programs if we can't find a specific jornada mapping
    const jornada = (sede.jornadas || []).find((j: any) => j.id === jornadaId);
    if (jornada && jornada.programas) {
      setFilteredPrograms(jornada.programas);
    } else {
      setFilteredPrograms(allPrograms);
    }
  };

  const handleProgramChange = (progId: string) => {
    setForm(p => ({ ...p, programaId: progId, pensum: '' }));
    
    if (!progId) {
      setFilteredPensums([]);
      return;
    }

    setFilteredPensums([{ id: 'unico', nombre: 'PENSUM ÚNICO - ALTA CALIDAD' }]);
    setForm(p => ({ ...p, pensum: 'unico' }));
  };

  const validate = () => {
    setTouched({ 
      periodo: true, 
      fechaRango: true,
      sedeJornada: true, 
      programaId: true, 
      pensum: true,
      subjectId: true,
      teacherId: true
    });
    
    const isTimeValid = form.filtro === 'Período' ? !!form.periodo : !!form.fechaRango;
    const isSedeValid = !!form.sedeJornada;
    let isModeValid = false;

    if (form.tipoFiltro === 'Programa') {
      isModeValid = !!form.programaId && !!form.pensum;
    } else {
      isModeValid = !!form.subjectId; 
    }

    return isTimeValid && isSedeValid && isModeValid;
  };

  const handleCharge = async () => {
    if (!validate()) {
       alert('Por favor complete todos los parámetros obligatorios.');
       return;
    }
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // 1. Fetch all grades from Firestore
      const allGrades = await db.list<any>('academic_grades');
      
      // 2. Filter students by sede/programa
      const sedeId = form.sedeJornada.split('::')[0];
      const filteredStudents = allStudents.filter(s => {
        const matchSede = s.sedeId === sedeId || s.sede === sedeId || s.details?.campus?.startsWith(sedeId);
        const matchProg = form.tipoFiltro === 'Programa' ? (s.programaId === form.programaId || s.details?.programId === form.programaId) : true;
        return matchSede && matchProg;
      });

      // 3. Process grades for each student
      const consolidated = filteredStudents.map(student => {
        const studentGrades = allGrades.find(g => g.studentId === student.id);
        const gradesMap = studentGrades?.grades || {};
        
        let totalWeighted = 0;
        let totalWeights = 0;
        const subjectDetails: any[] = [];

        // If filtering by specific subject
        if (form.tipoFiltro === 'Asignatura') {
          const subjGrades = gradesMap[form.subjectId] || {};
          // Simplified: just taking the 'definitiva' if exists, or calculating from params
          const def = subjGrades.definitiva || 0;
          return {
            id: student.id,
            name: student.name || `${student.nombres} ${student.apellidos}`,
            documento: student.documento || student.id,
            grade: def,
            status: def >= 3.0 ? 'Aprobado' : 'Reprobado'
          };
        }

        // Agrupado por programa: average of all subjects
        allSubjects.forEach(sub => {
          if (gradesMap[sub.id]) {
            const def = gradesMap[sub.id].definitiva || 0;
            if (def > 0) {
              totalWeighted += def;
              totalWeights++;
            }
          }
        });

        const finalAvg = totalWeights > 0 ? (totalWeighted / totalWeights).toFixed(2) : "0.00";

        return {
            id: student.id,
            name: student.name || `${student.nombres} ${student.apellidos}`,
            documento: student.documento || student.id,
            grade: finalAvg,
            status: parseFloat(finalAvg) >= 3.0 ? 'Aprobado' : 'Reprobado'
        };
      });

      setResults(consolidated.filter(r => r.grade !== "0.00" || form.tipoFiltro === 'Programa'));
    } catch (error) {
      console.error("Error generating consolidado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!validate()) return;
    if (results.length === 0) {
      alert('Primero cargue los datos del consolidado.');
      return;
    }
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const headers = ['Estudiante', 'Documento', 'Promedio/Nota', 'Estado'];
      const rows = results.map(r => [r.name, r.documento, r.grade, r.status]);
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Consolidado');
      XLSX.writeFile(wb, `Consolidado_${form.periodo}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting consolidado:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isError = (field: string) => {
    return (touched as any)[field] && !(form as any)[field];
  };

  // Build Sede-Jornada options
  const sedeJornadaOptions: { label: string; value: string }[] = [];
  allSedes.forEach(s => {
    if (s.estado === 'Inactiva') return;
    (s.jornadas || []).forEach((j: any) => {
      if (j.estado === 'Inactiva') return;
      sedeJornadaOptions.push({ label: `${s.nombre} - ${j.nombre}`, value: `${s.id}::${j.id}` });
    });
  });

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
        <div className="glass-panel" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
           <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <GraduationCap size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: 0 }}>
                  Consolidado de Calificaciones
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Resumen ejecutivo de notas definitivas y promedios por grupo o asignatura.
                </p>
              </div>
           </div>

           <div style={{ padding: '0 20px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                
                {/* Filter Type (Period/Date) */}
                <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Filtrar por
                </label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', appearance: 'none', paddingRight: '36px' }} value={form.filtro} onChange={e => handleChange('filtro', e.target.value)}>
                    <option value="Período">Período Académico</option>
                    <option value="Fechas">Rango de Fechas</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                {form.filtro === 'Período' ? (
                  <>
                    <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                      Período <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', border: isError('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                        value={form.periodo} 
                        onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                      >
                        <option value="">Seleccione el período</option>
                        {allPeriods.map(p => (
                          <option key={p.id} value={(p as any).name || p.id}>{(p as any).name || p.id}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                      {isError('periodo') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>Es necesario seleccionar un período</div>}
                    </div>
                  </>
                ) : (
                  <>
                    <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                      Fechas <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div>
                      <DateRangePicker 
                        value={form.fechaRango} 
                        onChange={(val) => { setTouched(p => ({...p, fechaRango: true})); handleChange('fechaRango', val); }} 
                      />
                    </div>
                  </>
                )}

                {/* Mode Selection (Program/Subject) */}
                <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Modo Reporte
                </label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', appearance: 'none', paddingRight: '36px' }} value={form.tipoFiltro} onChange={e => handleChange('tipoFiltro', e.target.value)}>
                    <option value="Programa">Agrupado por Programa</option>
                    <option value="Asignatura">Agrupado por Asignatura</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                {/* Campus/Shift Selection */}
                <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Sede - jornada <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', border: isError('sedeJornada') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                    value={form.sedeJornada} 
                    onChange={e => { setTouched(p => ({...p, sedeJornada: true})); handleSedeChange(e.target.value); }}
                  >
                    <option value="">Seleccione Sede y Jornada</option>
                    {sedeJornadaOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  {isError('sedeJornada') && (
                     <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>Debe seleccionar una sede</div>
                  )}
                </div>

                {form.tipoFiltro === 'Programa' ? (
                  <>
                    <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                      Programa <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        className="input-premium" 
                        disabled={!form.sedeJornada}
                        style={{ width: '100%', height: '44px', fontSize: '14px', background: !form.sedeJornada ? '#f1f5f9' : '#f8fafc', border: isError('programaId') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                        value={form.programaId} 
                        onChange={e => { setTouched(p => ({...p, programaId: true})); handleProgramChange(e.target.value); }}
                      >
                        <option value="">Seleccione Programa</option>
                        {filteredPrograms.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                      {isError('programaId') && (
                         <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>Debe seleccionar un programa académico</div>
                      )}
                    </div>

                    <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                      Pensum <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        className="input-premium" 
                        disabled={!form.programaId}
                        style={{ width: '100%', height: '44px', fontSize: '14px', background: !form.programaId ? '#f1f5f9' : '#f8fafc', border: isError('pensum') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                        value={form.pensum} 
                        onChange={e => { setTouched(p => ({...p, pensum: true})); handleChange('pensum', e.target.value); }}
                      >
                        <option value="">Seleccione Pensum</option>
                        {filteredPensums.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    </div>
                  </>
                ) : (
                  <>
                    <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                      Asignatura <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', border: isError('subjectId') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                        value={form.subjectId}
                        onChange={e => { setTouched(p => ({...p, subjectId: true})); handleChange('subjectId', e.target.value); }}
                      >
                        <option value="">Seleccione Asignatura</option>
                        {allSubjects.map(s => (
                          <option key={s.id || s.codigo} value={s.id || s.codigo}>{s.nombre} ({s.codigo})</option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                      {isError('subjectId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>La asignatura es obligatoria en este modo</div>}
                    </div>

                    <label style={{ textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                      Docente
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', appearance: 'none', paddingRight: '36px' }}
                        value={form.teacherId}
                        onChange={e => handleChange('teacherId', e.target.value)}
                      >
                        <option value="">Todos los docentes (Opcional)</option>
                        {allTeachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} {t.surname}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    </div>
                  </>
                )}
                
             </div>
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <button 
                className="btn-premium" 
                style={{ background: 'white', color: '#475569', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', fontSize: '13px', fontWeight: '700', borderRadius: '12px' }}
                onClick={handleExport}
                disabled={isExporting}
              >
                <FileSpreadsheet size={18} color="#10b981" />
                {isExporting ? 'Exportando...' : 'Exportar a Excel'}
              </button>

              <button 
                className="btn-premium" 
                style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 36px', fontSize: '14px', fontWeight: '800', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '12px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}
                onClick={handleCharge}
                disabled={isLoading}
              >
                <FileDown size={20} />
                {isLoading ? 'Generando...' : 'Obtener Consolidado'}
              </button>
           </div>
        </div>

        {hasSearched && (
          <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
               <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                 Resultados del Consolidado ({results.length} registros)
               </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Estudiante</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Promedio / Nota</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? results.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{r.name}</div>
                       <div style={{ fontSize: '11px', color: '#64748b' }}>Doc: {r.documento}</div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                       <span style={{ fontSize: '15px', fontWeight: '900', color: parseFloat(r.grade) >= 3.0 ? '#059669' : '#dc2626' }}>
                         {r.grade}
                       </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                       <span style={{ 
                         background: r.status === 'Aprobado' ? '#f0fdf4' : '#fef2f2',
                         color: r.status === 'Aprobado' ? '#059669' : '#dc2626',
                         padding: '4px 12px',
                         borderRadius: '20px',
                         fontSize: '11px',
                         fontWeight: '800'
                       }}>
                         {r.status.toUpperCase()}
                       </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      No se encontraron calificaciones para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
           <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', background: '#f0fdf4', color: '#10b981', borderRadius: '10px' }}>
                 <MapPin size={18} />
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Sedes</p>
                 <p style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{allSedes.length}</p>
              </div>
           </div>
           <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', background: '#eff6ff', color: '#2563eb', borderRadius: '10px' }}>
                 <GraduationCap size={18} />
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Programas</p>
                 <p style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{allPrograms.length}</p>
              </div>
           </div>
           <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', background: '#fff7ed', color: '#f59e0b', borderRadius: '10px' }}>
                 <BookOpen size={18} />
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Materias</p>
                 <p style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{allSubjects.length}</p>
              </div>
           </div>
           <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', background: '#faf5ff', color: '#a855f7', borderRadius: '10px' }}>
                 <UserCheck size={18} />
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Docentes</p>
                 <p style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{allTeachers.length}</p>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 16px; }
        .input-premium:focus { border-color: #10b981; background: white !important; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .btn-premium:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .btn-premium:active { transform: translateY(0); }
      `}</style>
    </DashboardLayout>
  );
}
