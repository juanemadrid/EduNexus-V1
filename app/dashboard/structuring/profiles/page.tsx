'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  Shield, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  Eye
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  description: string;
  status: 'Activo' | 'Inactivo';
}

const INITIAL_PROFILES: Profile[] = [
  { id: '1', name: 'Presupuesto', description: 'Gestión y control de recursos financieros', status: 'Activo' },
  { id: '2', name: 'Cordinador de Programas', description: 'Supervisión de planes de estudio y programas académicos', status: 'Activo' },
  { id: '3', name: 'Contaduria', description: 'Registro y auditoría contable institucional', status: 'Activo' },
  { id: '4', name: 'Secretaria Administrativa', description: 'Apoyo administrativo y gestión documental', status: 'Activo' },
  { id: '5', name: 'Coordinadora Academico', description: 'Dirección y coordinación de actividades docentes', status: 'Activo' },
];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_profiles');
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    }
    return INITIAL_PROFILES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Activo' as 'Activo' | 'Inactivo'
  });

  useEffect(() => {
    localStorage.setItem('edunexus_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleSave = () => {
    if (!form.name) {
      alert('Por favor complete el nombre del perfil.');
      return;
    }

    const newProfile: Profile = {
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      status: form.status
    };

    setProfiles([...profiles, newProfile]);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setForm({ name: '', description: '', status: 'Activo' });
    }, 1500);
  };

  const filtered = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Gestión de Perfiles</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Roles y Permisos</span>
          </p>
        </div>
        <button 
          className="btn-premium" 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
        >
          <Plus size={20} strokeWidth={3} /> Crear Perfil
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--primary-glow))' }} />
        <div style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar perfiles por nombre o descripción..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '52px', fontSize: '15px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary" style={{ padding: '0 20px', height: '52px' }}>Búsqueda avanzada</button>
          <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Nombre', 'Descripción', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((profile) => (
              <tr key={profile.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                      <Shield size={18} />
                    </div>
                    <span style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{profile.name}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px', fontSize: '14px', color: 'var(--text-dim)', fontWeight: '500' }}>
                  {profile.description || 'Sin descripción'}
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: profile.status === 'Activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: profile.status === 'Activo' ? '#059669' : '#dc2626'
                  }}>
                    {profile.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Ver permisos"><Eye size={18} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={18} /></button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Eliminar este perfil?')) {
                            setProfiles(profiles.filter(p => p.id !== profile.id));
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
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Crear Perfil</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Define un nuevo rol institucional</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={40} />
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Perfil Registrado!</h3>
                   <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>El perfil institucional se ha creado correctamente.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="Ej: Auditor Interno"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado *</label>
                      <div style={{ display: 'flex', gap: '16px', height: '48px', alignItems: 'center' }}>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                            <input type="radio" checked={form.status === 'Activo'} onChange={() => setForm({...form, status: 'Activo'})} /> Activa
                         </label>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                            <input type="radio" checked={form.status === 'Inactivo'} onChange={() => setForm({...form, status: 'Inactivo'})} /> Inactiva
                         </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Descripción</label>
                    <textarea 
                      className="input-premium" 
                      style={{ width: '100%', height: '100px', padding: '12px', resize: 'none' }} 
                      placeholder="Breve descripción de las responsabilidades del perfil..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

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
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(59, 130, 246, 0.02) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </DashboardLayout>
  );
}
