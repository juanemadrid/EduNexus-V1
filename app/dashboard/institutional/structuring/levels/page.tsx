'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';
import { 
  Search, 
  Plus, 
  Layers, 
  Download, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';

interface Level {
  id: string;
  code: string;
  name: string;
  period: string;
  order: number;
  status: 'Activo' | 'Inactivo';
}


export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [levelsData, periodsData] = await Promise.all([
        db.list<Level>('levels'),
        db.list<any>('academic_periods')
      ]);
      
      const sorted = [...levelsData].sort((a, b) => (a.order || 0) - (b.order || 0));
      setLevels(sorted);
      
      if (periodsData.length > 0) {
        const pNames = periodsData.map((p: any) => p.name || p.id);
        setPeriods(pNames);
        setForm(prev => ({ ...prev, period: pNames[0] || '2025-01' }));
      } else {
        setPeriods(['2025-01', '2025-02', '2024-02', '2026-01']);
      }
    } catch (error) {
       console.error("Error loading levels data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    code: '',
    name: '',
    period: '2025-01',
    order: '',
    status: 'Activo' as 'Activo' | 'Inactivo'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Level | null>(null);

  // localStorage side effects removed

  const handleSave = async () => {
    if (!form.code || !form.name || !form.order) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        const updatedLevel: Partial<Level> = {
          code: form.code,
          name: form.name,
          period: form.period,
          order: parseInt(form.order),
          status: form.status
        };
        await db.update('levels', currentId, updatedLevel);
        setLevels(levels.map(l => l.id === currentId ? { ...l, ...updatedLevel } : l));
      } else {
        const newLevel: Level = {
          id: crypto.randomUUID(),
          code: form.code,
          name: form.name,
          period: form.period,
          order: parseInt(form.order),
          status: form.status
        };
        await db.create('levels', newLevel);
        setLevels([...levels, newLevel]);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
       console.error("Error saving level:", error);
       alert("Error al guardar el nivel.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ code: '', name: '', period: periods[0] || '2025-01', order: '', status: 'Activo' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (level: Level) => {
    setForm({
      code: level.code,
      name: level.name,
      period: level.period,
      order: level.order.toString(),
      status: level.status
    });
    setCurrentId(level.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteRequest = (level: Level) => {
    setItemToDelete(level);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await db.delete('levels', itemToDelete.id);
      setLevels(levels.filter(l => l.id !== itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting level:", error);
      alert("Error al eliminar el nivel.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = levels.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Gestión de Niveles</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Niveles Académicos</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <Download size={18} /> Exportar
          </button>
          <button 
            className="btn-premium" 
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
          >
            <Plus size={20} strokeWidth={3} /> Crear nivel
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--primary-glow))' }} />
        <div style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar niveles por nombre o código..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '52px', fontSize: '15px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
        </div>
      </div>

      {/* Levels Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Código', 'Nombre', 'Período', 'Ordenamiento', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a,b) => a.order - b.order).map((level) => (
              <tr key={level.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--primary)' }}>{level.code}</span>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                        <Layers size={16} />
                     </div>
                     <span style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{level.name}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: '6px' }}>{level.period}</span>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowUpDown size={14} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{level.order}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: level.status === 'Activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: level.status === 'Activo' ? '#059669' : '#dc2626'
                  }}>
                    {level.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                      <button 
                        onClick={() => handleEdit(level)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} 
                        title="Editar"
                      >
                         <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRequest(level)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: isLoading ? 0.5 : 1 }} 
                        disabled={isLoading}
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
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: isEditing ? '#7c3aed' : 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{isEditing ? 'Editar Nivel' : 'Crear Nuevo Nivel'}</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>{isEditing ? 'Modifica los detalles del escalafón seleccionado' : 'Define un nuevo escalafón académico'}</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={40} />
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{isEditing ? '¡Nivel Actualizado!' : '¡Nivel Registrado!'}</h3>
                   <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>El nivel académico se ha guardado correctamente.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Código *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="14"
                        value={form.code}
                        onChange={e => setForm({...form, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre del Nivel *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="QUINTO SEMESTRE"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Período *</label>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px', appearance: 'none' }}
                        value={form.period}
                        onChange={e => setForm({...form, period: e.target.value})}
                      >
                        {periods.map(p => (
                           <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Ordenamiento *</label>
                      <input 
                        type="number"
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="13"
                        value={form.order}
                        onChange={e => setForm({...form, order: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!success && (
              <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: isEditing ? '#7c3aed' : 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-glow)' }}
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Nivel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Trash2 size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>¿Eliminar Nivel?</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.6' }}>
                Estás a punto de eliminar el nivel <strong style={{ color: 'var(--text-main)' }}>{itemToDelete?.name}</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ padding: '20px 32px', background: '#f8fafc', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowDeleteModal(false); setItemToDelete(null); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
              >
                No, mantener
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isLoading}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '800', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(124, 58, 237, 0.02) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
      `}</style>
    </DashboardLayout>
  );
}
