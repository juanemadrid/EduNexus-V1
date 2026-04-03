'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function DisenoCurricularPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [instConfig, setInstConfig] = useState<any>({ logo: '' });
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const [form, setForm] = useState({ 
    programaId: 'Todos', 
    pensum: 'Todos' 
  });
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [programsData, subjectsData, configData] = await Promise.all([
        db.list<any>('academic_programs'),
        db.list<any>('academic_subjects'),
        db.get<any>('settings', 'appearance')
      ]);
      setPrograms(programsData);
      setSubjects(subjectsData);
      if (configData) setInstConfig(configData);
    } catch (error) {
       console.error("Error loading diseno curricular report data:", error);
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
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate generation
      
      const progName = programs.find(p => p.codigo === form.programaId)?.nombre || form.programaId;
      setGeneratedReport({
        programName: progName === 'Todos' ? 'TODOS LOS PROGRAMAS' : progName,
        pensumName: form.pensum === 'Todos' ? 'PENSUM' : form.pensum,
        subjects: subjects
      });
    } catch (error) {
       console.error("Error generating curricular design report:", error);
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
             Diseño Curricular
           </h1>
           <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
             Permite visualizar el plan de estudios (Pensum) de cada programa.
           </p>
         </div>

         <div style={{ padding: '0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
               
               <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                 Programa
               </label>
               <div>
                 <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                   <option value="Todos">Seleccionar</option>
                   {programs.map(p => (
                     <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                   ))}
                 </select>
               </div>

               <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                 Pensum
               </label>
               <div>
                 <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.pensum} onChange={e => handleChange('pensum', e.target.value)}>
                   <option value="Todos">Seleccionar</option>
                   <option value="PENSUM">PENSUM</option>
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

      {/* REPORTE GENERADO (VISOR TIPO PDF) */}
      {generatedReport && (
        <div style={{ position: 'fixed', inset: 0, background: '#525659', zIndex: 9999, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Barra de controles superior */}
          <div style={{ width: '100%', maxWidth: '850px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
               Diseño Curricular - {generatedReport.programName}
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

          {/* Página blanca (A4) - Estilo Profesional */}
          <div id="print-area" style={{ background: 'white', width: '100%', maxWidth: '900px', minHeight: '1100px', padding: '60px 70px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '2px', fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
            
            {/* Header del documento */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
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
                 <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CENTRO INSTITUCIONAL EDUCATIVO</p>
                 <p style={{ margin: '6px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '1px' }}>DISEÑO CURRICULAR</p>
               </div>
               <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569', fontWeight: '600', flex: '1', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                 <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block', textAlign: 'left' }}>
                    <div style={{ marginBottom: '3px' }}><span style={{ color: '#94a3b8' }}>Código:</span> DOC-DC-01</div>
                    <div style={{ marginBottom: '3px' }}><span style={{ color: '#94a3b8' }}>Versión:</span> 1.0</div>
                    <div style={{ marginBottom: '3px' }}><span style={{ color: '#94a3b8' }}>Fecha emisión:</span> {new Date().toLocaleDateString('es-CO')}</div>
                    <div><span style={{ color: '#94a3b8' }}>Página:</span> 1 de 1</div>
                 </div>
               </div>
            </div>

            {/* Subheader */}
            <div style={{ textAlign: 'center', marginBottom: '30px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0', color: '#1e293b' }}>
                 Programa: <span style={{ color: '#0f172a' }}>{generatedReport.programName.toUpperCase()}</span> &nbsp;|&nbsp; Pensum: <span style={{ color: '#0f172a' }}>{generatedReport.pensumName.toUpperCase()}</span>
               </h3>
               <div style={{ marginTop: '14px', fontSize: '10px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                 Requisito(s) (Prerrequisitos)
               </div>
            </div>

            {/* Tabla de malla curricular */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: '#334155' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#1e293b' }}>Código</th>
                  <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#1e293b' }}>Nombre Asignatura</th>
                  <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>Abreviación</th>
                  <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>Nivel</th>
                  <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>Int. Horaria</th>
                  <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>Int. Semanal</th>
                  <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>N° Créditos</th>
                </tr>
              </thead>
              <tbody>
                {generatedReport.subjects.length > 0 ? (
                  generatedReport.subjects.map((sub: any, idx: number) => {
                    const levelMock = `Semestre N° ${Math.ceil((idx + 1) / 4)}`;
                    return (
                      <tr key={sub.id || idx}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: '700', color: '#475569' }}>{sub.codigo}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: '600', color: '#1e293b' }}>{sub.nombre.toUpperCase()}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'center' }}>{sub.abreviacion}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'center', fontWeight: '600' }}>{sub.nivel || levelMock}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'center' }}>{sub.intensidadHoraria || '40'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'center' }}>{sub.horasSemanales || '8'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'center', fontWeight: '700' }}>{sub.creditos || '3'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ border: '1px solid #cbd5e1', padding: '24px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                      No hay asignaturas registradas para este pensum.
                    </td>
                  </tr>
                )}
                
                {/* Footer sumatorias */}
                {generatedReport.subjects.length > 0 && (
                  <tr style={{ background: '#f8fafc' }}>
                     <td colSpan={4} style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '10px 16px', fontWeight: '900', color: '#1e293b', letterSpacing: '0.5px' }}>TOTALES GENERALES</td>
                     <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>{generatedReport.subjects.length * 40}</td>
                     <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>{generatedReport.subjects.length * 8}</td>
                     <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#1e293b' }}>{generatedReport.subjects.length * 3}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '40px', fontSize: '8px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Generado por módulo de Diseño Curricular - EduNexus</span>
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
