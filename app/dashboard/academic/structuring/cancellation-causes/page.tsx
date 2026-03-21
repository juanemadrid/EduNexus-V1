'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const INITIAL_CAUSES = [
  { id: 'cc-1', codigo: 'FAM', nombre: 'Razones Familiares', tipoId: '', estado: 'Activo' },
  { id: 'cc-2', codigo: 'LAB', nombre: 'Motivos Laborales', tipoId: '', estado: 'Activo' },
  { id: 'cc-3', codigo: 'MIG', nombre: 'Cambio de Ciudad / Migración', tipoId: '', estado: 'Activo' },
  { id: 'cc-4', codigo: 'OTR', nombre: 'Otras causas', tipoId: '', estado: 'Activo' },
];

export default function CancellationCausesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ codigo: '', nombre: '', tipoId: '', estado: 'Activo' });

  useEffect(() => {
    const saved = localStorage.getItem('edunexus_cancellation_causes');
    if (saved) { setItems(JSON.parse(saved)); }
    else { setItems(INITIAL_CAUSES); localStorage.setItem('edunexus_cancellation_causes', JSON.stringify(INITIAL_CAUSES)); }

    const savedTypes = localStorage.getItem('edunexus_cancellation_types');
    if (savedTypes) setTypes(JSON.parse(savedTypes));
  }, []);

  const save = (updated: any[]) => { setItems(updated); localStorage.setItem('edunexus_cancellation_causes', JSON.stringify(updated)); };
  const handleSave = () => {
    if (!form.codigo || !form.nombre) { alert('Complete los campos obligatorios (*)'); return; }
    const item = { id: isEditing && editingId ? editingId : `cc-${Date.now()}`, ...form };
    save(isEditing && editingId ? items.map(i => i.id === editingId ? item : i) : [item, ...items]);
    closeModal();
  };
  const closeModal = () => { setShowModal(false); setIsEditing(false); setEditingId(null); setForm({ codigo: '', nombre: '', tipoId: '', estado: 'Activo' }); };
  const handleEdit = (i: any) => { setForm({ codigo: i.codigo, nombre: i.nombre, tipoId: i.tipoId || '', estado: i.estado }); setEditingId(i.id); setIsEditing(true); setShowModal(true); };
  const handleDelete = (id: string) => { if (confirm('¿Eliminar esta causa?')) save(items.filter(i => i.id !== id)); };
  const getTypeName = (id: string) => types.find(t => t.id === id)?.nombre || '—';
  const filtered = items.filter(i => i.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || i.codigo?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Causas de cancelación</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Catálogo de causas específicas de cancelación de matrícula</p>
          </div>
          <button className="btn-premium" onClick={() => { setIsEditing(false); setShowModal(true); }} style={{ background: 'var(--primary)', color: 'white' }}>
            <Plus size={18} /> Nueva causa
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 24px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Buscar causas..." className="input-premium" style={{ paddingLeft: '42px', height: '42px', background: '#f8fafc' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Código', 'Causa', 'Tipo de cancelación', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Acciones' ? 'center' : 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8' }}>Sin registros</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 24px', fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>{i.codigo}</td>
                  <td style={{ padding: '14px 24px', fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{i.nombre}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{getTypeName(i.tipoId)}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: i.estado === 'Activo' ? '#ecfdf5' : '#fef2f2', color: i.estado === 'Activo' ? '#059669' : '#dc2626' }}>{i.estado}</span>
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleEdit(i)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Edit size={16} /></button>
                      <button onClick={() => handleDelete(i.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar causa' : 'Nueva causa de cancelación'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Código *</label>
                <input type="text" className="input-premium" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre *</label>
                <input type="text" className="input-premium" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Tipo de cancelación</label>
                <select className="input-premium" value={form.tipoId} onChange={e => setForm(f => ({ ...f, tipoId: e.target.value }))}>
                  <option value="">Seleccione</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Estado *</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['Activo', 'Inactivo'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.estado === s} onChange={() => setForm(f => ({ ...f, estado: s }))} style={{ accentColor: 'var(--primary)' }} /> {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button onClick={closeModal} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
