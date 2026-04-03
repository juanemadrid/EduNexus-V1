'use client';
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock, Search, Filter, Plus, Mail, DollarSign, Sparkles, Loader2, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

const MOCK_PIPELINE = {
  leads: [
    { id: 1, name: 'Sofia Rodriguez', grade: 'Párvulos', status: 'Interesado', date: 'Hace 2 horas', parent: 'Laura Rodriguez', email: 'laura@email.com' },
    { id: 2, name: 'Andrés López', grade: '5to Primaria', status: 'Contactado', date: 'Hace 5 horas', parent: 'Carlos López', email: 'carlos@email.com' },
  ],
  testing: [
    { id: 3, name: 'Valentina Mesa', grade: '11vo Grado', status: 'Examen Programado', score: '-', parent: 'Marta Mesa', email: 'marta@email.com' },
    { id: 4, name: 'Juan C. Perea', grade: '1ro Primaria', status: 'Examen Completado', score: '85/100', parent: 'Juan Perea Sr.', email: 'juan@email.com' },
  ],
  approved: [
    { id: 5, name: 'Martín Suarez', grade: 'Párvulos', status: 'Pago Pendiente', date: 'Aprobado ayer', parent: 'Ricardo Suarez', email: 'ricardo@email.com', idNumber: '10203040' },
  ]
};

export default function AdmissionsPipelinePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormalizing, setIsFormalizing] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<any>(null);

  const handleFormalize = (lead: any) => {
    setIsFormalizing(lead.id);
    
    // Elite Automation Simulation
    setTimeout(() => {
      setIsFormalizing(null);
      setShowSuccessModal(lead);
    }, 2500);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Premium Header */}
        <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="heading-premium" style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 10px 0' }}>
              CRM de <span style={{ color: 'var(--primary)' }}>Admisiones Elite</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '16px', fontWeight: '500', maxWidth: '600px', margin: 0 }}>
              Automatización inteligente desde el prospecto hasta la matrícula digital.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o grado..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '14px 16px 14px 46px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', width: '300px', outline: 'none', fontWeight: '600', fontSize: '14px' }}
              />
            </div>
            <button className="btn-premium" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              <Plus size={18} /> Nuevo Aspirante
            </button>
          </motion.div>
        </div>

        {/* Pipeline Board */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          
          {/* Column 1: Leads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                Nuevos Prospectos
              </h3>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#3b82f6' }}>{MOCK_PIPELINE.leads.length}</span>
            </div>
            
            {MOCK_PIPELINE.leads.map(lead => (
              <motion.div key={lead.id} className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }} whileHover={{ y: -5 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                   <span style={{ fontSize: '10px', fontWeight: '900', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '4px 12px', borderRadius: '8px', letterSpacing: '0.5px' }}>{lead.grade.toUpperCase()}</span>
                   <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>{lead.date}</span>
                 </div>
                 <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900' }}>{lead.name}</h4>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
                   <Users size={14} /> Acudiente: {lead.parent}
                 </div>
                 <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                   <Mail size={16} /> Enviar Info
                 </button>
              </motion.div>
            ))}
          </div>

          {/* Column 2: Exámenes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
                Admisión Digital
              </h3>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#f59e0b' }}>{MOCK_PIPELINE.testing.length}</span>
            </div>
            
            {MOCK_PIPELINE.testing.map(lead => (
              <motion.div key={lead.id} className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }} whileHover={{ y: -5 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                   <span style={{ fontSize: '10px', fontWeight: '900', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '4px 12px', borderRadius: '8px' }}>PUNTAJE: {lead.score}</span>
                   <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>ADMISIÓN</span>
                 </div>
                 <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900' }}>{lead.name}</h4>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: '600' }}>
                   <FileText size={14} /> {lead.status}
                 </div>
              </motion.div>
            ))}
          </div>

          {/* Column 3: Approved & Automation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                Matrícula Automática
              </h3>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#10b981' }}>{MOCK_PIPELINE.approved.length}</span>
            </div>
            
            {MOCK_PIPELINE.approved.map(lead => (
              <motion.div key={lead.id} className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(16,185,129,0.2)' }} whileHover={{ y: -5 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                   <span style={{ fontSize: '10px', fontWeight: '900', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '8px' }}>LISTO PARA ELITE</span>
                   <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '900' }}>APROBADO</span>
                 </div>
                 <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900' }}>{lead.name}</h4>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                   <DollarSign size={14} /> Pago verificado satisfactoriamente
                 </div>

                 <button 
                    onClick={() => handleFormalize(lead)}
                    disabled={isFormalizing === lead.id}
                    className="btn-premium" 
                    style={{ 
                        width: '100%', padding: '16px', borderRadius: '16px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        boxShadow: '0 10px 20px -5px rgba(16,185,129,0.3)'
                    }}
                 >
                   {isFormalizing === lead.id ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        AUTOGESTIONANDO ACCESO...
                      </>
                   ) : (
                      <>
                        <Sparkles size={18} /> FORMALIZAR MATRÍCULA
                      </>
                   )}
                 </button>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Success Modal: Automated Onboarding Notification */}
        <AnimatePresence>
          {showSuccessModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccessModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)' }} />
               
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 style={{ 
                    position: 'relative', width: '100%', maxWidth: '480px', 
                    background: 'var(--bg-secondary)', borderRadius: '32px', padding: '40px',
                    border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)'
                 }}
               >
                  <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                     <ShieldCheck size={42} />
                  </div>
                  
                  <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 12px', letterSpacing: '-1px' }}>¡Matrícula Exitosa!</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                     El estudiante **{showSuccessModal.name}** ha sido matriculado. El acceso familiar ha sido generado y enviado automáticamente.
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'left', marginBottom: '32px' }}>
                     <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Credenciales de Acudiente</p>
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16}/></div>
                        <div>
                           <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800' }}>USUARIO</p>
                           <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{showSuccessModal.email}</p>
                        </div>
                     </div>

                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Smartphone size={16}/></div>
                        <div>
                           <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800' }}>CONTRASEÑA INICIAL</p>
                           <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{showSuccessModal.idNumber || 'Documento de Identidad'}</p>
                        </div>
                     </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '32px', justifyContent: 'center' }}>
                     <Smartphone size={16} /> NOTIFICACIÓN DIGITAL ENVIADA POR WHATSAPP
                  </div>

                  <button 
                    onClick={() => setShowSuccessModal(null)}
                    style={{ width: '100%', background: 'white', color: '#020617', border: 'none', padding: '18px', borderRadius: '20px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  >
                     CONTINUAR AL DASHBOARD <ArrowRight size={18}/>
                  </button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
