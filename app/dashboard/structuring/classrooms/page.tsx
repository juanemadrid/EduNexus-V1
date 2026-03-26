'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  MapPin, 
  Monitor, 
  Users, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  branch: string;
  description: string;
  status: 'Activa' | 'Inactiva';
}

const INITIAL_AULAS: Classroom[] = [
  { id: '1', name: 'AUDITORIO 01', capacity: 35, branch: 'Principal', description: 'AUDITORIO GENERAL', status: 'Activa' },
  { id: '2', name: 'AULA 02', capacity: 30, branch: 'Principal', description: 'AULA GENERAL', status: 'Activa' },
  { id: '3', name: 'AULA 03', capacity: 30, branch: 'Principal', description: 'AULA GENERAL', status: 'Activa' },
  { id: '4', name: 'AULA 04', capacity: 25, branch: 'Principal', description: 'LABORATORIO DE SISTEMAS', status: 'Activa' },
  { id: '5', name: 'RECEPCIÓN', capacity: 2, branch: 'Principal', description: 'Punto de información general de la corporacion.', status: 'Activa' },
];

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_classrooms');
      return saved ? JSON.parse(saved) : INITIAL_AULAS;
    }
    return INITIAL_AULAS;
  });

  const [branches, setBranches] = useState<string[]>(['Principal']);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedShifts = localStorage.getItem('edunexus_branch_shifts');
      if (savedShifts) {
        const shifts = JSON.parse(savedShifts);
        const uniqueBranches = Array.from(new Set(shifts.map((s: any) => s.branch))) as string[];
        if (uniqueBranches.length > 0) {
          setBranches(uniqueBranches);
          // If current form branch is not in the new list, set it to the first one
          if (!uniqueBranches.includes(form.branch)) {
             setForm(prev => ({ ...prev, branch: uniqueBranches[0] || 'Principal' }));
          }
        }
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    capacity: '',
    branch: 'Principal',
    description: '',
    status: 'Activa' as 'Activa' | 'Inactiva'
  });

  useEffect(() => {
    localStorage.setItem('edunexus_classrooms', JSON.stringify(classrooms));
  }, [classrooms]);

  const handleSave = () => {
    if (!form.name || !form.capacity) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    const newClassroom: Classroom = {
      id: Date.now().toString(),
      name: form.name.toUpperCase(),
      capacity: parseInt(form.capacity),
      branch: form.branch,
      description: form.description,
      status: form.status
    };

    setClassrooms([...classrooms, newClassroom]);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setForm({ name: '', capacity: '', branch: 'Principal', description: '', status: 'Activa' });
    }, 1500);
  };

  const filtered = classrooms.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Gestión de Aulas</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Aulas y Espacios</span>
          </p>
        </div>
        <button 
          className="btn-premium" 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
        >
          <Plus size={20} strokeWidth={3} /> Crear aula
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
              placeholder="Buscar aulas por nombre o descripción..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '52px', fontSize: '15px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn-secondary" style={{ padding: '0 20px', height: '52px' }}>Filtros Avanzados</button>
             <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
          </div>
        </div>
      </div>

      {/* Classrooms Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Nombre', 'Cupo', 'Sede', 'Descripción', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((aula) => (
              <tr key={aula.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Monitor size={20} />
                    </div>
                    <div>
                      <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)', display: 'block' }}>{aula.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700' }}>ID: {aula.id}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontWeight: '750', fontSize: '14px' }}>{aula.capacity}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} style={{ color: '#3b82f6' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{aula.branch}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px', fontSize: '14px', color: 'var(--text-dim)', fontWeight: '500', maxWidth: '300px' }}>
                  {aula.description}
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: aula.status === 'Activa' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: aula.status === 'Activa' ? '#059669' : '#dc2626',
                    border: '1px solid transparent'
                  }}>
                    {aula.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={18} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Más opciones"><MoreHorizontal size={18} /></button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Eliminar esta aula?')) {
                            setClassrooms(classrooms.filter(c => c.id !== aula.id));
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
             <Monitor size={64} style={{ marginBottom: '20px', opacity: 0.1 }} />
             <h3 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>No se encontraron aulas</h3>
             <p style={{ fontSize: '14px' }}>Intenta con otro término de búsqueda o crea una nueva aula.</p>
          </div>
        )}
      </div>

      {/* Create Classroom Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Crear Nueva Aula</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Ingresa los detalles del nuevo espacio</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Aula Creada!</h3>
                   <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>La información se ha guardado exitosamente.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre del Aula *</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="Ej: AULA 101"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cupo (Capacidad) *</label>
                      <input 
                        type="number"
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="25"
                        value={form.capacity}
                        onChange={e => setForm({...form, capacity: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sede</label>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px', appearance: 'none' }}
                        value={form.branch}
                        onChange={e => setForm({...form, branch: e.target.value})}
                      >
                        {branches.map(b => (
                           <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripción</label>
                    <textarea 
                      className="input-premium" 
                      style={{ width: '100%', height: '100px', padding: '12px', resize: 'none' }} 
                      placeholder="Ej: Sala de informática con 20 equipos..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '12px' }}>
                     <AlertCircle size={20} style={{ color: '#b45309', flexShrink: 0 }} />
                     <p style={{ margin: 0, fontSize: '12px', color: '#92400e', fontWeight: '600', lineHeight: '1.5' }}>
                       Asegúrate de que la sede seleccionada tenga disponibilidad para este nuevo espacio.
                     </p>
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
                  Confirmar Registro
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(16, 185, 129, 0.03) !important;
          transform: scale(1.002);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
      `}</style>
    </DashboardLayout>
  );
}
