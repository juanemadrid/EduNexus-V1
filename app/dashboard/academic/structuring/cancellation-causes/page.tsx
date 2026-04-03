'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '@/lib/db';

const DEFAULT_CAUSES = [
  'Aplazamiento',
  'Cambio de Domicilio',
  'Cambio de Institución',
  'Decisión de la Institución',
  'Dificultades Económicas',
  'Dificultades en el Horario',
  'Ejército',
  'Enfermedad',
  'Otra',
  'Voluntario',
];

const emptyForm = { nombre: '', estado: 'Activo' as 'Activo' | 'Inactivo' };

export default function CancellationCausesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);

  // Modal Create/Edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await db.list<any>('cancellation_causes');
      if (data.length === 0) {
        const seeded: any[] = [];
        for (const nombre of DEFAULT_CAUSES) {
          const item = { id: crypto.randomUUID(), nombre, estado: 'Activo' };
          await db.create('cancellation_causes', item);
          seeded.push(item);
        }
        setItems(seeded);
      } else {
        setItems(data.sort((a: any, b: any) => a.nombre?.localeCompare(b.nombre)));
      }
    } catch (e) {
      console.error('Error loading cancellation causes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Save changes
  const handleSave = async () => {
    if (!form.nombre.trim()) {
      alert('El nombre es obligatorio.'); 
      return; 
    }

    setIsSaving(true);
    try {
      const payload = { nombre: form.nombre.trim(), estado: form.estado };

      if (isEditing && editingId) {
        await db.update('cancellation_causes', editingId, payload);
      } else {
        await db.create('cancellation_causes', { ...payload, id: crypto.randomUUID() });
      }

      await loadData();
      setShowModal(false);
    } catch (e: any) {
      console.error('Error saving:', e);
      alert('Error al guardar la causa.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await db.delete('cancellation_causes', deletingId);
      setItems(prev => prev.filter(i => i.id !== deletingId));
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (e) {
      console.error('Error deleting:', e);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  // Export
  const handleExport = () => {
    if (filtered.length === 0) return;
    const csv = ['Nombre,Estado', ...filtered.map(i => `"${i.nombre}","${i.estado}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'causas_cancelacion.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = items.filter(i => {
    const matchesSearch = i.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = includeInactive ? true : i.estado !== 'Inactivo';
    return matchesSearch && matchesActive;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Causas de Cancelación</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión de motivos de cancelación de matrícula</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Buscar causa..." 
              className="input-premium" 
              style={{ height: '42px', paddingLeft: '38px', fontSize: '13px', width: '100%' }} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-premium"
            style={{ background: 'white', border: '1px solid #e2e8f0', color: '#475569', padding: '10px 16px', fontSize: '13px', fontWeight: '700', boxShadow: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}
            onClick={handleExport}
          >
            <Download size={16} /> Exportar
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}
          >
            Búsqueda avanzada
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        <button 
          className="btn-premium"
          style={{ background: '#10b981', color: 'white', padding: '10px 20px', fontSize: '13px', fontWeight: '700' }}
          onClick={() => {
            setIsEditing(false);
            setForm(emptyForm);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Nueva causa
        </button>
      </div>

      {/* Advanced search panel */}
      {showAdvanced && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={e => setIncludeInactive(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
            />
            ¿Incluir inactivos?
          </label>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Nombre</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={3} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Cargando causas...</td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{item.nombre}</div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: item.estado === 'Activo' ? '#ecfdf5' : '#f1f5f9', color: item.estado === 'Activo' ? '#10b981' : '#64748b', fontSize: '11px', fontWeight: '700' }}>
                      {item.estado}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => { setForm({ nombre: item.nombre, estado: item.estado }); setEditingId(item.id); setIsEditing(true); setShowModal(true); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Editar"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteClick(item.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ padding: '80px', textAlign: 'center' }}>
                   <div style={{ color: '#94a3b8', fontSize: '14px' }}>No hay causas de cancelación configuradas.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#10b981', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar causa' : 'Nueva causa de cancelación'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre *</label>
                <input 
                  type="text" 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px' }} 
                  value={form.nombre} 
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                <div style={{ display: 'flex', gap: '16px', height: '42px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" name="estado" checked={form.estado === 'Activo'} onChange={() => setForm({...form, estado: 'Activo'})} /> Activo
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" name="estado" checked={form.estado === 'Inactivo'} onChange={() => setForm({...form, estado: 'Inactivo'})} /> Inactivo
                  </label>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
               <button onClick={handleSave} disabled={isSaving} style={{ padding: '10px 30px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: 'pointer' }}>{isSaving ? 'Guardando...' : 'Aceptar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 10px' }}>¿Eliminar causa?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
