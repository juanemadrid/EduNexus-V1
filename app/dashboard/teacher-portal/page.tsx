'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, UserCheck, CheckCircle2, ChevronLeft, Download, ShieldCheck, User, Building, AlertCircle, Bell, AppWindow, Star, Heart, TrendingUp, Calendar, Zap, MoreVertical, Search, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { MOCK_COURSES } from '@/lib/mockData';

export default function TeacherPortalPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'attendance'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [attendanceStep, setAttendanceStep] = useState<'idle' | 'taking' | 'success'>('idle');
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowInstallBanner(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartAttendance = (course: any) => {
    setSelectedCourse(course);
    setAttendanceStep('taking');
  };

  const handleFinishAttendance = () => {
    setAttendanceStep('success');
    setTimeout(() => {
      setAttendanceStep('idle');
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: 'var(--font-outfit)', color: 'white', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Teacher-Specific Aurora Background */}
      <div style={{ position: 'absolute', top: '-80px', right: '-40px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '60px', left: '-40px', width: '240px', height: '240px', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>

      {/* Header Elite */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(20px)',
        padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(139,92,246,0.4)' }}>
               <BookOpen size={22} color="white" />
            </div>
            <div>
               <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-0.8px' }}>EduNexus</h1>
               <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', background: '#8b5cf6', borderRadius: '50%' }}></div>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: '900', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1px' }}>Docente Pro</p>
               </div>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Bell size={24} color="#64748b" />
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px', color: 'white', opacity: 0.8 }}>RM</div>
         </div>
      </header>

      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '28px 24px 120px' }}>
        
        <AnimatePresence>
          {showInstallBanner && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '24px', padding: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px -10px rgba(139,92,246,0.4)', position: 'relative', overflow: 'hidden' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '14px' }}>
                     <AppWindow size={24} color="#8b5cf6" />
                  </div>
                  <div>
                     <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: 'white' }}>Modo App</h4>
                     <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>Sin navegador, más rápido</p>
                  </div>
               </div>
               <button onClick={() => setShowInstallBanner(false)} style={{ background: 'white', color: '#8b5cf6', border: 'none', padding: '10px 20px', borderRadius: '14px', fontSize: '12px', fontWeight: '900' }}>INSTALAR</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {attendanceStep === 'idle' ? (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div style={{ marginBottom: '36px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '800', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1px' }}>¡Buen día!</p>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1.5px', lineHeight: '1' }}>Prof. Roberto Mendoza</h2>
               </div>

               {/* Quick Tools */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '36px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                     <Zap size={22} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
                     <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900' }}>OBSERVADOR</h4>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                     <Calendar size={22} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                     <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900' }}>HORARIO</h4>
                  </div>
               </div>

               <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>Mis Grupos Activos</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {MOCK_COURSES.map((course, idx) => (
                     <div key={course.id} style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px', padding: '28px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: idx % 2 === 0 ? '#8b5cf6' : '#3b82f6' }}></div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '900' }}>{course.name}</h4>
                        <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#64748b' }}>{course.students} EST. • 08:00 AM</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                           <button onClick={() => handleStartAttendance(course)} style={{ flex: 1, background: '#8b5cf6', color: 'white', border: 'none', padding: '16px', borderRadius: '18px', fontSize: '13px', fontWeight: '900' }}>ASISTENCIA</button>
                           <button style={{ flex: 1, background: 'rgba(255,255,255,0.02)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '18px', fontSize: '13px', fontWeight: '900' }}>CALIFICAR</button>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
          ) : attendanceStep === 'taking' ? (
            <motion.div key="taking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <div onClick={() => setAttendanceStep('idle')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '28px', cursor: 'pointer', fontWeight: '900', fontSize: '13px' }}>
                  <ChevronLeft size={22} /> VOLVER
               </div>
               <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 6px' }}>Pasar Lista</h2>
               <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>{selectedCourse?.name}</p>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
                  {['ACEVEDO MARIA', 'BERNAL CARLOS', 'CÁRDENAS DIANA', 'DIAZ GABRIEL'].map((name) => (
                    <div key={name} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '22px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                       <span style={{ fontSize: '15px', fontWeight: '800' }}>{name}</span>
                       <input type="checkbox" defaultChecked style={{ width: '24px', height: '24px', accentColor: '#10b981' }} />
                    </div>
                  ))}
               </div>

               <button onClick={handleFinishAttendance} style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', color: 'white', border: 'none', padding: '22px', borderRadius: '24px', fontSize: '17px', fontWeight: '900' }}>GUARDAR ASISTENCIA</button>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', paddingTop: '100px' }}>
               <div style={{ width: '100px', height: '100px', background: '#10b981', borderRadius: '50%', margin: '0 auto 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={50} color="white" />
               </div>
               <h3 style={{ fontSize: '24px', fontWeight: '900' }}>¡Asistencia Exitosa!</h3>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <nav style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-around', padding: '16px 0 34px'
      }}>
         <Building size={28} color="#8b5cf6" />
         <TrendingUp size={28} color="#475569" />
         <Calendar size={28} color="#475569" />
         <User size={28} color="#475569" />
      </nav>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        :root { --font-outfit: 'Outfit', sans-serif; }
        body { margin: 0; background: #020617; color-scheme: dark; }
      `}</style>
    </div>
  );
}
