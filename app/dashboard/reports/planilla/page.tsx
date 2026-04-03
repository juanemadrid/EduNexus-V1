'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import React, { useState, useEffect } from 'react';
import { FileDown, ClipboardList, BookOpen, Layers, Users } from 'lucide-react';
import { db } from '@/lib/db';

export default function PlanillaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [allSedes, setAllSedes] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '',
    fechaRango: 'Hoy',
    sedeJornada: '', 
    asignaturaId: '', 
    cursoId: '',
    tipoInforme: 'Asistencia y Evaluación'
  });
  
  const [touched, setTouched] = useState({ 
    periodo: false,
    fechaRango: false,
    sedeJornada: false, 
    asignaturaId: false, 
    cursoId: false 
  });

  useEffect(() => {
    // Fetch multiple collections in parallel
    Promise.all([
      db.list('academic_subjects'),
      db.list('cursos'),
      db.list('academic_periods'),
      db.list('sedes'),
      db.list('students')
    ]).then(([subjectsData, coursesData, periodsData, sedesData, studentsData]) => {
      setSubjects(subjectsData);
      setAllCourses(coursesData);
      setPeriods(periodsData);
      setAllSedes(sedesData);
      setAllStudents(studentsData);
      
      if (periodsData.length > 0) {
        setForm(p => ({ ...p, periodo: (periodsData[0] as any).name || (periodsData[0] as any).id }));
      }
    }).catch(console.error);
  }, []);

  const handleCharge = async () => {
    setTouched({ 
      periodo: true,
      fechaRango: true,
      sedeJornada: true, 
      asignaturaId: true, 
      cursoId: true 
    });
    
    const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid || !form.sedeJornada || !form.asignaturaId || !form.cursoId) {
      return;
    }
    
    setIsLoading(true);
    try {
      const XLSX = await import('xlsx');
      
      // Filter students for the course
      const courseStudents = allStudents.filter(s => 
        (s.cursoId === form.cursoId || s.idCurso === form.cursoId || s.details?.cursoId === form.cursoId) &&
        (s.sedeId === form.sedeJornada || s.sede === form.sedeJornada || s.details?.campus?.startsWith(form.sedeJornada))
      );

      if (courseStudents.length === 0) {
        console.warn('No se encontraron estudiantes registrados en este curso.');
        setIsLoading(false);
        return;
      }

      // Headers for Planilla
      const headers = ['#', 'Documento', 'Estudiante', 'Nota 1', 'Nota 2', 'Nota 3', 'Nota 4', 'Definitiva', 'Faltas'];
      const rows = courseStudents.sort((a,b) => (a.name || a.nombres).localeCompare(b.name || b.nombres)).map((s, idx) => [
        idx + 1,
        s.documento || s.id,
        s.name || `${s.nombres} ${s.apellidos}`,
        '', '', '', '', '', ''
      ]);

      const ws = XLSX.utils.aoa_to_sheet([
        [`PLANILLA ACADÉMICA - ${form.tipoInforme.toUpperCase()}`],
        [`Curso: ${allCourses.find(c => c.id === form.cursoId)?.nombre || form.cursoId}`, `Asignatura: ${subjects.find(s => s.id === form.asignaturaId || s.codigo === form.asignaturaId)?.nombre || form.asignaturaId}`],
        [`Período: ${form.periodo}`, `Fecha: ${new Date().toLocaleDateString()}`],
        [],
        headers,
        ...rows
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Planilla');
      XLSX.writeFile(wb, `Planilla_${form.cursoId}_${form.asignaturaId}.xlsx`);
    } catch (error) {
      console.error("Error generating planilla:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSedeChange = (val: string) => {
    setForm(p => ({ ...p, sedeJornada: val, cursoId: '' }));
    if (!val) {
      setCourses([]);
      return;
    }
    const filtered = allCourses.filter(c => c.sedeJornada === val || c.sedeId === val || c.campus === val);
    setCourses(filtered.length > 0 ? filtered : allCourses); // Fallback if no specific mapping
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: string) => {
    if (field === 'periodo' && form.filtroFecha !== 'Período') return false;
    if (field === 'fechaRango' && form.filtroFecha !== 'Fechas') return false;
    return (touched as any)[field] && !(form as any)[field];
  };

  const radioOptions = [
    'Asistencia',
    'Evaluación',
    'Asistencia y Evaluación',
    'Asistencia (Firmas)'
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
        <div className="glass-panel" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
           <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ClipboardList size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: 0 }}>
                  Generar Planilla Académica
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Listado oficial para el registro manual de notas e inasistencias por parte del docente.
                </p>
              </div>
           </div>

           <div style={{ padding: '0 20px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Filtrar por</label>
                    <select className="input-premium" style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc' }} value={form.filtroFecha} onChange={e => handleChange('filtroFecha', e.target.value)}>
                      <option value="Período">Período</option>
                      <option value="Fechas">Fechas</option>
                    </select>
                  </div>

                  {form.filtroFecha === 'Período' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Período <span style={{ color: '#ef4444' }}>*</span></label>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                        value={form.periodo} 
                        onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                      >
                        <option value="">Seleccione</option>
                        {periods.map(p => <option key={p.id} value={p.name || p.id}>{p.name || p.id}</option>)}
                      </select>
                      {isInvalid('periodo') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Rango de Fechas <span style={{ color: '#ef4444' }}>*</span></label>
                      <DateRangePicker 
                        value={form.fechaRango} 
                        onChange={(val) => { setTouched(p => ({...p, fechaRango: true})); handleChange('fechaRango', val); }} 
                      />
                      {isInvalid('fechaRango') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Sede - jornada <span style={{ color: '#ef4444' }}>*</span></label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', border: isInvalid('sedeJornada') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.sedeJornada} 
                      onChange={e => { setTouched(p => ({...p, sedeJornada: true})); handleSedeChange(e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {allSedes.map(s => (s.jornadas || []).map((j: any) => (
                        <option key={`${s.id}::${j.id}`} value={`${s.id}::${j.id}`}>{s.nombre} - {j.nombre}</option>
                      )))}
                    </select>
                    {isInvalid('sedeJornada') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Asignatura <span style={{ color: '#ef4444' }}>*</span></label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', border: isInvalid('asignaturaId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.asignaturaId} 
                      onChange={e => { setTouched(p => ({...p, asignaturaId: true})); handleChange('asignaturaId', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {subjects.map(s => <option key={s.codigo || s.id} value={s.codigo || s.id}>{s.nombre}</option>)}
                    </select>
                    {isInvalid('asignaturaId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Curso <span style={{ color: '#ef4444' }}>*</span></label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc', border: isInvalid('cursoId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.cursoId} 
                      onChange={e => { setTouched(p => ({...p, cursoId: true})); handleChange('cursoId', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {courses.map(c => <option key={c.id || c.codigo} value={c.id || c.codigo}>{c.nombre || c.codigo}</option>)}
                    </select>
                    {isInvalid('cursoId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Tipo de informe</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      {radioOptions.map(option => (
                        <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                          <input 
                            type="radio" 
                            name="tipoInforme" 
                            value={option} 
                            checked={form.tipoInforme === option}
                            onChange={() => handleChange('tipoInforme', option)}
                            style={{ cursor: 'pointer' }}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
             </div>
           </div>

           <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <button 
                className="btn-premium" 
                style={{ 
                  background: '#2563eb', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '12px 32px', 
                  fontSize: '14px', 
                  fontWeight: '800', 
                  opacity: isLoading ? 0.7 : 1, 
                  cursor: isLoading ? 'wait' : 'pointer', 
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                }} 
                onClick={handleCharge} 
                disabled={isLoading}
              >
                <FileDown size={20} />
                {isLoading ? 'Generando Plantilla...' : 'Descargar Planilla'}
              </button>
           </div>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
           <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', background: '#f0fdf4', color: '#10b981', borderRadius: '12px' }}>
                 <Users size={20} />
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Estudiantes</p>
                 <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>Sincronizado</p>
              </div>
           </div>
           
           <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px' }}>
                 <BookOpen size={20} />
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Asignaturas</p>
                 <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{subjects.length} Activas</p>
              </div>
           </div>

           <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', background: '#faf5ff', color: '#a855f7', borderRadius: '12px' }}>
                 <Layers size={20} />
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Cursos</p>
                 <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{courses.length} Disponibles</p>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; }
        .input-premium:focus { border-color: #2563eb; background: white !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .btn-premium:hover { filter: brightness(1.05); transform: translateY(-1px); }
      `}</style>
    </DashboardLayout>
  );
}
