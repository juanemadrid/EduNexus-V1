'use client';
import DashboardLayout from '@/components/DashboardLayout';
import SearchableBarrioInput from '@/components/SearchableBarrioInput';

import { Search, Eye, ChevronRight, ChevronLeft, Plus, ChevronDown, X, MapPin, Save, BarChart3, Download, Check } from 'lucide-react';
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
        <input className="input-premium" style={{ width: '100%', paddingRight: '36px', fontSize: '13px', height: '38px' }}
          value={value} onChange={e => { onChange(e.target.value); setShow(true); }} onFocus={() => setShow(true)} placeholder={placeholder} />
        <Search size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
      </div>
      {show && value.length > 0 && (
        <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: '4px', padding: '6px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          {filtered.length > 0 ? filtered.map((city, i) => (
            <div key={i} onClick={() => { onSelect(city); setShow(false); }}
              style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <MapPin size={12} style={{ color: 'var(--primary)' }} />{city.label}
            </div>
          )) : <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-dim)' }}>Sin resultados</div>}
        </div>
      )}
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
    fechaNacimiento: '', direccion: '', periodo: '', sedeJornada: '', programa: '',
  });
  const [residencia, setResidencia] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [barrio, setBarrio] = useState('');
  const [lugarNac, setLugarNac] = useState('');

  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [allRequirements, setAllRequirements] = useState<any[]>([]);
  const [reqStatus, setReqStatus] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    // Load requirements and statuses
    const savedReqs = localStorage.getItem('edunexus_enrollment_requirements');
    if (savedReqs) setAllRequirements(JSON.parse(savedReqs));

    const savedStatus = localStorage.getItem('edunexus_student_requirements_status');
    if (savedStatus) setReqStatus(JSON.parse(savedStatus));
  }, []);

  const handleToggleRequirement = (reqId: string) => {
    if (!selectedStudent) return;
    
    const currentStatus = reqStatus[selectedStudent.id] || {};
    const newStatusVal = currentStatus[reqId] === 'Entregado' ? 'Faltante' : 'Entregado';
    
    const updatedStatus = {
      ...reqStatus,
      [selectedStudent.id]: {
        ...currentStatus,
        [reqId]: newStatusVal
      }
    };
    
    setReqStatus(updatedStatus);
    localStorage.setItem('edunexus_student_requirements_status', JSON.stringify(updatedStatus));
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

  // Auto-open modal from register link redirect
  useEffect(() => {
    if (searchParams.get('openModal') === 'true') setShowModal(true);
  }, [searchParams]);

  const handleSave = () => {
    if (!form.primerNombre || !form.primerApellido || !form.numeroId) {
      alert('Complete los campos obligatorios (*)');
      return;
    }
    const name = `${form.primerNombre} ${form.segundoNombre} ${form.primerApellido} ${form.segundoApellido}`.trim().replace(/\s+/g, ' ');
    const newStudent = {
      id: form.numeroId,
      name: name.toUpperCase(),
      type: 'Estudiante',
      isActive: true,
      isEnrolled: false,
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
       alert("Error al guardar: Verifique si habilitó Cloud Firestore en la consola.");
    });
    setTimeout(() => {
      setShowModal(false);
      setRegisterSuccess(false);
      setForm({ primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '', tipoId: '', numeroId: '', sexo: '', correo: '', telefono: '', celular: '', fechaNacimiento: '', direccion: '', periodo: '', sedeJornada: '', programa: '' });
      setResidencia(''); setBarrio(''); setLugarNac(''); setSelectedCity(null);
    }, 1500);
  };

  const fld = (key: string, label: string) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>{label}</label>
      <input className="input-premium" style={{ width: '100%', fontSize: '13px', height: '38px' }}
        value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  const sel = (key: string, label: string, options: string[]) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>{label}</label>
      <select className="input-premium" style={{ width: '100%', appearance: 'none', fontSize: '13px', height: '38px' }}
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
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Información básica</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión y consulta de datos generales de estudiantes</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn-premium"
            style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> Registrar Estudiante
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input type="text" placeholder="Buscar personas..." className="input-premium"
              style={{ paddingLeft: '48px', height: '48px', background: 'white', width: '100%' }}
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white' }}>Buscar</button>
          <button 
            className="btn-premium" 
            style={{ height: '48px', padding: '0 20px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => router.push('/dashboard/reports')}
          >
            <BarChart3 size={18} /> Informes
          </button>
          <button 
            className="btn-premium" 
            style={{ height: '48px', padding: '0 20px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={18} /> Exportar
          </button>
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>
        {showAdvanced && (
          <div style={{ marginTop: '20px', padding: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '30px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#374151' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px' }} checked={includeInactive} onChange={(e) => { setIncludeInactive(e.target.checked); setCurrentPage(1); }} />
              ¿Incluir inactivos?
            </label>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Nombre completo</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>N° Identificación</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Tipo</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  <td style={{ padding: '14px 24px', color: '#2563eb', fontWeight: '700', fontSize: '14px' }}>{s.name.toUpperCase()}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>{s.id}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#64748b' }}>{s.type || 'Estudiante'}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <Link href={`/dashboard/students/basic-info/${s.id}`}>
                        <button title="Ver detalles" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                          <Eye size={20} />
                        </button>
                      </Link>
                      <button 
                        title="Requisitos de Matrícula" 
                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowRequirementsModal(true);
                        }}
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '100px 40px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#f3f4f6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <Search size={40} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>No se encontraron estudiantes</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Intente con otros términos o verifique los filtros.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#6b7280', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: currentPage === page ? 'var(--primary)' : 'white', color: currentPage === page ? 'white' : '#6b7280', fontWeight: '700', cursor: 'pointer', border: currentPage === page ? 'none' : '1px solid #e5e7eb' }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#6b7280', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ REQUIREMENTS MODAL ━━━━━━━━━━ */}
      {showRequirementsModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#10b981', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white' }}>Requisitos de Matrícula</h2>
                 <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{selectedStudent.name}</p>
               </div>
               <button onClick={() => setShowRequirementsModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            
            <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '60vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allRequirements.length > 0 ? allRequirements.map((req: any) => {
                  const isChecked = (reqStatus[selectedStudent.id] || {})[req.id] === 'Entregado';
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => handleToggleRequirement(req.id)}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px', 
                        cursor: 'pointer',
                        background: isChecked ? '#f0fdf4' : 'white',
                        transition: '0.2s'
                      }}
                    >
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '6px', 
                        border: isChecked ? 'none' : '2px solid #cbd5e1', 
                        background: isChecked ? '#10b981' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {isChecked && <Check size={16} strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{req.nombre}</div>
                        {req.descripcion && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{req.descripcion}</div>}
                      </div>
                      {req.obligatorio && (
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>*</span>
                      )}
                    </div>
                  );
                }) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No hay requisitos definidos en el sistema.
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#fafafa' }}>
               <button 
                 onClick={() => setShowRequirementsModal(false)} 
                 style={{ padding: '10px 32px', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', border: 'none' }}
               >
                 Aceptar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━ FLOATING REGISTRATION MODAL ━━━━━━━━━━ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            {/* Modal Header */}
            <div style={{ background: 'var(--primary)', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>Registrar estudiante</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={22} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '28px' }}>
              {registerSuccess ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div style={{ background: '#ecfdf5', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Save size={32} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>¡Registro Exitoso!</h3>
                  <p style={{ color: '#64748b', margin: 0 }}>El estudiante ha sido guardado correctamente.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {fld('primerNombre', 'Primer nombre *')}
                  {fld('segundoNombre', 'Segundo nombre')}
                  {fld('primerApellido', 'Primer apellido *')}
                  {fld('segundoApellido', 'Segundo apellido')}
                  {sel('tipoId', 'Tipo de identificación *', TIPOS_IDENTIFICACION)}
                  {fld('numeroId', 'Número de identificación *')}
                  {sel('sexo', 'Sexo *', GENEROS)}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Correo electrónico *</label>
                    <input type="email" className="input-premium" style={{ width: '100%', fontSize: '13px', height: '38px' }}
                      value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} />
                  </div>
                  {fld('telefono', 'Teléfono *')}
                  {fld('celular', 'Celular *')}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Fecha de nacimiento *</label>
                    <input type="date" className="input-premium" style={{ width: '100%', fontSize: '13px', height: '38px' }}
                      value={form.fechaNacimiento} onChange={e => setForm(p => ({ ...p, fechaNacimiento: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Lugar de nacimiento</label>
                    <SearchableCityInput value={lugarNac} onChange={setLugarNac} onSelect={c => setLugarNac(c.label)} placeholder="Escriba el municipio..." />
                  </div>
                  {fld('direccion', 'Dirección')}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Lugar de residencia</label>
                    <SearchableCityInput value={residencia} onChange={setResidencia} onSelect={c => { setResidencia(c.label); setSelectedCity(c); }} placeholder="Escriba el municipio..." />
                  </div>
                                    <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Barrio</label>
                    <SearchableBarrioInput city={selectedCity ? selectedCity.name : ''} value={barrio} onChange={setBarrio} />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!registerSuccess && (
              <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fafafa', borderRadius: '0 0 20px 20px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
                <button onClick={handleSave} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Aceptar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function BasicInfoPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Cargando información básica de estudiantes...</div>}>
      <BasicInfoContent />
    </Suspense>
  );
}
