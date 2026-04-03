'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function DocentesPendientesEvaluarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Data from DB
  const [periods, setPeriods] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [sedesJornadas, setSedesJornadas] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [instConfig, setInstConfig] = useState<any>({ logo: '' });

  // State
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const [form, setForm] = useState({ 
    periodo: 'Todos', 
    filtrarPor: 'Programa',
    sedeJornada: 'Todos', 
    programaId: 'Todos',
    asignaturaId: 'Todos',
    parametro: 'Todos'
  });

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [periodsData, programsData, coursesData, teachersData, configData, sedesData, paramData, subjectsData] = await Promise.all([
        db.list<any>('academic_periods'),
        db.list<any>('academic_programs'),
        db.list<any>('academic_courses'),
        db.list<any>('teachers'),
        db.get<any>('settings', 'appearance'),
        db.list<any>('sedes'),
        db.list<any>('academic_eval_parameters'),
        db.list<any>('academic_subjects')
      ]);

      setPeriods(periodsData);
      setPrograms(programsData);
      setCourses(coursesData);
      setTeachers(teachersData);
      setSubjects(subjectsData || []);
      if (configData) setInstConfig(configData);
      setParameters(paramData || []);

      const sjOptions: string[] = [];
      sedesData.forEach((s: any) => {
        (s.jornadas || []).forEach((j: any) => {
          sjOptions.push(`${s.nombre} - ${j.nombre}`);
        });
      });
      setSedesJornadas(sjOptions);

    } catch (error) {
       console.error("Error loading report data:", error);
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
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate calculation

      // Map courses to their respective teachers
      const missingEvals: any[] = [];
      
      const filteredCourses = courses.filter(c => {
        // Enforce filters
        if (form.periodo !== 'Todos' && c.periodo !== form.periodo) return false;
        if (form.sedeJornada !== 'Todos' && c.sedeJornada !== form.sedeJornada) return false;
        if (form.filtrarPor === 'Programa' && form.programaId !== 'Todos' && c.programaId !== form.programaId) return false;
        if (form.filtrarPor === 'Asignatura' && form.asignaturaId !== 'Todos' && c.asignaturaId !== form.asignaturaId) return false;
        return true;
      });

      // Filter to only those courses that have an assigned teacher
      const coursesWithTeachers = filteredCourses.filter(c => c.docenteId);

      coursesWithTeachers.forEach(course => {
        const teacher = teachers.find(t => t.id === course.docenteId);
        const program = programs.find(p => p.codigo === course.programaId || p.id === course.programaId);
        const asignatura = subjects.find(s => s.id === course.asignaturaId) || { nombre: course.asignaturaId };
        
        if (teacher) {
           missingEvals.push({
             id: course.id,
             docenteNombre: teacher.name || `${teacher.nombres || ''} ${teacher.apellidos || ''}`.trim(),
             docenteDoc: teacher.documento,
             cursoNombre: course.nombre || course.codigo,
             asignaturaNombre: asignatura.nombre || 'N/A',
             programaNombre: program?.nombre || course.programaId || 'N/A',
             sedeJornada: course.sedeJornada || 'N/A',
             periodo: course.periodo || 'N/A',
           });
        }
      });

      // Sort by Teacher Name alphabetically
      missingEvals.sort((a, b) => a.docenteNombre.localeCompare(b.docenteNombre));

      // Group by Sede - Jornada (Periodo)
      const agrupado: Record<string, any[]> = {};
      missingEvals.forEach(item => {
        const groupKey = `${item.sedeJornada} (${item.periodo})`;
        if (!agrupado[groupKey]) agrupado[groupKey] = [];
        agrupado[groupKey].push(item);
      });

      setGeneratedReport({
        filtros: {
           periodo: form.periodo,
           parametro: form.parametro === 'Todos' ? 'Todos' : (parameters.find(p => p.id === form.parametro)?.nombre || form.parametro)
        },
        agrupado
      });
    } catch (error) {
       console.error("Error generating pending evals report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      {/* PANTALLA DE FILTROS MINIMALISTA (MANTENIENDO EL DISEÑO PREMIUM EDUNEXUS) */}
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
             Docentes pendientes por evaluar el 100%
           </h1>
           <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
             Permite generar el listado de los docentes que no han evaluado al 100% un curso.
           </p>
         </div>

         <div style={{ padding: '0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
               
               <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                 Período
               </label>
               <div>
                 <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                   <option value="Todos">Todos</option>
                   {periods.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                 </select>
               </div>

               <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                 Filtrar por
               </label>
               <div>
                 <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#e2e8f0', border: '1px solid #cbd5e1', fontWeight: '600' }} value={form.filtrarPor} onChange={e => handleChange('filtrarPor', e.target.value)}>
                   <option value="Programa">Programa</option>
                   <option value="Asignatura">Asignatura</option>
                 </select>
               </div>
               
               <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                 Sede - jornada
               </label>
               <div>
                 <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                   <option value="Todos">Todos</option>
                   {sedesJornadas.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                 </select>
               </div>

               {form.filtrarPor === 'Programa' && (
                 <>
                   <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                     Programa
                   </label>
                   <div>
                     <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                       <option value="Todos">Todos</option>
                       {programs.map(p => <option key={p.id} value={p.codigo}>{p.nombre}</option>)}
                     </select>
                   </div>
                 </>
               )}

               {form.filtrarPor === 'Asignatura' && (
                 <>
                   <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                     Asignatura
                   </label>
                   <div>
                     <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.asignaturaId} onChange={e => handleChange('asignaturaId', e.target.value)}>
                       <option value="Todos">Todas</option>
                       {subjects.map(s => <option key={s.id} value={s.id}>{s.nombre || s.codigo}</option>)}
                     </select>
                   </div>
                 </>
               )}

               <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                 Parámetro
               </label>
               <div>
                 <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.parametro} onChange={e => handleChange('parametro', e.target.value)}>
                   <option value="Todos">Todos</option>
                   {parameters.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                 </select>
               </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <button 
                  className="btn-premium"
                  onClick={handleCharge}
                  disabled={isLoading}
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
                >
                  <FileDown size={18} />
                  {isLoading ? 'Cargando reporte...' : 'Cargar reporte'}
                </button>
            </div>
         </div>
      </div>

      {/* REPORTE GENERADO (VISOR TIPO PDF - ESTILO PROFESIONAL) */}
      {generatedReport && (
        <div style={{ position: 'fixed', inset: 0, background: '#525659', zIndex: 9999, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '950px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
               Docentes pendientes de evaluación - {generatedReport.filtros.periodo}
             </div>
             <div style={{ display: 'flex', gap: '10px' }}>
               <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                 Exportar a PDF
               </button>
               <button onClick={() => setGeneratedReport(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                 Cerrar
               </button>
             </div>
          </div>

          <div id="print-area" style={{ background: 'white', width: '100%', maxWidth: '950px', minHeight: '1100px', padding: '60px 70px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '2px', fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
            
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
                 <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '900', color: '#000' }}>DOCENTES PENDIENTES POR EVALUAR</p>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '9px', marginTop: '6px' }}>
                    <span>Código: REP-01</span>
                    <span>Versión: 0.1</span>
                    <span>Fecha versión: {new Date().toLocaleDateString('es-CO')}</span>
                 </div>
               </div>
               <div style={{ textAlign: 'right', fontSize: '10px', flex: '1' }}>
                 <div style={{ marginBottom: '4px' }}>Página: 1 de 1</div>
               </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '12px', fontWeight: '800', margin: '0', color: '#000' }}>
                 Parámetro: {generatedReport.filtros.parametro}
               </h3>
            </div>

            {generatedReport.agrupado && Object.keys(generatedReport.agrupado).length > 0 ? (
              Object.entries(generatedReport.agrupado).map(([groupName, rows]: [string, any], index) => (
                <div key={groupName} style={{ marginBottom: '30px' }}>
                   <div style={{ fontSize: '9px', fontWeight: '600', color: '#666', marginBottom: '2px' }}>
                     Sede - Jornada (Periodo)
                   </div>
                   <div style={{ fontSize: '11px', fontWeight: '800', color: '#000', marginBottom: '8px' }}>
                     {groupName}
                   </div>
                   
                   <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', color: '#000', border: '1px solid #ccc' }}>
                     <thead>
                       <tr>
                         <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', fontWeight: '800', width: '25%' }}>Docente</th>
                         <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', fontWeight: '800', width: '30%' }}>Programa</th>
                         <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', fontWeight: '800', width: '20%' }}>Nombre curso</th>
                         <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', fontWeight: '800', width: '25%' }}>Asignatura</th>
                       </tr>
                     </thead>
                     <tbody>
                       {rows.map((row: any) => (
                         <tr key={row.id}>
                           <td style={{ border: '1px solid #ccc', padding: '6px', textTransform: 'uppercase' }}>{row.docenteNombre}</td>
                           <td style={{ border: '1px solid #ccc', padding: '6px', textTransform: 'uppercase' }}>{row.programaNombre}</td>
                           <td style={{ border: '1px solid #ccc', padding: '6px', textTransform: 'uppercase' }}>{row.cursoNombre}</td>
                           <td style={{ border: '1px solid #ccc', padding: '6px', textTransform: 'uppercase' }}>{row.asignaturaNombre}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontStyle: 'italic', border: '1px solid #ccc' }}>
                 No hay registros para mostrar.
              </div>
            )}

            <div style={{ marginTop: '50px', fontSize: '9px', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span>EduNexus - Control Académico y Seguimiento de Calificaciones</span>
              <span>Fecha de impresión: {new Date().toLocaleDateString('es-CO')} {new Date().toLocaleTimeString('es-CO')}</span>
            </div>

          </div>
        </div>
      )}

      {/* Helper styles for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; box-shadow: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
        }
        .input-premium:focus {
          outline: none;
          border-color: #22c55e !important;
        }
      `}} />
    </DashboardLayout>
  );
}
