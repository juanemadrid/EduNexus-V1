'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import { db } from '@/lib/db';

export default function HistoricoInasistenciasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [instConfig, setInstConfig] = useState<any>({ logo: '' });

  const [form, setForm] = useState({
    periodo: 'Todos',
    sedeJornada: 'Todos',
    asignaturaId: '',
    cursoId: ''
  });
  const [touched, setTouched] = useState({ asignaturaId: false, cursoId: false });
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      db.list<any>('academic_subjects'),
      db.list<any>('sedes'),
      db.list<any>('cursos'),
      db.list<any>('academic_periods'),
      db.get<any>('settings', 'appearance')
    ]).then(([subjectsData, sedesData, coursesData, periodsData, configData]) => {
      setSubjects(subjectsData);
      setSedes(sedesData);
      setCourses(coursesData);
      setPeriods(periodsData);
      if (configData) setInstConfig(configData);
    }).catch(console.error);
  }, []);

  const isInvalid = (field: 'asignaturaId' | 'cursoId') =>
    touched[field] && !form[field];

  const handleCharge = async () => {
    setTouched({ asignaturaId: true, cursoId: true });
    if (!form.asignaturaId || !form.cursoId) return;

    setIsLoading(true);
    try {
      const [records, allStudents] = await Promise.all([
        db.list<any>('attendance_records'),
        db.list<any>('students')
      ]);

      const filtered = records.filter((r: any) => {
        const matchCurso = r.cursoId === form.cursoId || r.idCurso === form.cursoId;
        const matchPeriod = form.periodo !== 'Todos' ? (r.periodo === form.periodo || r.period === form.periodo) : true;
        return matchCurso && matchPeriod && (r.status === 'I' || r.status === 'A' || r.status === 'T');
      });

      const byStudent: Record<string, any> = {};
      filtered.forEach((r: any) => {
        if (!byStudent[r.studentId]) {
          const student = allStudents.find(s => s.id === r.studentId);
          byStudent[r.studentId] = {
            id: r.studentId,
            name: student ? (student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim()) : r.studentId,
            documento: student?.documento || r.studentId,
            absences: 0,
            tardies: 0
          };
        }
        if (r.status === 'I' || r.status === 'A') byStudent[r.studentId].absences++;
        if (r.status === 'T') byStudent[r.studentId].tardies++;
      });

      const data = Object.values(byStudent).sort((a: any, b: any) => a.name.localeCompare(b.name));
      const course = courses.find(c => c.id === form.cursoId);
      const subject = subjects.find(s => s.id === form.asignaturaId || s.codigo === form.asignaturaId);

      setGeneratedReport({
        filtros: {
          periodo: form.periodo,
          sede: form.sedeJornada,
          curso: course?.nombre || form.cursoId,
          asignatura: subject?.nombre || form.asignaturaId
        },
        data
      });
    } catch (error) {
      console.error("Error charging historical inasistencias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>Histórico Inasistencias</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite observar las inasistencias registradas en los cursos que ya están archivados.
          </p>
        </div>

        <div style={{ padding: '0 40px', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período</label>
            <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={form.periodo} onChange={e => setForm(p => ({ ...p, periodo: e.target.value }))}>
              <option value="Todos">Todos</option>
              {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
            </select>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Sede - jornada</label>
            <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={form.sedeJornada} onChange={e => setForm(p => ({ ...p, sedeJornada: e.target.value }))}>
              <option value="Todos">Todos</option>
              {sedes.map(s => <option key={s.id} value={s.nombre || s.id}>{s.nombre}</option>)}
            </select>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Asignatura <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select className="input-premium"
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('asignaturaId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                value={form.asignaturaId}
                onChange={e => { setTouched(p => ({ ...p, asignaturaId: true })); setForm(p => ({ ...p, asignaturaId: e.target.value })); }}>
                <option value="">Seleccione</option>
                {subjects.map(s => <option key={s.id || s.codigo} value={s.id || s.codigo}>{s.nombre}</option>)}
              </select>
              {isInvalid('asignaturaId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Curso <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select className="input-premium"
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('cursoId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                value={form.cursoId}
                onChange={e => { setTouched(p => ({ ...p, cursoId: true })); setForm(p => ({ ...p, cursoId: e.target.value })); }}>
                <option value="">Seleccione</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {isInvalid('cursoId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>}
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-premium"
            style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', border: 'none' }}
            onClick={handleCharge} disabled={isLoading}>
            <FileDown size={18} />
            {isLoading ? 'Generando...' : 'Cargar reporte'}
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

          <div id="print-area" style={{ background: 'white', width: '100%', maxWidth: '950px', minHeight: '1100px', padding: '60px 70px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '2px', fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '10px' }}>
              <div style={{ flex: '1' }}>
                {instConfig.logo ? (
                  <img src={instConfig.logo} alt="Logo" style={{ maxWidth: '140px', maxHeight: '70px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px' }}>E</div>
                    <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b', fontWeight: '900' }}>EduNexus</h2>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', flex: '2' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>CENTRO EDUCATIVO INSTITUCIONAL</p>
                <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '900', color: '#000' }}>HISTÓRICO DE INASISTENCIAS</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '9px', marginTop: '6px' }}>
                  <span>Código: REP-07</span><span>Versión: 1.0</span><span>Fecha: {new Date().toLocaleDateString('es-CO')}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', flex: '1' }}>Página: 1 de 1</div>
            </div>

            <div style={{ margin: '20px 0 30px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 4px', color: '#1e293b' }}>
                Período: {generatedReport.filtros.periodo} &nbsp;|&nbsp; Sede: {generatedReport.filtros.sede}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569', fontWeight: '700' }}>
                Curso: {generatedReport.filtros.curso} &nbsp;|&nbsp; Asignatura: {generatedReport.filtros.asignatura}
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '45%' }}>Estudiante</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', width: '27%' }}>Total Inasistencias</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', width: '28%' }}>Total Tardanzas</th>
                </tr>
              </thead>
              <tbody>
                {generatedReport.data.length > 0 ? generatedReport.data.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      <div style={{ fontWeight: '700', textTransform: 'uppercase' }}>{row.name}</div>
                      <div style={{ fontSize: '9px', color: '#4b5563' }}>ID: {row.documento}</div>
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '800', color: row.absences > 0 ? '#ef4444' : '#374151' }}>
                      {row.absences}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '700', color: row.tardies > 0 ? '#f59e0b' : '#374151' }}>
                      {row.tardies}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} style={{ border: '1px solid #ccc', padding: '30px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                      No se encontraron registros de inasistencias para los filtros seleccionados.
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
        @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; box-shadow: none !important; width: 100% !important; max-width: 100% !important; } }
        .input-premium:focus { border-color: #3b82f6 !important; outline: none; }
      `}} />
    </DashboardLayout>
  );
}
