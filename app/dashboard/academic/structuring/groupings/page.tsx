'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function GroupingsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrograma, setFilterPrograma] = useState('');
  const [filterPensum, setFilterPensum] = useState('');
  const [programas, setProgramas] = useState<any[]>([]);
  const [pensums, setPensums] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    programaId: '',
    pensumId: '',
    porcentaje: '',
    estado: 'Activo'
  });

  const fetchData = async () => {
    const groupings = await db.list('groupings');
    const progs = await db.list('academic_programs');
    const pens = await db.list('pensums');
    setItems(groupings || []);
    setProgramas(progs || []);
    setPensums(pens || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.codigo || !form.nombre || !form.programaId || !form.pensumId) {
      alert('Complete los campos obligatorios (*)');
      return;
    }

    try {
      if (isEditing && editingId) {
        await db.update('groupings', editingId, form);
      } else {
        await db.create('groupings', form);
      }
      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving grouping:', error);
      alert('Error al guardar la agrupación');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ codigo: '', nombre: '', programaId: '', pensumId: '', porcentaje: '', estado: 'Activo' });
  };

  const handleEdit = (i: any) => {
    setForm({
      codigo: i.codigo || '',
      nombre: i.nombre || '',
      programaId: i.programaId || '',
      pensumId: i.pensumId || '',
      porcentaje: i.porcentaje || '',
      estado: i.estado || 'Activo'
    });
    setEditingId(i.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta agrupación?')) {
      await db.delete('groupings', id);
      await fetchData();
    }
  };

  const filtersSelected = filterPrograma !== '' && filterPensum !== '';
  const filtered = items.filter(i => 
    i.programaId === filterPrograma && 
    i.pensumId === filterPensum
  );

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Agrupaciones</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Áreas de desempeño o agrupaciones de asignaturas</p>
          </div>
          <button className="btn-premium" onClick={() => { setIsEditing(false); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
            <Plus size={18} /> Crear Agrupación
          </button>
        </div>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Programa</label>
              <select value={filterPrograma} onChange={e => setFilterPrograma(e.target.value)} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}>
                <option value="">Seleccione</option>
                {programas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Pensum</label>
              <select value={filterPensum} onChange={e => setFilterPensum(e.target.value)} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}>
                <option value="">Seleccione</option>
                {pensums.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {!filtersSelected ? (
          <div style={{ padding: '16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '13px', color: '#4b5563' }}>
            por favor seleccione Programa y pensum.
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Código</th>
                  <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Peso (%)</th>
                  <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>Estado</th>
                  <th style={{ padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8' }}>No hay agrupaciones configuradas para este programa y pensum</td></tr>
                ) : filtered.map(i => (
                  <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '14px 24px', fontWeight: '800', fontSize: '13px', color: '#1e293b' }}>{i.codigo}</td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', fontWeight: '700', color: '#334155' }}>{i.nombre}</td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{i.porcentaje ? `${i.porcentaje}%` : 'N/A'}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: i.estado === 'Activo' ? '#ecfdf5' : '#fef2f2', color: i.estado === 'Activo' ? '#059669' : '#dc2626' }}>{i.estado}</span>
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
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{isEditing ? 'Editar agrupación' : 'Nueva agrupación'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Código *</label>
                <input type="text" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ej: AGR-CIE" style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Programa vinculado *</label>
                <select value={form.programaId} onChange={e => setForm(f => ({ ...f, programaId: e.target.value }))} style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px', background: 'white' }}>
                  <option value="">Seleccione un programa...</option>
                  {programas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Pensum vinculado *</label>
                <select value={form.pensumId} onChange={e => setForm(f => ({ ...f, pensumId: e.target.value }))} style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px', background: 'white' }}>
                  <option value="">Seleccione un pensum...</option>
                  {pensums.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre del área *</label>
                <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Ciencias Exactas" style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Porcentaje general (%)</label>
                <input type="number" value={form.porcentaje} onChange={e => setForm(f => ({ ...f, porcentaje: e.target.value }))} placeholder="Ej: 100" style={{ width: '100%', height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 14px', fontSize: '13px' }} />
              </div>

              <div>
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
              <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
