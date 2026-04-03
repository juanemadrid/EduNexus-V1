'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  FolderOpen,
  Settings
} from 'lucide-react';
import { db } from '@/lib/db';

interface DocRequirement {
  id: string;
  name: string;
  category: string;
  isRequired: boolean;
  status: 'Activo' | 'Inactivo';
}

export default function DigitalDocumentsPage() {
  const [requirements, setRequirements] = useState<DocRequirement[]>([]);

  const fetchRequirements = async () => {
    const data = await db.list<DocRequirement>('doc_requirements');
    setRequirements(data);
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const [categories, setCategories] = useState<string[]>(['DOCUMENTOS ACADÉMICOS']);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    category: '',
    isRequired: true,
    status: 'Activo' as 'Activo' | 'Inactivo'
  });

  useEffect(() => {
    db.list('digital_categories').then((cats: any[]) => {
      if (cats.length > 0) {
        const catNames = cats.map((c: any) => c.name);
        setCategories(catNames);
        setForm(prev => ({ ...prev, category: catNames[0] }));
      }
    });
  }, []);

  // Removed direct localStorage useEffect as db handles it now

  const handleSave = async () => {
    if (!form.name || !form.category) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    const newReq = {
      name: form.name.toUpperCase(),
      category: form.category,
      isRequired: form.isRequired,
      status: form.status
    };

    await db.create('doc_requirements', newReq);
    await fetchRequirements();
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setForm({ name: '', category: categories[0] || '', isRequired: true, status: 'Activo' });
    }, 1500);
  };

  const filtered = requirements.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Requisitos de Documentos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Parámetros Documentales</span>
          </p>
        </div>
        <button 
          className="btn-premium" 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
        >
          <Plus size={20} strokeWidth={3} /> Crear requisito
        </button>
      </div>

      {/* Modern Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--primary-glow))' }} />
        <div style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o categoría..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '52px', fontSize: '15px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
        </div>
      </div>

      {/* Table Content */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Documento', 'Categoría', 'Obligatorio', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <FileText size={20} />
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>{req.name}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOpen size={16} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{req.category}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: req.isRequired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.05)',
                    color: req.isRequired ? '#ef4444' : 'var(--text-dim)'
                  }}>
                    {req.isRequired ? 'SÍ' : 'NO'}
                  </span>
                </td>
                <td style={{ padding: '24px 32px' }}>
                   <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: req.status === 'Activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.05)',
                    color: req.status === 'Activo' ? '#059669' : 'var(--text-dim)'
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={18} /></button>
                      <button 
                        onClick={async () => {
                          if (confirm('¿Eliminar este requisito?')) {
                            await db.delete('doc_requirements', req.id);
                            await fetchRequirements();
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} 
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>
             <FileText size={64} style={{ marginBottom: '20px', opacity: 0.1 }} />
             <h3 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>No se encontraron requisitos</h3>
             <p style={{ fontSize: '14px' }}>Cree una nueva regla de documentación.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Crear Requisito</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Defina un nuevo requerimiento documental</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ width: '64px', height: '64px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={40} />
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Requisito Creado!</h3>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre del Documento *</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="Ej: ACTA DE GRADO"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Categoría *</label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px', appearance: 'none' }}
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.isRequired} onChange={e => setForm({...form, isRequired: e.target.checked})} />
                        ¿Es obligatorio para el ingreso?
                     </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-glow)' }}
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(14, 165, 233, 0.02) !important;
          transform: scale(1.001);
        }
      `}</style>
    </DashboardLayout>
  );
}
