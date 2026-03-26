'use client';
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, GraduationCap, Users, History, Save, X, Calendar, Briefcase, GraduationCap as GradIcon, Info } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function GraduatesPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'graduates'>('pending');
  const [filters, setFilters] = useState({
    program: 'Seleccione',
    period: 'Seleccione',
    status: 'Todos'
  });
  const [localStudents, setLocalStudents] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  
  // Followup Modal state
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [followupForm, setFollowupForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Laboral',
    observacion: ''
  });

  useEffect(() => {
    const savedStudents = localStorage.getItem('edunexus_registered_students');
    if (savedStudents) setLocalStudents(JSON.parse(savedStudents));

    const savedFollowups = localStorage.getItem('edunexus_graduate_followups');
    if (savedFollowups) setFollowups(JSON.parse(savedFollowups));
  }, []);

  const handleGraduate = (id: string) => {
    const updated = localStudents.map(s => s.id === id ? { ...s, isGraduated: true, graduationDate: new Date().toISOString() } : s);
    setLocalStudents(updated);
    localStorage.setItem('edunexus_registered_students', JSON.stringify(updated));
    alert('Estudiante graduado exitosamente');
  };

  const handleSaveFollowup = () => {
    if (!selectedStudent || !followupForm.observacion) return;

    const newFollowup = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      ...followupForm
    };

    const updated = [...followups, newFollowup];
    setFollowups(updated);
    localStorage.setItem('edunexus_graduate_followups', JSON.stringify(updated));
    
    setShowFollowupModal(false);
    setFollowupForm({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'Laboral',
      observacion: ''
    });
    alert('Seguimiento registrado correctamente');
  };

  const filteredStudents = localStudents.filter((s: any) => {
    const matchesProgram = filters.program === 'Seleccione' || s.details?.program === filters.program;
    const matchesPeriod = filters.period === 'Seleccione' || s.details?.period === filters.period;
    
    if (activeTab === 'pending') {
      return s.isEnrolled === true && s.isGraduated !== true && matchesProgram && matchesPeriod;
    } else {
      return s.isGraduated === true && matchesProgram && matchesPeriod;
    }
  });

  return (
    <DashboardLayout>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
             <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                <GraduationCap size={20} />
             </div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>
               Gestión de Graduados y Egresados
             </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginLeft: '40px' }}>
            {activeTab === 'pending' ? 'Procesamiento masivo de graduación' : 'Seguimiento y registro de actividades para egresados'}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
         <button 
           onClick={() => setActiveTab('pending')}
           style={{ 
             padding: '12px 24px', 
             fontSize: '14px', 
             fontWeight: activeTab === 'pending' ? '800' : '600', 
             color: activeTab === 'pending' ? 'var(--primary)' : '#64748b',
             border: 'none',
             borderBottom: activeTab === 'pending' ? '3px solid var(--primary)' : '3px solid transparent',
             background: 'none',
             cursor: 'pointer',
             transition: '0.2s'
           }}
         >
           Pendientes por Graduar
         </button>
         <button 
           onClick={() => setActiveTab('graduates')}
           style={{ 
             padding: '12px 24px', 
             fontSize: '14px', 
             fontWeight: activeTab === 'graduates' ? '800' : '600', 
             color: activeTab === 'graduates' ? 'var(--primary)' : '#64748b',
             border: 'none',
             borderBottom: activeTab === 'graduates' ? '3px solid var(--primary)' : '3px solid transparent',
             background: 'none',
             cursor: 'pointer',
             transition: '0.2s'
           }}
         >
           Egresados Registrados
         </button>
      </div>

      {/* Filter Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1fr 1fr 100px', 
          gap: '20px',
          alignItems: 'end'
        }}>
          <div className="input-group">
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Programa</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none' }} value={filters.program} onChange={(e) => setFilters({...filters, program: e.target.value})}>
                <option>Seleccione</option>
                <option>Bachillerato Académico</option>
                <option>Técnico en Sistemas</option>
                <option>Técnico en Contabilidad</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Periodo</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none' }} value={filters.period} onChange={(e) => setFilters({...filters, period: e.target.value})}>
                <option>Seleccione</option>
                <option>2025-1</option>
                <option>2023-2</option>
                <option>2023-1</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Filtro de Estado</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '45px', appearance: 'none' }} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                <option>Todos</option>
                <option>Solo con deudas</option>
                <option>Solo solventes</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <button className="btn-premium" style={{ height: '45px', background: 'var(--primary)', color: 'white', fontWeight: '800' }}>Listar</button>
        </div>
      </div>

      {/* Results Section */}
      <div className="glass-panel" style={{ background: 'white', overflow: 'hidden' }}>
        {filteredStudents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Estudiante</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Programa / Periodo</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Estado</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                   <td style={{ padding: '14px 24px' }}>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{s.name.toUpperCase()}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {s.id}</div>
                   </td>
                   <td style={{ padding: '14px 24px' }}>
                      <div style={{ fontSize: '13px', color: '#334155' }}>{s.details?.program || 'Bachillerato Académico'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Periodo: {s.details?.period || '2025-1'}</div>
                   </td>
                   <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                        {activeTab === 'pending' ? 'SOLVENTE' : 'GRADUADO'}
                      </span>
                   </td>
                   <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      {activeTab === 'pending' ? (
                        <button onClick={() => handleGraduate(s.id)} className="btn-premium" style={{ padding: '6px 16px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '12px', fontWeight: '700' }}>Graduar</button>
                      ) : (
                        <button 
                          onClick={() => { setSelectedStudent(s); setShowFollowupModal(true); }} 
                          className="btn-premium" 
                          style={{ padding: '6px 16px', background: '#10b981', color: 'white', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <History size={14} /> Seguimiento
                        </button>
                      )}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '80px', textAlign: 'center' }}>
             <Users size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
             <p style={{ margin: 0, fontWeight: '700', color: '#64748b' }}>No se encontraron estudiantes para los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ FOLLOWUP MODAL ━━━━━━━━━━ */}
      {showFollowupModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '550px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#10b981', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white' }}>Registrar Seguimiento</h2>
                 <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Egresado: {selectedStudent.name}</p>
               </div>
               <button onClick={() => setShowFollowupModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Fecha de contacto</label>
                  <input type="date" className="input-premium" style={{ width: '100%', height: '40px' }} value={followupForm.fecha} onChange={e => setFollowupForm({...followupForm, fecha: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Tipo de Seguimiento</label>
                  <select className="input-premium" style={{ width: '100%', height: '40px' }} value={followupForm.tipo} onChange={e => setFollowupForm({...followupForm, tipo: e.target.value})}>
                    <option value="Laboral">Laboral</option>
                    <option value="Académico">Académico / Superior</option>
                    <option value="Personal">Personal</option>
                    <option value="Encuesta">Encuesta de Satisfacción</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Observaciones detalladas</label>
                <textarea 
                  className="input-premium" 
                  style={{ width: '100%', height: '120px', padding: '12px', fontSize: '14px', resize: 'none' }} 
                  placeholder="Describa la situación actual del egresado, empresa donde labora, institución de educación superior, etc."
                  value={followupForm.observacion}
                  onChange={e => setFollowupForm({...followupForm, observacion: e.target.value})}
                ></textarea>
              </div>

              <div style={{ marginTop: '20px', background: '#f0fdf4', padding: '12px', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                 <Info size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                 <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: '1.4' }}>
                   Esta información será visible en el <strong>Reporte de Seguimientos Egresados</strong> para el cumplimiento de indicadores institucionales.
                 </p>
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fafafa' }}>
               <button onClick={() => setShowFollowupModal(false)} style={{ padding: '10px 24px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
               <button onClick={handleSaveFollowup} style={{ padding: '10px 32px', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Save size={18} /> Guardar Registro
               </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-panel { border-radius: 20px; border: 1px solid #e2e8f0; }
        .input-premium { border-radius: 12px; outline: none; transition: 0.2s; padding: 0 16px; border: 1px solid #e2e8f0; font-size: 14px; }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .btn-premium { border-radius: 12px; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn-premium:hover { transform: translateY(-1px); filter: brightness(1.05); }
        .btn-premium:active { transform: translateY(0px); }
      `}</style>
    </DashboardLayout>
  );
}
