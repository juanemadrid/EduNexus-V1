'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Clock, 
  ShieldCheck,
  RefreshCcw,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { db } from '@/lib/db';
import { defaultFirebaseConfig } from '@/lib/db/defaultConfig';

// Using html5-qr-code via CDN for reliability without manual local setup
const QR_SCANNER_CDN = 'https://unpkg.com/html5-qrcode';

export default function AttendanceScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Institutional context (Simulated/Stored)
  const [instName, setInstName] = useState('Colegio Nueva Esperanza');

  useEffect(() => {
    // Load script
    const script = document.createElement('script');
    script.src = QR_SCANNER_CDN;
    script.async = true;
    script.onload = () => {
      console.log('QR Scanner loaded');
    };
    document.body.appendChild(script);

    const savedConfig = localStorage.getItem('edunexus_inst_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.name) setInstName(config.name);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      document.body.removeChild(script);
    };
  }, []);

  const startScanner = () => {
    if (typeof window === 'undefined' || !(window as any).Html5QrcodeScanner) return;
    setIsScannerActive(true);
    setStatus('idle');
    setScanResult(null);
    setStudentInfo(null);

    const scanner = new (window as any).Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setIsScannerActive(false);
    }
  };

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`Scan result: ${decodedText}`, decodedResult);
    stopScanner();
    setScanResult(decodedText);
    processAttendance(decodedText);
  };

  const onScanFailure = (error: any) => {
    // Silently continue (normal for scanner)
  };

  const processAttendance = async (studentId: string) => {
    setStatus('loading');
    
    try {
      // 1. Look up student in Firestore
      let student = await db.get<any>('students', studentId);
      
      // If not found by ID, try querying by numeroId field
      if (!student) {
        const students = await db.list<any>('registered_students', { id: studentId });
        if (students.length > 0) student = students[0];
      }

      if (!student) {
        setStatus('error');
        setErrorMsg('Estudiante no encontrado en la base de datos de la nube.');
        return;
      }

      setStudentInfo(student);

      // 2. Record attendance in Firestore
      const newRecord = {
        studentId: student.id,
        studentName: student.name,
        cursoId: student.details?.cursoId || 'CUR-DEMO-01',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: 'A',
        periodo: '2026-01'
      };

      await db.create('attendance', newRecord);

      // Show success
      setStatus('success');
    } catch (err) {
      console.error("Error processing attendance in Firestore:", err);
      setStatus('error');
      setErrorMsg('Error de conexión con la base de datos.');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <Link href="/dashboard/reports/consolidado-de-asistencias-asignaturas-individuales">
            <button className="btn-premium" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'white', color: '#1e293b', border: '1px solid #e2e8f0' }}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '28px', margin: 0 }}>Escáner de Asistencia</h1>
            <p style={{ color: '#64748b', margin: 0 }}>Centro de Control Institucional - {instName}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isScannerActive || status !== 'idle' ? '1fr' : '1fr', gap: '30px' }}>
          
          {/* Main Action Card */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.5)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <QrCode size={20} color="#1e40af" />
                  <span style={{ fontWeight: '800', fontSize: '14px' }}>ESTADO DEL SISTEMA</span>
               </div>
               {isScannerActive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', animation: 'pulse 1.5s infinite' }}></div>
                     <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>CÁMARA ACTIVA</span>
                  </div>
               )}
            </div>

            <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
               
               <AnimatePresence mode="wait">
                  {!isScannerActive && status === 'idle' && (
                    <motion.div 
                      key="start"
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 1.1 }}
                      style={{ textAlign: 'center' }}
                    >
                       <div style={{ width: '120px', height: '120px', background: '#eff6ff', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', position: 'relative' }}>
                          <Camera size={50} color="#1e40af" />
                          <div style={{ position: 'absolute', inset: '-10px', border: '2px dashed #3b82f6', borderRadius: '45px', opacity: 0.3 }}></div>
                       </div>
                       <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '12px' }}>Listo para Escanear</h2>
                       <p style={{ color: '#64748b', marginBottom: '30px', maxWidth: '300px', margin: '0 auto 30px' }}>Coloque el carnet del estudiante frente a la cámara para registrar su ingreso.</p>
                       <button onClick={startScanner} className="btn-premium" style={{ background: '#1e40af', padding: '14px 40px', fontSize: '16px', borderRadius: '50px' }}>
                          ACTIVAR CÁMARA
                       </button>
                    </motion.div>
                  )}

                  {isScannerActive && (
                    <motion.div 
                      key="scanner"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      style={{ width: '100%', maxWidth: '400px' }}
                    >
                       <div id="reader" style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', border: '2px solid #3b82f6' }}></div>
                       <button onClick={stopScanner} style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '800', width: '100%', textDecoration: 'underline', cursor: 'pointer' }}>
                          CANCELAR ESCANEO
                       </button>
                    </motion.div>
                  )}

                  {status === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                       <RefreshCcw size={40} color="#3b82f6" className="spin-slow" />
                       <p style={{ marginTop: '20px', fontWeight: '800' }}>Validando Identidad...</p>
                    </motion.div>
                  )}

                  {status === 'success' && studentInfo && (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      style={{ textAlign: 'center', width: '100%' }}
                    >
                       <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '5px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                          <CheckCircle2 size={40} color="#059669" />
                       </div>
                       <span style={{ fontSize: '11px', fontWeight: '950', color: '#059669', background: '#dcfce7', padding: '4px 12px', borderRadius: '50px', letterSpacing: '1px' }}>ASISTENCIA REGISTRADA</span>
                       <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#111827', margin: '15px 0 5px' }}>{studentInfo.name}</h2>
                       <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>ID: {studentInfo.id} • {studentInfo.details?.program || 'Estudiante'}</p>
                       
                       <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '300px', margin: '0 auto 30px', border: '1px solid #e2e8f0' }}>
                          <div style={{ textAlign: 'left' }}>
                             <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', display: 'block' }}>HORA</span>
                             <span style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                             <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', display: 'block' }}>ESTADO</span>
                             <span style={{ fontSize: '15px', fontWeight: '900', color: '#059669' }}>PRESENTE</span>
                          </div>
                       </div>

                       <button onClick={startScanner} className="btn-premium" style={{ background: '#1e40af', padding: '12px 30px', borderRadius: '50px' }}>
                          ESCANEAR SIGUIENTE
                       </button>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      style={{ textAlign: 'center' }}
                    >
                       <div style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                          <AlertCircle size={40} color="#dc2626" />
                       </div>
                       <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>Error de Lectura</h2>
                       <p style={{ color: '#dc2626', marginBottom: '30px', maxWidth: '250px', margin: '0 auto 30px' }}>{errorMsg}</p>
                       <button onClick={startScanner} className="btn-premium" style={{ background: '#dc2626', padding: '12px 30px', borderRadius: '50px' }}>
                          REINTENTAR ESCANEO
                       </button>
                    </motion.div>
                  )}
               </AnimatePresence>

            </div>

            <div style={{ padding: '15px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: '40px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>CÓDIGO ENCRIPTADO</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#1e40af" />
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>REGISTRO EN TIEMPO REAL</span>
               </div>
            </div>
          </div>

          {/* Quick Manual Entry Option */}
          <div style={{ textAlign: 'center' }}>
             <p style={{ color: '#64748b', fontSize: '14px' }}>
               ¿No funciona la cámara? 
               <Link href="/dashboard/academic/attendance/registry" style={{ color: '#1e40af', fontWeight: '800', marginLeft: '5px' }}>
                  Registro Manual
               </Link>
             </p>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .spin-slow { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </DashboardLayout>
  );
}
