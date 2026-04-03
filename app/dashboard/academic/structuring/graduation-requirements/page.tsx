'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Edit, Trash2, X, BookOpen, Database, Download } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function GraduationRequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [digitalCategories, setDigitalCategories] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    programas: 'TODOS',
    requiereAdjunto: true,
    categoriaArchivoId: '',
    estado: 'Activo' as 'Activo' | 'Inactivo'
  });

  const fetchData = async () => {
    const [reqs, cats, progs] = await Promise.all([
      db.list('graduation_requirements'),
      db.list('digital_categories'),
      db.list('academic_programs')
    ]);
    setRequirements(reqs);
    setDigitalCategories(cats);
    setPrograms(progs);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    if (isEditing && editingId) {
      await db.update('graduation_requirements', editingId, form);
    } else {
      await db.create('graduation_requirements', form);
    }

    await fetchData();
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ nombre: '', descripcion: '', programas: 'TODOS', requiereAdjunto: true, categoriaArchivoId: '', estado: 'Activo' });
  };

  const handleEdit = (req: any) => {
    setForm({
      nombre: req.nombre,
      descripcion: req.descripcion || '',
      programas: req.programas || 'TODOS',
      requiereAdjunto: req.requiereAdjunto ?? true,
      categoriaArchivoId: req.categoriaArchivoId || '',
      estado: req.estado || 'Activo'
    });
    setEditingId(req.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setEditingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (editingId) {
      await db.delete('graduation_requirements', editingId);
      await fetchData();
      setShowDeleteModal(false);
      setEditingId(null);
    }
  };

  const filtered = requirements.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Requisitos de Grado</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión de documentos y trámites necesarios para la titulación</p>
      </div>

      {/* Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', width: '400px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Buscar requisito..." 
              className="input-premium" 
              style={{ height: '42px', paddingLeft: '38px', fontSize: '13px' }} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          className="btn-premium"
          style={{ background: '#10b981', color: 'white', padding: '10px 20px', fontSize: '13px', fontWeight: '700' }}
          onClick={() => {
            setIsEditing(false);
            setForm({ nombre: '', descripcion: '', programas: 'TODOS', requiereAdjunto: true, categoriaArchivoId: '', estado: 'Activo' });
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Nuevo requisito
        </button>
        <button 
          className="btn-premium"
          style={{ background: 'white', border: '1px solid #e2e8f0', color: '#475569', padding: '10px 20px', fontSize: '13px', fontWeight: '700', boxShadow: 'none' }}
        >
          <Download size={18} /> Exportar
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Requisito</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Programa</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Adjunto</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{req.nombre}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{req.descripcion || 'Sin descripción'}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563', fontWeight: '500' }}>
                      <BookOpen size={14} style={{ color: 'var(--primary)' }} />
                      {req.programas === 'TODOS' ? 'Todos los programas' : (programs.find(p => p.id === req.programas)?.nombre || 'Programa específico')}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    {req.requiereAdjunto ? (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#ecfdf5', color: '#10b981', fontSize: '11px', fontWeight: '700' }}>SÍ</span>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '700' }}>NO</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: req.estado === 'Activo' ? '#ecfdf5' : '#f1f5f9', color: req.estado === 'Activo' ? '#10b981' : '#64748b', fontSize: '11px', fontWeight: '700' }}>
                      {req.estado}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleEdit(req)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Editar"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(req.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '100px 40px', textAlign: 'center' }}>
                   <div style={{ color: '#94a3b8', fontSize: '14px' }}>No hay requisitos de grado configurados.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#10b981', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar requisito de grado' : 'Nuevo requisito de grado'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre *</label>
                  <input 
                    type="text" 
                    className="input-premium" 
                    style={{ width: '100%', height: '42px' }} 
                    value={form.nombre} 
                    onChange={e => setForm({...form, nombre: e.target.value.toUpperCase()})}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Programas *</label>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px' }}
                  value={form.programas}
                  onChange={e => setForm({...form, programas: e.target.value})}
                >
                  <option value="TODOS">Todos</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre || p.codigo}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Requiere adjunto</label>
                  <div style={{ display: 'flex', gap: '16px', height: '42px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="radio" name="adjunto" checked={form.requiereAdjunto === true} onChange={() => setForm({...form, requiereAdjunto: true})} /> Sí
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="radio" name="adjunto" checked={form.requiereAdjunto === false} onChange={() => setForm({...form, requiereAdjunto: false})} /> No
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Categoría archivo *</label>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '42px' }}
                    value={form.categoriaArchivoId}
                    onChange={e => setForm({...form, categoriaArchivoId: e.target.value})}
                  >
                    <option value="">Seleccione</option>
                    {digitalCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Descripción interna</label>
                <textarea 
                  className="input-premium" 
                  style={{ width: '100%', height: '60px', padding: '12px', resize: 'none' }} 
                  value={form.descripcion} 
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  placeholder="Instrucciones adicionales para la oficina de admisiones..."
                />
              </div>
            </div>
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
               <button onClick={handleSave} style={{ padding: '10px 30px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Aceptar</button>
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
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 10px' }}>¿Eliminar requisito?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>Esta acción no se puede deshacer y afectará a los estudiantes próximos a graduarse.</p>
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
