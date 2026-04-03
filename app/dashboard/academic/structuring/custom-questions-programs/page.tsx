'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function CustomQuestionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    programaId: '',
    gestionInterna: false,
    obligatoria: true,
    estado: 'Activa',
    tipo: ''
  });

  const fetchData = async () => {
    const [questions, progs] = await Promise.all([
      db.list('custom_questions_programs'),
      db.list('academic_programs')
    ]);
    setItems(questions || []);
    setPrograms(progs || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.nombre || !form.programaId || !form.tipo) {
      alert('Complete todos los campos obligatorios (*)');
      return;
    }

    try {
      if (isEditing && editingId) {
        await db.update('custom_questions_programs', editingId, form);
      } else {
        await db.create('custom_questions_programs', form);
      }
      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error al guardar la pregunta');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ nombre: '', programaId: '', gestionInterna: false, obligatoria: true, estado: 'Activa', tipo: '' });
  };

  const handleEdit = (i: any) => {
    setForm({
      nombre: i.nombre || '',
      programaId: i.programaId || '',
      gestionInterna: !!i.gestionInterna,
      obligatoria: i.obligatoria !== false, // default true
      estado: i.estado || 'Activa',
      tipo: i.tipo || ''
    });
    setEditingId(i.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta pregunta personalizada?')) {
      await db.delete('custom_questions_programs', id);
      await fetchData();
    }
  };

  const filtered = items.filter(i => 
    i.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Preguntas personalizadas</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Campos dinámicos para el programa seleccionado</p>
          </div>
          <button className="btn-premium" onClick={() => { setIsEditing(false); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#34d399', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
            <Plus size={18} /> Crear Pregunta
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 24px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              className="input-premium" 
              style={{ width: '100%', paddingLeft: '42px', height: '42px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Nombre de la pregunta</th>
                <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Programa</th>
                <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Obligatoria</th>
                <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8' }}>No hay registros. Verifique los filtros de consulta o cree uno nuevo</td></tr>
              ) : filtered.map(i => {
                const progName = programs.find(p => p.id === i.programaId)?.nombre || 'Sin programa';
                return (
                  <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '14px 24px', fontWeight: '800', fontSize: '13px', color: '#1e293b' }}>{i.nombre}</td>
                    <td style={{ padding: '14px 24px', fontSize: '12px', color: '#64748b' }}>{progName}</td>
                    <td style={{ padding: '14px 24px', fontSize: '12px', color: '#64748b' }}>{i.tipo}</td>
                    <td style={{ padding: '14px 24px', fontSize: '12px', color: '#64748b' }}>{i.obligatoria ? 'Sí' : 'No'}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: i.estado === 'Activa' ? '#ecfdf5' : '#fef2f2', color: i.estado === 'Activa' ? '#059669' : '#dc2626' }}>{i.estado}</span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleEdit(i)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Edit size={16} /></button>
                        <button onClick={() => handleDelete(i.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#4ade80', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Crear pregunta</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Nombre *</label>
                <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={{ width: '100%', height: '36px', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0 10px', fontSize: '13px' }} />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Programa</label>
                <select value={form.programaId} onChange={e => setForm(f => ({ ...f, programaId: e.target.value }))} style={{ width: '100%', height: '36px', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0 10px', fontSize: '13px', background: '#f9fafb' }}>
                  <option value="">Seleccione...</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Gestión Interna</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <input type="radio" checked={form.gestionInterna === true} onChange={() => setForm(f => ({ ...f, gestionInterna: true }))} style={{ accentColor: '#3b82f6' }} /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <input type="radio" checked={form.gestionInterna === false} onChange={() => setForm(f => ({ ...f, gestionInterna: false }))} style={{ accentColor: '#3b82f6' }} /> No
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Obligatoria</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <input type="radio" checked={form.obligatoria === true} onChange={() => setForm(f => ({ ...f, obligatoria: true }))} style={{ accentColor: '#3b82f6' }} /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <input type="radio" checked={form.obligatoria === false} onChange={() => setForm(f => ({ ...f, obligatoria: false }))} style={{ accentColor: '#3b82f6' }} /> No
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Estado</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <input type="radio" checked={form.estado === 'Activa'} onChange={() => setForm(f => ({ ...f, estado: 'Activa' }))} style={{ accentColor: '#3b82f6' }} /> Activa
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <input type="radio" checked={form.estado === 'Inactiva'} onChange={() => setForm(f => ({ ...f, estado: 'Inactiva' }))} style={{ accentColor: '#3b82f6' }} /> Inactiva
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Tipo *</label>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={{ width: '100%', height: '36px', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0 10px', fontSize: '13px' }}>
                  <option value="">Seleccione</option>
                  <option value="Múltiples opciones (Única respuesta)">Múltiples opciones (Única respuesta)</option>
                  <option value="Múltiples opciones (Múltiple respuesta)">Múltiples opciones (Múltiple respuesta)</option>
                  <option value="Casilla de redacción">Casilla de redacción</option>
                  <option value="Sí o No">Sí o No</option>
                  <option value="Fecha">Fecha</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button onClick={closeModal} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#22c55e', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
