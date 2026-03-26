'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
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
  Filter,
  Check,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminEntity {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  type: string;
  status: 'Activo' | 'Inactivo';
}

const ENTITY_TYPES = ['EPS', 'ARP', 'IPS', 'Caja de Compensación', 'Cesantías', 'AFP', 'Otro'];

// Initial mock data based on screenshot
const MOCK_DATA: AdminEntity[] = [
  { id: '1', code: '52013', name: 'Unisalud', abbreviation: 'UNISALUD', type: 'EPS', status: 'Activo' },
  { id: '2', code: '0205015874', name: 'Unión temporal', abbreviation: 'Unión temporal', type: 'EPS', status: 'Activo' },
  { id: '3', code: '00253625', name: 'U.t Norte', abbreviation: 'U.t Norte', type: 'EPS', status: 'Activo' },
  { id: '4', code: '52919', name: 'Suramericana', abbreviation: 'Suramericana', type: 'EPS', status: 'Activo' },
  { id: '5', code: '046544646546', name: 'Sisben', abbreviation: 'SISBEN', type: 'EPS', status: 'Activo' }
];

export default function AdminEntitiesPage() {
  const [entities, setEntities] = useState<AdminEntity[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_admin_entities');
      return saved ? JSON.parse(saved) : MOCK_DATA;
    }
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    code: '',
    name: '',
    abbreviation: '',
    type: '',
    status: 'Activo' as 'Activo' | 'Inactivo'
  });

  useEffect(() => {
    localStorage.setItem('edunexus_admin_entities', JSON.stringify(entities));
  }, [entities]);

  const handleSave = () => {
    if (!form.code || !form.name || !form.abbreviation || !form.type) {
      alert('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    const newEntity: AdminEntity = {
      id: Date.now().toString(),
      code: form.code,
      name: form.name,
      abbreviation: form.abbreviation.toUpperCase(),
      type: form.type,
      status: form.status
    };

    setEntities([...entities, newEntity]);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setForm({ code: '', name: '', abbreviation: '', type: '', status: 'Activo' });
    }, 1500);
  };

  const filtered = entities.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.code.includes(searchTerm) ||
    e.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Entidades administradoras</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Seguridad Social</span>
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
            <Plus size={20} strokeWidth={3} /> Crear entidad administradora
          </button>
        </div>
      </div>

      {/* Search & Filters */}
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

        {showAdvancedSearch && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
             <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Entidad</label>
                <select className="input-premium" style={{ width: '100%', height: '40px', padding: '0 12px' }}>
                   <option value="">Todos los tipos</option>
                   {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                <div style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      <input type="checkbox" checked style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Activos
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Inactivos
                   </label>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Código', 'Nombre', 'Abreviatura', 'Tipo', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: '500' }}>
                  No hay registros que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((ent) => (
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
                  <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                       <button className="action-icon-btn"><Edit size={18} /></button>
                       <button 
                         onClick={() => {
                           if (confirm('¿Eliminar esta entidad?')) {
                             setEntities(entities.filter(item => item.id !== ent.id));
                           }
                         }}
                         className="action-icon-btn" 
                         style={{ color: '#ef4444' }}
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Mirror Q10 */}
        <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.01)' }}>
            <div style={{ display: 'flex', gap: '1px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
               {[<ChevronLeft size={16}/>, '1', '2', '3', '4', '5', <ChevronRight size={16}/>].map((p, i) => (
                  <button key={i} style={{ 
                    padding: '8px 16px', 
                    background: p === '1' ? 'var(--primary)' : 'white', 
                    color: p === '1' ? 'white' : 'var(--text-dim)',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '40px'
                  }}>
                    {p}
                  </button>
               ))}
            </div>
        </div>
      </div>

      {/* Modal Creating Entity */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background: 'rgb(34, 197, 94)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Crear entidad administradora</h2>
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
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Entidad Registrada!</h3>
                   <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>La información ha sido guardada exitosamente.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Código *</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="Ej. 52013"
                      value={form.code}
                      onChange={e => setForm({...form, code: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre entidad *</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="Ej. Salud Vital EPS"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Abreviatura *</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="Ej. SALUDV"
                      value={form.abbreviation}
                      onChange={e => setForm({...form, abbreviation: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo entidad *</label>
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
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado *</label>
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
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'rgb(34, 197, 94)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(124, 58, 237, 0.02) !important;
          transform: translateY(-1px);
        }
        .action-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          padding: 8px;
          border-radius: 8px;
          transition: 0.2s;
        }
        .action-icon-btn:hover {
          background: rgba(0,0,0,0.05);
        }
      `}</style>
    </DashboardLayout>
  );
}
