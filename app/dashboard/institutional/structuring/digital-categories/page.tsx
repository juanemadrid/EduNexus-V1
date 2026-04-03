'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { 
  Search, Plus, FolderTree, Download, Edit, Trash2, X,
  CheckCircle, UserCheck, AlertCircle
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_TYPES = ['Estudiante', 'Docente', 'Administrativo', 'Otros'];

const emptyForm = { name: '', type: '', description: '' };

export default function DigitalCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyForm);

  // ── Load data
  const loadCategories = async () => {
    setIsInitialLoading(true);
    try {
      const data = await db.list<Category>('digital_categories');
      setCategories(data);
    } catch (error) {
      console.error('Error loading digital categories:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  // ── Modal helpers
  const openCreate = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setSuccess(false);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, type: cat.type, description: cat.description });
    setIsEditing(true);
    setEditingId(cat.id);
    setSuccess(false);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(emptyForm);
    setSuccess(false);
    setFormError('');
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    if (!form.type) { setFormError('Seleccione un tipo de categoría.'); return; }
    setIsSaving(true);
    try {
      const payload: any = {
        name: form.name.toUpperCase(),
        type: form.type,
        description: form.description ? form.description.toUpperCase() : '',
        updatedAt: new Date().toISOString()
      };

      if (isEditing && editingId) {
        await db.update('digital_categories', editingId, payload);
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...payload } : c));
      } else {
        const newId = crypto.randomUUID();
        const newCategory: Category = { ...payload, id: newId, createdAt: new Date().toISOString() };
        await db.create('digital_categories', newCategory);
        setCategories([...categories, newCategory]);
      }

      setSuccess(true);
      setTimeout(() => closeModal(), 1600);
    } catch (error: any) {
      console.error('Error saving digital category:', error);
      setFormError('Error al guardar: ' + (error?.message || 'Intente nuevamente.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await db.delete('digital_categories', cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (error: any) {
      console.error('Error deleting digital category:', error);
    }
  };

  const handleExport = () => {
    const header = 'Nombre,Tipo Categoría,Descripción';
    const rows = filtered.map(c => `"${c.name}","${c.type}","${c.description}"`);
    const csvStr = [header, ...rows].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'categorias_digitales.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeColor = (type: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      Estudiante:     { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
      Docente:        { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' },
      Administrativo: { bg: 'rgba(124, 58, 237, 0.1)', text: '#7c3aed' },
      Otros:          { bg: 'rgba(0,0,0,0.05)', text: 'var(--text-dim)' },
    };
    return map[type] || { bg: 'rgba(0,0,0,0.05)', text: 'var(--text-dim)' };
  };

  const lblStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
  };

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_estru_perf">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Categorías Digitales</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
              Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Tipos de Documentos</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleExport}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
            >
              <Download size={18} /> Exportar
            </button>
            <button
              onClick={openCreate}
              className="btn-premium"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
            >
              <Plus size={20} strokeWidth={3} stroke="#fff" /> Crear categoría
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--primary-glow))' }} />
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre, tipo o descripción..."
                className="input-premium"
                style={{ width: '100%', height: '52px', paddingLeft: '48px', fontSize: '15px', borderRadius: '12px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-secondary"
              style={{ padding: '0 20px', height: '52px' }}
            >
              Limpiar filtros
            </button>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600', minWidth: '150px' }}>
              {isInitialLoading ? 'Cargando...' : `${filtered.length} categorías encontradas`}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                {['Nombre', 'Tipo categoría', 'Descripción', 'Acciones'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 3 ? 'center' : 'left', padding: '20px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isInitialLoading ? (
                <tr><td colSpan={4} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>Cargando categorías...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No hay registros. <span onClick={openCreate} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Cree una categoría nueva</span>
                </td></tr>
              ) : filtered.map(cat => {
                const tc = typeColor(cat.type);
                return (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                          <FolderTree size={18} />
                        </div>
                        <span style={{ fontWeight: '750', color: 'var(--text-main)', fontSize: '15px' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', background: tc.bg, color: tc.text, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={14} /> {cat.type}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: '500' }}>{cat.description}</span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEdit(cat)}
                          title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          title="Eliminar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '580px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* Header */}
              <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{isEditing ? 'Editar categoría' : 'Crear categoría'}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Clasificación institucional de archivos digitales</p>
                </div>
                <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '32px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={40} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                      {isEditing ? '¡Categoría actualizada!' : '¡Categoría registrada!'}
                    </h3>
                    <p style={{ color: 'var(--text-dim)', margin: 0 }}>Los cambios se guardaron exitosamente.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {formError && (
                      <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px' }}>
                        <AlertCircle size={18} color="#ef4444" />
                        <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '700' }}>{formError}</span>
                      </div>
                    )}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={lblStyle}>Nombre *</label>
                      <input
                        className="input-premium"
                        style={{ width: '100%', height: '52px', borderRadius: '12px' }}
                        placeholder="Ej: DOCUMENTOS ACADÉMICOS"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={lblStyle}>Tipo categoría *</label>
                      <select
                        className="input-premium"
                        style={{ width: '100%', height: '52px', borderRadius: '12px', padding: '0 16px' }}
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                      >
                        <option value="">Seleccione</option>
                        {CATEGORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={lblStyle}>Descripción *</label>
                      <textarea
                        className="input-premium"
                        style={{ width: '100%', height: '100px', padding: '16px', resize: 'none', borderRadius: '12px' }}
                        placeholder="Breve descripción de la categoría..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                  <button onClick={closeModal} className="btn-secondary" style={{ padding: '12px 24px' }}>
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="btn-premium" style={{ padding: '12px 32px', opacity: isSaving ? 0.7 : 1 }}>
                    {isSaving ? 'Guardando...' : 'Aceptar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </PermissionGate>

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(16, 185, 129, 0.02) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </DashboardLayout>
  );
}
