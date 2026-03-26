'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Filter, Edit, Trash2, X, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const INITIAL_REQUIREMENTS = [
  { id: '1', nombre: 'DOCUMENTO DE IDENTIDAD AMPLIADO AL 150%', descripcion: 'Fotocopia legible por ambos lados', obligatorio: true, estado: 'Activo' },
  { id: '2', nombre: 'ACTA DE GRADO DE BACHILLER', descripcion: 'Original o copia autenticada', obligatorio: true, estado: 'Activo' },
  { id: '3', nombre: 'CERTIFICADO DE EPS O SISBEN', descripcion: 'Vigencia no mayor a 30 días', obligatorio: false, estado: 'Activo' },
  { id: '4', nombre: 'FOTOS 3X4 FONDO BLANCO', descripcion: '2 fotos recientes', obligatorio: true, estado: 'Activo' }
];

export default function EnrollmentRequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    obligatorio: true,
    estado: 'Activo' as 'Activo' | 'Inactivo'
  });

  useEffect(() => {
    const saved = localStorage.getItem('edunexus_enrollment_requirements');
    if (saved) {
      setRequirements(JSON.parse(saved));
    } else {
      localStorage.setItem('edunexus_enrollment_requirements', JSON.stringify(INITIAL_REQUIREMENTS));
      setRequirements(INITIAL_REQUIREMENTS);
    }
  }, []);

  const handleSave = () => {
    if (!form.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    let updated;
    if (isEditing && editingId) {
      updated = requirements.map(r => r.id === editingId ? { ...r, ...form } : r);
    } else {
      const newReq = {
        id: Date.now().toString(),
        ...form
      };
      updated = [newReq, ...requirements];
    }

    setRequirements(updated);
    localStorage.setItem('edunexus_enrollment_requirements', JSON.stringify(updated));
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ nombre: '', descripcion: '', obligatorio: true, estado: 'Activo' });
  };

  const handleEdit = (req: any) => {
    setForm({
      nombre: req.nombre,
      descripcion: req.descripcion,
      obligatorio: req.obligatorio,
      estado: req.estado
    });
    setEditingId(req.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setEditingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (editingId) {
      const updated = requirements.filter(r => r.id !== editingId);
      setRequirements(updated);
      localStorage.setItem('edunexus_enrollment_requirements', JSON.stringify(updated));
      setShowDeleteModal(false);
      setEditingId(null);
    }
  };

  const filtered = requirements.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Requisitos de Matrícula</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Definición y gestión de documentos necesarios para la inscripción</p>
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
            setForm({ nombre: '', descripcion: '', obligatorio: true, estado: 'Activo' });
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Nuevo requisito
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Requisito</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Descripción</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Obligatorio</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{req.nombre}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{req.descripcion || '-'}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    {req.obligatorio ? (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: '700' }}>SÍ</span>
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
                   <div style={{ color: '#94a3b8', fontSize: '14px' }}>No hay requisitos configurados que coincidan con la búsqueda.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#10b981', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar requisito' : 'Nuevo requisito'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre del requisito *</label>
                <input 
                  type="text" 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px' }} 
                  value={form.nombre} 
                  onChange={e => setForm({...form, nombre: e.target.value.toUpperCase()})}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Descripción</label>
                <textarea 
                  className="input-premium" 
                  style={{ width: '100%', height: '80px', padding: '12px', resize: 'none' }} 
                  value={form.descripcion} 
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Obligatorio</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '18px', height: '18px', accentColor: '#10b981' }} 
                      checked={form.obligatorio} 
                      onChange={e => setForm({...form, obligatorio: e.target.checked})}
                    />
                    Requerido para matrícula
                  </label>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '42px' }}
                    value={form.estado}
                    onChange={e => setForm({...form, estado: e.target.value as 'Activo' | 'Inactivo'})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
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
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>Esta acción no se puede deshacer y afectará los reportes de matrícula.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Bajar</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
