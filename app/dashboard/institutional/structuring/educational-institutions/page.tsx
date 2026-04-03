'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { 
  Search, 
  Plus, 
  GraduationCap, 
  Download, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  Filter,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  School
} from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  nit: string;
  phone: string;
  address: string;
  city: string;
  email: string;
  status: 'Activa' | 'Inactiva';
  createdAt?: string;
  updatedAt?: string;
}

const CITIES = [
  'Sincelejo', 'Corozal', 'Morroa', 'Sampués', 'Los Palmitos', 'Buenavista', 'Ovejas', 
  'San Pedro', 'San Onofre', 'Tolú', 'Coveñas', 'Galeras', 'El Roble', 
  'San Benito Abad', 'Majagual', 'Guaranda', 'Sucre', 'Betulia', 'Sincé', 
  'Caimito', 'Colosó', 'Chalán', 'Palmito', 'Tolú Viejo'
];

export default function EducationalInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadInstitutions = async () => {
    setIsInitialLoading(true);
    try {
      const data = await db.list<Institution>('educational_institutions');
      setInstitutions(data);
    } catch (error) {
       console.error("Error loading educational institutions:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    nit: '',
    phone: '',
    address: '',
    city: '',
    email: '',
    status: 'Activa' as 'Activa' | 'Inactiva'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.name) {
      alert('Por favor complete el nombre de la institución.');
      return;
    }

    setIsLoading(true);
    try {
      const institutionData: any = {
        name: form.name,
        nit: form.nit,
        phone: form.phone,
        address: form.address,
        city: form.city,
        email: form.email,
        status: form.status,
        updatedAt: new Date().toISOString()
      };

      if (isEditing && currentId) {
        await db.update('educational_institutions', currentId, institutionData);
        setInstitutions(institutions.map(i => i.id === currentId ? { ...i, ...institutionData } : i));
      } else {
        const newId = crypto.randomUUID();
        const newInstitution: Institution = { ...institutionData, id: newId, createdAt: new Date().toISOString() };
        await db.create('educational_institutions', newInstitution);
        setInstitutions([...institutions, newInstitution]);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
       console.error("Error saving institution:", error);
       alert("Error al guardar la institución.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', nit: '', phone: '', address: '', city: '', email: '', status: 'Activa' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (inst: Institution) => {
    setForm({
      name: inst.name,
      nit: inst.nit,
      phone: inst.phone,
      address: inst.address,
      city: inst.city,
      email: inst.email,
      status: inst.status
    });
    setCurrentId(inst.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleExport = () => {
    const headers = ['Institución', 'NIT', 'Teléfono', 'Dirección', 'Municipio', 'Email', 'Estado'];
    const rows = filtered.map(i => [
      i.name, i.nit, i.phone, i.address, i.city, i.email, i.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `instituciones_educativas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || inst.nit.includes(searchTerm);
    const matchesStatus = includeInactive ? true : inst.status === 'Activa';
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_estru_perf">
        {/* Premium Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Instituciones Educativas</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
              Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Convenios Educativos</span>
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
              <Plus size={20} strokeWidth={3} stroke="#fff" /> Crear institución
            </button>
          </div>
        </div>

        {/* Search Bar & Advanced Toggle */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--primary-glow))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar instituciones por nombre o NIT..." 
                  className="input-premium"
                  style={{ paddingLeft: '48px', height: '52px', fontSize: '15px', width: '100%' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className={`btn-secondary ${showAdvanced ? 'active' : ''}`} 
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Filter size={18} /> Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
              <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
            </div>

            {/* Advanced Search Panel */}
            {showAdvanced && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                    <input 
                      type="checkbox" 
                      checked={includeInactive}
                      onChange={e => setIncludeInactive(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    ¿Incluir instituciones inactivas?
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', minHeight: '200px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-dim)' }}>
                <School size={40} opacity={0.5} />
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500' }}>
                No hay registros, verifique los filtros de la consulta o <span onClick={() => { resetForm(); setShowModal(true); }} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>cree uno nuevo</span>
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                  {['Institución', 'NIT', 'Contacto', 'Ubicación', 'Estado', 'Acciones'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst) => (
                  <tr key={inst.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                    <td style={{ padding: '24px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                          <GraduationCap size={18} />
                        </div>
                        <span style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{inst.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px', fontSize: '14px', fontWeight: '800', color: 'var(--text-dim)' }}>{inst.nit}</td>
                    <td style={{ padding: '24px 32px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>
                            <Phone size={14} style={{ color: 'var(--primary)' }} /> {inst.phone || '-'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
                            <Mail size={14} /> {inst.email || '-'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>
                            <MapPin size={14} style={{ color: '#3b82f6' }} /> {inst.city || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', paddingLeft: '20px' }}>
                            {inst.address || '-'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px' }}>
                      <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '10px', 
                        fontSize: '11px', 
                        fontWeight: '800',
                        background: inst.status === 'Activa' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: inst.status === 'Activa' ? '#059669' : '#dc2626'
                      }}>
                        {inst.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                          <button onClick={() => handleEdit(inst)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={18} /></button>
                          <button 
                            onClick={async () => {
                              if (confirm('¿Eliminar esta institución?')) {
                                setIsLoading(true);
                                try {
                                  await db.delete('educational_institutions', inst.id);
                                  setInstitutions(institutions.filter(i => i.id !== inst.id));
                                } catch (error) {
                                  console.error("Error deleting institution:", error);
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
          )}
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '650px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* Header */}
              <div style={{ background: 'rgb(34, 197, 94)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{isEditing ? 'Editar institución' : 'Crear institución educativa'}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>{isEditing ? 'Actualice la información del aliado educativo' : 'Registre un nuevo aliado educativo en el sistema'}</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '32px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={40} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{isEditing ? '¡Institución Actualizada!' : '¡Institución Registrada!'}</h3>
                    <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>Los datos se han guardado satisfactoriamente.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Institución *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="Nombre de la institución educativa"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>NIT</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="900.000.000-1"
                        value={form.nit}
                        onChange={e => setForm({...form, nit: e.target.value})}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Teléfono</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="300 000 0000"
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Dirección</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="Avenida principal # 12 - 34"
                        value={form.address}
                        onChange={e => setForm({...form, address: e.target.value})}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Municipio</label>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px', padding: '0 16px' }}
                        value={form.city}
                        onChange={e => setForm({...form, city: e.target.value})}
                      >
                        <option value="">Seleccione municipio</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Correo electrónico</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="info@institucion.edu.co"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                      <div style={{ display: 'flex', gap: '20px', height: '40px', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-main)' }}>
                            <input type="radio" checked={form.status === 'Activa'} onChange={() => setForm({...form, status: 'Activa'})} style={{ width: '18px', height: '18px', accentColor: 'rgb(34, 197, 94)' }} /> Activa
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-main)' }}>
                            <input type="radio" checked={form.status === 'Inactiva'} onChange={() => setForm({...form, status: 'Inactiva'})} style={{ width: '18px', height: '18px', accentColor: 'rgb(34, 197, 94)' }} /> Inactiva
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
      </PermissionGate>

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(16, 185, 129, 0.02) !important;
          transform: translateY(-1px);
        }
        .btn-secondary.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
    </DashboardLayout>
  );
}
