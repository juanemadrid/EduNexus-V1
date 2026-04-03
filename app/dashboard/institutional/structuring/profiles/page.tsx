'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';
import { 
  Search, 
  Plus, 
  Shield, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  Eye,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { MASTER_PERMISSIONS, PermissionSection, PermissionCategory, Permission } from '@/lib/constants/permissions';

interface Profile {
  id: string;
  name: string;
  description: string;
  status: 'Activo' | 'Inactivo';
  assignedPermissions?: string[];
  advancedPermissions?: Record<string, string[]>;
}

const INITIAL_PROFILES: Profile[] = [
  { id: '1', name: 'Presupuesto', description: 'Gestión y control de recursos financieros', status: 'Activo' },
  { id: '2', name: 'Cordinador de Programas', description: 'Supervisión de planes de estudio y programas académicos', status: 'Activo' },
  { id: '3', name: 'Contaduria', description: 'Registro y auditoría contable institucional', status: 'Activo' },
  { id: '4', name: 'Secretaria Administrativa', description: 'Apoyo administrativo y gestión documental', status: 'Activo' },
  { id: '5', name: 'Coordinadora Academico', description: 'Dirección y coordinación de actividades docentes', status: 'Activo' },
];

const MOCK_PERMS = {
  institucional: [
    { category: 'Estructuración', permission: 'Asignaturas', advanced: ['Permitir administrar equivalencias de asignaturas'] },
    { category: 'Estructuración', permission: 'Programas', advanced: [] },
    { category: 'Estructuración', permission: 'Cursos', advanced: ['Permitir administrar docentes de apoyo', 'Solo permitir consultar cursos'] },
    { category: 'Estructuración', permission: 'Cerrar - Cursos', advanced: [] },
    { category: 'Estructuración', permission: 'Parámetros de evaluación asignaturas', advanced: [] },
    { category: 'Adaptaciones', permission: 'Traslado masivo de estudiantes', advanced: [] },
    { category: 'Matrículas masivas a cursos', permission: 'Matrículas masivas a cursos', advanced: [] }
  ],
  academico: [
    { category: 'Estudiantes', permission: 'Observador de estudiante', advanced: ['No permitir editar observaciones en el observador', 'No permitir eliminar observaciones en el observador', 'Permitir modificar fecha en el observador'] },
    { category: 'Estudiantes', permission: 'Permitir agregar espacio adicional en documentos digitales', advanced: [] },
    { category: 'Estudiantes', permission: 'Información académica', advanced: ['Cancelar programa', 'No permitir agregar carga académica de otros programas', 'No permitir cambiar programa', 'No permitir editar matrícula programa', 'No permitir eliminar créditos académicos adicionales', 'No permitir eliminar matrícula', 'No permitir ingresar habilitaciones', 'No permitir ingresar homologaciones', 'No permitir modificar observaciones en el récord académico', 'Permitir cancelar materias', 'Récord académico', 'Eliminar historial de asignaturas'] },
    { category: 'Estructuración', permission: 'Aulas', advanced: [] },
    { category: 'Estructuración', permission: 'Períodos', advanced: ['Crear horarios'] }
  ]
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadProfiles = async () => {
    setIsInitialLoading(true);
    try {
      const data = await db.list<Profile>('profiles');
      setProfiles(data.length > 0 ? data : INITIAL_PROFILES);
    } catch (error) {
       console.error("Error loading profiles:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Institucional');
  
  // States for Assign Permissions Modal
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [selectedAdvancedPerms, setSelectedAdvancedPerms] = useState<Record<string, string[]>>({});
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Activo' as 'Activo' | 'Inactivo'
  });

  // localStorage side effects removed

  const handleSave = async () => {
    if (!form.name) {
      alert('Por favor complete el nombre del perfil.');
      return;
    }

    setIsLoading(true);
    try {
      const newProfile: Profile = {
        id: crypto.randomUUID(),
        name: form.name,
        description: form.description,
        status: form.status,
        assignedPermissions: [],
        advancedPermissions: {}
      };

      await db.create('profiles', newProfile);
      setProfiles([...profiles, newProfile]);
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setForm({ name: '', description: '', status: 'Activo' });
      }, 1500);
    } catch (error) {
       console.error("Error saving profile:", error);
       alert("Error al guardar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAssign = (profile: Profile) => {
    setSelectedProfile(profile);
    setSelectedPerms(profile.assignedPermissions || []);
    setSelectedAdvancedPerms(profile.advancedPermissions || {});
    setShowAssignModal(true);
    setActiveTab('Institucional');
  };

  const handleAssignSave = async () => {
    if (!selectedProfile) return;
    setIsLoading(true);
    try {
      const updateData = {
        assignedPermissions: selectedPerms,
        advancedPermissions: selectedAdvancedPerms
      };
      await db.update('profiles', selectedProfile.id, updateData);
      
      // Update local state
      setProfiles(profiles.map(p => 
        p.id === selectedProfile.id 
          ? { ...p, ...updateData } 
          : p
      ));

      setSuccess(true);
      setTimeout(() => {
        setShowAssignModal(false);
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Error al guardar los permisos.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePerm = (permId: string) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const toggleAdvanced = (permId: string, advancedName: string) => {
    setSelectedAdvancedPerms(prev => {
      const current = prev[permId] || [];
      const updated = current.includes(advancedName)
        ? current.filter(a => a !== advancedName)
        : [...current, advancedName];
      return { ...prev, [permId]: updated };
    });
  };

  const toggleCat = (catName: string) => {
    setExpandedCats(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
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
                      <button 
                         onClick={() => { setSelectedProfile(profile); setShowPermissionsModal(true); setActiveTab(MASTER_PERMISSIONS[0]?.name || 'Institucional'); }}
                         style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} 
                         title="Ver permisos"
                      >
                         <Eye size={18} />
                      </button>
                      <button 
                         style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} 
                         title="Asignar permisos"
                         onClick={() => handleOpenAssign(profile)}
                      >
                         <Shield size={18} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={18} /></button>
                       <button 
                        onClick={async () => {
                          if (confirm('¿Eliminar este perfil?')) {
                            setIsLoading(true);
                            try {
                              await db.delete('profiles', profile.id);
                              setProfiles(profiles.filter(p => p.id !== profile.id));
                            } catch (error) {
                              console.error("Error deleting profile:", error);
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }}
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

      {/* View Permissions Modal (Dynamic) */}
      {showPermissionsModal && selectedProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-main)', borderRadius: '24px', width: '100%', maxWidth: '1100px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                   <Shield size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Perfil: {selectedProfile.name}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Permisos asignados actualmente</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPermissionsModal(false)} 
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
               {/* Profile Info Row (New Style) */}
               <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', background: 'rgba(0,0,0,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>Nombre:</label>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{selectedProfile.name}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>Estado:</label>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{selectedProfile.status}</div>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>Descripción:</label>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-dim)' }}>{selectedProfile.description || 'N/A'}</div>
                  </div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', gap: '8px', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                     <Shield size={16} style={{ color: 'var(--primary)' }} />
                     Permisos Asignados
                  </h3>
                  <button 
                    onClick={() => { setShowPermissionsModal(false); handleOpenAssign(selectedProfile); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Asignar permisos
                  </button>
               </div>
               {/* Tabs */}
               <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {MASTER_PERMISSIONS.map(section => {
                    const assignedInSection = section.categories.flatMap(c => 
                      c.permissions.filter(p => selectedProfile.assignedPermissions?.includes(p.id))
                    );
                    return (
                      <button 
                         key={section.name}
                         onClick={() => setActiveTab(section.name)}
                         style={{ 
                            padding: '10px 24px', 
                            background: activeTab === section.name ? 'var(--primary)' : 'rgba(0,0,0,0.03)', 
                            color: activeTab === section.name ? 'white' : 'var(--text-dim)', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontWeight: '700', 
                            fontSize: '13px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: '0.2s'
                         }}
                      >
                         {section.name}
                         <span style={{ background: activeTab === section.name ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                            {assignedInSection.length}
                         </span>
                      </button>
                    );
                  })}
               </div>

               {/* Assigned Permissions Table */}
               <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                     <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                           <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', width: '15%' }}>Categoría</th>
                           <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', width: '30%' }}>Permiso</th>
                           <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', width: '50%' }}>Avanzados</th>
                           <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', width: '5%' }}>Acciones</th>
                        </tr>
                     </thead>
                      <tbody>
                        {(() => {
                           const currentSection = MASTER_PERMISSIONS.find(s => s.name === activeTab);
                           const assignedRows: { cat: string, name: string, id: string, advanced: string[] }[] = [];
                           
                           (currentSection?.categories || []).forEach(cat => {
                              cat.permissions.forEach(p => {
                                 if (selectedProfile.assignedPermissions?.includes(p.id)) {
                                    assignedRows.push({
                                       cat: cat.name,
                                       name: p.name,
                                       id: p.id,
                                       advanced: selectedProfile.advancedPermissions?.[p.id] || []
                                    });
                                 }
                              });
                           });

                           if (assignedRows.length === 0) {
                              return (
                                 <tr>
                                    <td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>
                                       <div style={{ color: 'var(--text-dim)', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                          <span>El usuario no cuenta con permisos asignados.</span>
                                          <button 
                                            onClick={() => { setShowPermissionsModal(false); handleOpenAssign(selectedProfile); }}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                                          >
                                            Asigne permisos
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           }

                           let lastCat = '';
                           return assignedRows.map((row) => {
                              const isNewCat = row.cat !== lastCat;
                              lastCat = row.cat;
                              return (
                                <tr key={row.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                  <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '750', color: 'var(--text-main)', verticalAlign: 'top', borderRight: '1px solid #f1f5f9' }}>
                                     {isNewCat ? row.cat : ''}
                                  </td>
                                  <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--text-dim)', verticalAlign: 'top', fontWeight: '500' }}>{row.name}</td>
                                  <td style={{ padding: '20px 24px', fontSize: '12px', color: '#64748b', verticalAlign: 'top' }}>
                                     {row.advanced.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                           {row.advanced.map(adv => (
                                              <label key={adv} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
                                                 <input type="checkbox" checked={true} readOnly style={{ width: '14px', height: '14px', accentColor: 'var(--primary)' }} />
                                                 {adv}
                                              </label>
                                           ))}
                                        </div>
                                     ) : '-'}
                                  </td>
                                  <td style={{ padding: '20px 24px', textAlign: 'center', verticalAlign: 'top' }}>
                                    <button 
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }} 
                                      title="Quitar permiso"
                                      onClick={async () => {
                                        if (confirm(`¿Quitar el permiso "${row.name}" de este perfil?`)) {
                                          const newPerms = selectedProfile.assignedPermissions?.filter(id => id !== row.id) || [];
                                          await db.update('profiles', selectedProfile.id, { assignedPermissions: newPerms });
                                          setProfiles(profiles.map(p => p.id === selectedProfile.id ? { ...p, assignedPermissions: newPerms } : p));
                                          // Update modal state
                                          setSelectedProfile({ ...selectedProfile, assignedPermissions: newPerms });
                                        }
                                      }}
                                    >
                                       <X size={16} />
                                    </button>
                                  </td>
                                </tr>
                              );
                           });
                        })()}
                      </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Permissions Modal */}
      {showAssignModal && selectedProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
             {/* Header */}
             <div style={{ background: '#3b82f6', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
               <div>
                 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Asignar permisos: {selectedProfile.name}</h2>
                 <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Marque los permisos institucionales y académicos permitidos para este rol</p>
               </div>
               <button onClick={() => setShowAssignModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                 <X size={20} />
               </button>
             </div>

             <div style={{ padding: '32px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
               {success ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={40} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Permisos Actualizados!</h3>
                    <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>Los cambios han sido guardados exitosamente.</p>
                  </div>
               ) : (
                 <div style={{ display: 'flex', gap: '32px' }}>
                     {/* Sections Tabs Left */}
                     <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {MASTER_PERMISSIONS.map(section => {
                         const totalInSecret = section.categories.reduce((acc, cat) => acc + cat.permissions.length, 0);
                         return (
                           <button 
                             key={section.name}
                             onClick={() => { setActiveTab(section.name); setCurrentPage(1); }}
                             style={{ 
                               textAlign: 'left',
                               padding: '14px 20px',
                               background: activeTab === section.name ? 'var(--primary)' : 'white',
                               color: activeTab === section.name ? 'white' : 'var(--text-dim)',
                               border: activeTab === section.name ? 'none' : '1px solid #e2e8f0',
                               borderRadius: '12px',
                               fontWeight: '700',
                               fontSize: '14px',
                               cursor: 'pointer',
                               transition: '0.2s',
                               display: 'flex',
                               justifyContent: 'space-between',
                               alignItems: 'center'
                             }}
                           >
                             {section.name}
                             <span style={{ 
                               background: activeTab === section.name ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                               padding: '2px 8px', 
                               borderRadius: '10px', 
                               fontSize: '11px' 
                             }}>
                               {totalInSecret}
                             </span>
                           </button>
                         );
                       })}
                     </div>

                     {/* Permissions List Right */}
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       {/* Modal Search Bar */}
                       <div style={{ position: 'relative' }}>
                          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input 
                            type="text" 
                            placeholder="Buscar permiso..." 
                            className="input-premium"
                            style={{ paddingLeft: '48px', height: '44px', fontSize: '14px', width: '100%', background: 'white' }}
                            value={modalSearchTerm}
                            onChange={(e) => setModalSearchTerm(e.target.value)}
                          />
                       </div>

                       {/* Flat Paginated Permissions Table */}
                       <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                             <thead>
                                <tr style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', width: '25%' }}>Categoría</th>
                                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', width: '65%' }}>Permiso</th>
                                   <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', width: '10%' }}></th>
                                </tr>
                             </thead>
                             <tbody>
                                {(() => {
                                   const currentSection = MASTER_PERMISSIONS.find(s => s.name === activeTab);
                                   const flatList: { cat: string, id: string, name: string, advanced?: string[] }[] = [];
                                   
                                   (currentSection?.categories || []).forEach(cat => {
                                      cat.permissions.forEach(p => {
                                         if (!modalSearchTerm || p.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || cat.name.toLowerCase().includes(modalSearchTerm.toLowerCase())) {
                                            flatList.push({ cat: cat.name, ...p });
                                         }
                                      });
                                   });

                                   const itemsPerPage = 12;
                                   const totalPages = Math.ceil(flatList.length / itemsPerPage);
                                   const paginatedItems = flatList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                                   if (paginatedItems.length === 0) {
                                      return (
                                         <tr>
                                            <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No se encontraron permisos coincidentes.</td>
                                         </tr>
                                      );
                                   }

                                   return paginatedItems.map((item) => (
                                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row-hover">
                                         <td style={{ padding: '14px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{item.cat}</td>
                                         <td style={{ padding: '14px 24px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                                            <div>{item.name}</div>
                                            {selectedPerms.includes(item.id) && item.advanced && item.advanced.length > 0 && (
                                              <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                                 {item.advanced.map(adv => (
                                                   <label key={adv} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                                                      <input 
                                                        type="checkbox" 
                                                        checked={selectedAdvancedPerms[item.id]?.includes(adv)} 
                                                        onChange={() => toggleAdvanced(item.id, adv)}
                                                        style={{ width: '12px', height: '12px' }}
                                                      />
                                                      {adv}
                                                   </label>
                                                 ))}
                                              </div>
                                            )}
                                         </td>
                                         <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                            <input 
                                               type="checkbox" 
                                               checked={selectedPerms.includes(item.id)} 
                                               onChange={() => togglePerm(item.id)}
                                               style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                            />
                                         </td>
                                      </tr>
                                   ));
                                })()}
                             </tbody>
                          </table>
                          
                          {/* Real Pagination Footer */}
                          <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                             {(() => {
                                const currentSection = MASTER_PERMISSIONS.find(s => s.name === activeTab);
                                const flatList: any[] = [];
                                (currentSection?.categories || []).forEach(cat => {
                                   cat.permissions.forEach(p => {
                                      if (!modalSearchTerm || p.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || cat.name.toLowerCase().includes(modalSearchTerm.toLowerCase())) {
                                         flatList.push(p);
                                      }
                                   });
                                });
                                const totalPages = Math.ceil(flatList.length / 12);
                                if (totalPages <= 1) return null;

                                return (
                                   <>
                                      <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                                      >
                                         Anterior
                                      </button>
                                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                         <button 
                                            key={p} 
                                            onClick={() => setCurrentPage(p)}
                                            style={{ 
                                              width: '32px', 
                                              height: '32px', 
                                              borderRadius: '6px', 
                                              border: '1px solid #e2e8f0', 
                                              background: currentPage === p ? 'var(--primary)' : 'white',
                                              color: currentPage === p ? 'white' : '#64748b',
                                              fontSize: '13px',
                                              fontWeight: '700',
                                              cursor: 'pointer'
                                            }}
                                         >
                                            {p}
                                         </button>
                                      ))}
                                      <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                                      >
                                         Siguiente
                                      </button>
                                   </>
                                );
                             })()}
                          </div>
                       </div>
                     </div>
                 </div>
               )}
             </div>

             <div style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: 'white' }}>
               <button 
                 onClick={() => setShowAssignModal(false)}
                 style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleAssignSave}
                 disabled={isLoading}
                 style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', opacity: isLoading ? 0.7 : 1 }}
               >
                 {isLoading ? 'Guardando...' : 'Guardar y Asignar'}
               </button>
             </div>
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
