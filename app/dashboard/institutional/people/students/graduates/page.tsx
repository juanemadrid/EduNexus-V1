'use client';
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, GraduationCap, Users, History, Save, X, Calendar, Briefcase, GraduationCap as GradIcon, Info, Filter, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';

export default function GraduatesPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'graduates'>('pending');
  const [filters, setFilters] = useState({
    program: 'Seleccione',
    period: 'Seleccione',
    status: 'Todos'
  });
  const [students, setStudents] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Followup Modal state
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [followupForm, setFollowupForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Laboral',
    observacion: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, followupsData] = await Promise.all([
        db.list('students'),
        db.list('graduate_followups')
      ]);
      setStudents(studentsData);
      setFollowups(followupsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGraduate = async (id: string) => {
    try {
      await db.update('students', id, { 
        isGraduated: true, 
        graduationDate: new Date().toISOString(),
        isActive: false // Usually graduates are no longer "active students" but "graduates"
      });
      
      // Update local state
      setStudents(prev => prev.map(s => s.id === id ? { ...s, isGraduated: true, graduationDate: new Date().toISOString(), isActive: false } : s));
      alert('Estudiante promovido a Egresado exitosamente.');
    } catch (error) {
      console.error('Error graduating student:', error);
      alert('Error al procesar la graduación.');
    }
  };

  const handleSaveFollowup = async () => {
    if (!selectedStudent || !followupForm.observacion) return;

    const newFollowup = {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      ...followupForm,
      createdAt: new Date().toISOString()
    };

    try {
      const docId = await db.create('graduate_followups', newFollowup);
      setFollowups(prev => [...prev, { ...newFollowup, id: docId }]);
      
      setShowFollowupModal(false);
      setFollowupForm({
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'Laboral',
        observacion: ''
      });
      alert('Seguimiento registrado y persistido en el servidor.');
    } catch (error) {
      console.error('Error saving followup:', error);
      alert('Error al guardar el seguimiento.');
    }
  };

  const filteredStudents = students.filter((s: any) => {
    const studentProgram = s.program || s.details?.program;
    const studentPeriod = s.period || s.details?.period;
    
    const matchesProgram = filters.program === 'Seleccione' || studentProgram === filters.program;
    const matchesPeriod = filters.period === 'Seleccione' || studentPeriod === filters.period;
    
    if (activeTab === 'pending') {
      // In this view, "pending" means enrolled students who haven't graduated yet
      const isEnrolled = s.isEnrolled !== false; // Default true if not specified
      return isEnrolled && s.isGraduated !== true && matchesProgram && matchesPeriod;
    } else {
      return s.isGraduated === true && matchesProgram && matchesPeriod;
    }
  });

  return (
    <DashboardLayout>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.2)' }}>
              <GraduationCap size={32} />
           </div>
           <div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>
               Control de Egresados
             </h1>
             <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
               {activeTab === 'pending' ? 'Postulación y aprobación de grados académicos' : 'Seguimiento de impacto y vinculación laboral'}
             </p>
           </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: '#f1f5f9', padding: '6px', borderRadius: '16px', width: 'fit-content' }}>
         <button 
           onClick={() => setActiveTab('pending')}
           style={{ 
             padding: '10px 24px', 
             fontSize: '13px', 
             fontWeight: '800', 
             color: activeTab === 'pending' ? 'white' : '#64748b',
             border: 'none',
             borderRadius: '12px',
             background: activeTab === 'pending' ? '#2563eb' : 'transparent',
             boxShadow: activeTab === 'pending' ? '0 4px 12px -2px rgba(37, 99, 235, 0.3)' : 'none',
             cursor: 'pointer',
             transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
           }}
         >
           Proceso de Grado
         </button>
         <button 
           onClick={() => setActiveTab('graduates')}
           style={{ 
             padding: '10px 24px', 
             fontSize: '13px', 
             fontWeight: '800', 
             color: activeTab === 'graduates' ? 'white' : '#64748b',
             border: 'none',
             borderRadius: '12px',
             background: activeTab === 'graduates' ? '#2563eb' : 'transparent',
             boxShadow: activeTab === 'graduates' ? '0 4px 12px -2px rgba(37, 99, 235, 0.3)' : 'none',
             cursor: 'pointer',
             transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
           }}
         >
           Base de Egresados
         </button>
      </div>

      {/* Filter Panel */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr 1fr 120px', 
          gap: '24px',
          alignItems: 'end'
        }}>
          <div className="input-group">
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
              <Filter size={12} /> Programa Académico
            </label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc' }} value={filters.program} onChange={(e) => setFilters({...filters, program: e.target.value})}>
                <option>Seleccione</option>
                <option>Bachillerato Académico</option>
                <option>Primaria Básica</option>
                <option>Pre-escolar</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', display: 'block', textTransform: 'uppercase' }}>Período Conclusión</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc' }} value={filters.period} onChange={(e) => setFilters({...filters, period: e.target.value})}>
                <option>Seleccione</option>
                <option>2024-2</option>
                <option>2025-1</option>
                <option>2026-01</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', display: 'block', textTransform: 'uppercase' }}>Filtro de Paz y Salvo</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc' }} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                <option>Todos</option>
                <option>Con Deudas Pendientes</option>
                <option>Solventes Administrativos</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <button className="btn-premium" style={{ height: '48px', background: '#2563eb', color: 'white', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Search size={18} /> Filtrar
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="glass-panel" style={{ background: 'white', overflow: 'hidden', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
             <p style={{ fontWeight: '800', color: '#64748b' }}>Conectando con Firestore...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.05em' }}>Identidad Estudiante</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.05em' }}>Programa / Periodo</th>
                <th style={{ padding: '20px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.05em' }}>Estatus Administrativo</th>
                <th style={{ padding: '20px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.05em' }}>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id} className="table-row" style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                   <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{s.name.toUpperCase()}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>REG: {s.idNumber || s.id}</div>
                   </td>
                   <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700' }}>{s.program || s.details?.program || 'PENDIENTE'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>CULMINACIÓN: {s.period || s.details?.period || '2026-01'}</div>
                   </td>
                   <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#10b981', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '900' }}>
                        <CheckCircle2 size={12} />
                        {activeTab === 'pending' ? 'SOLVENTE' : 'EGRESADO'}
                      </div>
                   </td>
                   <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                      {activeTab === 'pending' ? (
                        <button onClick={() => handleGraduate(s.id)} className="btn-premium" style={{ padding: '8px 20px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '12px', fontWeight: '800', borderRadius: '10px' }}>Finalizar Grado</button>
                      ) : (
                        <button 
                          onClick={() => { setSelectedStudent(s); setShowFollowupModal(true); }} 
                          className="btn-premium" 
                          style={{ padding: '8px 20px', background: '#10b981', color: 'white', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', margin: '0 auto' }}
                        >
                          <History size={15} /> Seguimiento
                        </button>
                      )}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '100px 40px', textAlign: 'center' }}>
             <Users size={48} style={{ color: '#e2e8f0', marginBottom: '20px' }} />
             <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>Sin resultados</h3>
             <p style={{ margin: 0, fontWeight: '600', color: '#94a3b8', fontSize: '14px' }}>No hay registros que coincidan con la búsqueda actual.</p>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ FOLLOWUP MODAL ━━━━━━━━━━ */}
      {showFollowupModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalSlide 0.3s ease-out' }}>
            <div style={{ background: '#10b981', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <History size={20} />
                 </div>
                 <div>
                   <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>Bitácora de Seguimiento</h2>
                   <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>EGRESADO: {selectedStudent.name.toUpperCase()}</p>
                 </div>
               </div>
               <button onClick={() => setShowFollowupModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Fecha de Contacto</label>
                  <input type="date" className="input-premium" style={{ width: '100%', height: '48px', background: '#f8fafc' }} value={followupForm.fecha} onChange={e => setFollowupForm({...followupForm, fecha: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Estatus de Impacto</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '48px', background: '#f8fafc', appearance: 'none' }} value={followupForm.tipo} onChange={e => setFollowupForm({...followupForm, tipo: e.target.value})}>
                      <option value="Laboral">Vinculación Laboral</option>
                      <option value="Académico">Educación Continuada / Superior</option>
                      <option value="Personal">Situación Personal / Emprendimiento</option>
                      <option value="Encuesta">Encuesta Institucional</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Análisis y Observaciones</label>
                <textarea 
                  className="input-premium" 
                  style={{ width: '100%', height: '140px', padding: '16px', fontSize: '14px', resize: 'none', background: '#f8fafc', lineHeight: '1.5' }} 
                  placeholder="Detalle los hallazgos del seguimiento (Empresa, Cargo, Salario, Institución, Nivel académico, etc.)"
                  value={followupForm.observacion}
                  onChange={e => setFollowupForm({...followupForm, observacion: e.target.value})}
                ></textarea>
              </div>

              <div style={{ marginTop: '24px', background: '#f0fdf4', padding: '16px', borderRadius: '16px', display: 'flex', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                 <Info size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                 <p style={{ margin: 0, fontSize: '13px', color: '#166534', lineHeight: '1.5', fontWeight: '500' }}>
                   Los datos registrados alimentan el <strong>Tablero de Indicadores de Impacto</strong> del Ministerio de Educación Nacional.
                 </p>
              </div>
            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: '#f8fafc' }}>
               <button onClick={() => setShowFollowupModal(false)} style={{ padding: '12px 28px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Descartar</button>
               <button onClick={handleSaveFollowup} style={{ padding: '12px 36px', borderRadius: '12px', background: '#2563eb', color: 'white', fontWeight: '900', cursor: 'pointer', border: 'none', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                 <Save size={20} /> Guardar Registro
               </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-panel { transition: 0.3s; }
        .input-premium { border-radius: 14px; outline: none; transition: 0.2s; padding: 0 18px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 500; }
        .input-premium:focus { border-color: #2563eb; background: white !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .btn-premium { transition: 0.2s; }
        .btn-premium:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .btn-premium:active { transform: translateY(0px); }
        .table-row:hover { background-color: #f8fafc !important; }
        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </DashboardLayout>
  );
}
