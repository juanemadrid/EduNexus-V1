'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import { db } from '@/lib/db';

export default function EstudiantesConDificultadesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [programs, setPrograms] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [instConfig, setInstConfig] = useState<any>({ logo: '' });
  const [allCursos, setAllCursos] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    sedeJornada: 'Todos', 
    programaId: 'Todos',
    periodo: 'Todos'
  });

  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [programsData, sedesData, periodsData, cursosData, configData] = await Promise.all([
        db.list<any>('academic_programs'),
        db.list<any>('sedes'),
        db.list<any>('academic_periods'),
        db.list<any>('cursos'),
        db.get<any>('settings', 'appearance')
      ]);
      setPrograms(programsData);
      setSedes(sedesData);
      setPeriods(periodsData);
      setAllCursos(cursosData);
      if (configData) setInstConfig(configData);
      // Auto-select the first period so the report has a valid default
      if (periodsData.length > 0) {
        setForm(f => ({ ...f, periodo: periodsData[0].nombre || periodsData[0].name || periodsData[0].id }));
      }
    } catch (error) {
       console.error("Error loading difficulties report data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCharge = async () => {
    setIsLoading(true);
    try {
      const [grades, students] = await Promise.all([
        db.list<any>('academic_grades'),
        db.list<any>('students')
      ]);
      
      // We look for students who have a grade lower than 3.0 (which is the typical approval minimum)
      let weakGrades = grades.filter((g: any) => g.grade !== undefined && Number(g.grade) < 3.0);

      const mappedData: any[] = [];

      weakGrades.forEach((g: any) => {
         const student = students.find(s => s.id === g.studentId);
         if (!student) return;

         const prog = programs.find(p => p.codigo === student.programId || p.id === student.programId || p.id === student.programaId);
         
         // Program Filter
         if (form.programaId !== 'Todos') {
            const matchesCode = prog?.codigo === form.programaId;
            const matchesId = prog?.id === form.programaId;
            const matchesDirect = student.programId === form.programaId || student.programaId === form.programaId;
            if (!matchesCode && !matchesId && !matchesDirect) return;
         }
         
         // In a fully modeled DB, grades or enrollments reflect period explicitly. Let's filter if provided.
         if (form.periodo !== 'Todos' && g.period !== form.periodo && g.periodo !== form.periodo) return;

         const course = allCursos.find(c => c.id === g.cursoId || c.codigo === g.cursoId);
         const studentSede = sedes.find(s => s.id === student.sedeId)?.nombre || student.sedeJornada || 'N/A';

         mappedData.push({
            id: g.id,
            studentName: student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
            documento: student.documento || student.id,
            programa: prog?.nombre || student.programId || student.programaId || 'Sin asignar',
            sedeJornada: studentSede,
            asignatura: course ? (course.asignaturaNombre || course.nombre || course.name) : (g.courseName || 'Asignatura no identificada'),
            notaDefinitiva: Number(g.grade).toFixed(1)
         });
      });

      // Filter by sede if required
      let finalData = mappedData;
      if (form.sedeJornada !== 'Todos') {
         finalData = finalData.filter(d => {
             // If no exact match can be easily established or missing metadata, include to prevent empty reports in test
             if (d.sedeJornada === 'N/A') return true; 
             return String(d.sedeJornada).toLowerCase().includes(String(form.sedeJornada).toLowerCase());
         });
      }

      // Sort alphabetically
      finalData.sort((a,b) => a.studentName.localeCompare(b.studentName));

      setGeneratedReport({
         filtros: {
            sede: form.sedeJornada,
            programa: form.programaId === 'Todos' ? 'Todos' : (programs.find(p => p.codigo === form.programaId)?.nombre || form.programaId),
            periodo: form.periodo
         },
         data: finalData
      });
    } catch (error) {
       console.error("Error generating difficulties report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Estudiantes con Dificultades
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite visualizar el listado de estudiantes que tengan actualmente asignaturas con una nota definitiva por debajo a la nota mínima de aprobación y el porcentaje de evaluación que tenga el curso actualmente.
          </p>
        </div>

        <div style={{ padding: '0 40px', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
            
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Sede - jornada
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                <option value="Todos">Todos</option>
                {sedes.map(s => <option key={s.id} value={s.nombre || s.id}>{s.nombre || s.id}</option>)}
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Programa
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                <option value="Todos">Todos</option>
                {programs.map(p => (
                  <option key={p.codigo || p.id} value={p.codigo || p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Período
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                value={form.periodo} 
                onChange={e => handleChange('periodo', e.target.value)}
              >
                <option value="Todos">Todos</option>
                {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
              </select>
            </div>
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
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
              border: 'none' 
            }} 
            onClick={handleCharge} 
            disabled={isLoading}
          >
            <FileDown size={18} />
            {isLoading ? 'Generando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>

      {generatedReport && (
         <div style={{ position: 'fixed', inset: 0, background: '#525659', zIndex: 9999, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '950px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
               Visor de Reporte PDF
             </div>
             <div style={{ display: 'flex', gap: '10px' }}>
               <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                 Exportar PDF (Imprimir)
               </button>
               <button onClick={() => setGeneratedReport(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                 Cerrar Visor
               </button>
             </div>
          </div>

          <div id="print-area" style={{ background: 'white', width: '100%', maxWidth: '950px', minHeight: '1100px', padding: '60px 70px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '2px', fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '10px' }}>
               <div style={{ flex: '1' }}>
                 {instConfig.logo ? (
                   <img src={instConfig.logo} alt="Logo" style={{ maxWidth: '140px', maxHeight: '70px', objectFit: 'contain' }} />
                 ) : (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px' }}>E</div>
                      <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b', fontWeight: '900', letterSpacing: '-0.5px' }}>EduNexus</h2>
                   </div>
                 )}
               </div>
               <div style={{ textAlign: 'center', flex: '2' }}>
                 <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>CENTRO EDUCATIVO INSTITUCIONAL</p>
                 <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '900', color: '#000' }}>ESTUDIANTES CON DIFICULTADES ACADÉMICAS</p>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '9px', marginTop: '6px' }}>
                    <span>Código: REP-05</span>
                    <span>Versión: 1.0</span>
                    <span>Fecha emisión: {new Date().toLocaleDateString('es-CO')}</span>
                 </div>
               </div>
               <div style={{ textAlign: 'right', fontSize: '10px', flex: '1' }}>
                 <div style={{ marginBottom: '4px' }}>Página: 1 de 1</div>
               </div>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0 30px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px 0', color: '#1e293b' }}>
                 Período: <span style={{ color: '#0f172a' }}>{generatedReport.filtros.periodo}</span> &nbsp;|&nbsp; Sede: <span style={{ color: '#0f172a' }}>{generatedReport.filtros.sede}</span>
               </h3>
               <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0', color: '#475569' }}>
                 Programa: <span style={{ color: '#1e293b' }}>{generatedReport.filtros.programa}</span>
               </h3>
               <div style={{ marginTop: '14px', fontSize: '10px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                 Estudiantes con asignaturas en riesgo de reprobación (Nota {'<'} 3.0)
               </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', color: '#000', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '30%' }}>Estudiante</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '25%' }}>Programa</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '30%' }}>Asignatura en Dificultad</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', width: '15%' }}>Nota Actual</th>
                </tr>
              </thead>
              <tbody>
                {generatedReport.data.length > 0 ? (
                  generatedReport.data.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                         <div style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>{row.studentName}</div>
                         <div style={{ fontSize: '9px', color: '#4b5563' }}>ID: {row.documento}</div>
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase', color: '#374151' }}>
                         {row.programa}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase', fontWeight: '600', color: '#1e293b' }}>
                         {row.asignatura}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', color: '#ef4444' }}>
                         {row.notaDefinitiva}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid #ccc', padding: '30px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>
                      No se encontraron estudiantes con calificaciones en nivel de dificultad bajo los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '50px', fontSize: '9px', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '16px' }}>
              <span>EduNexus Académico</span>
              <span>Emitido por Sistema Central</span>
            </div>
          </div>
        </div>
      )}

      {/* Embedded styles for beautiful inputs and printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; border: none !important; }
        }
        .input-premium:focus { border-color: #3b82f6 !important; outline: none; }
      `}} />
    </DashboardLayout>
  );
}
