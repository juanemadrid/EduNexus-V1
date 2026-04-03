'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { ChevronDown, User, Printer, X, Building2, GraduationCap, BookOpen, Shield } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function FichaDeMatriculaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [allPeriods, setAllPeriods] = useState<any[]>([]);
  const [institutionData, setInstitutionData] = useState<any>(null);

  const [form, setForm] = useState({
    periodo: '',
    sedeJornada: 'Todos',
    programaId: 'Todos'
  });

  const [touched, setTouched] = useState({
    periodo: false,
    sedeJornada: false,
    programaId: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sedesData, programsData, studentsData, periodsData, instData] = await Promise.all([
          db.list<any>('sedes'),
          db.list<any>('academic_programs'),
          db.list<any>('students'),
          db.list<any>('academic_periods'),
          db.list<any>('institution_config').catch(() => [])
        ]);
        setSedes(sedesData);
        setPrograms(programsData);
        setAllStudents(studentsData);
        setAllPeriods(periodsData);
        if (instData.length > 0) setInstitutionData(instData[0]);
        if (periodsData.length > 0) {
          setForm(p => ({ ...p, periodo: periodsData[0].nombre || periodsData[0].name || periodsData[0].id }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleCharge = async () => {
    setTouched({ periodo: true, sedeJornada: true, programaId: true });
    if (!form.periodo) return;

    setIsLoading(true);
    setShowResults(false);
    try {
      const filtered = allStudents.filter(s => {
        const matchSede = form.sedeJornada === 'Todos' ||
          s.sedeId === form.sedeJornada || s.sede === form.sedeJornada;
        const matchProg = form.programaId === 'Todos' ||
          s.programaId === form.programaId || s.details?.programaId === form.programaId;
        return matchSede && matchProg;
      });
      setFilteredStudents(filtered);
      setShowResults(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (student: any) => {
    setSelectedStudent(student);
    setShowPrintModal(true);
    setTimeout(() => {
      const el = document.getElementById('ficha-preview');
      if (el) el.scrollTop = 0;
    }, 100);
  };

  const executePrint = () => window.print();

  const selectedProgram = programs.find(p =>
    p.id === selectedStudent?.programaId ||
    p.id === selectedStudent?.details?.programaId ||
    p.id === form.programaId
  );

  const fichaNumber = selectedStudent
    ? `${new Date().getFullYear()}-${String(allStudents.findIndex(s => s.id === selectedStudent.id) + 1).padStart(4, '0')}`
    : '';

  return (
    <DashboardLayout>
      <div className="no-print">
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
            Fichas de Matrícula
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
            Generación e impresión de formularios oficiales de inscripción
          </p>
        </div>

        {/* Filter Panel */}
        <div className="glass-panel" style={{ background: 'white', padding: '28px 32px', borderRadius: '20px', marginBottom: '28px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '20px', alignItems: 'flex-end' }}>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Período <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="input-premium"
                  style={{ width: '100%', appearance: 'none', paddingRight: '36px', border: touched.periodo && !form.periodo ? '1px solid #ef4444' : '1px solid #e2e8f0', height: '42px', background: '#f8fafc' }}
                  value={form.periodo}
                  onChange={e => { setTouched(p => ({ ...p, periodo: true })); setForm(p => ({ ...p, periodo: e.target.value })); }}
                >
                  <option value="">Seleccione</option>
                  {allPeriods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sede - Jornada
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="input-premium"
                  style={{ width: '100%', appearance: 'none', paddingRight: '36px', height: '42px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  value={form.sedeJornada}
                  onChange={e => setForm(p => ({ ...p, sedeJornada: e.target.value }))}
                >
                  <option value="Todos">Todas las sedes</option>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Programa
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="input-premium"
                  style={{ width: '100%', appearance: 'none', paddingRight: '36px', height: '42px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  value={form.programaId}
                  onChange={e => setForm(p => ({ ...p, programaId: e.target.value }))}
                >
                  <option value="Todos">Todos los programas</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            <button
              className="btn-premium"
              style={{
                background: isLoading ? '#94a3b8' : '#10b981', color: 'white',
                height: '42px', fontWeight: '800', fontSize: '13px', border: 'none',
                padding: '0 28px', borderRadius: '10px', cursor: isLoading ? 'wait' : 'pointer',
                whiteSpace: 'nowrap', boxShadow: '0 4px 14px -3px rgba(16,185,129,0.4)'
              }}
              onClick={handleCharge}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Cargar estudiantes'}
            </button>
          </div>
        </div>

        {/* Results */}
        {showResults && (
          <div className="glass-panel" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                Estudiantes encontrados ({filteredStudents.length})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Período: {form.periodo}</span>
            </div>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                No se encontraron estudiantes para los filtros seleccionados.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Identificación</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Nombre completo</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Programa</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Estado</th>
                    <th style={{ textAlign: 'center', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.id || idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafdf9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>{s.documento || s.id}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>
                        {s.name || `${s.nombres || ''} ${s.apellidos || ''}`.trim()}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>
                        {programs.find(p => p.id === s.programaId)?.nombre || s.programa || '—'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ background: s.isActive !== false ? '#ecfdf5' : '#fee2e2', color: s.isActive !== false ? '#059669' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.3px' }}>
                          {s.isActive !== false ? 'MATRICULADO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button
                          style={{ padding: '7px 18px', fontSize: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700', transition: 'all 0.2s' }}
                          onClick={() => handlePrint(s)}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#10b981'; (e.currentTarget as HTMLButtonElement).style.color = '#10b981'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.color = '#1e293b'; }}
                        >
                          <Printer size={14} /> Ver Ficha
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ PROFESSIONAL PRINT MODAL ━━━━━━━━━━ */}
      {showPrintModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 4000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} id="ficha-modal-overlay">

          {/* Modal Toolbar */}
          <div className="ficha-toolbar" style={{ background: '#0f172a', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Printer size={16} color="#10b981" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: '700' }}>Vista Previa — Ficha de Matrícula</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>{selectedStudent.name || `${selectedStudent.nombres} ${selectedStudent.apellidos}`} · N° {fichaNumber}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={executePrint}
                style={{ background: '#10b981', border: 'none', color: 'white', padding: '9px 22px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={15} /> Imprimir / PDF
              </button>
              <button onClick={() => setShowPrintModal(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Preview Area */}
          <div id="ficha-preview" style={{ flex: 1, overflowY: 'auto', padding: '40px 0', background: '#1e293b', display: 'flex', justifyContent: 'center' }}>
            {/* The Ficha Document */}
            <div id="ficha-printable" style={{
              width: '794px',
              background: 'white',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              fontFamily: 'Arial, sans-serif',
              color: '#1a1a2e',
              position: 'relative'
            }}>
              {/* Top accent bar */}
              <div style={{ height: '8px', background: 'linear-gradient(90deg, #10b981, #059669, #047857)' }} />

              {/* Document Header */}
              <div style={{ padding: '28px 48px 20px', borderBottom: '2px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Institution Branding */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GraduationCap size={32} color="white" />
                    </div>
                    <div>
                      <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                        {institutionData?.nombre || 'Institución Educativa EduNexus'}
                      </h1>
                      <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        NIT: {institutionData?.nit || '900.123.456-7'} &nbsp;·&nbsp; Resolución No. {institutionData?.resolucion || '0045 de 2024'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                        {institutionData?.direccion || 'Municipio de San José'} &nbsp;·&nbsp; Tel: {institutionData?.telefono || '(601) 000-0000'}
                      </p>
                    </div>
                  </div>

                  {/* Document Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ border: '2px solid #10b981', borderRadius: '12px', padding: '10px 20px', background: '#f0fdf4' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Ficha de Matrícula</p>
                      <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '900', color: '#059669', letterSpacing: '-0.5px' }}>N° {fichaNumber}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#94a3b8' }}>Período: <strong style={{ color: '#475569' }}>{form.periodo}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px 48px 40px' }}>

                {/* Section 1: Personal Data */}
                <SectionHeader icon={<User size={14} color="white" />} title="Información Personal del Estudiante" color="#0f172a" />
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '24px', marginBottom: '28px', marginTop: '16px' }}>
                  {/* Photo placeholder */}
                  <div style={{ width: '100px', height: '125px', border: '2px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <User size={32} color="#cbd5e1" />
                    <span style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>Foto<br />carné</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0' }}>
                    <DataField label="Nombres" value={selectedStudent.nombres || selectedStudent.name?.split(' ').slice(0, -1).join(' ') || selectedStudent.name} span={2} />
                    <DataField label="Apellidos" value={selectedStudent.apellidos || selectedStudent.name?.split(' ').slice(-1).join(' ') || '—'} />
                    <DataField label="Tipo de Documento" value={selectedStudent.tipoDocumento || 'T.I.'} />
                    <DataField label="No. Documento" value={selectedStudent.documento || selectedStudent.id} />
                    <DataField label="Fecha de Nacimiento" value={selectedStudent.fechaNacimiento || selectedStudent.birthDate || '—'} />
                    <DataField label="Lugar de Nacimiento" value={selectedStudent.lugarNacimiento || '—'} span={2} />
                    <DataField label="Género" value={selectedStudent.genero || selectedStudent.gender || '—'} />
                  </div>
                </div>

                {/* Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '28px' }}>
                  <DataField label="Dirección de Residencia" value={selectedStudent.address || selectedStudent.direccion || '—'} span={2} />
                  <DataField label="Ciudad" value={selectedStudent.city || selectedStudent.ciudad || '—'} />
                  <DataField label="Teléfono" value={selectedStudent.telefono || selectedStudent.phone || '—'} />
                  <DataField label="Celular" value={selectedStudent.mobile || selectedStudent.celular || '—'} />
                  <DataField label="Correo Electrónico" value={selectedStudent.correo || selectedStudent.email || '—'} />
                </div>

                {/* Section 2: Academic Data */}
                <SectionHeader icon={<BookOpen size={14} color="white" />} title="Información Académica" color="#059669" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '28px', marginTop: '16px' }}>
                  <DataField label="Programa de Formación" value={selectedProgram?.nombre || selectedStudent.programa || 'Programa General'} span={2} />
                  <DataField label="Período Académico" value={form.periodo} />
                  <DataField label="Modalidad" value={selectedProgram?.modalidad || 'Presencial'} />
                  <DataField label="Duración" value={selectedProgram?.duracion || '—'} />
                  <DataField label="Sede - Jornada" value={sedes.find(s => s.id === form.sedeJornada)?.nombre || 'Principal'} />
                </div>

                {/* Section 3: Responsible Person */}
                <SectionHeader icon={<Shield size={14} color="white" />} title="Acudiente / Responsable" color="#475569" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '28px', marginTop: '16px' }}>
                  <DataField label="Nombre del Acudiente" value={selectedStudent.acudiente || selectedStudent.guardian || '___________________________'} span={2} />
                  <DataField label="Parentesco" value={selectedStudent.parentesco || '___________'} />
                  <DataField label="Documento Acudiente" value={selectedStudent.documentoAcudiente || '___________________'} />
                  <DataField label="Teléfono Acudiente" value={selectedStudent.telefonoAcudiente || '___________________'} />
                  <DataField label="Ocupación" value={selectedStudent.ocupacionAcudiente || '___________________'} />
                </div>

                {/* Terms */}
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '28px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: '10.5px', color: '#475569', lineHeight: '1.7', textAlign: 'justify' }}>
                    Yo, el suscrito, identificado con el documento anteriormente registrado, manifiesto que acepto libre y voluntariamente los términos y condiciones del 
                    contrato de matrícula, el manual de convivencia escolar y el reglamento estudiantil vigente de la institución para el período académico 
                    <strong> {form.periodo}</strong>, comprometiéndome a cumplir con todas las obligaciones académicas, financieras y disciplinarias establecidas.
                  </p>
                </div>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', marginTop: '20px' }}>
                  {[
                    { label: 'Firma del Estudiante', sub: `C.C. / T.I. ${selectedStudent.documento || selectedStudent.id}` },
                    { label: 'Firma del Acudiente', sub: 'C.C. __________________' },
                    { label: 'Secretaría Académica', sub: 'Sello institucional' }
                  ].map((sig, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1.5px solid #334155', height: '50px', marginBottom: '10px' }} />
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#1e293b' }}>{sig.label}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#94a3b8' }}>{sig.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                    Generado por Sistema EduNexus · {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                    Documento N° {fichaNumber} — Original para la institución
                  </span>
                </div>
              </div>

              {/* Bottom accent bar */}
              <div style={{ height: '5px', background: 'linear-gradient(90deg, #047857, #10b981, #34d399)' }} />
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        .input-premium { outline: none; border-radius: 10px; padding: 0 12px; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .btn-premium { transition: all 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); }
        @media print {
          /* Force color printing - backgrounds, gradients, everything */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Hide EVERYTHING on the page except the ficha */
          body * { visibility: hidden !important; }
          #ficha-printable, #ficha-printable * { visibility: visible !important; }
          /* Position ficha at top-left corner, full page */
          #ficha-printable {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
            z-index: 99999 !important;
          }
          /* Page setup */
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
    </DashboardLayout>
  );
}

// Helper sub-components
function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </h3>
      <div style={{ flex: 1, height: '1px', background: `${color}22` }} />
    </div>
  );
}

function DataField({ label, value, span = 1 }: { label: string; value: string; span?: number }) {
  return (
    <div style={{ gridColumn: `span ${span}`, borderBottom: '1px solid #f1f5f9', padding: '10px 12px 8px', background: 'white' }}>
      <p style={{ margin: 0, fontSize: '9px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a', minHeight: '18px' }}>{value || '—'}</p>
    </div>
  );
}
