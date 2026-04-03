'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Download, ChevronDown, Plus, X, Save, Edit, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';

export default function ProgramCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadCategories = async () => {
    setIsInitialLoading(true);
    try {
      const data = await db.list<any>('academic_program_categories');
      setCategories(data);
    } catch (error) {
       console.error("Error loading program categories:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const handleSave = async () => {
    if (!newCatName.trim()) {
      alert('Debe ingresar un nombre para la categoría.');
      return;
    }

    setIsLoading(true);
    try {
      const catData = {
        name: newCatName.toUpperCase(),
        isActive: true,
        updatedAt: new Date().toISOString()
      };

      if (isEditing && editingId) {
        await db.update('academic_program_categories', editingId, catData);
      } else {
        const id = newCatName.toLowerCase().replace(/ /g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        await db.create('academic_program_categories', { ...catData, id, createdAt: new Date().toISOString() });
      }

      await loadCategories();
      setShowModal(false);
      setNewCatName('');
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
       console.error("Error saving program category:", error);
       alert("Error al guardar la categoría.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      await db.delete('academic_program_categories', id);
      await loadCategories();
    }
  };

  const handleEdit = (cat: any) => {
    setNewCatName(cat.name);
    setEditingId(cat.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const filtered = categories.filter((m: any) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 40px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Categorías de Programas</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestione las áreas de conocimiento y clasificación de su oferta educativa</p>
          </div>
          <button
            className="btn-premium"
            style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', border: 'none' }}
            onClick={() => { setIsEditing(false); setNewCatName(''); setShowModal(true); }}
          >
            <Plus size={18} /> Nueva Categoría
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Buscar áreas o categorías..." 
                className="input-premium"
                style={{ paddingLeft: '48px', height: '48px', background: '#f8fafc' }}
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <button className="btn-premium" style={{ height: '48px', padding: '0 20px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b' }}>
              <Download size={18} /> Exportar
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', borderRadius: '16px' }}>
          {isInitialLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Cargando categorías...</div>
          ) : filtered.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Nombre de Área / Categoría</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '14px 24px', color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>{m.name}</td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <span style={{ background: m.isActive ? '#ecfdf5' : '#fef2f2', color: m.isActive ? '#059669' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                        {m.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleEdit(m)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}><Edit size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '80px 24px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No se encontraron categorías. Presione "Nueva Categoría" para empezar.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>{isEditing ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '32px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre de la categoría *</label>
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Ej. ADMINISTRACIÓN, ARTES..."
                style={{ width: '100%', height: '48px', borderRadius: '12px' }}
                value={newCatName} 
                onChange={e => setNewCatName(e.target.value)} 
                autoFocus
              />
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>Este nombre se verá reflejado en los diplomas y registros oficiales.</p>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                className="btn-premium"
                disabled={isLoading}
                style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none' }}
              >
                {isLoading ? 'Guardando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
