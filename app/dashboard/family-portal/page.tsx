'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, ChevronLeft, Download, ShieldCheck, User, Building, AlertCircle, Bell, AppWindow, Star, Heart, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FamilyPortalPage() {
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    } else {
      const timer = setTimeout(() => {
        if (!deferredPrompt) setShowInstallBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    } else {
      alert("Para instalar, toca 'Compartir' y luego 'Añadir a pantalla de inicio'.");
    }
  };

  const handlePayment = () => {
    setIsPaying(true);
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 2500);
  };

  const currentDebt = 150000;
  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: 'var(--font-outfit)', color: 'white', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Aurora Background Effects (Mobile Optimized) */}
      <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '100px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>

      {/* PWA Mobile Header Elite */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(20px)',
        padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -5px rgba(16,185,129,0.3)' }}>
               <Building size={22} color="white" />
            </div>
            <div>
               <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-0.8px' }}>EduNexus</h1>
               <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Portal Elite</p>
               </div>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <motion.div whileTap={{ scale: 0.9 }}>
               <Bell size={24} color="#64748b" />
            </motion.div>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
               <User size={20} color="#94a3b8" />
            </div>
         </div>
      </header>

      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '28px 24px 120px' }}>
        
        {/* Install App Banner (Professional Native Look) */}
        <AnimatePresence>
          {showInstallBanner && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)',
                borderRadius: '24px', padding: '18px', marginBottom: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: '1px solid rgba(16,185,129,0.2)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                 <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '10px', borderRadius: '14px', boxShadow: '0 10px 20px -5px rgba(16,185,129,0.4)' }}>
                    <AppWindow size={24} color="white" />
                 </div>
                 <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: 'white' }}>Instalar App</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Versión institucional rápida</p>
                 </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                style={{ background: 'white', color: '#020617', border: 'none', padding: '8px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
              >
                OBTENER
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          {paymentStatus !== 'success' ? (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               {/* Welcome Section */}
               <div style={{ marginBottom: '36px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Buen día</p>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1.5px', lineHeight: '1' }}>Familia López</h2>
               </div>

               {/* Stats Grid (Glassmorphism Pro) */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}>
                     <div style={{ width: '32px', height: '32px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Star size={18} color="#f59e0b" />
                     </div>
                     <h4 style={{ margin: 0, fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-space-grotesk)' }}>4.8</h4>
                     <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promedio Total</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}>
                     <div style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Heart size={18} color="#ef4444" />
                     </div>
                     <h4 style={{ margin: 0, fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-space-grotesk)' }}>0</h4>
                     <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faltas Mes</p>
                  </div>
               </div>

               {/* Payment Card Elite 2.0 */}
               <div style={{ 
                 background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.8), rgba(2, 6, 23, 0.9))',
                 borderRadius: '32px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)',
                 marginBottom: '36px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.7)',
                 position: 'relative', overflow: 'hidden'
               }}>
                  {/* Decorative glow */}
                  <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                     <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Cartera Pendiente</p>
                        <h1 style={{ margin: 0, fontSize: '52px', fontWeight: '900', letterSpacing: '-2px', fontFamily: 'var(--font-space-grotesk)' }}>{formatter.format(currentDebt)}</h1>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '8px 18px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', marginTop: '16px', border: '1px solid rgba(239,68,68,0.1)' }}>
                           <AlertCircle size={14} /> Vence en 2 días
                        </div>
                     </div>

                     <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                           <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '700' }}>Pensión Mensual</span>
                           <span style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'var(--font-space-grotesk)' }}>{formatter.format(140000)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                           <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '700' }}>Recargos Mora</span>
                           <span style={{ fontSize: '14px', fontWeight: '900', color: '#fca5a5', fontFamily: 'var(--font-space-grotesk)' }}>{formatter.format(10000)}</span>
                        </div>
                     </div>

                     <motion.button 
                       whileTap={{ scale: 0.96 }}
                       onClick={handlePayment}
                       disabled={isPaying}
                       style={{ 
                         width: '100%', background: 'linear-gradient(90deg, #10b981, #059669)',
                         color: 'white', border: 'none', padding: '22px', borderRadius: '24px',
                         fontSize: '17px', fontWeight: '900', cursor: 'pointer',
                         boxShadow: '0 20px 40px -10px rgba(16,185,129,0.5)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px'
                       }}
                     >
                       {isPaying ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><ShieldCheck size={26}/></motion.div> : 'Pagar Seguramente'}
                     </motion.button>
                  </div>
               </div>

               {/* Observador Section Elite */}
               <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                     <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>Observador Real-Time</h3>
                     <motion.div whileTap={{ scale: 0.95 }} style={{ fontSize: '12px', color: '#10b981', fontWeight: '900', background: 'rgba(16,185,129,0.05)', padding: '6px 14px', borderRadius: '100px' }}>VER TODOS</motion.div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '28px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           <Sparkles size={22} />
                        </div>
                        <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '900' }}>Felicitación Académica</h5>
                              <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                           </div>
                           <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', fontWeight: '500' }}>Andrés obtuvo el mejor desempeño en el simulacro regional de Matemáticas.</p>
                           <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#334155' }}></div>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>PROF. RODRIGO • HACE 12M</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
               style={{ textAlign: 'center', paddingTop: '60px' }}
            >
               <div style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', margin: '0 auto 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 40px 80px -20px rgba(16,185,129,0.6)' }}>
                  <CheckCircle2 size={60} color="white" />
               </div>
               <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-1px' }}>¡Transacción Exitosa!</h2>
               <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', margin: '0 0 48px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                  El pago por {formatter.format(currentDebt)} ha sido procesado. Los registros académicos están desbloqueados.
               </p>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <motion.button whileTap={{ scale: 0.96 }} style={{ width: '100%', background: 'white', color: '#020617', border: 'none', padding: '20px', borderRadius: '24px', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                     <Download size={20} /> DESCARGAR RECIBO
                  </motion.button>
                  <button onClick={() => { setPaymentStatus('idle'); setIsPaying(false); }} style={{ width: '100%', background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '24px', fontSize: '16px', fontWeight: '900' }}>
                     CERRAR
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Bottom Mobile Tab Bar Elite */}
      <nav style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-around', padding: '16px 0 34px',
        zIndex: 2000
      }}>
         <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#10b981' }}>
            <Building size={26} />
            <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>INICIO</span>
         </motion.div>
         <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#475569' }}>
            <TrendingUp size={26} />
            <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>NOTAS</span>
         </motion.div>
         <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#475569' }}>
            <CreditCard size={26} />
            <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>PAGOS</span>
         </motion.div>
         <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#475569' }}>
            <User size={26} />
            <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>CUENTA</span>
         </motion.div>
      </nav>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Space+Grotesk:wght@400;700&display=swap');
        :root { 
          --font-outfit: 'Outfit', sans-serif; 
          --font-space-grotesk: 'Space Grotesk', sans-serif;
        }
        body { margin: 0; background: #020617; color-scheme: dark; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
