'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const INITIAL_PARAMS = [
  { id: 'ep-1', nombre: 'PARCIAL 1', porcentaje: '30', tipoNota: 'Cuantitativo', escalaMin: '0', escalaMax: '5', estado: 'Activo' },
  { id: 'ep-2', nombre: 'PARCIAL 2', porcentaje: '30', tipoNota: 'Cuantitativo', escalaMin: '0', escalaMax: '5', estado: 'Activo' },
  { id: 'ep-3', nombre: 'EXAMEN FINAL', porcentaje: '40', tipoNota: 'Cuantitativo', escalaMin: '0', escalaMax: '5', estado: 'Activo' },
];

export default function EvalParamsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', porcentaje: '', tipoNota: 'Cuantitativo', escalaMin: '0', escalaMax: '5', estado: 'Activo' });

  useEffect(() => {
    const saved = localStorage.getItem('edunexus_eval_params');
    if (saved) { setItems(JSON.parse(saved)); }
    else { setItems(INITIAL_PARAMS); localStorage.setItem('edunexus_eval_params', JSON.stringify(INITIAL_PARAMS)); }
  }, []);

  const save = (updated: any[]) => { setItems(updated); localStorage.setItem('edunexus_eval_params', JSON.stringify(updated)); };
  const handleSave = () => {
    if (!form.nombre || !form.porcentaje) { alert('Complete los campos obligatorios (*)'); return; }
    const item = { id: isEditing && editingId ? editingId : `ep-${Date.now()}`, ...form };
    save(isEditing && editingId ? items.map(i => i.id === editingId ? item : i) : [item, ...items]);
    closeModal();
  };
  const closeModal = () => { setShowModal(false); setIsEditing(false); setEditingId(null); setForm({ nombre: '', porcentaje: '', tipoNota: 'Cuantitativo', escalaMin: '0', escalaMax: '5', estado: 'Activo' }); };
  const handleEdit = (i: any) => { setForm({ nombre: i.nombre, porcentaje: i.porcentaje, tipoNota: i.tipoNota, escalaMin: i.escalaMin, escalaMax: i.escalaMax, estado: i.estado }); setEditingId(i.id); setIsEditing(true); setShowModal(true); };
  const handleDelete = (id: string) => { if (confirm('¿Eliminar este parámetro?')) save(items.filter(i => i.id !== id)); };

  const filtered = items.filter(i => i.nombre?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPct = items.reduce((acc, i) => acc + parseFloat(i.porcentaje || '0'), 0);

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Parámetros de evaluación</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Configuración de cortes, parciales y exámenes</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: '12px', background: totalPct === 100 ? '#ecfdf5' : totalPct > 100 ? '#fef2f2' : '#fff7ed', border: `1px solid ${totalPct === 100 ? '#10b981' : totalPct > 100 ? '#ef4444' : '#f59e0b'}` }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: totalPct === 100 ? '#059669' : totalPct > 100 ? '#dc2626' : '#d97706' }}>
                Total: {totalPct}% {totalPct === 100 ? '✅' : totalPct > 100 ? '❌ Excede 100%' : '⚠️ Incompleto'}
              </span>
            </div>
            <button className="btn-premium" onClick={() => { setIsEditing(false); setShowModal(true); }} style={{ background: 'var(--primary)', color: 'white' }}>
              <Plus size={18} /> Nuevo parámetro
            </button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 24px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Buscar parámetros..." className="input-premium" style={{ paddingLeft: '42px', height: '42px', background: '#f8fafc' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Nombre', '% Peso', 'Tipo de nota', 'Escala', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Acciones' ? 'center' : 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8' }}>Sin parámetros configurados</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 24px', fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>{i.nombre}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden', maxWidth: '80px' }}>
                        <div style={{ height: '100%', width: `${i.porcentaje}%`, background: 'var(--primary)', borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>{i.porcentaje}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{i.tipoNota}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{i.escalaMin} — {i.escalaMax}</td>
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
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar parámetro' : 'Nuevo parámetro de evaluación'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre del corte / parcial *</label>
                <input type="text" className="input-premium" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: PARCIAL 1" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>% de peso *</label>
                <input type="number" className="input-premium" value={form.porcentaje} onChange={e => setForm(f => ({ ...f, porcentaje: e.target.value }))} placeholder="Ej: 30" min="0" max="100" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Tipo de nota</label>
                <select className="input-premium" value={form.tipoNota} onChange={e => setForm(f => ({ ...f, tipoNota: e.target.value }))}>
                  <option value="Cuantitativo">Cuantitativo</option>
                  <option value="Cualitativo">Cualitativo</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Escala mínima</label>
                <input type="number" className="input-premium" value={form.escalaMin} onChange={e => setForm(f => ({ ...f, escalaMin: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Escala máxima</label>
                <input type="number" className="input-premium" value={form.escalaMax} onChange={e => setForm(f => ({ ...f, escalaMax: e.target.value }))} />
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
