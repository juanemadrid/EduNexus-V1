'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, UserCheck, AlertCircle, CheckCircle, Info, Plus, ChevronRight, User } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';

export default function AcademicObserverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newObs, setNewObs] = useState({ type: 'Falta Leve', description: '', date: new Date().toISOString().split('T')[0], teacher: '' });

  useEffect(() => {
    const savedSt = localStorage.getItem('edunexus_registered_students');
    if (savedSt) setStudents(JSON.parse(savedSt));
    
    const savedObs = localStorage.getItem('edunexus_observations');
    if (savedObs) setObservations(JSON.parse(savedObs));
  }, []);

  const filteredStudents = useMemo(() => {
    if(!searchTerm) return [];
    const query = searchTerm.toLowerCase();
    return students.filter(s => s.name?.toLowerCase().includes(query) || s.id?.includes(query)).slice(0, 10);
  }, [searchTerm, students]);

  const studentObservations = useMemo(() => {
    if(!selectedStudent) return [];
    return observations.filter(o => o.studentId === selectedStudent.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedStudent, observations]);

  const handleSaveObservation = () => {
    if(!newObs.description || !newObs.teacher) {
      alert('Llene todos los campos obligatorios.');
      return;
    }
    
    const observation = {
       id: `OBS-${Date.now()}`,
       studentId: selectedStudent.id,
       studentName: selectedStudent.name,
       date: newObs.date,
       type: newObs.type,
       description: newObs.description,
       teacher: newObs.teacher
    };
    
    const updated = [observation, ...observations];
    localStorage.setItem('edunexus_observations', JSON.stringify(updated));
    setObservations(updated);
    setShowAddModal(false);
    setNewObs({ type: 'Falta Leve', description: '', date: new Date().toISOString().split('T')[0], teacher: '' });
  };

  const getTypeStyle = (type: string) => {
    if (type.includes('Grave')) return { bg: '#fee2e2', text: '#ef4444', icon: <AlertCircle size={14} /> };
    if (type.includes('Leve')) return { bg: '#fef3c7', text: '#d97706', icon: <AlertCircle size={14} /> };
    if (type.includes('Mérito')) return { bg: '#dcfce3', text: '#16a34a', icon: <CheckCircle size={14} /> };
    return { bg: '#f1f5f9', text: '#64748b', icon: <Info size={14} /> };
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: selectedStudent ? '350px 1fr' : '1fr', gap: '24px', transition: '0.3s all' }}>
        
        {/* PANEL BUSCADOR */}
        <div className="glass-panel" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Observador</h1>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Búsqueda de estudiantes</p>
              </div>
           </div>

           <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Buscar por nombre o documento..."
                style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', width: '100%', fontSize: '14px' }}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); if(!e.target.value) setSelectedStudent(null); }}
              />
           </div>

           {filteredStudents.length > 0 && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {filteredStudents.map(s => (
                 <div 
                   key={s.id} 
                   onClick={() => setSelectedStudent(s)}
                   style={{ 
                     display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', 
                     background: selectedStudent?.id === s.id ? '#eff6ff' : 'white', 
                     border: `1px solid ${selectedStudent?.id === s.id ? '#bfdbfe' : '#e2e8f0'}`, 
                     cursor: 'pointer', transition: '0.2s' 
                   }}
                   className="hover-card"
                 >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedStudent?.id === s.id ? '#3b82f6' : '#f1f5f9', color: selectedStudent?.id === s.id ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <User size={20} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', color: selectedStudent?.id === s.id ? '#1e40af' : '#1e293b', fontSize: '14px' }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: selectedStudent?.id === s.id ? '#60a5fa' : '#94a3b8' }}>ID: {s.id}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} color={selectedStudent?.id === s.id ? '#3b82f6' : '#cbd5e1'} />
                 </div>
               ))}
             </div>
           )}

           {searchTerm && filteredStudents.length === 0 && (
             <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
               <User size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
               <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>No se encontraron estudiantes</p>
             </div>
           )}

           {!searchTerm && !selectedStudent && (
             <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
               <Search size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
               <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#475569' }}>Busque un estudiante</p>
               <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13px' }}>Digite su nombre para cargar su folio disciplinario.</p>
             </div>
           )}
        </div>

        {/* PANEL FOLIO DEL ESTUDIANTE */}
        {selectedStudent && (
          <div className="glass-panel animate-fade-in" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{selectedStudent.name}</h2>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>Documento: {selectedStudent.id} • Folio Observador</p>
                </div>
                <button 
                  className="btn-premium" 
                  style={{ background: '#3b82f6', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', borderRadius: '12px' }}
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus size={18} /> Añadir anotación
                </button>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {studentObservations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px' }}>
                    <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '800' }}>Sin anotaciones disciplinarias</h3>
                    <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>El estudiante mantiene una hoja de vida limpia.</p>
                  </div>
                ) : (
                  studentObservations.map((obs, idx) => {
                    const st = getTypeStyle(obs.type);
                    return (
                      <div key={obs.id} style={{ display: 'flex', gap: '20px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                         <div style={{ width: '4px', position: 'absolute', left: 0, top: 0, bottom: 0, background: st.text }}></div>
                         <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: st.bg, color: st.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           {st.icon}
                         </div>
                         <div style={{ flex: 1 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                             <span style={{ fontSize: '13px', fontWeight: '800', color: st.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{obs.type}</span>
                             <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', background: 'white', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{obs.date}</span>
                           </div>
                           <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#334155', lineHeight: '1.6' }}>{obs.description}</p>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <User size={12} color="#64748b" />
                             </div>
                             <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Registrado por: <strong style={{color:'#1e293b'}}>{obs.teacher}</strong></span>
                           </div>
                         </div>
                      </div>
                    );
                  })
                )}
             </div>

          </div>
        )}
      </div>

      {showAddModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fade" style={{ background: 'white', width: '500px', padding: '32px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Registrar anotación</h2>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>Estudiante: <strong style={{color:'#3b82f6'}}>{selectedStudent.name}</strong></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                   <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Fecha <span style={{color:'#ef4444'}}>*</span></label>
                   <input type="date" className="input-premium" style={{ width: '100%', height: '42px', borderRadius: '10px', padding: '0 12px' }} value={newObs.date} onChange={e => setNewObs({...newObs, date: e.target.value})} />
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Tipo de anotación <span style={{color:'#ef4444'}}>*</span></label>
                   <select className="input-premium" style={{ width: '100%', height: '42px', borderRadius: '10px' }} value={newObs.type} onChange={e => setNewObs({...newObs, type: e.target.value})}>
                     <option>Falta Leve</option>
                     <option>Falta Grave</option>
                     <option>Mérito / Felicitación</option>
                     <option>Anotación General</option>
                   </select>
                 </div>
               </div>
               <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Docente / Coordinador <span style={{color:'#ef4444'}}>*</span></label>
                 <input type="text" className="input-premium" style={{ width: '100%', height: '42px', borderRadius: '10px', padding: '0 12px' }} placeholder="Nombre de quien reporta" value={newObs.teacher} onChange={e => setNewObs({...newObs, teacher: e.target.value})} />
               </div>
               <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Descripción de los hechos <span style={{color:'#ef4444'}}>*</span></label>
                 <textarea className="input-premium" style={{ width: '100%', height: '100px', borderRadius: '10px', padding: '12px', resize: 'none' }} placeholder="Detalle exactamente la situación..." value={newObs.description} onChange={e => setNewObs({...newObs, description: e.target.value})}></textarea>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={() => setShowAddModal(false)} className="btn-premium" style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Mala idea, Cancelar</button>
               <button onClick={handleSaveObservation} className="btn-premium" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Guardar en el folio</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; }
        .input-premium:focus { border-color: #3b82f6; background: white !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .btn-premium:hover { filter: brightness(1.05); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .btn-premium:active { transform: translateY(0); }
        .hover-card:hover { border-color: #bfdbfe !important; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade { animation: fade 0.2s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </DashboardLayout>
  );
}
