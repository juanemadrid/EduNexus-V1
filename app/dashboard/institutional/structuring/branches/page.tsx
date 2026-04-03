'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  Download, 
  Edit, 
  Trash2, 
  X,
  CheckCircle
} from 'lucide-react';

interface BranchShift {
  id: string;
  nombre: string;
  jornada: string;
}

const JORNADAS = ['Mañana', 'Tarde', 'Noche', 'Sabatina', 'Dominical', 'Única'];

export default function BranchesShiftsPage() {
  const [data, setData] = useState<BranchShift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadData = async () => {
    setIsInitialLoading(true);
    try {
      const result = await db.list<BranchShift>('sedes');
      setData(result);
    } catch (error) {
       console.error("Error loading sedes:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    jornada: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BranchShift | null>(null);

  // localStorage side effects removed

  const handleSave = async () => {
    if (!form.nombre || !form.jornada) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        const updatedEntry: Partial<BranchShift> = {
          nombre: form.nombre,
          jornada: form.jornada
        };
        await db.update('sedes', currentId, updatedEntry);
        setData(data.map(d => d.id === currentId ? { ...d, ...updatedEntry } : d));
      } else {
        const newEntry: BranchShift = {
          id: crypto.randomUUID(),
          nombre: form.nombre,
          jornada: form.jornada
        };
        await db.create('sedes', newEntry);
        setData([...data, newEntry]);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
       console.error("Error saving sede-jornada:", error);
       alert("Error al guardar la configuración.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nombre: '', jornada: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (item: BranchShift) => {
    setForm({
      nombre: item.nombre,
      jornada: item.jornada
    });
    setCurrentId(item.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteRequest = (item: BranchShift) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await db.delete('sedes', itemToDelete.id);
      setData(data.filter(d => d.id !== itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting sede:", error);
      alert("Error al eliminar la sede.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = data.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.jornada.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_estru_perf">
        {/* Premium Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Sedes - Jornadas</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
              Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Sedes por Jornada</span>
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
              <Plus size={20} strokeWidth={3} /> Crear Sede - jornada
            </button>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--primary-glow))' }} />
          <div style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Buscar sede - jornada..." 
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
                {['Sede', 'Jornada', 'Acciones'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 2 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                  <td style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <MapPin size={18} />
                      </div>
                      <span style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{item.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                      <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-dim)' }}>{item.jornada}</span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                        <button 
                          onClick={() => handleEdit(item)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} 
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRequest(item)}
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
          
          {filtered.length === 0 && (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <Clock size={64} style={{ marginBottom: '20px', opacity: 0.1 }} />
              <h3 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>No se encontraron resultados</h3>
              <p style={{ fontSize: '14px' }}>Intente con otro término o cree una nueva configuración.</p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* Header */}
              <div style={{ background: isEditing ? '#3b82f6' : 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{isEditing ? 'Editar Sede - jornada' : 'Crear Sede - jornada'}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>{isEditing ? 'Modifica la configuración de la sede seleccionada' : 'Configura la disponibilidad horaria por establecimiento'}</p>
                </div>
                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '32px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={40} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Configuración Exitosa!</h3>
                    <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>La relación sede-jornada ha sido registrada.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre Sede *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="Ej: Sede Principal"
                        value={form.nombre}
                        onChange={e => setForm({...form, nombre: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jornada *</label>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px', appearance: 'none' }}
                        value={form.jornada}
                        onChange={e => setForm({...form, jornada: e.target.value})}
                      >
                        <option value="">Seleccione</option>
                        {JORNADAS.map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
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
                    style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: isEditing ? '#3b82f6' : 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-glow)' }}
                  >
                    {isEditing ? 'Guardar Cambios' : 'Aceptar'}
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
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>¿Eliminar Sede - Jornada?</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.6' }}>
                  Estás a punto de eliminar la relación <strong style={{ color: 'var(--text-main)' }}>{itemToDelete?.nombre} - {itemToDelete?.jornada}</strong>. Esta acción no se puede deshacer.
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
            background: rgba(59, 130, 246, 0.02) !important;
            transform: scale(1.001);
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          }
        `}</style>
      </PermissionGate>
    </DashboardLayout>
  );
}
