'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileDown, ChevronDown, User, Printer, X, Download, Mail, Phone, MapPin, Calendar, CheckSquare } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

export default function FichaDeMatriculaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [form, setForm] = useState({ 
    periodo: '2026 - 01', 
    sedeJornada: 'PRINCIPAL - MAÑANA', 
    programaId: 'Todos' 
  });

  const [touched, setTouched] = useState({ 
    sedeJornada: false, 
    programaId: false 
  });

  useEffect(() => {
    // Load Sedes
    const savedSedes = localStorage.getItem('edunexus_sedes');
    if (savedSedes) setSedes(JSON.parse(savedSedes));

    // Load Programs
    const savedPrograms = localStorage.getItem('edunexus_academic_programs');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));

    // Load Students
    const savedStudents = localStorage.getItem('edunexus_registered_students');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
  }, []);

  const handleCharge = () => {
    setTouched({ 
      sedeJornada: true, 
      programaId: true 
    });
    
    if (!form.sedeJornada || !form.programaId) return;

    setIsLoading(true);
    setTimeout(() => {
      // Logic for filtering (Simulated for now based on SEDE/PROGRAMA)
      // In a real scenario, students would have these fields.
      const lucky = students.filter(s => s.isActive !== false);
      setFilteredStudents(lucky);
      setShowResults(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const handlePrint = (student: any) => {
    setSelectedStudent(student);
    setShowPrintModal(true);
  };

  const executePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="no-print">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Fichas de Matrícula</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Generación y descarga de formularios oficiales de inscripción</p>
        </div>

        {/* Filter Panel */}
        <div className="glass-panel" style={{ background: 'white', padding: '32px', borderRadius: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'flex-end' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Período</label>
              <div style={{ position: 'relative' }}>
                <select className="input-premium" style={{ width: '100%', appearance: 'none', paddingRight: '36px' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                   <option>2026 - 01</option>
                   <option>2026 - 02</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Sede - Jornada</label>
              <div style={{ position: 'relative' }}>
                <select className="input-premium" style={{ width: '100%', appearance: 'none', paddingRight: '36px' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                   <option value="">Seleccione</option>
                   {sedes.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Programa</label>
              <div style={{ position: 'relative' }}>
                <select className="input-premium" style={{ width: '100%', appearance: 'none', paddingRight: '36px' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                   <option value="Todos">Todos los programas</option>
                   {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', height: '42px', fontWeight: '800' }}
              onClick={handleCharge}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Cargar estudiantes'}
            </button>
          </div>
        </div>

        {/* Results List */}
        {showResults && (
          <div className="glass-panel" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
               <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Estudiantes Encontrados ({filteredStudents.length})</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Identificación</th>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Nombre completo</th>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Estado</th>
                   <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{s.id}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{s.name}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>MATRICULADO</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button 
                        className="btn-premium" 
                        style={{ padding: '6px 16px', fontSize: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: 'none' }}
                        onClick={() => handlePrint(s)}
                      >
                        <Printer size={14} style={{ marginRight: '6px' }} /> Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ PRINT MODAL (FICHA) ━━━━━━━━━━ */}
      {showPrintModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 4000, display: 'flex', justifyContent: 'center', overflowY: 'auto', padding: '40px 0' }} className="no-print">
          <div style={{ background: 'white', width: '850px', borderRadius: '0px', padding: '0', display: 'flex', flexDirection: 'column', height: 'fit-content', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Controls */}
            <div style={{ background: '#1e293b', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
               <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Vista previa de Ficha de Matrícula</h3>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={executePrint} style={{ cursor: 'pointer', background: '#10b981', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={16} /> Imprimir
                  </button>
                  <button onClick={() => setShowPrintModal(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'white', opacity: 0.7 }}>
                    <X size={20} />
                  </button>
               </div>
            </div>

            {/* Ficha Layout (The printable part) */}
            <div id="ficha-printable" style={{ padding: '60px', color: '#000', fontFamily: 'Arial, sans-serif' }}>
               
               {/* Header Section */}
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #000', paddingBottom: '24px', marginBottom: '32px' }}>
                 <div>
                   <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>Institución Educativa Edunexus</h1>
                   <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '700' }}>NIT: 900.123.456-7 | Resolución: 0045 de 2024</p>
                   <p style={{ margin: 0, fontSize: '12px' }}>{form.sedeJornada} | {form.periodo}</p>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ border: '2px solid #000', padding: '10px 24px', display: 'inline-block', borderRadius: '4px' }}>
                      <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '900' }}>FICHA DE MATRÍCULA</h2>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>N° {selectedStudent.id.slice(-6)}</p>
                   </div>
                 </div>
               </div>

               {/* Personal Info Grid */}
               <div style={{ marginBottom: '32px' }}>
                 <div style={{ background: '#f1f5f9', padding: '8px 16px', borderLeft: '6px solid #1e293b', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Información Personal del Estudiante</h3>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '24px' }}>
                    <div style={{ width: '150px', height: '180px', border: '2px solid #e2e8f0', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <User size={64} style={{ color: '#cbd5e1' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                       <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                         <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Nombre Completo</label>
                         <div style={{ fontSize: '14px', fontWeight: '700' }}>{selectedStudent.name}</div>
                       </div>
                       <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                         <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Identificación</label>
                         <div style={{ fontSize: '14px', fontWeight: '700' }}>{selectedStudent.id}</div>
                       </div>
                       <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                         <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Correo Electrónico</label>
                         <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedStudent.correo || 'N/A'}</div>
                       </div>
                       <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                         <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Teléfono / Celular</label>
                         <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedStudent.telefono || selectedStudent.mobile || 'N/A'}</div>
                       </div>
                       <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', gridColumn: 'span 2' }}>
                         <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Dirección de Residencia</label>
                         <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedStudent.address || 'N/A'}, {selectedStudent.residenceCity}</div>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Academic Info */}
               <div style={{ marginBottom: '32px' }}>
                 <div style={{ background: '#f1f5f9', padding: '8px 16px', borderLeft: '6px solid #1e293b', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Información Académica</h3>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Programa de Formación</label>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{programs.find(p => p.id === form.programaId)?.nombre || 'Programa General'}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Nivel / Semestre</label>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>Primer Semestre</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Fecha de Matrícula</label>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{new Date().toLocaleDateString()}</div>
                    </div>
                 </div>
               </div>

               {/* Agreement and Signatures */}
               <div style={{ marginTop: '60px' }}>
                  <p style={{ fontSize: '11px', lineHeight: '1.6', color: '#4b5563', marginBottom: '60px' }}>
                    Yo, **{selectedStudent.name}**, identificado como se indica anteriormente, manifiesto que acepto los términos y condiciones del contrato de matrícula de la institución para el período **{form.periodo}**, así como el manual de convivencia y reglamentos internos.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '2px solid #000', paddingTop: '12px' }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '900' }}>FIRMA DEL ESTUDIANTE</p>
                        <p style={{ margin: 0, fontSize: '11px' }}>C.C. / T.I. {selectedStudent.id}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '2px solid #000', paddingTop: '12px' }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '900' }}>FIRMA SECRETARÍA ACADÉMICA</p>
                        <p style={{ margin: 0, fontSize: '11px' }}>Institución Educativa Edunexus</p>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Footer */}
               <div style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
                  Generado automáticamente por el Sistema de Gestión Educativa EduNexus - {new Date().toLocaleString()}
               </div>

            </div>
          </div>
        </div>
      )}

      {/* Global Printing Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          #ficha-printable {
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          a[href]:after {
            content: "" !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
