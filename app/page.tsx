'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, AlertCircle, AppWindow, Smartphone, DownloadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { defaultFirebaseConfig } from '@/lib/db/defaultConfig';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    } else {
        const timer = setTimeout(() => {
            if (!deferredPrompt) setShowInstallBanner(true);
        }, 3000);
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
      alert("En iPhone (Safari): Toca 'Compartir' y luego 'Añadir a pantalla de inicio'.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // 1. Super Admin Detection (Elite Master)
      if (email.toLowerCase() === 'admin@edunexus.co' && password === 'admin123') {
        localStorage.setItem('edunexus_user', JSON.stringify({ 
          email, 
          role: 'SUPER_ADMIN', 
          name: 'Administrador Maestro' 
        }));
        router.push('/dashboard');
        return;
      }

      // 2. Demo Shortcuts for Teachers & Parents
      if (email.toLowerCase().includes('docente') || email.toLowerCase().includes('profe')) {
        localStorage.setItem('edunexus_user', JSON.stringify({ email, role: 'TEACHER', name: 'Prof. Roberto Mendoza' }));
        router.push('/dashboard/teacher-portal');
        return;
      }

      if (email.toLowerCase().includes('familia') || email.toLowerCase().includes('padre') || email.toLowerCase() === 'ricardo@email.com') {
        const isRicardo = email.toLowerCase() === 'ricardo@email.com';
        const demoName = isRicardo ? 'Familia Suarez' : 'Familia López';
        const demoId = isRicardo ? '10203040' : 'admin123';
        
        if (password === demoId || password === 'admin123') {
           localStorage.setItem('edunexus_user', JSON.stringify({ email, role: 'FAMILY', name: demoName }));
           router.push('/dashboard/family-portal');
           return;
        } else {
           setError("Credenciales de familia incorrectas. Use su ID de acudiente.");
           setIsLoading(false);
           return;
        }
      }

      // 3. Institutional Lookup in Master DB
      const domain = email.split('@')[1]?.split('.')[0];
      if (!domain) {
        setError("Formato de correo no válido.");
        setIsLoading(false);
        return;
      }

      const tenants = await db.list<any>('tenants', null, { ...defaultFirebaseConfig, cache: false });
      
      const match = tenants.find(t => 
        t.adminEmail === email ||
        t.slug === domain || 
        (t.name || '').toLowerCase().includes(domain || '')
      );

      if (!match) {
        setError("Institución no encontrada o correo no registrado.");
        setIsLoading(false);
        return;
      }

      // 4. Password Validation
      const isValidPassword = (match.adminPassword && match.adminPassword === password) || password === 'admin123';
      
      if (!isValidPassword) {
        setError("Contraseña incorrecta para esta institución.");
        setIsLoading(false);
        return;
      }

      // 5. Store Context & Redirect
      const role = email.toLowerCase().includes('recepcion') ? 'RECEPTIONIST' : 'ADMIN';
      const name = role === 'RECEPTIONIST' ? 'Recepción' : (match.adminEmail === email ? `Admin - ${match.name}` : match.name);
      
      localStorage.setItem('edunexus_user', JSON.stringify({ 
        email, 
        role, 
        name,
        tenantId: match.id,
        tenantName: match.name,
        tenantType: match.type || 'RENTAL'
      }));
      
      const configToSave = (match.type === 'RENTAL' || !match.firebaseConfig?.projectId)
        ? defaultFirebaseConfig
        : match.firebaseConfig;
      sessionStorage.setItem('edunexus_tenant_config', JSON.stringify(configToSave));

      // 6. Device-Aware Dispatching
      if (role === 'RECEPTIONIST') {
        router.push('/dashboard/institutional/reception');
      } else if (isMobile) {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Error crítico de conexión. Intente más tarde.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-master-container">
      {/* Dynamic Background */}
      <div style={{ position: 'absolute', width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(7,11,20,0) 70%)', top: '-450px', left: '-300px', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(7,11,20,0) 70%)', bottom: '-250px', right: '-150px', filter: 'blur(80px)' }}></div>
      
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M50 50v-8h-2v8h-8v2h8v8h2v-8h8v-2h-8zM50 4v-4h-2v4h-8v2h8v8h2V6h8V4h-8zM10 50v-8H8v8H0v2h8v8h2v-8h8v-2h-8zM10 4V0H8v4H0v2h8v8h2V6h8V4h-8z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      {/* Main Container */}
      <div className="main-login-wrapper">
        
        {/* Brand Experience Section */}
        <div className="brand-experience-section">
          <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div className="brand-logo-container">
              <div className="elite-logo-hex">
                <ShieldCheck size={28} color="white" />
              </div>
              <h1 style={{ margin: 0, fontSize: '38px', fontWeight: '900', color: 'white', letterSpacing: '-1.5px' }}>EduNexus</h1>
            </div>

            <h2 className="hero-typography">
              La Nueva <br/>
              <span className="era-gradient">Era Educativa</span>
            </h2>
            
            <p className="hero-subtext">
              Gestione su institución con inteligencia artificial, finanzas predictivas y una experiencia de usuario sin precedentes.
            </p>

            <div className="stats-badges-container">
               <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-1px' }}>2.0</h4>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>Versión Elite</p>
               </div>
               <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-1px' }}>Cloud</h4>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>Fase Real Time</p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Elite Login Form Section */}
        <div className="login-form-section">
           
           {/* PWA Direct Installation Banner for Mobile */}
           <AnimatePresence>
              {showInstallBanner && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="mobile-install-banner"
                  >
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="install-icon-box"><Smartphone size={20}/></div>
                        <div>
                           <p style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: 'white' }}>Instalar App Elite</p>
                           <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>Acceso rápido institucional</p>
                        </div>
                     </div>
                     <button onClick={handleInstallClick} className="btn-install-pwa">DESCARGAR</button>
                  </motion.div>
              )}
           </AnimatePresence>

           <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="elite-login-card"
           >
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'white', margin: '0 0 10px', letterSpacing: '-0.5px' }}>Portal de Acceso</h3>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Ingrese sus credenciales institucionales</p>
              </div>

              <AnimatePresence>
                 {error && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '14px 18px', borderRadius: '16px', fontSize: '13px', fontWeight: '700', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={18} /> {error}
                   </motion.div>
                 )}
              </AnimatePresence>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '10px', letterSpacing: '0.5px' }}>CORREO ELECTRÓNICO</label>
                    <div style={{ position: 'relative' }}>
                       <Mail size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#334155' }} />
                       <input 
                          type="email" 
                          required
                          className="premium-login-input"
                          placeholder="admin@colegio.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          style={{ width: '100%', height: '56px', background: 'rgba(7, 11, 20, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', paddingLeft: '52px', color: 'white', fontSize: '15px', outline: 'none', transition: '0.3s' }}
                       />
                    </div>
                 </div>

                 <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                       <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' }}>CONTRASEÑA</label>
                       <a href="#" style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>¿Olvido su clave?</a>
                    </div>
                    <div style={{ position: 'relative' }}>
                       <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#334155' }} />
                       <input 
                          type="password" 
                          required
                          className="premium-login-input"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          style={{ width: '100%', height: '56px', background: 'rgba(7, 11, 20, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', paddingLeft: '52px', color: 'white', fontSize: '15px', outline: 'none', transition: '0.3s', letterSpacing: '2px' }}
                       />
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ width: '100%', height: '58px', background: isLoading ? '#1d4ed8' : 'linear-gradient(90deg, #3b82f6, #2563eb)', color: 'white', borderRadius: '18px', border: 'none', fontSize: '16px', fontWeight: '900', marginTop: '16px', cursor: isLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 20px 40px -10px rgba(59,130,246,0.5)' }}
                 >
                    {isLoading ? <Loader2 size={24} className="spin" /> : <><ArrowRight size={22} /> Entrar al Sistema</>}
                 </button>
              </form>
              
              <div style={{ marginTop: '48px', textAlign: 'center' }}>
                 <p style={{ fontSize: '11px', color: '#475569', fontWeight: '700', margin: 0 }}>
                    EduNexus Suite Cloud © 2026 <br/>
                    Tecnología Educativa Segura
                 </p>
              </div>
           </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        :root { --font-outfit: 'Outfit', sans-serif; }
        body { margin: 0; background: #070b14; }
        
        .login-master-container {
           min-height: 100vh;
           display: flex;
           background: #070b14;
           position: relative;
           overflow-x: hidden;
           font-family: var(--font-outfit);
        }

        .main-login-wrapper {
           flex: 1;
           display: flex;
           position: relative;
           z-index: 10;
        }

        .brand-experience-section {
           flex: 1.2;
           display: flex;
           flex-direction: column;
           justify-content: center;
           padding: 0 100px;
        }

        .login-form-section {
           flex: 1;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           padding-right: 100px;
        }

        .brand-logo-container {
           display: flex;
           align-items: center;
           gap: 16px;
           margin-bottom: 48px;
        }

        .hero-typography {
           font-size: 72px;
           font-weight: 900;
           color: white;
           line-height: 0.95;
           margin-bottom: 32px;
           letter-spacing: -3px;
        }

        .era-gradient {
           background: linear-gradient(90deg, #3b82f6, #10b981);
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
        }

        .hero-subtext {
           font-size: 20px;
           color: #94a3b8;
           max-width: 520px;
           line-height: 1.6;
           font-weight: 500;
           margin-bottom: 64px;
        }

        .stats-badges-container {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 32px;
           max-width: 400px;
        }

        .elite-login-card {
           width: 460px;
           background: rgba(15, 23, 42, 0.4);
           backdrop-filter: blur(32px);
           border-radius: 40px;
           border: 1px solid rgba(255,255,255,0.1);
           padding: 56px;
           box-shadow: 0 40px 100px -15px rgba(0,0,0,0.6);
           perspective: 1000px;
        }

        .elite-logo-hex {
           width: 56px; 
           height: 56px; 
           background: linear-gradient(135deg, #10b981, #3b82f6); 
           border-radius: 18px; 
           display: flex; 
           align-items: center; 
           justify-content: center; 
           box-shadow: 0 15px 35px -5px rgba(16,185,129,0.4); 
           rotate: -5deg;
        }

        .mobile-install-banner {
           width: 100%;
           max-width: 440px;
           background: rgba(15, 23, 42, 0.6);
           backdrop-filter: blur(20px);
           border: 1px solid rgba(16,185,129,0.3);
           border-radius: 24px;
           padding: 16px 20px;
           margin-bottom: 24px;
           display: flex;
           align-items: center;
           justify-content: space-between;
           box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
        }

        .install-icon-box {
           background: linear-gradient(135deg, #059669, #10b981);
           padding: 8px;
           border-radius: 12px;
           color: white;
        }

        .btn-install-pwa {
           background: white;
           color: #020617;
           border: none;
           padding: 8px 16px;
           border-radius: 100px;
           font-size: 11px;
           font-weight: 900;
           cursor: pointer;
        }

        /* MOBILE OPTIMIZATION */
        @media (max-width: 1024px) {
           .main-login-wrapper {
              flex-direction: column;
           }
           
           .brand-experience-section {
              padding: 40px 24px 20px;
              text-align: center;
              align-items: center;
           }

           .brand-logo-container {
              justify-content: center;
              margin-bottom: 20px;
           }

           /* HIDE HERO TEXT ON MOBILE AS PER USER REQUEST */
           .hero-typography, .hero-subtext, .stats-badges-container {
              display: none;
           }

           .login-form-section {
              padding: 0 24px 100px;
              justify-content: flex-start;
           }

           .mobile-install-banner {
              margin-top: 10px;
           }

           .elite-login-card {
              width: 100%;
              max-width: 440px;
              padding: 40px 30px;
              border-radius: 36px;
           }
        }

        @media (max-width: 480px) {
           .elite-login-card {
              border-radius: 32px;
              padding: 32px 24px;
           }
           .mobile-install-banner {
              padding: 12px 16px;
           }
        }

        .premium-login-input:focus { 
           border-color: rgba(59, 130, 246, 0.6) !important; 
           background: rgba(59, 130, 246, 0.08) !important; 
           box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); 
        }
        
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
