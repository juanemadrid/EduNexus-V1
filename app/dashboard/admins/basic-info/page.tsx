'use client';
import DashboardLayout from '@/components/DashboardLayout';
import SearchableBarrioInput from '@/components/SearchableBarrioInput';

import { Search, Eye, ChevronRight, ChevronLeft, Plus, ChevronDown, X, MapPin, Save } from 'lucide-react';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ALL_CITIES } from '@/lib/colombiaData';
import { TIPOS_IDENTIFICACION, GENEROS } from '@/lib/institutionalParams';

const MAX_ADMINS = 2;

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

function AdminBasicInfoContent() {
  const searchParams = useSearchParams();
  const [admins, setAdmins] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('edunexus_registered_admins');
      return s ? JSON.parse(s) : [];
    }
    return [];
  });
  const [showModal, setShowModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const activeCount = admins.filter((a: any) => a.isActive !== false).length;

  useEffect(() => {
    if (searchParams.get('openModal') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const [form, setForm] = useState<Record<string, string>>({
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    tipoId: '', numeroId: '', sexo: '', correo: '', telefono: '', celular: '',
    fechaNacimiento: '', direccion: '',
  });
  const [residencia, setResidencia] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [barrio, setBarrio] = useState('');
  const [lugarNac, setLugarNac] = useState('');

  const handleSave = () => {
    if (!form.primerNombre || !form.primerApellido || !form.numeroId) {
      alert('Complete los campos obligatorios (*)');
      return;
    }
    const name = `${form.primerNombre} ${form.segundoNombre} ${form.primerApellido} ${form.segundoApellido}`.trim().replace(/\s+/g, ' ');
    const newAdmin = {
      id: form.numeroId,
      name,
      type: 'Administrativo',
      isActive: true,
      correo: form.correo,
      telefono: form.telefono,
      residencia,
      barrio,
      details: { ...form, lugarNacimiento: lugarNac, residence: residencia, barrio },
    };
    const updated = [...admins, newAdmin];
    setAdmins(updated);
    localStorage.setItem('edunexus_registered_admins', JSON.stringify(updated));
    setRegisterSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setRegisterSuccess(false);
      setForm({ primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '', tipoId: '', numeroId: '', sexo: '', correo: '', telefono: '', celular: '', fechaNacimiento: '', direccion: '' });
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

  const filtered = admins.filter((a: any) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.includes(searchTerm)
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Información básica</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión y consulta de datos generales de administrativos</p>
        </div>
        <button
          className="btn-premium"
          style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Registrar Admin
        </button>
      </div>

      {/* Search bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input type="text" placeholder="Buscar personas..." className="input-premium"
              style={{ paddingLeft: '48px', height: '48px', background: 'white', width: '100%' }}
              value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>Buscar</button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              {['Nombre completo', 'N° Identificación', 'Tipo', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 3 ? 'center' : 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map((a: any) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                <td style={{ padding: '14px 24px', color: '#2563eb', fontWeight: '700', fontSize: '14px' }}>{a.name.toUpperCase()}</td>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>{a.id}</td>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#64748b' }}>{a.type}</td>
                <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                  <Link href={`/dashboard/admins/basic-info/${a.id}`}>
                    <button title="Ver" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      <Eye size={20} />
                    </button>
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: '80px 40px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#f3f4f6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <Search size={40} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>No hay administrativos registrados</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Haz clic en "Registrar Admin" para agregar el primero.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#cbd5e1' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: p === currentPage ? 'none' : '1px solid #e5e7eb', background: p === currentPage ? 'var(--primary)' : 'white', color: p === currentPage ? 'white' : '#6b7280', fontWeight: '700', cursor: 'pointer' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#cbd5e1' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ FLOATING REGISTRATION MODAL ━━━━━━━━━━ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            {/* Modal Header */}
            <div style={{ background: '#10b981', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>Registrar administrativo</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={22} /></button>
            </div>

            {/* Limit warning - Redesigned to match screenshot */}
            {activeCount >= MAX_ADMINS && !registerSuccess && (
              <div style={{ margin: '16px 24px 0', padding: '10px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', color: '#b45309', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   Ha alcanzado el número máximo de administrativos activos en la plataforma y no es posible registrar más.
                </span>
                <X size={14} style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setShowModal(false)} />
              </div>
            )}

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              {registerSuccess ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div style={{ background: '#ecfdf5', color: '#10b981', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Save size={32} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>¡Registro Exitoso!</h3>
                  <p style={{ color: '#64748b', margin: 0 }}>El administrativo ha sido guardado correctamente.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  {/* Column 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     {fld('primerNombre', 'Primer nombre *')}
                     {fld('segundoApellido', 'Segundo apellido')}
                     {sel('sexo', 'Sexo *', GENEROS)}
                     {fld('celular', 'Celular *')}
                     {fld('direccion', 'Dirección')}
                  </div>

                  {/* Column 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     {fld('segundoNombre', 'Segundo nombre')}
                     {sel('tipoId', 'Tipo de identificación *', TIPOS_IDENTIFICACION)}
                     <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Correo electrónico *</label>
                        <input type="email" className="input-premium" style={{ width: '100%', fontSize: '13px', height: '38px' }}
                           value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} />
                     </div>
                     <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Fecha de nacimiento *</label>
                        <input type="date" className="input-premium" style={{ width: '100%', fontSize: '13px', height: '38px' }}
                           value={form.fechaNacimiento} onChange={e => setForm(p => ({ ...p, fechaNacimiento: e.target.value }))} />
                     </div>
                     <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Lugar de residencia</label>
                        <SearchableCityInput value={residencia} onChange={setResidencia} onSelect={c => { setResidencia(c.label); setSelectedCity(c); }} placeholder="Seleccione municipio" />
                     </div>
                  </div>

                  {/* Column 3 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     {fld('primerApellido', 'Primer apellido *')}
                     {fld('numeroId', 'Número de identificación *')}
                     {fld('telefono', 'Teléfono *')}
                     <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Lugar de nacimiento</label>
                        <SearchableCityInput value={lugarNac} onChange={setLugarNac} onSelect={c => setLugarNac(c.label)} placeholder="Seleccione municipio" />
                     </div>
                     <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Barrio</label>
                        <SearchableBarrioInput city={selectedCity ? selectedCity.name : ''} value={barrio} onChange={setBarrio} />
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!registerSuccess && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'white' }}>
                <span style={{ marginRight: 'auto', alignSelf: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  Administrativos activos: <strong style={{ color: activeCount >= MAX_ADMINS ? '#ef4444' : '#10b981' }}>{activeCount} / {MAX_ADMINS}</strong>
                </span>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
                <button 
                  onClick={handleSave} 
                  disabled={activeCount >= MAX_ADMINS}
                  style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: activeCount >= MAX_ADMINS ? '#cbd5e1' : '#10b981', color: 'white', fontWeight: '800', cursor: activeCount >= MAX_ADMINS ? 'not-allowed' : 'pointer', fontSize: '14px' }}
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function AdminBasicInfo() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Cargando información básica de administrativos...</div>}>
      <AdminBasicInfoContent />
    </Suspense>
  );
}
