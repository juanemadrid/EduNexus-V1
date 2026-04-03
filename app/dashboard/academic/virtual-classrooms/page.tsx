'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Video, FileText, CheckCircle, Clock, BookOpen, UploadCloud, PlayCircle, Users } from 'lucide-react';
import React from 'react';

export default function VirtualClassroomsPage() {
  const MOCK_CLASSES = [
    { title: 'Matemáticas Avanzadas', grade: '11vo Grado', tutor: 'Prof. Augusto Reyes', students: 32, type: 'live', time: 'En vivo ahora', status: 'active', color: '#ef4444' },
    { title: 'Historia Contemporánea', grade: '9no Grado', tutor: 'Prof. Diana Osorio', students: 28, type: 'recorded', time: 'Subida hace 2 horas', status: 'recorded', color: '#8b5cf6' },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Premium Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-premium" style={{ fontSize: '38px', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 10px 0' }}>
              Aulas <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Virtuales</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '16px', fontWeight: '500', maxWidth: '600px', margin: 0 }}>
              Gestión ultra-rápida de sesiones remotas, tareas y material de apoyo.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={18} /> Iniciar Clase en Vivo
            </button>
          </motion.div>
        </div>

        {/* Quick Upload Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel" 
          style={{ 
            padding: '40px', 
            textAlign: 'center', 
            border: '2px dashed var(--border-color)', 
            marginBottom: '40px',
            background: 'rgba(59, 130, 246, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#3b82f615', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
             <UploadCloud size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Crear Tarea o Subir Material</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: 0, fontWeight: '500' }}>Arrastra y suelta tu archivo PDF/Video aquí, o haz clic para seleccionar.</p>
        </motion.div>

        {/* Active Classes Grid */}
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlayCircle size={22} className="text-primary" /> Clases de Hoy
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {MOCK_CLASSES.map((cls, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + (idx * 0.1) }}
               className="glass-panel module-card"
               style={{ padding: '0', overflow: 'hidden' }}
             >
               <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: `${cls.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {cls.type === 'live' ? <Video size={24} color={cls.color} fill={`${cls.color}40`} /> : <BookOpen size={24} color={cls.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '8px' }}>{cls.grade}</span>
                        {cls.type === 'live' && (
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'white', background: '#ef4444', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', animation: 'pulse 2s infinite' }}>
                            <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} /> EN VIVO
                          </span>
                        )}
                     </div>
                     <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800' }}>{cls.title}</h3>
                     <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', fontWeight: '500' }}>{cls.tutor}</p>
                  </div>
               </div>
               
               <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                     <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Users size={14} /> {cls.students} listos
                     </span>
                     <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Clock size={14} /> {cls.time}
                     </span>
                  </div>
                  <button style={{ border: 'none', background: 'none', color: cls.color, fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                    Entrar →
                  </button>
               </div>
             </motion.div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .module-card {
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .module-card:hover {
           transform: translateY(-6px);
           box-shadow: 0 20px 40px rgba(0,0,0,0.08);
           border-color: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </DashboardLayout>
  );
}
