'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import React, { useState, useEffect } from 'react';
import { FileDown, Info } from 'lucide-react';

export default function AsistenciaInasistenciaDetalladaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Data from localStorage
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allCursos, setAllCursos] = useState<any[]>([]);
  const [allGrupos, setAllGrupos] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  const [filteredCursos, setFilteredCursos] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '', 
    fechaRango: 'Hoy',
    programaId: '', 
    pensum: 'Todos', 
    asignatura: 'Todos' 
  });
  const [touched, setTouched] = useState({ periodo: false, fechaRango: false, programaId: false });

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs') || localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setAllPrograms(JSON.parse(savedPrograms));

    const savedCursos = localStorage.getItem('edunexus_cursos');
    if (savedCursos) setAllCursos(JSON.parse(savedCursos));

    const savedGrupos = localStorage.getItem('edunexus_grupos');
    if (savedGrupos) setAllGrupos(JSON.parse(savedGrupos));

    const savedStudents = localStorage.getItem('edunexus_registered_students');
    if (savedStudents) setAllStudents(JSON.parse(savedStudents));
  }, []);

  const handleProgramChange = (progId: string) => {
    setForm(p => ({ ...p, programaId: progId, asignatura: 'Todos' }));
    setTouched(p => ({...p, programaId: true}));
    
    if (!progId) {
      setFilteredCursos([]);
      return;
    }
    const matched = allCursos.filter(c => c.programaId === progId);
    setFilteredCursos(matched);
  };

  const handleCharge = () => {
    setTouched({ periodo: true, fechaRango: true, programaId: true });
    
    if (!form.programaId) return;

    setIsLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      const targetCourseId = form.asignatura;
      
      let applicableGroups = allGrupos;
      if (targetCourseId && targetCourseId !== 'Todos') {
        applicableGroups = allGrupos.filter(g => g.cursoId === targetCourseId || g.id === targetCourseId);
      } else {
        const programCursoIds = allCursos.filter(c => c.programaId === form.programaId).map(c => c.id);
        applicableGroups = allGrupos.filter(g => programCursoIds.includes(g.cursoId) || programCursoIds.includes(g.id));
      }

      const studentSet = new Set<string>();
      applicableGroups.forEach(g => {
        if (g.estudiantes) {
          g.estudiantes.forEach((se: any) => studentSet.add(se.id || se));
        }
      });
      const enrolledStudents = allStudents.filter(s => studentSet.has(s.id));
      
      const savedRecords = JSON.parse(localStorage.getItem('edunexus_attendance_records') || '[]');
      
      let courseRecords = savedRecords;
      if (targetCourseId && targetCourseId !== 'Todos') {
        courseRecords = savedRecords.filter((r: any) => r.cursoId === targetCourseId || r.groupId === targetCourseId);
      } else {
        const groupIds = applicableGroups.map(g => g.id);
        const courseIds = applicableGroups.map(g => g.cursoId);
        courseRecords = savedRecords.filter((r: any) => groupIds.includes(r.groupId) || courseIds.includes(r.cursoId));
      }

      const flatResults: any[] = [];
      enrolledStudents.forEach(s => {
        const studentRecords = courseRecords.filter((r: any) => r.studentId === s.id);
        
        studentRecords.forEach((r: any) => {
           const getStatusConfig = (st: string) => {
             if(st === 'A') return { text: 'Asistió', fg: '#16a34a', bg: '#dcfce7' };
             if(st === 'I') return { text: 'Falla', fg: '#e11d48', bg: '#ffe4e6' };
             if(st === 'T') return { text: 'Tardanza', fg: '#d97706', bg: '#fef3c7' };
             if(st === 'J') return { text: 'Justificada', fg: '#0284c7', bg: '#e0f2fe' };
             return { text: st, fg: '#64748b', bg: '#f1f5f9' };
           };
           
           flatResults.push({
             id: r.id,
             studentId: s.id,
             documento: s.documento || s.id,
             nombre: s.name || `${s.nombres} ${s.apellidos}`,
             date: new Date(r.date).toLocaleDateString(),
             sortDate: new Date(r.date).getTime(),
             statusRaw: r.status,
             statusConfig: getStatusConfig(r.status),
             observations: r.observations || ''
           });
        });
      });
      
      flatResults.sort((a,b) => b.sortDate - a.sortDate || a.nombre.localeCompare(b.nombre));
      setResults(flatResults);
      setIsLoading(false);
    }, 800);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: keyof typeof form) => {
    if (field === 'periodo' && form.filtroFecha !== 'Período') return false;
    if (field === 'fechaRango' && form.filtroFecha !== 'Fechas') return false;
    return touched[field as keyof typeof touched] && !form[field as keyof typeof touched];
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Asistencia / inasistencia detallada por estudiante
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar un listado de cada asignatura donde se visualiza por cada mes las asistencias o inasistencias registradas a los estudiantes.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Filtrar por
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                value={form.filtroFecha} 
                onChange={e => handleChange('filtroFecha', e.target.value)}
              >
                <option value="Período">Período</option>
                <option value="Fechas">Fechas</option>
              </select>
            </div>

            {form.filtroFecha === 'Período' ? (
              <>
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Período <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                    value={form.periodo} 
                    onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                  >
                    <option value="">Seleccione</option>
                    <option value="2026 - 01">2026 - 01</option>
                    <option value="2026 - 02">2026 - 02</option>
                  </select>
                  {isInvalid('periodo') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                </div>
              </>
            ) : (
              <>
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Fechas <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div>
                  <DateRangePicker 
                    value={form.fechaRango} 
                    onChange={(val) => { setTouched(p => ({...p, fechaRango: true})); handleChange('fechaRango', val); }} 
                  />
                  {isInvalid('fechaRango') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                </div>
              </>
            )}

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Programa <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('programaId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.programaId} 
                onChange={e => handleProgramChange(e.target.value)}
              >
                <option value="">Seleccione</option>
                {allPrograms.map(p => (
                  <option key={p.id || p.codigo} value={p.id || p.codigo}>{p.nombre}</option>
                ))}
              </select>
              {isInvalid('programaId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Pensum
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.pensum} onChange={e => handleChange('pensum', e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="1">PENSUM 2026-I</option>
                <option value="2">PENSUM 2025-II</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Asignatura
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.asignatura} onChange={e => handleChange('asignatura', e.target.value)}>
                <option value="Todos">Todos</option>
                {filteredCursos.map(c => (
                  <option key={c.id} value={c.id}>{c.asignaturaNombre} {c.codigo ? `(${c.codigo})` : ''}</option>
                ))}
              </select>
            </div>
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button 
            className="btn-premium" 
            style={{ 
              background: '#0ea5e9', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              fontSize: '13px', 
              fontWeight: '700', 
              opacity: isLoading ? 0.7 : 1, 
              cursor: isLoading ? 'wait' : 'border-color', 
              border: 'none' 
            }} 
            onClick={handleCharge} 
            disabled={isLoading}
          >
            <FileDown size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>

      {hasSearched && (
        <div style={{ maxWidth: '850px', margin: '40px auto 0', paddingBottom: '60px', animation: 'fadeIn 0.4s ease-out' }}>
          <div className="glass-panel" style={{ background: 'white', padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                  Resultados del Detalle
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  {results.length} registros encontrados para los criterios seleccionados.
                </p>
              </div>
            </div>

            {results.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Estudiante</th>
                      <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Fecha</th>
                      <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Estado</th>
                      <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="row-hover">
                        <td style={{ padding: '16px 24px' }}>
                           <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{r.nombre}</div>
                           <div style={{ fontSize: '11px', color: '#64748b' }}>Doc: {r.documento}</div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                           {r.date}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                           <span style={{ 
                             background: r.statusConfig.bg, 
                             color: r.statusConfig.fg, 
                             padding: '4px 10px', 
                             borderRadius: '8px', 
                             fontSize: '12px', 
                             fontWeight: '800' 
                           }}>
                             {r.statusConfig.text}
                           </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>
                           {r.observations || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 40px', color: '#94a3b8' }}>
                <Info size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#64748b' }}>No hay registros de asistencia</p>
                <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Modifique los filtros o verifique que existan registros configurados en el sistema.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
