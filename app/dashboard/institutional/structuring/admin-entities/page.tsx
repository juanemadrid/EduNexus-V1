'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { 
  Search, 
  Plus, 
  Building2, 
  Download, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  Hash,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertCircle
} from 'lucide-react';

interface AdminEntity {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  type: string;
  status: 'Activo' | 'Inactivo';
  createdAt?: string;
  updatedAt?: string;
}

const ENTITY_TYPES = ['EPS', 'ARP', 'IPS', 'AFP', 'Caja de Compensación', 'Cesantías', 'Otro'];

const emptyForm = {
  code: '',
  name: '',
  abbreviation: '',
  type: '',
  status: 'Activo' as 'Activo' | 'Inactivo'
};

export default function AdminEntitiesPage() {
  const [entities, setEntities] = useState<AdminEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadAdminEntities = async () => {
    setIsInitialLoading(true);
    try {
      const data = await db.list<AdminEntity>('admin_entities');
      setEntities(data);
    } catch (error) {
       console.error("Error loading admin entities:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadAdminEntities();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.abbreviation || !form.type) {
      alert('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    setIsLoading(true);
    try {
      const entityData: any = {
        code: form.code,
        name: form.name.toUpperCase(),
        abbreviation: form.abbreviation.toUpperCase(),
        type: form.type,
        status: form.status,
        updatedAt: new Date().toISOString()
      };

      if (isEditing && currentId) {
        await db.update('admin_entities', currentId, entityData);
        setEntities(entities.map(e => e.id === currentId ? { ...e, ...entityData } : e));
      } else {
        const newId = crypto.randomUUID();
        const newEntity: AdminEntity = { ...entityData, id: newId, createdAt: new Date().toISOString() };
        await db.create('admin_entities', newEntity);
        setEntities([...entities, newEntity]);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
       console.error("Error saving admin entity:", error);
       alert("Error al guardar la entidad.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ent: AdminEntity) => {
    setForm({
      code: ent.code,
      name: ent.name,
      abbreviation: ent.abbreviation,
      type: ent.type,
      status: ent.status
    });
    setCurrentId(ent.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (ent: AdminEntity) => {
    if (!confirm(`¿Eliminar la entidad "${ent.name}"?`)) return;
    setIsLoading(true);
    try {
      await db.delete('admin_entities', ent.id);
      setEntities(prev => prev.filter(item => item.id !== ent.id));
    } catch (error) {
      console.error("Error deleting entity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const header = 'Código,Nombre,Abreviatura,Tipo,Estado';
    const rows = filtered.map(ent => `"${ent.code}","${ent.name}","${ent.abbreviation}","${ent.type}","${ent.status}"`);
    const csvStr = [header, ...rows].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'entidades_administradoras.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = entities.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.code.includes(searchTerm) ||
    e.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lblStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
  };

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_estru_perf">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Entidades administradoras</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
              Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Seguridad Social</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              <Download size={18} /> Exportar
            </button>
            <button 
              className="btn-premium" 
              onClick={() => { resetForm(); setShowModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
            >
              <Plus size={20} strokeWidth={3} stroke="#fff" /> Crear entidad
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Buscar por código, nombre o abreviatura..." 
                className="input-premium"
                style={{ paddingLeft: '48px', height: '52px', fontSize: '15px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-premium" style={{ padding: '0 32px', height: '52px' }}>
               Buscar
            </button>
            <button 
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '750', fontSize: '14px', cursor: 'pointer' }}
            >
               Búsqueda avanzada <ChevronDown size={18} style={{ transform: showAdvancedSearch ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                {['Código', 'Nombre', 'Abreviatura', 'Tipo', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 5 ? 'center' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isInitialLoading ? (
                <tr><td colSpan={6} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>Cargando entidades...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>No hay registros encontrados.</td></tr>
              ) : filtered.map((ent) => (
                <tr key={ent.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--primary)', background: 'rgba(124, 58, 237, 0.05)', padding: '4px 8px', borderRadius: '6px' }}>{ent.code}</span>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{ent.name}</span>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-dim)' }}>{ent.abbreviation}</span>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontWeight: '700', fontSize: '13px' }}>
                       <Activity size={14} style={{ color: 'var(--primary)' }} /> {ent.type}
                    </div>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '10px', 
                      fontWeight: '800',
                      background: ent.status === 'Activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: ent.status === 'Activo' ? '#059669' : '#dc2626'
                    }}>
                      {ent.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', color: 'var(--text-dim)' }}>
                       <button onClick={() => handleEdit(ent)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Edit size={18} /></button>
                       <button onClick={() => handleDelete(ent)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', gap: '1px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                   <button style={{ padding: '8px 16px', background: 'white', color: 'var(--text-dim)', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
                      <ChevronLeft size={16}/>
                   </button>
                   
                   {/* Dinamyc logic for pages could be added here, for now limited to actual pages */}
                   {Array.from({ length: Math.ceil(filtered.length / 10) || 1 }).map((_, i) => (
                      <button key={i} style={{ 
                        padding: '8px 16px', 
                        background: i === 0 ? 'var(--primary)' : 'white', 
                        color: i === 0 ? 'white' : 'var(--text-dim)',
                        border: 'none',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '40px'
                      }}>
                        {i + 1}
                      </button>
                   ))}

                   <button style={{ padding: '8px 16px', background: 'white', color: 'var(--text-dim)', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
                      <ChevronRight size={16}/>
                   </button>
                </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '580px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* Header */}
              <div style={{ background: 'rgb(34, 197, 94)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{isEditing ? 'Editar entidad' : 'Crear entidad administradora'}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Gestión de entidades de seguridad social y salud</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '32px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                     <div style={{ width: '64px', height: '64px', background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={40} />
                     </div>
                     <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{isEditing ? '¡Entidad Actualizada!' : '¡Entidad Registrada!'}</h3>
                     <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>La información ha sido guardada exitosamente.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={lblStyle}>Código *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="Ej. 12015"
                        value={form.code}
                        onChange={e => setForm({...form, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={lblStyle}>Nombre entidad *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="Ej. UNISALUD"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={lblStyle}>Abreviatura *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="Ej. UNISALUD"
                        value={form.abbreviation}
                        onChange={e => setForm({...form, abbreviation: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={lblStyle}>Tipo entidad *</label>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px', padding: '0 16px' }}
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value})}
                      >
                        <option value="">Seleccione</option>
                        {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={lblStyle}>Estado *</label>
                      <div style={{ display: 'flex', gap: '24px' }}>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                            <input type="radio" checked={form.status === 'Activo'} onChange={() => setForm({...form, status: 'Activo'})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Activo
                         </label>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                            <input type="radio" checked={form.status === 'Inactivo'} onChange={() => setForm({...form, status: 'Inactivo'})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Inactivo
                         </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                  <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '12px 24px' }}>Cancelar</button>
                  <button onClick={handleSave} className="btn-premium" style={{ background: 'rgb(34, 197, 94)', padding: '12px 32px' }}>Aceptar</button>
                </div>
              )}
            </div>
          </div>
        )}
      </PermissionGate>

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(124, 58, 237, 0.02) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </DashboardLayout>
  );
}
