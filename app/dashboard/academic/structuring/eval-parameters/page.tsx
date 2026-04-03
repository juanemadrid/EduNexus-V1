'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, X, Edit, Trash2, Layout, Award, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function EvalParametersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nivelDesempeno: 'Superior',
    notaMinima: '',
    notaMaxima: '',
    reglaConceptual: '',
    estado: 'Activo'
  });

  const fetchData = async () => {
    const data = await db.list('eval_parameters');
    setItems(data.sort((a,b) => parseFloat(b.notaMinima) - parseFloat(a.notaMinima)));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.nivelDesempeno || !form.notaMinima || !form.notaMaxima) {
      alert('Complete los campos obligatorios (*)');
      return;
    }

    try {
      if (isEditing && editingId) {
        await db.update('eval_parameters', editingId, form);
      } else {
        await db.create('eval_parameters', form);
      }
      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving parameter:', error);
      alert('Error al guardar el parámetro');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ nivelDesempeno: 'Superior', notaMinima: '', notaMaxima: '', reglaConceptual: '', estado: 'Activo' });
  };

  const handleEdit = (i: any) => {
    setForm({
      nivelDesempeno: i.nivelDesempeno || 'Superior',
      notaMinima: i.notaMinima || '',
      notaMaxima: i.notaMaxima || '',
      reglaConceptual: i.reglaConceptual || '',
      estado: i.estado || 'Activo'
    });
    setEditingId(i.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta escala de evaluación?')) {
      await db.delete('eval_parameters', id);
      await fetchData();
    }
  };

  const getColor = (level: string) => {
    const l = level.toUpperCase();
    if (l === 'SUPERIOR') return { bg: '#ecfdf5', text: '#059669', border: '#10b981' };
    if (l === 'ALTO') return { bg: '#f0f9ff', text: '#0284c7', border: '#0ea5e9' };
    if (l === 'BÁSICO' || l === 'BASICO') return { bg: '#fffbeb', text: '#d97706', border: '#f59e0b' };
    if (l === 'BAJO') return { bg: '#fef2f2', text: '#dc2626', border: '#ef4444' };
    return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
  };

  const filtered = items.filter(i => 
    i.nivelDesempeno?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Escalas de Desempeño</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Definición de rangos según Decreto 1290 (Superior, Alto, Básico, Bajo)</p>
          </div>
          <button className="btn-premium" onClick={() => { setIsEditing(false); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
            <Plus size={18} /> Crear Escala
          </button>
        </div>

        {/* Info Alert */}
        <div style={{ background: '#f0f9ff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #0ea5e9', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Info size={20} style={{ color: '#0ea5e9' }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>Estas escalas se utilizarán automáticamente en el cierre masivo de asignaturas y boletines finales.</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 24px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Buscar por nivel de desempeño..." 
              className="input-premium" 
              style={{ width: '100%', paddingLeft: '42px', height: '42px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: 'span 10', padding: '60px 24px', textAlign: 'center', color: '#94a3b8' }}>No hay escalas configuradas</div>
          ) : filtered.map(i => {
            const colors = getColor(i.nivelDesempeno);
            return (
              <div key={i.id} className="glass-panel" style={{ border: `1px solid ${colors.border}`, padding: '24px', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={20} style={{ color: colors.text }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{i.nivelDesempeno.toUpperCase()}</h3>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: colors.text }}>Rango: {i.notaMinima} — {i.notaMaxima}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(i)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}><Edit size={16} /></button>
                    <button onClick={() => handleDelete(i.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Regla Conceptual</p>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.5', fontStyle: 'italic' }}>"{i.reglaConceptual || 'N/A'}"</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginRight: '20px' }}>
                        <div style={{ height: '100%', width: `${(parseFloat(i.notaMaxima)/5)*100}%`, background: colors.text }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: i.estado === 'Activo' ? '#ecfdf5' : '#fef2f2', color: i.estado === 'Activo' ? '#059669' : '#dc2626' }}>{i.estado}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{isEditing ? 'Editar escala' : 'Nueva escala de evaluación'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nivel de Desempeño *</label>
                <select value={form.nivelDesempeno} onChange={e => setForm(f => ({ ...f, nivelDesempeno: e.target.value }))} style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px', background: '#f9fafb' }}>
                  <option value="Superior">Superior</option>
                  <option value="Alto">Alto</option>
                  <option value="Básico">Básico</option>
                  <option value="Bajo">Bajo</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nota Mínima *</label>
                <input type="number" step="0.1" value={form.notaMinima} onChange={e => setForm(f => ({ ...f, notaMinima: e.target.value }))} placeholder="Ej: 4.6" style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nota Máxima *</label>
                <input type="number" step="0.1" value={form.notaMaxima} onChange={e => setForm(f => ({ ...f, notaMaxima: e.target.value }))} placeholder="Ej: 5.0" style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Regla Conceptual</label>
                <textarea value={form.reglaConceptual} onChange={e => setForm(f => ({ ...f, reglaConceptual: e.target.value }))} placeholder="Ej: El estudiante supera ampliamente los logros académicos previstos..." style={{ width: '100%', height: '80px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontFamily: 'inherit', resize: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Estado *</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>
                    <input type="radio" checked={form.estado === 'Activo'} onChange={() => setForm(f => ({ ...f, estado: 'Activo' }))} style={{ accentColor: 'var(--primary)' }} /> Activo
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>
                    <input type="radio" checked={form.estado === 'Inactivo'} onChange={() => setForm(f => ({ ...f, estado: 'Inactivo' }))} style={{ accentColor: 'var(--primary)' }} /> Inactivo
                  </label>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
              <button onClick={closeModal} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
