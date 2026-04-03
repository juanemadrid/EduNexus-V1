'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function EstadisticaMatriculasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Db Data
  const [periods, setPeriods] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [instConfig, setInstConfig] = useState<any>({ logo: '' });

  const [form, setForm] = useState({ 
    periodo: ''
  });
  
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [periodsData, programsData, sedesData, studentsData, enrollData, configData] = await Promise.all([
        db.list<any>('academic_periods'),
        db.list<any>('academic_programs'),
        db.list<any>('sedes'),
        db.list<any>('students'),
        db.list<any>('course_enrollments'),
        db.get<any>('settings', 'appearance')
      ]);

      setPeriods(periodsData);
      setPrograms(programsData);
      setSedes(sedesData);
      setStudents(studentsData);
      setEnrollments(enrollData);
      
      if (periodsData.length > 0) {
         setForm(p => ({ ...p, periodo: periodsData[0].name }));
      }
      if (configData) setInstConfig(configData);
    } catch (error) {
       console.error("Error loading estadistica report data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCharge = async () => {
    if (!form.periodo) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Calculate statistics matrix
      const stats = programs.map(prog => {
         const programJornadas = new Set<string>();
         
         // Collect all active jornadas for this program through active courses or sede definitions
         sedes.forEach((s: any) => {
           (s.jornadas || []).forEach((j: any) => {
              // Usually programs are tied to specific jornadas, we assume all available jornadas 
              // at the institution for this simulation if no specific mapping exists.
              programJornadas.add(j.nombre);
           });
         });

         // Default fallback if no sedes/jornadas defined
         const jornadasList = programJornadas.size > 0 ? Array.from(programJornadas) : ['Diurna', 'Nocturna'];

         const rows = jornadasList.map(jornada => {
            // Find enrollments for this program, jornada & period
            const currentEnrollments = enrollments.filter(e => 
               e.periodo === form.periodo && 
               e.programaId === prog.id &&
               e.jornada === jornada // assuming enrollment records jornada
            );

            // Compute metrics (since db might lack full history, we simulate the grouping based on real student data)
            let inscM = 0, inscF = 0;
            let actNuevosM = 0, actNuevosF = 0;
            let actRenovantesM = 0, actRenovantesF = 0;
            let inactNoRenovM = 0, inactNoRenovF = 0;
            let inactCancelM = 0, inactCancelF = 0;

            currentEnrollments.forEach(en => {
               const st = students.find(s => s.id === en.studentId);
               const isM = st?.sexo === 'M' || st?.genero === 'Masculino' || !st; // Fallback to M
               const isF = !isM;
               
               // Assume statuses: 'Inscrito', 'Matriculado Nuevo', 'Matriculado Renovante', 'No Renovado', 'Cancelado'
               // If basic EduNexus schema, they are just "Matriculado". Convert all to "Nuevos" for real data projection.
               const state = en.estado || 'Matriculado Nuevo';

               if (state === 'Inscrito') {
                  if (isM) inscM++; else inscF++;
               } else if (state === 'Matriculados Activos' || state === 'Matriculado Nuevo' || state === 'Matriculado') {
                  if (isM) actNuevosM++; else actNuevosF++;
               } else if (state === 'Matriculado Renovante') {
                  if (isM) actRenovantesM++; else actRenovantesF++;
               } else if (state === 'No Renovado') {
                  if (isM) inactNoRenovM++; else inactNoRenovF++;
               } else if (state === 'Cancelado') {
                  if (isM) inactCancelM++; else inactCancelF++;
               }
            });

            // Even if 0, we output empty arrays instead of 0 for aesthetic matching with Q10, but handle in render
            return {
               jornada,
               insc: [inscM, inscF, inscM + inscF],
               nuevos: [actNuevosM, actNuevosF, actNuevosM + actNuevosF],
               renovantes: [actRenovantesM, actRenovantesF, actRenovantesM + actRenovantesF],
               totAct: [actNuevosM + actRenovantesM, actNuevosF + actRenovantesF, actNuevosM + actRenovantesM + actNuevosF + actRenovantesF],
               noRenov: [inactNoRenovM, inactNoRenovF, inactNoRenovM + inactNoRenovF],
               cancel: [inactCancelM, inactCancelF, inactCancelM + inactCancelF]
            };
         });

         // Only include programs that have at least some data, OR include all programs depending on preference
         // Q10 includes them if they have a definition. We keep them.
         return {
            programaNombre: prog.nombre,
            rows
         };
      });

      // Calculate grand totals across all programs and all jornadas
      const grantTotals = {
         insc: [0,0,0], nuevos: [0,0,0], renovantes: [0,0,0], totAct: [0,0,0], noRenov: [0,0,0], cancel: [0,0,0]
      };

      stats.forEach(prog => {
         prog.rows.forEach(r => {
            for(let i=0; i<3; i++) {
               grantTotals.insc[i] += r.insc[i];
               grantTotals.nuevos[i] += r.nuevos[i];
               grantTotals.renovantes[i] += r.renovantes[i];
               grantTotals.totAct[i] += r.totAct[i];
               grantTotals.noRenov[i] += r.noRenov[i];
               grantTotals.cancel[i] += r.cancel[i];
            }
         });
      });

      setGeneratedReport({
         periodo: form.periodo,
         stats,
         grantTotals
      });

    } catch (error) {
       console.error("Error generating statistic report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  // Helper function to render a number, avoiding '0' and using blank strings or hyphens to match Q10
  const renderNum = (n: number) => n === 0 ? '' : n;

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
             Estadística de matrículas
           </h1>
           <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
             Permite visualizar cifras clasificadas por estado y género según las matrículas realizadas en cada jornada y programa.
           </p>
         </div>

         <div style={{ padding: '0 40px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
               
               <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                 Periodo <span style={{ color: '#ef4444' }}>*</span>
               </label>
               <div>
                 <select 
                   className="input-premium" 
                   style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                   value={form.periodo} 
                   onChange={e => handleChange('periodo', e.target.value)}
                 >
                   <option value="">Seleccione</option>
                   {periods.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                 </select>
               </div>
               
            </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading || !form.periodo ? 0.7 : 1, cursor: isLoading || !form.periodo ? 'not-allowed' : 'pointer', border: 'none' }}
              onClick={handleCharge}
              disabled={isLoading || !form.periodo}
            >
              <FileDown size={18} />
              {isLoading ? 'Cargando reporte...' : 'Cargar reporte'}
            </button>
         </div>
      </div>

      {/* REPORTE ONSCREEN TIPO PDF */}
      {generatedReport && (
         <div style={{ position: 'fixed', inset: 0, background: '#525659', zIndex: 9999, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '1050px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
               Estadística de matrículas - {generatedReport.periodo}
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

          <div id="print-area" style={{ background: 'white', width: '100%', maxWidth: '1050px', minHeight: '1100px', padding: '60px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '2px', fontFamily: '"Inter", "Helvetica", Arial, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '16px', marginBottom: '10px' }}>
               <div style={{ flex: '1' }}>
                 {instConfig.logo ? (
                   <img src={instConfig.logo} alt="Logo" style={{ maxWidth: '120px', maxHeight: '60px', objectFit: 'contain' }} />
                 ) : (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px' }}>E</div>
                      <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b', fontWeight: '900', letterSpacing: '-0.5px' }}>EduNexus</h2>
                   </div>
                 )}
               </div>
               <div style={{ textAlign: 'center', flex: '2' }}>
                 <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>CENTRO DE ESTUDIOS TECNICOS EDUCATIVOS</p>
                 <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '900', color: '#000' }}>ESTADÍSTICA DE MATRÍCULA</p>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '9px', marginTop: '6px' }}>
                    <span>Código: 11</span>
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
                 Periodo: {generatedReport.periodo} | Tipo Ingreso: Todos
               </h3>
            </div>

            <table className="matrix-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', color: '#000', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th rowSpan={3} style={{ border: '1px solid #9ca3af', padding: '4px', textAlign: 'center', fontWeight: '800', width: '30%', backgroundColor: '#f3f4f6' }}>Programa</th>
                  <th colSpan={3} style={{ border: '1px solid #9ca3af', padding: '4px', fontWeight: '800', backgroundColor: '#f3f4f6' }}>Inscritos</th>
                  <th colSpan={9} style={{ border: '1px solid #9ca3af', padding: '4px', fontWeight: '800', backgroundColor: '#f3f4f6' }}>Matriculados Activos</th>
                  <th colSpan={6} style={{ border: '1px solid #9ca3af', padding: '4px', fontWeight: '800', backgroundColor: '#f3f4f6' }}>Matriculados Inactivos</th>
                </tr>
                <tr>
                  <th colSpan={3} style={{ border: '1px solid #9ca3af', padding: '2px', backgroundColor: '#f9fafb' }}></th>
                  <th colSpan={3} style={{ border: '1px solid #9ca3af', padding: '2px', backgroundColor: '#f9fafb', fontSize: '7px' }}>Nuevos</th>
                  <th colSpan={3} style={{ border: '1px solid #9ca3af', padding: '2px', backgroundColor: '#f9fafb', fontSize: '7px' }}>Renovantes</th>
                  <th colSpan={3} style={{ border: '1px solid #9ca3af', padding: '2px', backgroundColor: '#f9fafb', fontSize: '7px' }}>Total</th>
                  <th colSpan={3} style={{ border: '1px solid #9ca3af', padding: '2px', backgroundColor: '#f9fafb', fontSize: '7px' }}>No Renovados</th>
                  <th colSpan={3} style={{ border: '1px solid #9ca3af', padding: '2px', backgroundColor: '#f9fafb', fontSize: '7px' }}>Cancelados</th>
                </tr>
                <tr>
                  {Array.from({length: 6}).map((_, i) => (
                     <React.Fragment key={i}>
                        <th style={{ border: '1px solid #d1d5db', padding: '2px', backgroundColor: '#f9fafb', width: '2.5%' }}>M</th>
                        <th style={{ border: '1px solid #d1d5db', padding: '2px', backgroundColor: '#f9fafb', width: '2.5%' }}>F</th>
                        <th style={{ border: '1px solid #d1d5db', padding: '2px', backgroundColor: '#f9fafb', width: '2.5%' }}>T</th>
                     </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {generatedReport.stats.map((prog: any, idx: number) => (
                  <React.Fragment key={idx}>
                    <tr>
                       <td colSpan={19} style={{ border: '1px solid #9ca3af', padding: '4px', textAlign: 'left', fontWeight: '800', textTransform: 'uppercase', fontSize: '9px', backgroundColor: '#f3f4f6' }}>
                         {prog.programaNombre}
                       </td>
                    </tr>
                    {prog.rows.map((row: any, ridx: number) => (
                       <tr key={`${idx}-${ridx}`}>
                          <td style={{ border: '1px solid #d1d5db', padding: '3px 6px', textAlign: 'left', fontWeight: '500' }}>{row.jornada}</td>
                          
                          {/* Inscritos */}
                          <td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.insc[0])}</td><td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.insc[1])}</td><td style={{ border: '1px solid #d1d5db', fontWeight: '700' }}>{renderNum(row.insc[2])}</td>
                          
                          {/* Nuevos */}
                          <td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.nuevos[0])}</td><td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.nuevos[1])}</td><td style={{ border: '1px solid #d1d5db', fontWeight: '700' }}>{renderNum(row.nuevos[2])}</td>
                          
                          {/* Renovantes */}
                          <td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.renovantes[0])}</td><td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.renovantes[1])}</td><td style={{ border: '1px solid #d1d5db', fontWeight: '700' }}>{renderNum(row.renovantes[2])}</td>
                          
                          {/* Total Activos */}
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}>{renderNum(row.totAct[0])}</td><td style={{ border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}>{renderNum(row.totAct[1])}</td><td style={{ border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontWeight: '700' }}>{renderNum(row.totAct[2])}</td>
                          
                          {/* No Renov */}
                          <td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.noRenov[0])}</td><td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.noRenov[1])}</td><td style={{ border: '1px solid #d1d5db', fontWeight: '700' }}>{renderNum(row.noRenov[2])}</td>
                          
                          {/* Cancel */}
                          <td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.cancel[0])}</td><td style={{ border: '1px solid #d1d5db' }}>{renderNum(row.cancel[1])}</td><td style={{ border: '1px solid #d1d5db', fontWeight: '700' }}>{renderNum(row.cancel[2])}</td>
                       </tr>
                    ))}
                  </React.Fragment>
                ))}
                
                {/* GRAND TOTAL */}
                <tr style={{ backgroundColor: '#f3f4f6', fontWeight: '800' }}>
                   <td style={{ border: '1px solid #9ca3af', padding: '6px', textAlign: 'right' }}>Total</td>
                   <td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.insc[0])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.insc[1])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.insc[2])}</td>
                   <td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.nuevos[0])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.nuevos[1])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.nuevos[2])}</td>
                   <td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.renovantes[0])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.renovantes[1])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.renovantes[2])}</td>
                   <td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.totAct[0])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.totAct[1])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.totAct[2])}</td>
                   <td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.noRenov[0])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.noRenov[1])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.noRenov[2])}</td>
                   <td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.cancel[0])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.cancel[1])}</td><td style={{ border: '1px solid #9ca3af' }}>{renderNum(generatedReport.grantTotals.cancel[2])}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '50px', fontSize: '9px', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span>www.q10.com</span>
              <span>Fecha de impresión: {new Date().toLocaleDateString('es-CO')}</span>
            </div>

          </div>
        </div>
      )}

      {/* Helper styles for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; box-shadow: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; }
        }
        .input-premium:focus {
          outline: none;
          border-color: #22c55e !important;
        }
        .matrix-table td, .matrix-table th {
          border: 1px solid #9ca3af;
        }
      `}} />
    </DashboardLayout>
  );
}
