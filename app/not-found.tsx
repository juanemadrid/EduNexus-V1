'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Building, ArrowLeft, TriangleAlert, Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', background: '#020617', color: 'white', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Outfit', sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Background Aurora Effects */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }}></div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '440px' }}>
        
        {/* Elite Icon 404 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ 
            width: '120px', height: '120px', margin: '0 auto 40px',
            background: 'rgba(255,255,255,0.02)', borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5)',
            position: 'relative'
          }}
        >
          <Compass size={56} color="#10b981" />
          <motion.div 
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            style={{ position: 'absolute', inset: '10px', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: '50%' }}
          ></motion.div>
        </motion.div>

        {/* Text Section */}
        <motion.span 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ fontSize: '12px', fontWeight: '900', color: '#10b981', letterSpacing: '2px', textTransform: 'uppercase' }}
        >
          Error de Navegación 404
        </motion.span>
        
        <motion.h1 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ fontSize: '42px', fontWeight: '900', margin: '12px 0 20px', letterSpacing: '-1.5px', lineHeight: '1.1' }}
        >
          Campus Extraviado
        </motion.h1>

        <motion.p 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 40px', fontWeight: '500' }}
        >
          La página que intentas consultar no existe en nuestros registros académicos de élite. Permítenos guiarte de vuelta.
        </motion.p>

        {/* Action Button */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(16,185,129,0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                background: 'linear-gradient(90deg, #10b981, #059669)',
                color: 'white', border: 'none', padding: '18px 32px', borderRadius: '100px',
                fontSize: '15px', fontWeight: '900', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 15px 30px -10px rgba(16,185,129,0.3)'
              }}
            >
              <ArrowLeft size={18} />
              Regresar al Portal de Inicio
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer Branding */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.8 }}
          style={{ marginTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <Building size={16} />
          <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>EDUNEXUS ELITE</span>
        </motion.div>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        body { margin: 0; background: #020617; }
      `}</style>
    </div>
  );
}
