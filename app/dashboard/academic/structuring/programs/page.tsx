'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Eye, ChevronRight, ChevronLeft, Plus, X, Edit, Trash2, Download, FileText, Filter, ChevronDown, HelpCircle, Calendar } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const INITIAL_PROGRAMS = [
  { id: '1', codigo: '01 ADS', nombre: 'AUXILIAR DE ADMINISTRACION EN SALUD', estado: 'Activo' },
  { id: '2', codigo: '03 ADS', nombre: 'AUXILIAR DE ADMINISTRACION EN SALUD', estado: 'Activo' },
  { id: '3', codigo: '02 ADS', nombre: 'AUXILIAR DE ADMINISTRACION EN SALUD', estado: 'Activo' },
  { id: '4', codigo: '03 AENFER *', nombre: 'AUXILIAR DE ENFERMERIA', estado: 'Activo' },
  { id: '5', codigo: '01 AENFER', nombre: 'AUXILIAR DE ENFERMERIA', estado: 'Activo' },
  { id: '6', codigo: '01A', nombre: 'AUXILIAR DE ENFERMERIA', estado: 'Activo' },
  { id: '7', codigo: '102', nombre: 'TECNICO EN AIRES ACONDICIONADO Y REFRIGERACION', estado: 'Activo' },
  { id: '8', codigo: '02 ADMCONT', nombre: 'TECNICO AUXILIAR CONTABLE Y ADMINISTRATIVO', estado: 'Activo' },
  { id: '9', codigo: '01 ADMCONT', nombre: 'TECNICO AUXILIAR CONTABLE Y ADMINISTRATIVO', estado: 'Activo' },
  { id: '10', codigo: '07 ADMCONT', nombre: 'TECNICO AUXILIAR CONTABLE Y ADMINISTRATIVO', estado: 'Activo' },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    nombreQ10Id: '',
    resAutorizacion: '',
    fechaRes: '',
    preinscripciones: 'No',
    grupos: 'No',
    tipoEvaluacion: 'Cuantitativo',
    categoria: '',
    estado: 'Activo'
  });

  useEffect(() => {
    const saved = localStorage.getItem('edunexus_academic_programs');
    if (saved) {
      setPrograms(JSON.parse(saved));
    } else {
      localStorage.setItem('edunexus_academic_programs', JSON.stringify(INITIAL_PROGRAMS));
      setPrograms(INITIAL_PROGRAMS);
    }
  }, []);

  const handleSave = () => {
    if (!form.codigo || !form.nombre || !form.tipoEvaluacion || !form.categoria) {
      alert('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    let updated;
    if (isEditing && editingId) {
      updated = programs.map(p => p.id === editingId ? { ...p, ...form } : p);
    } else {
      const newProgram = {
        id: Date.now().toString(),
        ...form
      };
      updated = [newProgram, ...programs];
    }

    setPrograms(updated);
    localStorage.setItem('edunexus_academic_programs', JSON.stringify(updated));
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({
      codigo: '',
      nombre: '',
      nombreQ10Id: '',
      resAutorizacion: '',
      fechaRes: '',
      preinscripciones: 'No',
      grupos: 'No',
      tipoEvaluacion: 'Cuantitativo',
      categoria: '',
      estado: 'Activo'
    });
  };

  const handleEdit = (program: any) => {
    setForm({
      codigo: program.codigo || '',
      nombre: program.nombre || '',
      nombreQ10Id: program.nombreQ10Id || '',
      resAutorizacion: program.resAutorizacion || '',
      fechaRes: program.fechaRes || '',
      preinscripciones: program.preinscripciones || 'No',
      grupos: program.grupos || 'No',
      tipoEvaluacion: program.tipoEvaluacion || 'Cuantitativo',
      categoria: program.categoria || '',
      estado: program.estado || 'Activo'
    });
    setEditingId(program.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setEditingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (editingId) {
      const updated = programs.filter(p => p.id !== editingId);
      setPrograms(updated);
      localStorage.setItem('edunexus_academic_programs', JSON.stringify(updated));
      setShowDeleteModal(false);
      setEditingId(null);
    }
  };

  const filteredPrograms = programs.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const currentItems = filteredPrograms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 40px 0' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Programas</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión de la oferta educativa e institucional</p>
          </div>
          <button 
            className="btn-premium"
            onClick={() => {
              setIsEditing(false);
              setShowModal(true);
            }}
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <Plus size={18} /> Crear programa
          </button>
        </div>

        {/* Search & Filters */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Buscar programas..." 
                className="input-premium"
                style={{ paddingLeft: '48px', height: '48px', background: '#f8fafc' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white' }}>
              <Search size={18} />
            </button>
            <button className="btn-premium" style={{ height: '48px', padding: '0 20px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: 'none' }}>
              <Download size={18} /> Exportar
            </button>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
          </div>
        </div>

        {/* Programs Table */}
        <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Código</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>{p.codigo}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{p.nombre}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        background: p.estado === 'Activo' ? '#ecfdf5' : '#fef2f2', 
                        color: p.estado === 'Activo' ? '#059669' : '#dc2626' 
                      }}>
                        {p.estado}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button title="Editar" onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Edit size={18} /></button>
                        <button title="Eliminar" onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8' }}>No hay registros encontrados</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#6b7280', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '8px', 
                      background: currentPage === page ? 'var(--primary)' : 'white', 
                      color: currentPage === page ? 'white' : '#6b7280', 
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: currentPage === page ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#6b7280', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Modal Header */}
            <div style={{ background: 'var(--primary)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar programa' : 'Crear programa'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Código *</label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={form.codigo}
                    onChange={e => setForm({...form, codigo: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre *</label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Nombre para Q10 ID <HelpCircle size={14} />
                  </label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={form.nombreQ10Id}
                    onChange={e => setForm({...form, nombreQ10Id: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Nº Res. autorización <HelpCircle size={14} />
                  </label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={form.resAutorizacion}
                    onChange={e => setForm({...form, resAutorizacion: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                    F. Res. autorización <HelpCircle size={14} />
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="date" 
                      className="input-premium"
                      value={form.fechaRes}
                      onChange={e => setForm({...form, fechaRes: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Aplica para preinscripciones</label>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.preinscripciones === 'Sí'} onChange={() => setForm({...form, preinscripciones: 'Sí'})} style={{ accentColor: 'var(--primary)' }} /> Sí
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.preinscripciones === 'No'} onChange={() => setForm({...form, preinscripciones: 'No'})} style={{ accentColor: 'var(--primary)' }} /> No
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Aplica para grupos * <HelpCircle size={14} />
                  </label>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.grupos === 'Sí'} onChange={() => setForm({...form, grupos: 'Sí'})} style={{ accentColor: 'var(--primary)' }} /> Sí
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.grupos === 'No'} onChange={() => setForm({...form, grupos: 'No'})} style={{ accentColor: 'var(--primary)' }} /> No
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de evaluación *</label>
                  <select 
                    className="input-premium"
                    value={form.tipoEvaluacion}
                    onChange={e => setForm({...form, tipoEvaluacion: e.target.value})}
                  >
                    <option value="Cuantitativo">Cuantitativo</option>
                    <option value="Cualitativo">Cualitativo</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Categoría *</label>
                  <select 
                    className="input-premium"
                    value={form.categoria}
                    onChange={e => setForm({...form, categoria: e.target.value})}
                  >
                    <option value="">Seleccione</option>
                    <option value="Diplomado">Diplomado</option>
                    <option value="Técnico">Técnico Laboral</option>
                    <option value="Curso">Curso Corto</option>
                    <option value="Bachillerato">Bachillerato</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Estado *</label>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.estado === 'Activo'} onChange={() => setForm({...form, estado: 'Activo'})} style={{ accentColor: 'var(--primary)' }} /> Activo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.estado === 'Inactivo'} onChange={() => setForm({...form, estado: 'Inactivo'})} style={{ accentColor: 'var(--primary)' }} /> Inactivo
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button 
                onClick={closeModal}
                style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Trash2 size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', marginBottom: '12px' }}>¿Eliminar programa?</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
                Esta acción no se puede deshacer. El programa será removido permanentemente.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
