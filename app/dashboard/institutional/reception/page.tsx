'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  User, 
  ArrowRightLeft, 
  Clock, 
  LogOut, 
  LogIn, 
  Building, 
  AlertCircle,
  CheckCircle2,
  FileText,
  QrCode,
  X,
  CreditCard,
  BookOpen,
  DollarSign,
  Package,
  Layers,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { defaultFirebaseConfig } from '@/lib/db/defaultConfig';

const QR_SCANNER_CDN = 'https://unpkg.com/html5-qrcode';

interface AccessLog {
  id: string;
  studentId: string;
  type: 'ENTRY' | 'EXIT';
  reason?: string;
  timestamp: string;
  date: string;
  recordedBy: string;
}

export default function ReceptionAccessControl() {
  const [activeTab, setActiveTab] = useState<'acceso' | 'info' | 'materiales'>('acceso');

  const [students, setStudents] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [studentLogs, setStudentLogs] = useState<AccessLog[]>([]);
  const [currentState, setCurrentState] = useState<'En Campus' | 'Fuera'>('En Campus');
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Scanner states
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scanError, setScanError] = useState('');
  const scannerRef = React.useRef<any>(null);

  const fetchData = async () => {
    try {
      // Load Students and Access Logs
      const [savedStudents, savedLogs, savedCursos, savedGrupos, savedProductos] = await Promise.all([
        db.list<any>('students'),
        db.list<AccessLog>('campus_access_log'),
        db.list<any>('cursos'),
        db.list<any>('grupos'),
        db.list<any>('productos')
      ]);

      setStudents(savedStudents);
      setAccessLogs(savedLogs);
      setCursos(savedCursos);
      setGrupos(savedGrupos);
      setProductos(savedProductos);
    } catch (error) {
       console.error("Error fetching data from Firestore:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // Load Scanner Script
    const script = document.createElement('script');
    script.src = QR_SCANNER_CDN;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  // Update selected student state and logs when selection changes
  useEffect(() => {
    if (selectedStudent) {
      const today = new Date().toISOString().split('T')[0];
      const logs = accessLogs.filter(l => l.studentId === selectedStudent.id && l.date === today);
      
      // Sort by timestamp descending so the latest is first
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setStudentLogs(logs);

      if (logs.length > 0 && logs[0]) {
        setCurrentState(logs[0].type === 'EXIT' ? 'Fuera' : 'En Campus');
      } else {
        // Default assuming they scanned in the morning
        setCurrentState('En Campus');
      }
    }
  }, [selectedStudent, accessLogs]);

  const filteredStudents = searchTerm.length >= 2 
    ? students.filter(s => 
        (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s?.id || '').includes(searchTerm)
      ).slice(0, 8) // Max 8 results for quick search
    : [];

  // Scanner Methods
  const startScanner = () => {
    if (typeof window === 'undefined' || !(window as any).Html5QrcodeScanner) return;
    setIsScannerActive(true);
    setScanError('');

    setTimeout(() => {
      const scanner = new (window as any).Html5QrcodeScanner(
        "reception-reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render((decodedText: string) => {
        scanner.clear();
        setIsScannerActive(false);
        
        // Find student natively
        const student = students.find(s => s.id === decodedText);
        if (student) {
          setSelectedStudent(student);
          setSearchTerm('');
        } else {
          setScanError('Estudiante no encontrado en la base de datos.');
          setTimeout(() => setScanError(''), 3000);
        }
      }, () => {});
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      setIsScannerActive(false);
    }
  };

  const handleAction = (type: 'ENTRY' | 'EXIT', reason?: string) => {
    if (!selectedStudent) return;

    const newLog: AccessLog = {
      id: crypto.randomUUID(),
      studentId: selectedStudent.id,
      type: type as 'ENTRY' | 'EXIT',
      reason: (type === 'EXIT' ? (reason || '') : '') as string,
      timestamp: new Date().toISOString(),
      date: (new Date().toISOString().split('T')[0]) || '',
      recordedBy: 'RECEPCIÓN',
    };

    db.create('campus_access_log', newLog).then(() => {
      setAccessLogs([newLog, ...accessLogs]);
    }).catch(err => {
      console.error("Error saving log to Firestore:", err);
    });

    setShowExitModal(false);
    setExitReason('');
    setCustomReason('');
  };

  const handleConfirmExit = () => {
    const finalReason = exitReason === 'Otro' ? customReason : exitReason;
    if (!finalReason) return;
    handleAction('EXIT', finalReason || '');
  };

  const getTeacherForStudent = (student: any) => {
    if (!student?.details?.cursoId) return 'No asignado';
    const cursoGrupo = grupos.find(g => g.cursoId === student.details.cursoId);
    if (cursoGrupo && cursoGrupo.docenteName) return cursoGrupo.docenteName;
    return 'Pendiente por asignar';
  };

  const getCursoNameForStudent = (student: any) => {
    if (!student?.details?.cursoId) return student?.details?.program || 'Sin Curso';
    const curso = cursos.find(c => c.id === student.details.cursoId);
    return curso ? curso.nombre : (student?.details?.program || 'Sin Curso');
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '32px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Building size={32} color="#1e40af" />
              Centro de Recepción
            </h1>
            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '5px' }}>
              Módulo integral de control de acceso estudiantil, consultas de precios e inventario de materiales.
            </p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div style={{ gap: '10px', marginBottom: '30px', background: 'rgba(255,255,255,0.5)', padding: '6px', borderRadius: '16px', display: 'inline-flex', border: '1px solid #f1f5f9' }}>
          <button 
            onClick={() => setActiveTab('acceso')}
            style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s', background: activeTab === 'acceso' ? 'white' : 'transparent', color: activeTab === 'acceso' ? '#1e40af' : '#64748b', boxShadow: activeTab === 'acceso' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none' }}>
            <ArrowRightLeft size={16} /> 1. Entradas y Salidas
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s', background: activeTab === 'info' ? 'white' : 'transparent', color: activeTab === 'info' ? '#1e40af' : '#64748b', boxShadow: activeTab === 'info' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none' }}>
            <DollarSign size={16} /> 2. Precios e Información
          </button>
          <button 
            onClick={() => setActiveTab('materiales')}
            style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s', background: activeTab === 'materiales' ? 'white' : 'transparent', color: activeTab === 'materiales' ? '#1e40af' : '#64748b', boxShadow: activeTab === 'materiales' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none' }}>
            <BookOpen size={16} /> 3. Libros y Entregas
          </button>
        </div>

        {/* Tab 1: Access Control */}
        {activeTab === 'acceso' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px', alignItems: 'start' }}>
          
          {/* Left Column: Search & List */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', background: 'rgba(255,255,255,0.7)' }}>
              <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar alumno por nombre o documento..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', height: '45px', padding: '0 15px 0 45px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <button 
                  onClick={startScanner}
                  title="Escanear Código QR"
                  style={{ width: '45px', height: '45px', borderRadius: '14px', border: 'none', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <QrCode size={20} />
                </button>
              </div>
              {scanError && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '10px', textAlign: 'center', fontWeight: '800' }}>{scanError}</p>}
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '10px' }}>
              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>
                  Escriba al menos 2 caracteres...
                </p>
              )}
              
              {searchTerm.length >= 2 && filteredStudents.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>
                  No se encontraron estudiantes.
                </p>
              )}

              {filteredStudents.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedStudent(s)}
                  style={{ 
                    padding: '12px 15px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    background: selectedStudent?.id === s.id ? '#eff6ff' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedStudent?.id === s.id ? '#bfdbfe' : 'transparent',
                    transition: 'all 0.2s',
                    marginBottom: '5px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = selectedStudent?.id === s.id ? '#eff6ff' : '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedStudent?.id === s.id ? '#eff6ff' : 'transparent'}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#64748b" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{s.name || `${s.nombres} ${s.apellidos}`}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Doc: {s.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Student Details & Actions */}
          <div>
            <AnimatePresence mode="wait">
              {selectedStudent ? (
                <motion.div 
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel" 
                  style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}
                >
                  {/* Status Indicator Background Glow */}
                  <div style={{ 
                    position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', borderRadius: '50%', 
                    background: currentState === 'En Campus' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    filter: 'blur(40px)', zIndex: 0 
                  }}></div>

                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                        <User size={40} color="#94a3b8" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 5px' }}>
                          {selectedStudent.name || `${selectedStudent.nombres} ${selectedStudent.apellidos}`}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FileText size={16} /> ID: {selectedStudent.id}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Layers size={16} /> Grado: {getCursoNameForStudent(selectedStudent)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0ea5e9', fontWeight: '700' }}><User size={16} color="#0ea5e9" /> Director de Grupo: {getTeacherForStudent(selectedStudent)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', marginBottom: '5px' }}>ESTADO ACTUAL</span>
                      <div style={{ 
                        padding: '8px 16px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px',
                        background: currentState === 'En Campus' ? '#dcfce7' : '#fee2e2',
                        color: currentState === 'En Campus' ? '#059669' : '#dc2626',
                        fontWeight: '800', fontSize: '14px', border: `1px solid ${currentState === 'En Campus' ? '#a7f3d0' : '#fecaca'}`
                      }}>
                        {currentState === 'En Campus' ? <CheckCircle2 size={18} /> : <LogOut size={18} />}
                        {currentState.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '40px', padding: '25px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '800', color: '#1e40af' }}>Acciones Rápidas</h3>
                    {currentState === 'En Campus' ? (
                      <button 
                        onClick={() => setShowExitModal(true)}
                        className="btn-premium" 
                        style={{ width: '100%', background: '#dc2626', color: 'white', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}
                      >
                        <LogOut size={22} /> Registrar Salida del Campus
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction('ENTRY')}
                        className="btn-premium" 
                        style={{ width: '100%', background: '#059669', color: 'white', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}
                      >
                        <LogIn size={22} /> Registrar Retorno (Ingreso)
                      </button>
                    )}
                  </div>

                  {/* Daily Log */}
                  <div style={{ marginTop: '40px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#64748b" /> Movimientos del Día
                    </h3>
                    
                    {studentLogs.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                        No hay salidas ni retornos registrados para hoy.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {studentLogs.map((log) => (
                          <div key={log.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <div style={{ width: '1px', height: '40px', background: '#e2e8f0' }}></div>
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                {log.type === 'EXIT' ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '800', color: '#dc2626', background: '#fee2e2', padding: '4px 10px', borderRadius: '6px' }}>
                                    <LogOut size={14} /> SALIDA
                                  </span>
                                ) : (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '800', color: '#059669', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                                    <LogIn size={14} /> RETORNO
                                  </span>
                                )}
                              </div>
                              {log.reason && <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#64748b' }}>Motivo: {log.reason}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '24px', border: '2px dashed #cbd5e1' }}
                >
                  <ArrowRightLeft size={60} color="#cbd5e1" style={{ marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#64748b' }}>Seleccione un Estudiante</h2>
                  <p style={{ color: '#94a3b8', maxWidth: '300px', textAlign: 'center' }}>
                    Busque un estudiante en la lista de la izquierda para registrar sus entradas y salidas del campus.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        )}

        {/* Tab 2: Pricing Info */}
        {activeTab === 'info' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '25px', borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={24} color="#1e40af" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Consulta Rápida de Precios 2026</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Información institucional general para atender llamadas e inquietudes de prospectos.</p>
                </div>
              </div>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Buscar programa o producto..." 
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 15px 0 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 25px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Código</th>
                    <th style={{ padding: '16px 25px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Nombre del Producto / Programa</th>
                    <th style={{ padding: '16px 25px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Valor Fijo</th>
                    <th style={{ padding: '16px 25px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productos
                    .filter(p => p.status === 'Activo' && (p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.id.includes(searchProduct)))
                    .map((prod, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 25px', fontWeight: '700', color: '#94a3b8' }}>{prod.id}</td>
                      <td style={{ padding: '16px 25px', fontWeight: '700', color: '#1e293b' }}>{prod.name}</td>
                      <td style={{ padding: '16px 25px', color: '#16a34a', fontWeight: '800', fontSize: '14px' }}>
                        $ {Number(prod.price).toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '16px 25px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#dcfce7', color: '#059669', fontSize: '12px', fontWeight: '800' }}>
                          Disponible
                        </span>
                      </td>
                    </tr>
                  ))}
                  {productos.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        No hay productos comerciales registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Materials & Books */}
        {activeTab === 'materiales' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
              <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={28} color="#4338ca" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Inventario en Sede</p>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>1,240</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4338ca', fontWeight: '700' }}>+150 recibidos hoy</p>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={28} color="#059669" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Módulos Entregados</p>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>856</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#059669', fontWeight: '700' }}>Alumnos al día</p>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={28} color="#dc2626" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Faltan por Recoger</p>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>384</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#dc2626', fontWeight: '700' }}>Padres notificados</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Registro de Entregas</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Buscar estudiante para registrar la entrega física de sus módulos.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Búsqueda rápida por nombre..." 
                    style={{ width: '100%', height: '40px', padding: '0 15px 0 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto', padding: '20px' }}>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', margin: '40px 0' }}>
                  <Package size={40} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                  Escriba el nombre del estudiante para registrar la entrega de su kit escolar.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal for Exit Reason */}
      <AnimatePresence>
        {showExitModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ width: '450px', background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={24} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Registrar Salida</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{selectedStudent?.name}</p>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>Especifique el Motivo:</label>
                <select 
                  value={exitReason} 
                  onChange={(e) => setExitReason(e.target.value)}
                  style={{ width: '100%', height: '50px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 15px', fontSize: '14px', background: '#f8fafc', marginBottom: exitReason === 'Otro' ? '15px' : '0' }}
                >
                  <option value="">Seleccione una opción...</option>
                  <option value="Cita Médica">Cita Médica</option>
                  <option value="Calamidad Doméstica / Familiar">Calamidad Doméstica / Familiar</option>
                  <option value="Autorizado por Coordinación">Autorizado por Coordinación</option>
                  <option value="Otro">Otro (Especificar)</option>
                </select>

                {exitReason === 'Otro' && (
                  <input 
                    type="text"
                    placeholder="Escriba el motivo detallado..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    autoFocus
                    style={{ width: '100%', height: '50px', borderRadius: '12px', border: '1px solid #3b82f6', padding: '0 15px', fontSize: '14px', boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)', outline: 'none' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => { setShowExitModal(false); setExitReason(''); }}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmExit}
                  disabled={!exitReason || (exitReason === 'Otro' && !customReason)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: (!exitReason || (exitReason === 'Otro' && !customReason)) ? '#cbd5e1' : '#dc2626', color: 'white', fontWeight: '800', cursor: (!exitReason || (exitReason === 'Otro' && !customReason)) ? 'not-allowed' : 'pointer' }}
                >
                  Confirmar Salida
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Scanner Modal */}
      <AnimatePresence>
        {isScannerActive && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ width: '400px', background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={20} color="#1e40af" /> Escanear Carnet
                </h3>
                <button onClick={stopScanner} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
                </button>
              </div>
              
              <div id="reception-reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px solid #3b82f6' }}></div>
              
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '15px' }}>
                Coloque el código QR del carnet frente a la cámara.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
