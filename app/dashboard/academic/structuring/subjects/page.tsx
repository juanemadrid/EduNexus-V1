'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { Search, ChevronRight, ChevronLeft, Plus, X, Edit, Trash2, Download, ChevronDown, BarChart3 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

/* Removed INITIAL_SUBJECTS mock data */

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter state
  const [filterForm, setFilterForm] = useState({
    filtroFecha: 'Período',
    periodo: '2026 - 01',
    fechaRango: 'Hoy'
  });

  // Form state
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    abreviacion: '',
    estado: 'Activa'
  });

  const fetchSubjects = async () => {
    const data = await db.list('academic_subjects');
    setSubjects(data);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSave = async () => {
    if (!form.codigo || !form.nombre || !form.abreviacion) {
      alert('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    if (isEditing && editingId) {
      await db.update('academic_subjects', editingId, form);
    } else {
      await db.create('academic_subjects', form);
    }

    await fetchSubjects(); // Refresh subjects after save
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ codigo: '', nombre: '', abreviacion: '', estado: 'Activa' });
  };

  const handleEdit = (subject: any) => {
    setForm({
      codigo: subject.codigo,
      nombre: subject.nombre,
      abreviacion: subject.abreviacion,
      estado: subject.estado
    });
    setEditingId(subject.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setEditingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (editingId) {
      await db.delete('academic_subjects', editingId);
      const fresh = await db.list('academic_subjects');
      setSubjects(fresh);
      setShowDeleteModal(false);
      setEditingId(null);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const currentItems = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (field: string, value: string) => {
    setFilterForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 40px 0' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Asignaturas</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión de carga académica y estructuración de materias</p>
          </div>
          <button 
            className="btn-premium"
            onClick={() => {
              setIsEditing(false);
              setForm({ codigo: '', nombre: '', abreviacion: '', estado: 'Activa' });
              setShowModal(true);
            }}
            style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px' }}
          >
            <Plus size={18} /> Crear asignatura
          </button>
        </div>

        {/* Search & Period/Date Filters */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Buscar asignaturas..." 
                  className="input-premium"
                  style={{ paddingLeft: '48px', height: '48px', background: '#f8fafc' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Filtrar por</label>
                <select 
                  className="input-premium" 
                  style={{ width: '140px', height: '48px', fontSize: '14px', background: '#f8fafc' }}
                  value={filterForm.filtroFecha}
                  onChange={e => handleFilterChange('filtroFecha', e.target.value)}
                >
                  <option value="Período">Período</option>
                  <option value="Fechas">Fechas</option>
                </select>
              </div>

              {filterForm.filtroFecha === 'Período' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período</label>
                  <select 
                    className="input-premium" 
                    style={{ width: '160px', height: '48px', fontSize: '14px', background: '#f8fafc' }}
                    value={filterForm.periodo}
                    onChange={e => handleFilterChange('periodo', e.target.value)}
                  >
                    <option value="2026 - 01">2026 - 01</option>
                    <option value="2026 - 02">2026 - 02</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Fechas</label>
                  <DateRangePicker 
                    value={filterForm.fechaRango} 
                    onChange={(val) => handleFilterChange('fechaRango', val)} 
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white' }}>
                <Search size={18} />
              </button>
              <button className="btn-premium" style={{ height: '48px', padding: '0 20px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: 'none' }}>
                <Download size={18} /> Exportar
              </button>
              <button 
                className="btn-premium" 
                style={{ height: '48px', padding: '0 20px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => router.push('/dashboard/reports')}
              >
                <BarChart3 size={18} /> Informes
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Código</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Abreviación</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>{s.codigo}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{s.nombre}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#64748b' }}>{s.abreviacion}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        background: s.estado === 'Activa' ? '#ecfdf5' : '#fef2f2', 
                        color: s.estado === 'Activa' ? '#059669' : '#dc2626' 
                      }}>
                        {s.estado}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          title="Editar" 
                          onClick={() => handleEdit(s)}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          title="Eliminar" 
                          onClick={() => handleDelete(s.id)}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8' }}>No hay registros, verifique los filtros de la consulta o cree uno nuevo</div>
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

      {/* CREATE MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Modal Header */}
            <div style={{ background: 'var(--primary)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>
                {isEditing ? 'Editar asignatura' : 'Crear asignatura'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Código *</label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={form.codigo}
                    onChange={e => setForm({...form, codigo: e.target.value})}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre *</label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Abreviación *</label>
                  <input 
                    type="text" 
                    className="input-premium"
                    value={form.abreviacion}
                    onChange={e => setForm({...form, abreviacion: e.target.value})}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="estado" 
                        checked={form.estado === 'Activa'} 
                        onChange={() => setForm({...form, estado: 'Activa'})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      Activa
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="estado" 
                        checked={form.estado === 'Inactiva'} 
                        onChange={() => setForm({...form, estado: 'Inactiva'})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      Inactiva
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button 
                onClick={() => setShowModal(false)}
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
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', marginBottom: '12px' }}>¿Eliminar asignatura?</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
                Esta acción no se puede deshacer. La asignatura será removida permanentemente del sistema académico.
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
