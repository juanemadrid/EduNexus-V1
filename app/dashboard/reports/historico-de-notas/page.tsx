'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown, ChevronDown } from 'lucide-react';
import { db } from '@/lib/db';

export default function HistoricoNotasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    filtro: 'Período',
    periodo: '',
    sedeJornada: '',
    programaId: '',
    asignaturaId: '',
    cursoId: '',
    incluirObservaciones: false
  });
  const [touched, setTouched] = useState({
    periodo: false, sedeJornada: false, programaId: false, asignaturaId: false, cursoId: false
  });
  const [programs, setPrograms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [instConfig, setInstConfig] = useState<any>({});

  useEffect(() => {
    Promise.all([
      db.list<any>('academic_programs'),
      db.list<any>('academic_subjects'),
      db.list<any>('sedes'),
      db.list<any>('cursos'),
      db.list<any>('academic_periods'),
      db.get<any>('settings', 'appearance')
    ]).then(([p, s, se, c, per, config]) => {
      setPrograms(p); setSubjects(s); setSedes(se); setAllCourses(c); setPeriods(per);
      if (per.length > 0) setForm(f => ({ ...f, periodo: per[0].nombre || per[0].name || per[0].id }));
      if (config) setInstConfig(config);
    }).catch(console.error);
  }, []);

  const handleCharge = async () => {
    setTouched({ periodo: true, sedeJornada: true, programaId: true, asignaturaId: true, cursoId: true });
    if (!form.sedeJornada || !form.programaId || !form.asignaturaId || !form.cursoId) return;

    setIsLoading(true);
    try {
      const [grades, students] = await Promise.all([
        db.list<any>('academic_grades'),
        db.list<any>('students')
      ]);

      const courseGrades = grades.filter(g => g.cursoId === form.cursoId);
      const course = allCourses.find(c => c.id === form.cursoId);
      const subject = subjects.find(s => s.id === form.asignaturaId || s.codigo === form.asignaturaId);
      const program = programs.find(p => p.id === form.programaId || p.codigo === form.programaId);
      const sede = sedes.find(s => s.nombre === form.sedeJornada || s.id === form.sedeJornada);

      const data = courseGrades.map(g => {
        const student = students.find(s => s.id === g.studentId);
        return {
          studentName: student ? (student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim()) : g.studentId,
          documento: student?.documento || g.studentId,
          grade: Number(g.grade).toFixed(2),
          status: Number(g.grade) >= 3.0 ? 'Aprobado' : 'Reprobado',
          period: g.period || form.periodo,
          observaciones: form.incluirObservaciones ? (g.observaciones || g.observations || '—') : null
        };
      });

      data.sort((a, b) => a.studentName.localeCompare(b.studentName));

      setGeneratedReport({
        filtros: {
          periodo: form.periodo,
          sede: sede?.nombre || form.sedeJornada,
          programa: program?.nombre || form.programaId,
          asignatura: subject?.nombre || form.asignaturaId,
          curso: course?.nombre || form.cursoId
        },
        data,
        incluirObs: form.incluirObservaciones
      });
    } catch (error) {
      console.error("Error charging historical grades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInvalid = (field: string) =>
    (touched as any)[field] && !(form as any)[field];

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>Histórico de notas</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar la planilla de los cursos archivados con sus respectivos estudiantes y notas.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                value={form.periodo} onChange={e => setForm(p => ({ ...p, periodo: e.target.value }))}>
                <option value="">Seleccione</option>
                {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Sede - jornada <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('sedeJornada') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                value={form.sedeJornada} onChange={e => { setTouched(p => ({ ...p, sedeJornada: true })); setForm(p => ({ ...p, sedeJornada: e.target.value })); }}>
                <option value="">Seleccione</option>
                {sedes.map(s => <option key={s.id} value={s.nombre || s.id}>{s.nombre}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {isInvalid('sedeJornada') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Programa <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('programaId') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                value={form.programaId} onChange={e => { setTouched(p => ({ ...p, programaId: true })); setForm(p => ({ ...p, programaId: e.target.value })); }}>
                <option value="">Seleccione</option>
                {programs.map(p => <option key={p.id || p.codigo} value={p.id || p.codigo}>{p.nombre}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {isInvalid('programaId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Asignatura <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('asignaturaId') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                value={form.asignaturaId} onChange={e => { setTouched(p => ({ ...p, asignaturaId: true })); setForm(p => ({ ...p, asignaturaId: e.target.value })); }}>
                <option value="">Seleccione</option>
                {subjects.map(s => <option key={s.id || s.codigo} value={s.id || s.codigo}>{s.nombre}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {isInvalid('asignaturaId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Curso <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('cursoId') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                value={form.cursoId} onChange={e => { setTouched(p => ({ ...p, cursoId: true })); setForm(p => ({ ...p, cursoId: e.target.value })); }}>
                <option value="">Seleccione</option>
                {allCourses.map(c => <option key={c.id} value={c.id}>{c.nombre || c.asignaturaNombre} ({c.codigo})</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {isInvalid('cursoId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Incluir observaciones</label>
            <div>
              <div onClick={() => setForm(p => ({ ...p, incluirObservaciones: !p.incluirObservaciones }))}
                style={{ width: '64px', height: '24px', background: form.incluirObservaciones ? '#ecfdf5' : '#f1f5f9', borderRadius: '12px', display: 'flex', position: 'relative', cursor: 'pointer', border: `1px solid ${form.incluirObservaciones ? '#10b981' : '#e2e8f0'}`, overflow: 'hidden', transition: '0.2s' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: form.incluirObservaciones ? '#cbd5e1' : '#64748b', zIndex: 1 }}>No</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: form.incluirObservaciones ? '#10b981' : '#cbd5e1', zIndex: 1 }}>Sí</div>
                <div style={{ position: 'absolute', top: 0, left: form.incluirObservaciones ? '50%' : 0, width: '50%', height: '100%', background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'left 0.2s ease' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-premium"
            style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', border: 'none', borderRadius: '12px' }}
            onClick={handleCharge} disabled={isLoading}>
            <FileDown size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>

      {generatedReport && (
        <div style={{ position: 'fixed', inset: 0, background: '#525659', zIndex: 9999, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '950px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Visor de Reporte PDF</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Exportar PDF (Imprimir)</button>
              <button onClick={() => setGeneratedReport(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Cerrar Visor</button>
            </div>
          </div>

          <div id="print-area" style={{ background: 'white', width: '100%', maxWidth: '950px', minHeight: '1100px', padding: '60px 70px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', fontFamily: '"Inter", Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px' }}>E</div>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b', fontWeight: '900' }}>EduNexus</h2>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>CENTRO EDUCATIVO INSTITUCIONAL</p>
                <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '900', color: '#000' }}>HISTÓRICO DE NOTAS</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '9px', marginTop: '4px' }}>
                  <span>Código: REP-09</span><span>Versión: 1.0</span><span>Fecha: {new Date().toLocaleDateString('es-CO')}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px' }}>Página: 1 de 1</div>
            </div>

            <div style={{ margin: '20px 0 30px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
              <strong>Período:</strong> {generatedReport.filtros.periodo} &nbsp;|&nbsp;
              <strong>Sede:</strong> {generatedReport.filtros.sede} &nbsp;|&nbsp;
              <strong>Programa:</strong> {generatedReport.filtros.programa} &nbsp;|&nbsp;
              <strong>Asignatura:</strong> {generatedReport.filtros.asignatura} &nbsp;|&nbsp;
              <strong>Curso:</strong> {generatedReport.filtros.curso}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '35%' }}>Estudiante</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', width: '15%' }}>Documento</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', width: '12%' }}>Nota</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', width: '15%' }}>Estado</th>
                  {generatedReport.incluirObs && <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800' }}>Observaciones</th>}
                </tr>
              </thead>
              <tbody>
                {generatedReport.data.length > 0 ? generatedReport.data.map((row: any, idx: number) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: '700', textTransform: 'uppercase' }}>{row.studentName}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{row.documento}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '900', color: parseFloat(row.grade) < 3.0 ? '#dc2626' : '#059669', fontSize: '12px' }}>{row.grade}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '700', color: row.status === 'Aprobado' ? '#059669' : '#dc2626' }}>{row.status}</td>
                    {generatedReport.incluirObs && <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '9px', color: '#4b5563' }}>{row.observaciones}</td>}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={generatedReport.incluirObs ? 5 : 4} style={{ border: '1px solid #ccc', padding: '30px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                      No se encontraron notas para el curso seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '50px', fontSize: '9px', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '16px' }}>
              <span>EduNexus Académico</span><span>Emitido por Sistema Central</span>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; box-shadow: none !important; width: 100% !important; } }
        .input-premium { outline: none; transition: 0.2s; border-radius: 10px; padding: 0 12px; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
      `}} />
    </DashboardLayout>
  );
}
