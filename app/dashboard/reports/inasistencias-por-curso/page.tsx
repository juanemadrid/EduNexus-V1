'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown, ChevronDown, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function InasistenciasPorCursoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  const [allSedes, setAllSedes] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allCursos, setAllCursos] = useState<any[]>([]);

  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    sedeJornada: '', 
    programaId: '', 
    periodo: '', 
    cursoId: '',
    fechaRango: 'Hoy'
  });
  
  const [touched, setTouched] = useState({ 
    sedeJornada: false, 
    programaId: false, 
    periodo: false, 
    cursoId: false, 
    fechaRango: false 
  });

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [sedesData, programsData, cursosData, periodsData, studentsData] = await Promise.all([
        db.list<any>('sedes'),
        db.list<any>('academic_programs'),
        db.list<any>('cursos'),
        db.list<any>('academic_periods'),
        db.list<any>('students')
      ]);
      setAllSedes(sedesData);
      setAllPrograms(programsData);
      setAllCursos(cursosData);
      setPeriods(periodsData);
      setAllStudents(studentsData);
    } catch (error) {
       console.error("Error loading inasistencias report initial data:", error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSedeChange = (val: string) => {
    setForm(p => ({ ...p, sedeJornada: val, programaId: '', cursoId: '' }));
    setFilteredPrograms([]);
    setFilteredCursos([]);

    if (!val) return;
    
    const [sedeId, jornadaId] = val.split('::');
    const sede = allSedes.find(s => s.id === sedeId);
    if (!sede) return;
    
    const jornada = (sede.jornadas || []).find((j: any) => j.id === jornadaId);
    if (jornada && jornada.programas) {
      // Many times programs are just the global ones, but here we check if they are linked
      setFilteredPrograms(allPrograms); 
    } else {
      setFilteredPrograms(allPrograms);
    }
  };

  const handleProgramChange = (progId: string) => {
    setForm(p => ({ ...p, programaId: progId, cursoId: '' }));
    setFilteredCursos([]);

    if (!progId || !form.sedeJornada) return;

    const [sedeId, jornadaId] = form.sedeJornada.split('::');
    const matched = allCursos.filter(c => 
      c.programaId === progId && 
      (c.sedeJornada === form.sedeJornada || c.sedeJornada?.startsWith(form.sedeJornada) || (c.sedeId === sedeId && c.jornadaId === jornadaId) || c.sedeId === sedeId)
    );
    setFilteredCursos(matched);
  };

  const handleCharge = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const attendees = await db.list<any>('attendance_records');
      
      const filteredRecords = attendees.filter(r => {
        const matchCourse = r.cursoId === form.cursoId;
        let matchDate = false;

        if (form.filtroFecha === 'Período') {
          matchDate = (r.periodo === form.periodo || r.periodoId === form.periodo);
        } else if (form.fechaRango && form.fechaRango.includes(' - ')) {
          const parts = form.fechaRango.split(' - ');
          const startDate = parts[0];
          const endDate = parts[1];
          if (startDate && endDate && r.date) {
            matchDate = (r.date >= startDate && r.date <= endDate);
          }
        }
        return matchCourse && matchDate;
      });

      const courseStudents = allStudents.filter(s => s.details?.cursoId === form.cursoId || s.idCurso === form.cursoId || s.cursoId === form.cursoId);

      const consolidatedResults = courseStudents.map(student => {
        const studentRecords = filteredRecords.filter(r => r.studentId === student.id);
        const counts = {
          A: studentRecords.filter(r => r.status === 'A').length,
          I: studentRecords.filter(r => r.status === 'I').length,
          T: studentRecords.filter(r => r.status === 'T').length,
          J: studentRecords.filter(r => r.status === 'J').length,
        };
        const total = studentRecords.length;

        return {
          id: student.id,
          name: student.name || `${student.nombres} ${student.apellidos}`,
          documento: student.documento || student.id,
          counts,
          total,
          percent: total > 0 ? ((counts.I / total) * 100).toFixed(1) : "0.0"
        };
      });

      setResults(consolidatedResults);
    } catch (error) {
       console.error("Error generating inasistencias report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (results.length === 0) {
      alert('Debe cargar el reporte antes de exportar.');
      return;
    }
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const headers = ['Estudiante', 'Documento', 'Asistencias', 'Inasistencias', 'Tardanzas', 'Justificadas', 'Total Sesiones', '% Faltas'];
      const rows = results.map(r => [
        r.name,
        r.documento,
        r.counts.A,
        r.counts.I,
        r.counts.T,
        r.counts.J,
        r.total,
        r.percent + '%'
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inasistencias');
      XLSX.writeFile(wb, `Inasistencias_Curso_${form.cursoId}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
       console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: keyof typeof form) => {
    if (field === 'periodo' && form.filtroFecha !== 'Período') return false;
    if (field === 'fechaRango' && form.filtroFecha !== 'Fechas') return false;
    return (touched as any)[field] && !(form as any)[field];
  };

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
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Inasistencias por curso
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar un reporte detallado de inasistencias por cada curso seleccionado.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Sede - jornada <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: touched.sedeJornada && !form.sedeJornada ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.sedeJornada} 
                onChange={e => { setTouched(p => ({...p, sedeJornada: true})); handleSedeChange(e.target.value); }}
              >
                <option value="">Seleccione</option>
                {sedeJornadaOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {touched.sedeJornada && !form.sedeJornada && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Programa <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                disabled={!form.sedeJornada}
                style={{ width: '100%', height: '42px', fontSize: '14px', background: !form.sedeJornada ? '#f1f5f9' : '#f8fafc', border: touched.programaId && !form.programaId ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.programaId} 
                onChange={e => { setTouched(p => ({...p, programaId: true})); handleProgramChange(e.target.value); }}
              >
                <option value="">Seleccione</option>
                {filteredPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {touched.programaId && !form.programaId && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Filtrar por
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.filtroFecha} 
                onChange={e => handleChange('filtroFecha', e.target.value)}
              >
                <option value="Período">Período</option>
                <option value="Fechas">Fechas</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {form.filtroFecha === 'Período' ? (
              <>
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Período <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                    value={form.periodo} 
                    onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                  >
                    <option value="">Seleccione</option>
                    {periods.map(p => <option key={p.id} value={p.name || p.nombre || p.id}>{p.name || p.nombre}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
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
              Curso <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                disabled={!form.programaId}
                style={{ width: '100%', height: '42px', fontSize: '14px', background: !form.programaId ? '#f1f5f9' : '#f8fafc', border: touched.cursoId && !form.cursoId ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.cursoId} 
                onChange={e => { setTouched(p => ({...p, cursoId: true})); handleChange('cursoId', e.target.value); }}
              >
                <option value="">Seleccione</option>
                {filteredCursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.codigo})</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {(form.programaId && filteredCursos.length === 0) && (
                <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '6px' }}>No hay cursos creados para este programa en esta sede</div>
              )}
              {touched.cursoId && !form.cursoId && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button 
            className="btn-premium" 
            style={{ 
              background: 'white', 
              color: '#475569', 
              border: '1px solid #e2e8f0',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              fontSize: '13px', 
              fontWeight: '700', 
              opacity: isExporting ? 0.7 : 1, 
              cursor: isExporting ? 'wait' : 'pointer'
            }} 
            onClick={handleExport} 
            disabled={isLoading || isExporting}
          >
            <FileDown size={18} color="#10b981" />
            {isExporting ? 'Exportando...' : 'Exportar a Excel'}
          </button>
          
          <button 
            className="btn-premium" 
            style={{ 
              background: '#10b981', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              fontSize: '13px', 
              fontWeight: '700', 
              opacity: isLoading ? 0.7 : 1, 
              cursor: isLoading ? 'wait' : 'pointer', 
              border: 'none',
              boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)'
            }} 
            onClick={async () => {
              setTouched({ sedeJornada: true, programaId: true, periodo: true, cursoId: true, fechaRango: true });
              const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
              const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;
              if (!form.sedeJornada || !form.programaId || !form.cursoId || !isPeriodValid || !isDateValid) return;
              handleCharge();
            }} 
            disabled={isLoading || isExporting}
          >
            <Search size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>

      {hasSearched && (
        <div style={{ maxWidth: '850px', margin: '40px auto 0', paddingBottom: '60px' }}>
          <div className="glass-panel" style={{ background: 'white', padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
               <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Resumen de Asistencia ({results.length} Estudiantes)</h3>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Estudiante</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>A</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#dc2626', textTransform: 'uppercase', fontWeight: '800' }}>I</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#d97706', textTransform: 'uppercase', fontWeight: '800' }}>T</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#2563eb', textTransform: 'uppercase', fontWeight: '800' }}>J</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>% Faltas</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? results.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }} className="row-hover">
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{r.name}</div>
                       <div style={{ fontSize: '11px', color: '#64748b' }}>Doc: {r.documento}</div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#059669' }}>{r.counts.A}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#dc2626' }}>{r.counts.I}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#d97706' }}>{r.counts.T}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>{r.counts.J}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                       <span style={{ 
                         background: parseFloat(r.percent) > 20 ? '#fef2f2' : '#f0fdf4',
                         color: parseFloat(r.percent) > 20 ? '#dc2626' : '#059669',
                         padding: '4px 8px',
                         borderRadius: '6px',
                         fontSize: '12px',
                         fontWeight: '800'
                       }}>{r.percent}%</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px 40px', textAlign: 'center', color: '#94a3b8' }}>
                       No hay registros de asistencia para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx global>{`
        .row-hover:hover { background: #f8fafc; }
        .input-premium { border-radius: 10px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; padding: 0 12px; }
        .input-premium:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .btn-premium { border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
      `}</style>
    </DashboardLayout>
  );
}
