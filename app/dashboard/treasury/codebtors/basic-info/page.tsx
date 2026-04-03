'use client';
import DashboardLayout from '@/components/DashboardLayout';
import SearchableBarrioInput from '@/components/SearchableBarrioInput';
import { Search, Eye, ChevronRight, ChevronLeft, Plus, ChevronDown, X, MapPin, Save, UserCheck, Phone, Mail, Trash2, Calendar } from 'lucide-react';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ALL_CITIES } from '@/lib/colombiaData';
import { TIPOS_IDENTIFICACION, GENEROS } from '@/lib/institutionalParams';
import { db } from '@/lib/db';

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
        <input className="input-premium" style={{ width: '100%', paddingRight: '36px', fontSize: '13px', height: '42px', borderRadius: '12px', background: '#f8fafc' }}
          value={value} onChange={e => { onChange(e.target.value); setShow(true); }} onFocus={() => setShow(true)} placeholder={placeholder} />
        <Search size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      </div>
      {show && value.length > 0 && (
        <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '8px', padding: '8px', maxHeight: '240px', overflowY: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}>
          {filtered.length > 0 ? filtered.map((city, i) => (
            <div key={i} onClick={() => { onSelect(city); setShow(false); }}
              style={{ padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#1e293b', fontWeight: '500', transition: '0.2s' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#1e293b';
              }}>
              <MapPin size={14} />{city.label}
            </div>
          )) : <div style={{ padding: '12px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Sin resultados found</div>}
        </div>
      )}
    </div>
  );
};

function CodebtorsBasicInfoContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [codebtors, setCodebtors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState<Record<string, string>>({
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    tipoId: '', numeroId: '', sexo: '', correo: '', telefono: '', celular: '',
    fechaNacimiento: '', direccion: '', tipoCodeudor: '', institucion: ''
  });
  const [residencia, setResidencia] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [barrio, setBarrio] = useState('');
  const [lugarNac, setLugarNac] = useState('');

  useEffect(() => {
    loadCodebtors();
  }, []);

  const loadCodebtors = async () => {
    setIsLoading(true);
    try {
      const data = await db.list('codebtors');
      setCodebtors(data);
    } catch (error) {
      console.error('Error loading codebtors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('openModal') === 'true') setShowModal(true);
  }, [searchParams]);

  const handleSave = async () => {
    if (!form.primerNombre || !form.primerApellido || !form.numeroId) {
      alert('Complete los campos obligatorios (*)');
      return;
    }
    const name = `${form.primerNombre} ${form.segundoNombre} ${form.primerApellido} ${form.segundoApellido}`.trim().replace(/\s+/g, ' ');
    const newCodebtor = {
      id: form.numeroId,
      name: name.toUpperCase(),
      type: 'Codeudor',
      tipoCodeudor: form.tipoCodeudor || 'Externo',
      isActive: true,
      correo: form.correo,
      telefono: form.celular,
      residenceCity: residencia,
      barrio,
      registrationDate: new Date().toISOString(),
      details: { ...form, lugarNacimiento: lugarNac, residence: residencia, barrio },
    };

    try {
      const docId = await db.create('codebtors', newCodebtor);
      setCodebtors(prev => [{ ...newCodebtor, _docId: docId }, ...prev]);
      setRegisterSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setRegisterSuccess(false);
        setForm({ primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '', tipoId: '', numeroId: '', sexo: '', correo: '', telefono: '', celular: '', fechaNacimiento: '', direccion: '', tipoCodeudor: '', institucion: '' });
        setResidencia(''); setBarrio(''); setLugarNac(''); setSelectedCity(null);
      }, 1500);
    } catch (error) {
       console.error('Error saving codebtor:', error);
       alert('Error al registrar el codeudor.');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!docId) return;
    if (window.confirm('¿Está seguro de eliminar este codeudor?')) {
      try {
        await db.delete('codebtors', docId);
        setCodebtors(prev => prev.filter(c => c._docId !== docId && c.id !== docId));
      } catch (error) {
        console.error('Error deleting codebtor:', error);
      }
    }
  };

  const fld = (key: string, label: string, required: boolean = false) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
      <input className="input-premium" style={{ width: '100%', fontSize: '14px', height: '48px', borderRadius: '14px', background: '#f8fafc', fontWeight: '600', border: '1px solid #e2e8f0' }}
        value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  const sel = (key: string, label: string, options: string[], required: boolean = false) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
      <div style={{ position: 'relative' }}>
        <select className="input-premium" style={{ width: '100%', appearance: 'none', fontSize: '14px', height: '48px', borderRadius: '14px', background: '#f8fafc', fontWeight: '600', border: '1px solid #e2e8f0' }}
          value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
          <option value="">Seleccione</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
      </div>
    </div>
  );

  const filteredItems = codebtors.filter((s: any) => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.id || '').includes(searchTerm);
    const matchesActive = includeInactive || s.isActive !== false;
    return matchesSearch && matchesActive;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.2)' }}>
              <UserCheck size={28} />
           </div>
           <div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>Gestión de Codeudores</h1>
             <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>Administración de información básica y solvencia de garantes</p>
           </div>
        </div>
        <button
          className="btn-premium"
          style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer', padding: '12px 28px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> Registrar Codeudor
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
           <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
           <input 
             type="text" 
             placeholder="Buscar por nombre o identificación..." 
             className="input-premium"
             style={{ width: '100%', height: '52px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', paddingLeft: '52px', outline: 'none', fontSize: '14px' }}
             value={searchTerm} 
             onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
           />
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0 20px', color: '#1e293b', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronDown size={16} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} /> Filtros Avanzados
        </button>
      </div>

      {showAdvanced && (
        <div className="glass-panel" style={{ marginBottom: '24px', padding: '24px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', animation: 'fadeIn 0.2s ease-out' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', color: '#475569' }}>
            <input type="checkbox" style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid #cbd5e1' }} checked={includeInactive} onChange={(e) => { setIncludeInactive(e.target.checked); setCurrentPage(1); }} />
            Mostrar registros inactivos / históricos
          </label>
        </div>
      )}

      <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
             <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
             <p style={{ marginTop: '16px', fontWeight: '800', color: '#64748b', fontSize: '14px' }}>Cargando base de datos de codeudores...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Codeudor</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificación</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto</th>
                <th style={{ textAlign: 'center', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((s: any) => (
                <tr key={s.id} className="table-row" style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', position: 'relative' }}>
                          <UserCheck size={20} />
                          {s.isActive !== false && <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }} />}
                       </div>
                       <div>
                          <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '14px' }}>{s.name.toUpperCase()}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginTop: '2px' }}>{s.tipoCodeudor || 'Externo'}</div>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                    {s.id}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                          <Phone size={12} /> {s.telefono || 'Sin registro'}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                          <Mail size={12} /> {s.correo || 'N/A'}
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                     <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <Link href={`/dashboard/treasury/codebtors/basic-info/${s.id}`}>
                           <button title="Ver detalles" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Eye size={18} />
                           </button>
                        </Link>
                        <button onClick={() => handleDelete(s._docId || s.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff1f2', color: '#e11d48', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', margin: '0 auto 24px', border: '1px solid #f1f5f9' }}>
               <Search size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0' }}>Bandeja vacía</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', maxWidth: '300px', margin: '0 auto' }}>
              No se han encontrado codeudores registrados bajo los criterios de búsqueda actuales.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#64748b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={20} />
              </button>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#64748b' }}>Página {currentPage} de {totalPages}</div>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#64748b', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.45)', animation: 'modalSlide 0.3s ease-out' }}>
            <div style={{ background: '#2563eb', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                     <UserCheck size={20} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white' }}>Ficha de Registro de Codeudor</h2>
               </div>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={26} /></button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '32px' }}>
              {registerSuccess ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ background: '#f0fdf4', color: '#10b981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.2)' }}>
                    <UserCheck size={40} />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 12px' }}>¡Registro Completo!</h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '16px', fontWeight: '500' }}>La información del codeudor ha sido guardada en Firestore.</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #2563eb', marginBottom: '24px' }}>
                     <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: '600' }}>Ingrese los datos personales y de ubicación para la verificación de solvencia.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {fld('primerNombre', 'Primer nombre', true)}
                    {fld('segundoNombre', 'Segundo nombre')}
                    {fld('primerApellido', 'Primer apellido', true)}
                    {fld('segundoApellido', 'Segundo apellido')}
                    {sel('tipoId', 'Tipo de identificación', TIPOS_IDENTIFICACION, true)}
                    {fld('numeroId', 'Número de identificación', true)}
                    {sel('sexo', 'Sexo', GENEROS, true)}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
                      <input type="email" className="input-premium" style={{ width: '100%', fontSize: '14px', height: '48px', borderRadius: '14px', background: '#f8fafc', fontWeight: '600', border: '1px solid #e2e8f0' }}
                        value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} />
                    </div>
                    {fld('telefono', 'Teléfono')}
                    {fld('celular', 'Celular', true)}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Fecha de nacimiento</label>
                      <input type="date" className="input-premium" style={{ width: '100%', fontSize: '14px', height: '48px', borderRadius: '14px', background: '#f8fafc', fontWeight: '600', border: '1px solid #e2e8f0' }}
                        value={form.fechaNacimiento} onChange={e => setForm(p => ({ ...p, fechaNacimiento: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Lugar de nacimiento</label>
                      <SearchableCityInput value={lugarNac} onChange={setLugarNac} onSelect={c => setLugarNac(c.label)} placeholder="Municipio..." />
                    </div>
                    {fld('direccion', 'Dirección Residencial')}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Lugar de residencia</label>
                      <SearchableCityInput value={residencia} onChange={setResidencia} onSelect={c => { setResidencia(c.label); setSelectedCity(c); }} placeholder="Municipio..." />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Barrio</label>
                      <SearchableBarrioInput city={selectedCity ? selectedCity.name : ''} value={barrio} onChange={setBarrio} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {!registerSuccess && (
              <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: '#f8fafc' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 28px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleSave} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)' }}>Aceptar y Guardar</button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .input-premium:focus { border-color: #2563eb !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important; background: white !important; }
        .table-row:hover { background-color: #f8fafc !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalSlide { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </DashboardLayout>
  );
}

export default function CodebtorsBasicInfoPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>
       <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
    </div>}>
      <CodebtorsBasicInfoContent />
    </Suspense>
  );
}
