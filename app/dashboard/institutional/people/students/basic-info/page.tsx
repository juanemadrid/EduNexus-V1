'use client';
import DashboardLayout from '@/components/DashboardLayout';
import SearchableBarrioInput from '@/components/SearchableBarrioInput';
import { motion, AnimatePresence } from 'framer-motion';

import { Search, Eye, ChevronRight, ChevronLeft, Plus, ChevronDown, X, MapPin, Save, BarChart3, Download, Check, UserPlus, FileText, ClipboardList, Filter } from 'lucide-react';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ALL_CITIES, BARRIOS_BY_CITY } from '@/lib/colombiaData';
import { PERIODOS, TIPOS_IDENTIFICACION, GENEROS, SEDES_JORNADAS } from '@/lib/institutionalParams';

import { db } from '@/lib/db';
import { defaultFirebaseConfig } from '@/lib/db/defaultConfig';

const normalizeString = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const SearchableCityInput = ({ value, onChange, onSelect, placeholder }: {
  value: string, onChange: (v: string) => void, onSelect: (c: any) => void, placeholder: string
}) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const q = normalizeString(value);
  const filtered = ALL_CITIES.filter(c => normalizeString(c.label).includes(q)).sort((a, b) => {
    const aS = normalizeString(a.label).startsWith(q);
    const bS = normalizeString(b.label).startsWith(q);
    return aS && !bS ? -1 : !aS && bS ? 1 : normalizeString(a.label).localeCompare(normalizeString(b.label));
  }).slice(0, 8);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input className="input-premium" style={{ width: '100%', paddingRight: '40px', fontSize: '13.5px', height: '44px', borderRadius: '12px' }}
          value={value} onChange={e => { onChange(e.target.value); setShow(true); }} onFocus={() => setShow(true)} placeholder={placeholder} />
        <MapPin size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
      </div>
      <AnimatePresence>
        {show && value.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: '8px', padding: '10px', maxHeight: '240px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', background: 'white', borderRadius: '16px' }}>
            {filtered.length > 0 ? filtered.map((city, i) => (
              <div key={i} onClick={() => { onSelect(city); setShow(false); }}
                style={{ padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <MapPin size={14} style={{ color: 'var(--primary)' }} />{city.label}
              </div>
            )) : <div style={{ padding: '12px', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>Sin resultados</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function BasicInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [localStudents, setLocalStudents] = useState<any[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState<Record<string, string>>({
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    tipoId: '', numeroId: '', sexo: '', correo: '', telefono: '', celular: '',
    fechaNacimiento: '', direccion: '', periodo: '', sedeJornada: '', programa: '', condicionMatricula: ''
  });
  const [residencia, setResidencia] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [barrio, setBarrio] = useState('');
  const [lugarNac, setLugarNac] = useState('');

  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [allRequirements, setAllRequirements] = useState<any[]>([]);
  const [reqStatus, setReqStatus] = useState<Record<string, Record<string, string>>>({});
  const [enrollmentConditions, setEnrollmentConditions] = useState<any[]>([]);

  useEffect(() => {
    db.list('enrollment_requirements').then(setAllRequirements);
    db.list('student_requirements_status').then((data: any[]) => {
      const merged = data.reduce((acc, curr) => ({ ...acc, ...curr.status || {} }), {});
      setReqStatus(merged);
    });
    db.list('enrollment_conditions').then(data => setEnrollmentConditions(data.filter((c:any) => c.isActive)));
  }, []);

  const handleToggleRequirement = async (reqId: string) => {
    if (!selectedStudent) return;
    
    const currentStatus = reqStatus[selectedStudent.id] || {};
    const newStatusVal = currentStatus[reqId] === 'Entregado' ? 'Faltante' : 'Entregado';
    
    const updatedStatus = {
      ...currentStatus,
      [reqId]: newStatusVal
    };
    
    const newReqStatus = {
      ...reqStatus,
      [selectedStudent.id]: updatedStatus
    };
    
    setReqStatus(newReqStatus);
    await db.update('student_requirements_status', selectedStudent.id, { status: updatedStatus });
  };

  const fetchStudents = async () => {
    try {
      const students = await db.list<any>('students');
      setLocalStudents(students);
    } catch (error) {
      console.error("Error fetching students from Firestore:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchParams.get('openModal') === 'true') setShowModal(true);
  }, [searchParams]);

  const handleSave = () => {
    if (!form.primerNombre || !form.primerApellido || !form.numeroId || !form.condicionMatricula) {
      alert('Complete los campos obligatorios (*) incluyendo la Condición de Matrícula.');
      return;
    }
    const name = `${form.primerNombre} ${form.segundoNombre} ${form.primerApellido} ${form.segundoApellido}`.trim().replace(/\s+/g, ' ');
    const newStudent = {
      id: form.numeroId,
      name: name.toUpperCase(),
      type: 'Estudiante',
      isActive: true,
      isEnrolled: false,
      enrollmentCondition: form.condicionMatricula,
      correo: form.correo,
      telefono: form.celular,
      residenceCity: residencia,
      barrio,
      registrationDate: new Date().toISOString(),
      details: { ...form, lugarNacimiento: lugarNac, residence: residencia, barrio },
    };
    
    db.create('students', newStudent).then(() => {
      fetchStudents();
      setRegisterSuccess(true);
    }).catch(err => {
       console.error("Error saving student to Firestore:", err);
       alert("Error al guardar en la base de datos.");
    });
    setTimeout(() => {
      setShowModal(false);
      setRegisterSuccess(false);
      setForm({ primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '', tipoId: '', numeroId: '', sexo: '', correo: '', telefono: '', celular: '', fechaNacimiento: '', direccion: '', periodo: '', sedeJornada: '', programa: '', condicionMatricula: '' });
      setResidencia(''); setBarrio(''); setLugarNac(''); setSelectedCity(null);
    }, 1500);
  };

  const fld = (key: string, label: string) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>{label}</label>
      <input className="input-premium" style={{ width: '100%', fontSize: '14px', height: '44px', borderRadius: '14px', background: '#f8fafc' }}
        value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  const sel = (key: string, label: string, options: string[]) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>{label}</label>
      <select className="input-premium" style={{ width: '100%', appearance: 'none', fontSize: '14px', height: '44px', borderRadius: '14px', background: '#f8fafc' }}
        value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
        <option value="">Seleccione</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  const filteredStudents = localStudents.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
    const matchesActive = includeInactive || s.isActive !== false;
    return matchesSearch && matchesActive;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentItems = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      {/* Elite Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' }}>Información Básica</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>Directorio maestro y gestión de estudiantes</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button
            className="btn-premium"
            style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '16px', fontSize: '14.5px', fontWeight: '900', boxShadow: '0 15px 30px -10px rgba(var(--primary-rgb), 0.5)' }}
            onClick={() => setShowModal(true)}
          >
            <UserPlus size={20} /> Registrar Estudiante
          </button>
        </motion.div>
      </div>

      {/* Elite Filter Bar */}
      <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Buscar por nombre o documento..." className="input-premium"
              style={{ paddingLeft: '54px', height: '54px', background: '#f8fafc', width: '100%', fontSize: '15px', borderRadius: '18px' }}
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={() => setShowAdvanced(!showAdvanced)} className="btn-premium" style={{ height: '54px', padding: '0 20px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}>
               <Filter size={18} /> Filtros {showAdvanced && <Check size={14} color="var(--primary)" />}
             </button>
             <button className="btn-premium" style={{ height: '54px', padding: '0 24px', background: '#1e293b', color: 'white', borderRadius: '18px', fontWeight: '800' }}>Buscar Alumno</button>
          </div>
        </div>
        
        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                  <input type="checkbox" className="custom-checkbox" checked={includeInactive} onChange={(e) => { setIncludeInactive(e.target.checked); setCurrentPage(1); }} />
                  Ver estudiantes inactivos
                </label>
                <Link href="/dashboard/reports" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '14px' }}>
                   <BarChart3 size={18} /> Panel de Reportes Estadísticos
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Elite Results Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ textAlign: 'left', padding: '20px 32px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Estudiante / Aspirante</th>
              <th style={{ textAlign: 'left', padding: '20px 32px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Documento</th>
              <th style={{ textAlign: 'left', padding: '20px 32px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Categoría</th>
              <th style={{ textAlign: 'center', padding: '20px 32px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Gestión</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {currentItems.length > 0 ? (
              currentItems.map((s: any, idx: number) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  key={s.id} 
                  style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}
                  className="table-row-premium"
                >
                  <td style={{ padding: '18px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>
                         {s.name.charAt(0)}
                       </div>
                       <div>
                         <p style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '14.5px' }}>{s.name.toUpperCase()}</p>
                         <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Sistema Validado</p>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 32px', fontSize: '14px', color: '#475569', fontWeight: '700' }}>{s.id}</td>
                  <td style={{ padding: '18px 32px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: s.isActive ? '#10b981' : '#ef4444', background: s.isActive ? '#ecfdf5' : '#fef2f2', padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {s.type || 'Estudiante'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <Link href={`/dashboard/institutional/people/students/basic-info/${s.id}`}>
                        <button title="Expediente" className="action-btn-premium" style={{ color: '#6366f1' }}>
                          <Eye size={20} />
                        </button>
                      </Link>
                      <button 
                        title="Requisitos" 
                        className="action-btn-premium"
                        style={{ color: '#10b981' }}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowRequirementsModal(true);
                        }}
                      >
                        <ClipboardList size={20} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '120px 32px', textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Search size={48} style={{ color: '#e2e8f0', marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px' }}>Directorio Vacío</h3>
                    <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>No se encontraron coincidencias en la base de datos institucional.</p>
                  </motion.div>
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
        
        <div style={{ padding: '24px 32px', borderTop: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Mostrando resultados del <span style={{color:'#1e293b'}}>{(currentPage - 1) * itemsPerPage + 1} al {Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span></p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="page-btn-premium">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`page-btn-premium ${currentPage === page ? 'active' : ''}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="page-btn-premium">
                <ChevronRight size={18} />
              </button>
            </div>
        </div>
      </div>

      {/* Elite Requirements Modal */}
      <AnimatePresence>
      {showRequirementsModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7, 11, 20, 0.4)', backdropFilter: 'blur(12px)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '640px', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#10b981', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>Requisitos de Matrícula</h2>
                 <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Validación de documentos para {selectedStudent.name}</p>
               </div>
               <button onClick={() => setShowRequirementsModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '40px', overflowY: 'auto', maxHeight: '55vh' }} className="custom-scrollbar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {allRequirements.map((req: any) => {
                  const isChecked = (reqStatus[selectedStudent.id] || {})[req.id] === 'Entregado';
                  return (
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      key={req.id} 
                      onClick={() => handleToggleRequirement(req.id)}
                      style={{ padding: '18px 24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', background: isChecked ? '#f0fdf4' : '#f8fafc', transition: '0.3s' }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '10px', border: isChecked ? 'none' : '2px solid #cbd5e1', background: isChecked ? '#10b981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        {isChecked && <Check size={18} strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>{req.nombre}</div>
                        {req.descripcion && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>{req.descripcion}</div>}
                      </div>
                      {req.obligatorio && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '24px 40px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
               <button onClick={() => setShowRequirementsModal(false)} className="btn-premium" style={{ background: '#1e293b', color: 'white', padding: '14px 40px', borderRadius: '16px', fontWeight: '900', border: 'none' }}>Cerrar y Sincronizar</button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Elite Registration Modal */}
      <AnimatePresence>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7, 11, 20, 0.4)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} style={{ background: 'white', borderRadius: '40px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'var(--primary)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                 <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'white', letterSpacing: '-1.5px' }}>Formulario de Admisión</h2>
                 <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Registro maestro de nuevo estudiante</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '48px' }} className="custom-scrollbar">
              {registerSuccess ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 20px 40px -10px rgba(16,185,129,0.3)' }}>
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px', letterSpacing: '-1px' }}>¡Registro Exitoso!</h3>
                  <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '600' }}>El perfil ha sido encriptado y guardado en la base de datos.</p>
                </motion.div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {fld('primerNombre', 'Primer nombre *')}
                  {fld('segundoNombre', 'Segundo nombre')}
                  {fld('primerApellido', 'Primer apellido *')}
                  {fld('segundoApellido', 'Segundo apellido')}
                  {sel('tipoId', 'Tipo de identificación *', TIPOS_IDENTIFICACION)}
                  {fld('numeroId', 'N° Identificación *')}
                  {sel('sexo', 'Sexo biológico *', GENEROS)}
                  {sel('condicionMatricula', 'Estado de Admisión *', enrollmentConditions.map((c:any) => c.name))}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>Correo Electrónico *</label>
                    <input type="email" className="input-premium" style={{ width: '100%', fontSize: '14px', height: '44px', borderRadius: '14px', background: '#f8fafc' }}
                      value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} />
                  </div>
                  {fld('celular', 'Celular de contacto *')}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>Fecha de Nacimiento *</label>
                    <input type="date" className="input-premium" style={{ width: '100%', fontSize: '14px', height: '44px', borderRadius: '14px', background: '#f8fafc' }}
                      value={form.fechaNacimiento} onChange={e => setForm(p => ({ ...p, fechaNacimiento: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>Lugar de Residencia</label>
                    <SearchableCityInput value={residencia} onChange={setResidencia} onSelect={c => { setResidencia(c.label); setSelectedCity(c); }} placeholder="Buscar municipio..." />
                  </div>
                </div>
              )}
            </div>

            {!registerSuccess && (
              <div style={{ padding: '32px 48px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '16px 32px', borderRadius: '18px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
                <button onClick={handleSave} className="btn-premium" style={{ background: 'var(--primary)', color: 'white', padding: '16px 40px', borderRadius: '18px', fontWeight: '900', border: 'none', boxShadow: '0 10px 25px -5px rgba(var(--primary-rgb), 0.4)' }}>Guardar Estudiante</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      <style jsx global>{`
        .table-row-premium:hover { background: #fbfcfe !important; }
        .action-btn-premium { background: #f1f5f9; padding: 10px; border-radius: 12px; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .action-btn-premium:hover { transform: scale(1.1) translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); background: white; }
        .page-btn-premium { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #475569; fontWeight: 800; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .page-btn-premium:hover { border-color: var(--primary); color: var(--primary); }
        .page-btn-premium.active { background: var(--primary); color: white; border: none; box-shadow: 0 10px 20px -5px rgba(var(--primary-rgb), 0.4); }
        .custom-checkbox { width: 22px; height: 22px; cursor: pointer; accent-color: var(--primary); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </DashboardLayout>
  );
}

export default function BasicInfoPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', fontWeight: '800', color: '#94a3b8' }}>Sincronizando con base de datos...</div>}>
      <BasicInfoContent />
    </Suspense>
  );
}
