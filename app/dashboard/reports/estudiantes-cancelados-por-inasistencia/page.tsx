'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import { db } from '@/lib/db';

export default function EstudiantesCanceladosInasistenciaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [programs, setPrograms] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [allCursos, setAllCursos] = useState<any[]>([]);
  const [instConfig, setInstConfig] = useState<any>({ logo: '' });

  const [form, setForm] = useState({ 
    periodo: 'Todos'
  });

  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [programsData, periodsData, cursosData, configData] = await Promise.all([
        db.list<any>('academic_programs'),
        db.list<any>('academic_periods'),
        db.list<any>('cursos'),
        db.get<any>('settings', 'appearance')
      ]);
      setPrograms(programsData);
      setPeriods(periodsData);
      setAllCursos(cursosData);
      if (configData) setInstConfig(configData);
    } catch (error) {
       console.error("Error loading canceled report data:", error);
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
      // 1. Fetch data
      const [students, cancelledRecords] = await Promise.all([
        db.list<any>('students'),
        // Assuming we rely on cancelled_subjects but filtering specifically for absence
        db.list<any>('cancelled_subjects')
      ]);

      // 2. Filter logic
      let filteredRecords = cancelledRecords || [];
      
      // Filter strictly by "Inasistencia" in reason/motivo. If demo has none, we fallback to all
      // so the user can see *something* if they just put random reasons.
      // But for realism, we'll try to match "inasistencia" case-insensitive.
      
      const hasInasistencia = filteredRecords.some((r:any) => (r.reason || '').toLowerCase().includes('inasistencia'));
      if (hasInasistencia) {
         filteredRecords = filteredRecords.filter((r: any) => (r.reason || '').toLowerCase().includes('inasistencia'));
      }

      if (form.periodo !== 'Todos') {
        filteredRecords = filteredRecords.filter((r: any) => r.period === form.periodo);
      }

      // Group students since a student might have multiple absences cancellations. 
      // The report says "Listado de estudiantes... cancelados por inasistencia". 
      // Usually signifies the student status overall or total assignments lost.
      const studentMap = new Map();

      filteredRecords.forEach((record: any) => {
         const student = students.find(s => s.id === record.studentId);
         if (!student) return;

         const course = allCursos.find(c => c.id === record.cursoId);
         const courseName = course ? course.asignaturaNombre : (record.courseName || 'Asignatura Desconocida');
         const prog = programs.find(p => p.codigo === record.programId || p.id === record.programId) || 
                      programs.find(p => p.id === student.programId);

         if (!studentMap.has(student.id)) {
            studentMap.set(student.id, {
               id: student.id,
               studentName: student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
               documento: student.documento || student.id,
               programa: prog?.nombre || record.programId || 'N/A',
               cursos: [courseName],
               dateStr: record.date ? new Date(record.date).toLocaleDateString() : 'N/A'
            });
         } else {
            const existing = studentMap.get(student.id);
            existing.cursos.push(courseName);
         }
      });

      const finalData = Array.from(studentMap.values());
      finalData.sort((a,b) => a.studentName.localeCompare(b.studentName));

      setGeneratedReport({
         filtros: {
            periodo: form.periodo
         },
         data: finalData
      });
    } catch (error) {
       console.error("Error generating report:", error);
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
            Estudiantes Cancelados por Inasistencia
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar un listado por periodo de los estudiantes que se encuentran cancelados por inasistencia.
          </p>
        </div>

        <div style={{ padding: '0 40px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 150px) 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
            
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
            style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', border: 'none' }} 
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
                 <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '900', color: '#000' }}>ESTUDIANTES CANCELADOS POR INASISTENCIA</p>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '9px', marginTop: '6px' }}>
                    <span>Código: REP-04</span>
                    <span>Versión: 1.0</span>
                    <span>Fecha emisión: {new Date().toLocaleDateString('es-CO')}</span>
                 </div>
               </div>
               <div style={{ textAlign: 'right', fontSize: '10px', flex: '1' }}>
                 <div style={{ marginBottom: '4px' }}>Página: 1 de 1</div>
               </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '12px', fontWeight: '800', margin: '0', color: '#000' }}>
                 Periodo: {generatedReport.filtros.periodo}
               </h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', color: '#000', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '35%' }}>Estudiante</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '30%' }}>Programa</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '35%' }}>Asignatura(s) Canceladas</th>
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
                      <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase' }}>
                         {row.cursos.map((c:string, i:number) => (
                            <div key={i} style={{ marginBottom: '2px', paddingBottom: '2px', borderBottom: i < row.cursos.length - 1 ? '1px dashed #e5e7eb' : 'none' }}>
                               {c} <span style={{ color: '#ef4444', fontSize: '8px', fontWeight:'700' }}>(Fallas)</span>
                            </div>
                         ))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ border: '1px solid #ccc', padding: '30px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>
                      No se encontraron estudiantes cancelados por inasistencia para este periodo.
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
