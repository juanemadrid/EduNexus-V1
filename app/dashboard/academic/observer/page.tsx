'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, UserCheck, AlertCircle, CheckCircle, Info, Plus, ChevronRight, User, GraduationCap, CreditCard, X, Download } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';

export default function AcademicObserverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIDModal, setShowIDModal] = useState(false);
  const [newObs, setNewObs] = useState({ type: 'Falta Leve', description: '', date: new Date().toISOString().split('T')[0], teacher: 'Profesor Titular' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stData, obsData] = await Promise.all([
        db.list<any>('students'),
        db.list<any>('academic_observations')
      ]);
      setStudents(stData);
      setObservations(obsData);
    } catch (error) {
       console.error("Error fetching observer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleSaveObservation = async () => {
    if(!newObs.description || !newObs.teacher) {
      alert('Llene todos los campos obligatorios.');
      return;
    }
    
    const observation = {
       studentId: selectedStudent.id,
       studentName: selectedStudent.name,
       date: newObs.date,
       type: newObs.type,
       description: newObs.description,
       teacher: newObs.teacher,
       createdAt: new Date().toISOString()
    };
    
    try {
      await db.create('academic_observations', observation);
      await fetchData(); // Refresh data
      setShowAddModal(false);
      setNewObs({ type: 'Falta Leve', description: '', date: new Date().toISOString().split('T')[0], teacher: 'Profesor Titular' });
    } catch (error) {
       console.error("Error saving observation:", error);
       alert('Error al guardar la anotación.');
    }
  };

  const getTypeStyle = (type: string) => {
    if (type.includes('Grave')) return { bg: '#fee2e2', text: '#ef4444', icon: <AlertCircle size={14} />, border: '#fca5a5' };
    if (type.includes('Leve')) return { bg: '#fef3c7', text: '#d97706', icon: <AlertCircle size={14} />, border: '#fcd34d' };
    if (type.includes('Mérito')) return { bg: '#dcfce3', text: '#16a34a', icon: <CheckCircle size={14} />, border: '#86efac' };
    return { bg: '#f1f5f9', text: '#64748b', icon: <Info size={14} />, border: '#cbd5e1' };
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: selectedStudent ? '350px 1fr' : '1fr', gap: '24px', transition: '0.4s ease-in-out' }}>
        
        {/* LADO IZQUIERDO: Buscador Minimalista */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)', alignSelf: 'start', border: '1px solid #f1f5f9' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '14px', color: 'var(--primary)' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>Red Estudiantil</h1>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '600' }}>Directorio y Observador</p>
              </div>
           </div>

           <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Buscar por nombre..."
                style={{ paddingLeft: '48px', height: '52px', borderRadius: '16px', background: '#f8fafc', width: '100%', fontSize: '14px', fontWeight: '600' }}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); if(!e.target.value) setSelectedStudent(null); }}
              />
           </div>

           {filteredStudents.length > 0 && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {filteredStudents.map(s => (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                   key={s.id} 
                   onClick={() => setSelectedStudent(s)}
                   style={{ 
                     display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '16px', 
                     background: selectedStudent?.id === s.id ? 'var(--primary-glow)' : 'transparent', 
                     border: `1px solid ${selectedStudent?.id === s.id ? 'rgba(var(--primary-rgb), 0.2)' : 'transparent'}`, 
                     cursor: 'pointer', transition: '0.2s' 
                   }}
                 >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedStudent?.id === s.id ? 'var(--primary)' : '#f1f5f9', color: selectedStudent?.id === s.id ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <User size={20} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', color: selectedStudent?.id === s.id ? 'var(--primary)' : '#1e293b', fontSize: '13px' }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>ID: {s.id}</p>
                      </div>
                    </div>
                    {selectedStudent?.id === s.id && <ChevronRight size={18} color="var(--primary)" />}
                 </motion.div>
               ))}
             </div>
           )}

           {!searchTerm && !selectedStudent && (
             <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
               <Search size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
               <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#475569' }}>Encuentra un estudiante</p>
               <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>Digite su nombre para cargar su muro disciplinario.</p>
             </div>
           )}
        </div>

        {/* LADO DERECHO: Perfil estilo "Red Social" */}
        <AnimatePresence mode="wait">
        {selectedStudent && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ background: 'white', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden', alignSelf: 'start' }}>
             
             {/* Portada y Avatar */}
             <div style={{ height: '220px', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                <button 
                   onClick={() => setShowIDModal(true)}
                   style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '10px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)' }}
                   onMouseEnter={e => e.currentTarget.style.background = 'white'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                   <CreditCard size={16} /> Ver Smart ID
                </button>
             </div>

             <div style={{ padding: '0 40px 40px', position: 'relative' }}>
                 {/* Avatar flotante */}
                 <div style={{ width: '120px', height: '120px', borderRadius: '32px', background: 'white', padding: '4px', position: 'absolute', top: '-60px', left: '40px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '28px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                       <User size={60} />
                    </div>
                 </div>

                 {/* Info Header */}
                 <div style={{ marginLeft: '140px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>{selectedStudent.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={14}/> ID: {selectedStudent.id}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '4px 10px', borderRadius: '10px' }}>Estudiante Activo</span>
                      </div>
                    </div>
                    <button 
                      style={{ background: '#1e293b', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', borderRadius: '14px', transition: '0.2s', boxShadow: '0 10px 20px -5px rgba(30, 41, 59, 0.4)' }}
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus size={16} /> Escribir en el Muro
                    </button>
                 </div>

                 <div style={{ width: '100%', height: '1px', background: '#f1f5f9', margin: '32px 0' }}></div>

                 {/* Timeline (El Feed Social) */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Muro Disciplinario</h3>

                    {studentObservations.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                        <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '800' }}>El muro está limpio</h3>
                        <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>Comparte un mérito para iniciar el historial.</p>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        {/* Línea del timeline */}
                        <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
                          {studentObservations.map((obs) => {
                            const st = getTypeStyle(obs.type);
                            return (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={obs.id} style={{ display: 'flex', gap: '20px' }}>
                                 {/* Icono del Timeline */}
                                 <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'white', border: `2px solid ${st.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.text, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', backgroundColor: st.bg, flexShrink: 0 }}>
                                    {st.icon}
                                 </div>
                                 
                                 {/* Tarjeta del Post */}
                                 <div style={{ flex: 1, background: '#f8fafc', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                             <GraduationCap size={16} color="#64748b" />
                                          </div>
                                          <div>
                                             <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{obs.teacher}</p>
                                             <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>Publicó un: <span style={{ color: st.text }}>{obs.type}</span></p>
                                          </div>
                                       </div>
                                       <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{obs.date}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '15px', color: '#334155', lineHeight: '1.6' }}>{obs.description}</p>
                                 </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                 </div>
             </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Modal Redactar Post */}
      {showAddModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ background: 'white', width: '500px', padding: '32px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>Nuevo Post en el Muro</h2>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>Publicando en el perfil de <strong style={{color:'var(--primary)'}}>{selectedStudent.name}</strong></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                   <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>FECHA</label>
                   <input type="date" className="input-premium" style={{ width: '100%', height: '48px', borderRadius: '14px', padding: '0 16px', border: '1px solid #e2e8f0', outline: 'none' }} value={newObs.date} onChange={e => setNewObs({...newObs, date: e.target.value})} />
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>TIPO DE OBSERVACIÓN</label>
                   <select className="input-premium" style={{ width: '100%', height: '48px', borderRadius: '14px', padding: '0 16px', border: '1px solid #e2e8f0', outline: 'none' }} value={newObs.type} onChange={e => setNewObs({...newObs, type: e.target.value})}>
                     <option>Falta Leve</option>
                     <option>Falta Grave</option>
                     <option>Mérito / Felicitación</option>
                   </select>
                 </div>
               </div>
               <div>
                 <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>DESCRIPCIÓN DE LOS HECHOS</label>
                 <textarea style={{ width: '100%', height: '120px', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '14px' }} placeholder="Detalle exactamente la situación..." value={newObs.description} onChange={e => setNewObs({...newObs, description: e.target.value})}></textarea>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
               <button onClick={handleSaveObservation} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 10px 20px -5px rgba(30, 41, 59, 0.4)' }}>Guardar Post</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Simulador de Smart ID (Carnet) */}
      {showIDModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <motion.div initial={{ opacity: 0, y: 20, rotateY: -30 }} animate={{ opacity: 1, y: 0, rotateY: 0 }} transition={{ type: 'spring', damping: 15 }} style={{ width: '380px', perspective: '1000px' }}>
             
             <div style={{ background: 'white', borderRadius: '32px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div onClick={() => setShowIDModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', zIndex: 10 }}>
                  <X size={16} />
                </div>
                
                <p style={{ margin: '0 0 24px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', textAlign: 'center' }}>SMART ID / CARNET DIGITAL</p>

                {/* Vertical ID Card Design */}
                <div style={{ width: '100%', height: '420px', borderRadius: '24px', background: 'linear-gradient(180deg, white 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', boxShadow: 'inset 0 0 0 2px white', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ height: '140px', background: 'var(--primary)', position: 'relative' }}>
                     <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>EduNexus</h3>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '700' }}>VIRTUAL ACCESS</p>
                     </div>
                   </div>

                   <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'white', padding: '4px', position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <User size={50} color="#cbd5e1" />
                      </div>
                   </div>

                   <div style={{ marginTop: '70px', textAlign: 'center', padding: '0 24px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>{selectedStudent.name}</h2>
                      <p style={{ margin: '4px 0 16px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>ID: {selectedStudent.id}</p>
                      <div style={{ display: 'inline-block', padding: '6px 16px', background: '#dcfce3', color: '#16a34a', borderRadius: '100px', fontSize: '12px', fontWeight: '800', marginBottom: '24px' }}>Activo 2026</div>

                      {/* Mock QR */}
                      <div style={{ width: '80px', height: '80px', margin: '0 auto', background: '#e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <div style={{ width: '40px', height: '40px', background: '#94a3b8' }}></div>
                      </div>
                   </div>
                </div>

                <button style={{ width: '100%', marginTop: '24px', background: '#1e293b', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                   <Download size={18} /> Imprimir Carnet Físico
                </button>
             </div>
           </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
