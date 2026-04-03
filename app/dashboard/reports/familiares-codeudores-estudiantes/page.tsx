'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileSpreadsheet, ChevronDown, Info, Users, Phone, Mail, ShieldCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function FamiliaresCodeudoresEstudiantesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allFamily, setAllFamily] = useState<any[]>([]);
  const [allLinks, setAllLinks] = useState<any[]>([]);

  const [reportData, setReportData] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [form, setForm] = useState({
    sedeJornada: 'Todos',
    programaId: 'Todos'
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        const [sedesData, programsData, studentsData, familyData, linksData] = await Promise.all([
          db.list<any>('sedes'),
          db.list<any>('academic_programs'),
          db.list<any>('students'),
          db.list<any>('family_members').catch(() => db.list<any>('family').catch(() => [])),
          db.list<any>('student_family_links').catch(() => [])
        ]);
        setSedes(sedesData);
        setPrograms(programsData);
        setAllStudents(studentsData);
        setAllFamily(familyData);
        setAllLinks(linksData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleCharge = async () => {
    setIsLoading(true);
    setShowResults(false);
    try {
      // Build joined data: student + family links
      let students = [...allStudents];

      // Apply sede filter
      if (form.sedeJornada !== 'Todos') {
        students = students.filter(s =>
          s.sedeId === form.sedeJornada || s.sede === form.sedeJornada
        );
      }

      // Apply program filter
      if (form.programaId !== 'Todos') {
        students = students.filter(s =>
          s.programaId === form.programaId || s.details?.programaId === form.programaId
        );
      }

      // Join with family links
      const rows: any[] = [];
      for (const student of students) {
        // Find links for this student
        const studentLinks = allLinks.filter(l =>
          l.studentId === student.id || l.estudianteId === student.id
        );

        if (studentLinks.length > 0) {
          for (const link of studentLinks) {
            const familiar = allFamily.find(f =>
              f.id === link.familiarId || f.id === link.familyMemberId
            );
            rows.push({
              studentId: student.id,
              studentName: student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
              studentDoc: student.documento || student.id,
              programa: programs.find(p => p.id === student.programaId)?.nombre || student.programa || '—',
              sede: sedes.find(s => s.id === student.sedeId)?.nombre || student.sede || '—',
              familiarName: familiar?.name || familiar?.nombre || link.nombreFamiliar || '—',
              familiarDoc: familiar?.documento || link.documento || '—',
              parentesco: link.parentesco || link.relacion || familiar?.parentesco || '—',
              esCodeudor: link.esCodeudor || link.codeudor || false,
              telefono: familiar?.celular || familiar?.telefono || link.telefono || '—',
              correo: familiar?.correo || familiar?.email || link.correo || '—'
            });
          }
        } else {
          // Student has no links — still include with empty family if relevant
          rows.push({
            studentId: student.id,
            studentName: student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
            studentDoc: student.documento || student.id,
            programa: programs.find(p => p.id === student.programaId)?.nombre || student.programa || '—',
            sede: sedes.find(s => s.id === student.sedeId)?.nombre || student.sede || '—',
            familiarName: '—',
            familiarDoc: '—',
            parentesco: '—',
            esCodeudor: false,
            telefono: student.telefono || student.celular || '—',
            correo: student.correo || student.email || '—'
          });
        }
      }

      setReportData(rows);
      setShowResults(true);
    } catch (err) {
      console.error('Error charging report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (reportData.length === 0) {
      await handleCharge();
      return;
    }
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const headers = [
        'Documento Estudiante', 'Nombre Estudiante', 'Programa', 'Sede',
        'Familiar / Codeudor', 'Documento Familiar', 'Parentesco', 'Tipo',
        'Teléfono', 'Correo'
      ];
      const rows = reportData.map(r => [
        r.studentDoc, r.studentName, r.programa, r.sede,
        r.familiarName, r.familiarDoc, r.parentesco,
        r.esCodeudor ? 'Codeudor' : 'Acudiente',
        r.telefono, r.correo
      ]);

      const ws = XLSX.utils.aoa_to_sheet([
        ['Familiares Codeudores Estudiante — EduNexus'],
        [`Sede: ${form.sedeJornada} | Programa: ${form.programaId}`],
        [`Total registros: ${rows.length}`],
        [],
        headers,
        ...rows
      ]);
      ws['!cols'] = [
        { wch: 16 }, { wch: 28 }, { wch: 26 }, { wch: 18 },
        { wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 12 },
        { wch: 16 }, { wch: 28 }
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Familiares');
      XLSX.writeFile(wb, `Familiares_Codeudores_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Filter Panel — Q10 layout */}
      <div className="glass-panel" style={{
        maxWidth: '680px',
        margin: '0 auto 28px',
        background: 'white',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '36px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
            Familiares Codeudores Estudiante
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
            Permite observar la información de los acudientes y codeudores relacionados a cada estudiante con su respectivo contacto.
          </p>
        </div>

        {/* Form — Q10 two-column label/field layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 150px) 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Sede - jornada */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Sede - jornada
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input-premium"
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
              value={form.sedeJornada}
              onChange={e => setForm(p => ({ ...p, sedeJornada: e.target.value }))}
              disabled={initialLoading}
            >
              <option value="Todos">Todos</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {/* Programa */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Programa
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input-premium"
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
              value={form.programaId}
              onChange={e => setForm(p => ({ ...p, programaId: e.target.value }))}
              disabled={initialLoading}
            >
              <option value="Todos">Todos</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

        </div>

        {/* Action Button — "Cargar reporte" (Q10-style, right-aligned) */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-premium"
            onClick={handleCharge}
            disabled={isLoading || initialLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#10b981', color: 'white',
              padding: '10px 24px', fontSize: '14px', fontWeight: '700',
              borderRadius: '8px', border: 'none',
              cursor: isLoading || initialLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 4px 14px -3px rgba(16,185,129,0.4)'
            }}
          >
            <Users size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>

      {/* Results Table */}
      {showResults && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            {/* Table Header bar */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                  Familiares / Codeudores — {reportData.length} registros
                </h3>
              </div>
              <button
                className="btn-premium"
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#10b981', color: 'white',
                  padding: '8px 18px', fontSize: '13px', fontWeight: '700',
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  boxShadow: '0 2px 8px -2px rgba(16,185,129,0.4)'
                }}
              >
                <FileSpreadsheet size={16} />
                {isExporting ? 'Exportando...' : 'Exportar Excel'}
              </button>
            </div>

            {reportData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <Users size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: '700' }}>No se encontraron registros para los filtros seleccionados.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>
                      {['Estudiante', 'Familiar / Codeudor', 'Parentesco', 'Tipo', 'Contacto'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((r, idx) => (
                      <tr key={`${r.studentId}-${idx}`} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafdf9')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{r.studentName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Doc: {r.studentDoc} · {r.programa}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{r.familiarName}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Doc: {r.familiarDoc}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>{r.parentesco}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            background: r.esCodeudor ? '#ecfdf5' : '#f1f5f9',
                            color: r.esCodeudor ? '#059669' : '#64748b',
                            padding: '4px 12px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: '800',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            {r.esCodeudor && <ShieldCheck size={11} />}
                            {r.esCodeudor ? 'Codeudor' : 'Acudiente'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                            <Phone size={12} color="#94a3b8" /> {r.telefono}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                            <Mail size={12} color="#94a3b8" /> {r.correo}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start', border: '1px solid #f1f5f9' }}>
            <Info size={16} style={{ color: '#64748b', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              Los familiares marcados como <strong>Codeudor</strong> son los responsables legales ante la institución. Los vínculos se gestionan en el perfil individual de cada estudiante.
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { outline: none; padding-left: 12px; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .btn-premium { transition: all 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
      `}</style>
    </DashboardLayout>
  );
}
