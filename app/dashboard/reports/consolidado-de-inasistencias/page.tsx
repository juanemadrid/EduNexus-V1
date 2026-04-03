'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ChevronDown, 
  Calendar,
  Layers,
  MapPin,
  BookOpen,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { db } from '@/lib/db';

export default function ConsolidadoInasistenciasPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Data State
  const [periods, setPeriods] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [pensums, setPensums] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);

  // Form State
  const [form, setForm] = useState({ 
    periodo: '2026 - 01',
    filtrarPor: 'Programa',
    sedeJornada: 'Todos', 
    programaId: 'Todos',
    pensumId: 'Todos',
    cursoId: 'Todos'
  });

  useEffect(() => {
    Promise.all([
      db.list('academic_periods'),
      db.list('sedes'),
      db.list('academic_programs'),
      db.list('pensums'),
      db.list('cursos')
    ]).then(([peri, sede, prog, pens, curs]) => {
      setPeriods(peri);
      setSedes(sede);
      setPrograms(prog);
      setPensums(pens);
      setCursos(curs);
      if ((peri as any[]).length > 0) setForm(f => ({ ...f, periodo: (peri as any[])[0].nombre || (peri as any[])[0].name || (peri as any[])[0].id }));
    }).catch(console.error).finally(() => setIsInitialLoading(false));
  }, []);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const [allAttendance, students] = await Promise.all([
        db.list<any>('attendance_records'),
        db.list<any>('students')
      ]);

      const absentCounts: Record<string, {name: string; doc: string; total: number; programa: string}> = {};
      
      const relevantStudents = students.filter(s => {
        if (form.sedeJornada !== 'Todos' && s.sedeJornada !== form.sedeJornada) return false;
        
        if (form.filtrarPor === 'Programa') {
          if (form.programaId !== 'Todos' && s.programaId !== form.programaId && s.programa !== form.programaId) return false;
          if (form.pensumId !== 'Todos' && s.pensumId !== form.pensumId) return false;
        } else if (form.filtrarPor === 'Curso') {
          // If filtering by specific course, we might need to check enrollment in that course specifically
          // For now, filtering by students linked to that course if the data exists
          if (form.cursoId !== 'Todos' && s.cursoId !== form.cursoId) return false;
        }
        return true;
      });

      const relevantIds = new Set(relevantStudents.map(s => s.id));

      allAttendance.forEach((att: any) => {
        if (!relevantIds.has(att.studentId)) return;
        if (att.status === 'I' || att.status === 'A') {
          if (!absentCounts[att.studentId]) {
            const s = relevantStudents.find((st: any) => st.id === att.studentId) as any;
            absentCounts[att.studentId] = {
              name: s?.name || `${s?.nombres || ''} ${s?.apellidos || ''}`.trim() || att.studentId,
              doc: s?.documento || s?.document || att.studentId,
              total: 0,
              programa: s?.programaNombre || s?.programa || 'N/A'
            };
          }
          absentCounts[att.studentId]!.total++;
        }
      });

      const headers = ['Documento', 'Estudiante', 'Programa', 'Total Inasistencias'];
      const rows = Object.values(absentCounts).map(s => [s.doc, s.name, s.programa, s.total]);
      rows.sort((a: any, b: any) => (b[3] - a[3]));

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 30 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inasistencias');
      const fileName = `Consolidado_Inasistencias_${form.periodo.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Header (Clean & Consistent - No Arrow) */}
        <div style={{ marginBottom: '40px' }}>
           <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>
             Consolidado de Inasistencias
           </h1>
           <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
             Estadísticas generales de ausencia y control de asistencia estudiantil.
           </p>
        </div>

        {/* Filter Configuration Card (EduNexus Premium Glass) */}
        <div className="glass-panel" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '32px', padding: '56px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
          <div style={{ maxWidth: '620px', margin: '0 auto' }}>
             
             {/* Report Description */}
             <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6', fontWeight: '500' }}>
                  Permite visualizar de manera general la cantidad de inasistencias registradas a cada estudiante según el periodo y criterios seleccionados.
                </p>
                <div style={{ width: '60px', height: '4px', background: '#10b981', borderRadius: '2px', margin: '20px auto 0', opacity: 0.3 }} />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Período */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                     <Calendar size={16} color="#94a3b8" />
                     <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período</label>
                   </div>
                   <div style={{ position: 'relative' }}>
                      <select className="input-premium" value={form.periodo} onChange={e => handleChange('periodo', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                         {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                   </div>
                </div>

                {/* 2. Filtrar por */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                     <Filter size={16} color="#94a3b8" />
                     <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Filtrar por</label>
                   </div>
                   <div style={{ position: 'relative' }}>
                      <select className="input-premium" value={form.filtrarPor} onChange={e => handleChange('filtrarPor', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                        <option value="Programa">Programa</option>
                        <option value="Curso">Curso</option>
                        <option value="Curso Competencia">Curso Competencia</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                   </div>
                </div>

                {/* 3. Sede - jornada */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                     <MapPin size={16} color="#94a3b8" />
                     <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Sede - jornada *</label>
                   </div>
                   <div style={{ position: 'relative' }}>
                      <select className="input-premium" value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                        <option value="Todos">Todos</option>
                        {sedes.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                   </div>
                </div>

                {/* Conditional Filters Based on 'Filtrar por' */}
                 {form.filtrarPor === 'Programa' ? (
                     <div key="programa" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Programa */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                           <BookOpen size={16} color="#94a3b8" />
                           <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Programa *</label>
                         </div>
                         <div style={{ position: 'relative' }}>
                            <select className="input-premium" value={form.programaId} onChange={e => handleChange('programaId', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                              <option value="Todos">Todos</option>
                              {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                         </div>
                      </div>
                      {/* Pensum */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                           <Layers size={16} color="#94a3b8" />
                           <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Pensum *</label>
                         </div>
                         <div style={{ position: 'relative' }}>
                            <select className="input-premium" value={form.pensumId} onChange={e => handleChange('pensumId', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                              <option value="Todos">Todos</option>
                              {pensums.map(p => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                         </div>
                      </div>
                     </div>
                   ) : (
                     <div key="curso" style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                         <CheckCircle2 size={16} color="#94a3b8" />
                         <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>{form.filtrarPor} *</label>
                       </div>
                       <div style={{ position: 'relative' }}>
                          <select className="input-premium" value={form.cursoId} onChange={e => handleChange('cursoId', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                            <option value="Todos">Todos los {form.filtrarPor.toLowerCase()}s</option>
                            {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.name || c.codigo}</option>)}
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                       </div>
                     </div>
                   )}

             </div>

             {/* Export Button Area */}
             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn-premium"
                  style={{ 
                    background: '#16a34a', 
                    color: 'white', 
                    padding: '16px 48px', 
                    fontWeight: '900', 
                    borderRadius: '20px', 
                    fontSize: '15px', 
                    border: 'none', 
                    cursor: isExporting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <FileSpreadsheet size={20} />
                  {isExporting ? 'EXPORTANDO...' : 'EXPORTAR REPORTE'}
                </button>
             </div>

          </div>
        </div>

      </div>

      <style jsx global>{`
        .input-premium {
          border-radius: 16px; border: 1px solid #e2e8f0; outline: none; padding: 0 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-premium:focus {
          border-color: #3b82f6; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.1); transform: translateY(-1px);
        }
        .btn-premium {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-premium:hover:not(:disabled) {
          transform: translateY(-2px); filter: brightness(1.05);
        }
        .btn-premium:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </DashboardLayout>
  );
}
