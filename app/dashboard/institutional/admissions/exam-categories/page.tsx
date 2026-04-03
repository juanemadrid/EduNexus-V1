'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { 
  Search, Plus, ClipboardList, Download, Edit, Trash2, X,
  CheckCircle, Percent, ChevronLeft, ChevronRight
} from 'lucide-react';

interface ExamCategory {
  id: string;
  name: string;
  weight: string; // Ponderación (e.g. 20.00)
  status: 'Activo' | 'Inactivo';
  createdAt?: string;
  updatedAt?: string;
}

const emptyForm = {
  name: '',
  weight: '',
  status: 'Activo' as 'Activo' | 'Inactivo'
};

export default function ExamCategoriesPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadCategories = async () => {
    setIsInitialLoading(true);
    try {
      const data = await db.list<ExamCategory>('admission_exam_categories');
      setCategories(data);
    } catch (error) {
       console.error("Error loading exam categories:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.weight) {
      alert('Por favor complete los campos obligatorios (*)');
      return;
    }

    setIsLoading(true);
    try {
      const categoryData: any = {
        name: form.name.toUpperCase(),
        weight: parseFloat(form.weight).toFixed(2),
        status: form.status,
        updatedAt: new Date().toISOString()
      };

      if (isEditing && currentId) {
        await db.update('admission_exam_categories', currentId, categoryData);
        setCategories(categories.map(c => c.id === currentId ? { ...c, ...categoryData } : c));
      } else {
        const newId = crypto.randomUUID();
        const newCategory: ExamCategory = { ...categoryData, id: newId, createdAt: new Date().toISOString() };
        await db.create('admission_exam_categories', newCategory);
        setCategories([...categories, newCategory]);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
       console.error("Error saving exam category:", error);
       alert("Error al guardar la categoría.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cat: ExamCategory) => {
    setForm({
      name: cat.name,
      weight: cat.weight,
      status: cat.status
    });
    setCurrentId(cat.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (cat: ExamCategory) => {
    if (!confirm(`¿Eliminar la categoría de examen "${cat.name}"?`)) return;
    try {
      await db.delete('admission_exam_categories', cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleExport = () => {
    const header = 'Nombre,Ponderación,Estado';
    const rows = filtered.map(c => `"${c.name}","${c.weight}%","${c.status}"`);
    const csvStr = [header, ...rows].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'categorias_examen_admision.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = categories
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const lblStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'
  };

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_admi_examen">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>Categorías examen de admisión</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontWeight: '500', margin: 0 }}>
                Institucional / Admisiones / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Categorías examen de admisión</span>
              </p>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' }}></div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: parseFloat(categories.reduce((acc, c) => acc + parseFloat(c.weight || '0'), 0).toFixed(2)) > 100 ? '#ef4444' : 'var(--primary)', margin: 0 }}>
                Ponderación Total: {categories.reduce((acc, c) => acc + parseFloat(c.weight || '0'), 0).toFixed(2)}%
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}>
              <Download size={16} /> Exportar
            </button>
            <button 
              className="btn-premium" 
              onClick={() => { resetForm(); setShowModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontSize: '13px' }}
            >
              <Plus size={18} strokeWidth={3} stroke="#fff" /> Crear categoría
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre de categoría..." 
                className="input-premium"
                style={{ paddingLeft: '40px', height: '38px', fontSize: '14px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-premium" style={{ height: '38px', padding: '0 24px', fontSize: '13px' }}>Buscar</button>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '700', minWidth: '180px', textAlign: 'right' }}>
              {isInitialLoading ? 'Cargando...' : `${filtered.length} categorías de examen`}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                {['Nombre', 'Ponderación', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 3 ? 'center' : 'left', padding: '16px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '0.8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isInitialLoading ? (
                <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>Sincronizando categorías...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: '600' }}>No hay registros.</td></tr>
              ) : filtered.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                  <td style={{ padding: '14px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <ClipboardList size={16} />
                      </div>
                      <span style={{ fontWeight: '750', fontSize: '14px', color: 'var(--text-main)' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '800', fontSize: '14px' }}>
                      <Percent size={12} /> {cat.weight}
                    </div>
                  </td>
                  <td style={{ padding: '14px 32px' }}>
                    <span style={{ 
                      padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                      background: cat.status === 'Activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: cat.status === 'Activo' ? '#059669' : '#dc2626'
                    }}>
                      {cat.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><Edit size={16} /></button>
                      <button onClick={() => handleDelete(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* Header */}
              <div style={{ background: 'rgb(34, 197, 94)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar categoría' : 'Crear categoría'}</h2>
                  <p style={{ margin: '2px 0 0', opacity: 0.8, fontSize: '12px', fontWeight: '500' }}>Configuración institucional de exámenes</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                     <div style={{ width: '56px', height: '56px', background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <CheckCircle size={32} />
                     </div>
                     <h3 style={{ fontSize: '18px', fontWeight: '800' }}>¡Completado!</h3>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={lblStyle}>Nombre *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                        placeholder="Ej. RAZONAMIENTO MATEMÁTICO"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={lblStyle}>Ponderación *</label>
                      <div style={{ position: 'relative' }}>
                        <Percent size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input 
                          type="number"
                          className="input-premium" 
                          style={{ width: '100%', height: '42px', borderRadius: '10px', paddingRight: '36px' }}
                          placeholder="Ej. 25.00"
                          value={form.weight}
                          onChange={e => setForm({...form, weight: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={lblStyle}>Estado *</label>
                      <div style={{ display: 'flex', gap: '20px' }}>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                            <input type="radio" checked={form.status === 'Activo'} onChange={() => setForm({...form, status: 'Activo'})} style={{ accentColor: 'rgb(34, 197, 94)' }} /> Activo
                         </label>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                            <input type="radio" checked={form.status === 'Inactivo'} onChange={() => setForm({...form, status: 'Inactivo'})} style={{ accentColor: 'rgb(34, 197, 94)' }} /> Inactivo
                         </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px' }}>Cancelar</button>
                  <button onClick={handleSave} className="btn-premium" style={{ background: 'rgb(34, 197, 94)', padding: '8px 24px', borderRadius: '10px', fontSize: '13px' }}>Guardar</button>
                </div>
              )}
            </div>
          </div>
        )}
      </PermissionGate>
    </DashboardLayout>
  );
}
