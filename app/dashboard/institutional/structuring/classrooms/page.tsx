'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';
import { 
  Search,
  Plus,
  Monitor,
  Filter,
  ChevronDown,
  Clock,
  Calendar,
  Users, 
  MapPin, 
  Download, 
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
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [classroomsData, sedesData] = await Promise.all([
        db.list<Classroom>('classrooms'),
        db.list<any>('sedes')
      ]);
      
      setClassrooms(classroomsData);
      
      if (sedesData.length > 0) {
        const uniqueBranches = Array.from(new Set(sedesData.map((s: any) => s.nombre))) as string[];
        setBranches(uniqueBranches);
        setForm(prev => ({ ...prev, branch: uniqueBranches[0] || 'Principal' }));
      } else {
        setBranches(['Principal']);
      }
    } catch (error) {
       console.error("Error loading classrooms data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAulaName, setSelectedAulaName] = useState('');
  const [scheduleView, setScheduleView] = useState<'Día' | 'Semana' | 'Mes'>('Semana');

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

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Classroom | null>(null);

  // localStorage side effects removed

  const handleSave = async () => {
    if (!form.name || !form.capacity) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        const updatedClassroom: Partial<Classroom> = {
          name: form.name,
          capacity: parseInt(form.capacity),
          branch: form.branch,
          description: form.description,
          status: form.status
        };
        await db.update('classrooms', currentId, updatedClassroom);
        setClassrooms(classrooms.map(c => c.id === currentId ? { ...c, ...updatedClassroom } : c));
      } else {
        const newClassroom: Classroom = {
          id: crypto.randomUUID(),
          name: form.name,
          capacity: parseInt(form.capacity),
          branch: form.branch,
          description: form.description,
          status: form.status
        };
        await db.create('classrooms', newClassroom);
        setClassrooms([...classrooms, newClassroom]);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
       console.error("Error saving classroom:", error);
       alert("Error al guardar el aula.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', capacity: '', branch: branches[0] || 'Principal', description: '', status: 'Activa' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (aula: Classroom) => {
    setForm({
      name: aula.name,
      capacity: aula.capacity.toString(),
      branch: aula.branch,
      description: aula.description,
      status: aula.status
    });
    setCurrentId(aula.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteRequest = (aula: Classroom) => {
    setItemToDelete(aula);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await db.delete('classrooms', itemToDelete.id);
      setClassrooms(classrooms.filter(c => c.id !== itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting classroom:", error);
      alert("Error al eliminar el aula.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = classrooms.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = selectedBranch === 'all' || c.branch === selectedBranch;
    
    // In Q10, inactive ones are hidden unless 'incluir inactivas' is checked
    const matchesStatus = includeInactive || c.status === 'Activa';
    
    return matchesSearch && matchesBranch && matchesStatus;
  });

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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <button 
                className="btn-secondary" 
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                style={{ 
                   padding: '0 20px', 
                   height: '52px', 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '10px',
                   borderColor: showAdvancedSearch ? 'var(--primary)' : 'var(--glass-border)',
                   color: showAdvancedSearch ? 'var(--primary)' : 'var(--text-dim)',
                   background: showAdvancedSearch ? 'rgba(16, 185, 129, 0.05)' : 'white'
                }}
             >
                <Filter size={18} />
                Búsqueda avanzada
                <ChevronDown size={18} style={{ transform: showAdvancedSearch ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
             </button>
             <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        <div style={{ 
           maxHeight: showAdvancedSearch ? '200px' : '0', 
           overflow: 'hidden', 
           transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
           opacity: showAdvancedSearch ? 1 : 0,
           marginTop: showAdvancedSearch ? '24px' : '0'
        }}>
           <div style={{ paddingTop: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '32px', alignItems: 'flex-end' }}>
              <div style={{ width: '300px' }}>
                 <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sede:</label>
                 <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '48px', appearance: 'none' }}
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                 >
                    <option value="all">Sede: Todos</option>
                    {branches.map(b => (
                       <option key={b} value={b}>{b}</option>
                    ))}
                 </select>
              </div>

              <div style={{ flex: 1, paddingBottom: '12px' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
                    <input 
                       type="checkbox" 
                       checked={includeInactive} 
                       onChange={e => setIncludeInactive(e.target.checked)}
                       style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>¿Incluir aulas inactivas?</span>
                 </label>
              </div>
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
                      <button 
                        onClick={() => { setSelectedAulaName(aula.name); setShowScheduleModal(true); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} 
                        title="Horario de Aula"
                      >
                         <Clock size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(aula)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} 
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRequest(aula)}
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
            <div style={{ background: isEditing ? '#3b82f6' : 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{isEditing ? 'Editar Aula' : 'Crear Nueva Aula'}</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>{isEditing ? 'Modifica los detalles del espacio seleccionado' : 'Ingresa los detalles del nuevo espacio'}</p>
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
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{isEditing ? '¡Aula Actualizada!' : '¡Aula Creada!'}</h3>
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
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado *</label>
                    <div style={{ display: 'flex', gap: '24px', background: 'rgba(0,0,0,0.02)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '750', fontSize: '14px', color: form.status === 'Activa' ? 'var(--primary)' : 'var(--text-dim)' }}>
                          <input 
                            type="radio" 
                            checked={form.status === 'Activa'} 
                            onChange={() => setForm({...form, status: 'Activa'})} 
                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                          /> 
                          Activa
                       </label>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '750', fontSize: '14px', color: form.status === 'Inactiva' ? '#ef4444' : 'var(--text-dim)' }}>
                          <input 
                            type="radio" 
                            checked={form.status === 'Inactiva'} 
                            onChange={() => setForm({...form, status: 'Inactiva'})} 
                            style={{ accentColor: '#ef4444', width: '18px', height: '18px' }}
                          /> 
                          Inactiva
                       </label>
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
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: isEditing ? '#3b82f6' : 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-glow)' }}
                >
                  {isEditing ? 'Guardar Cambios' : 'Confirmar Registro'}
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
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>¿Eliminar Aula?</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.6' }}>
                Estás a punto de eliminar el espacio <strong style={{ color: 'var(--text-main)' }}>{itemToDelete?.name}</strong>. Esta acción no se puede deshacer.
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

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                   <Clock size={24} />
                 </div>
                 <div>
                   <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Horario de Aula: {selectedAulaName}</h2>
                   <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Distribución semanal de ocupación y disponibilidad</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)} 
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Calendar Controls */}
            <div style={{ padding: '20px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Hoy</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
                     <span>Semana del 31 de Marzo - 06 de Abril, 2026</span>
                  </div>
               </div>
               <div style={{ display: 'flex', background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {['Día', 'Semana', 'Mes'].map((t) => (
                    <button 
                      key={t} 
                      onClick={() => setScheduleView(t as 'Día' | 'Semana' | 'Mes')}
                      style={{ padding: '6px 16px', border: 'none', background: t === scheduleView ? 'var(--primary)' : 'transparent', color: t === scheduleView ? 'white' : 'var(--text-dim)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t}
                    </button>
                  ))}
               </div>
            </div>

            {/* Grid Views */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
              {scheduleView === 'Semana' && (
                <>
                   <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ padding: '12px', background: '#f8fafc' }} />
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                        <div key={day} style={{ padding: '12px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', background: '#f8fafc' }}>
                           <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{day}</span>
                           <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{31 + i > 31 ? (31 + i) - 31 : 31 + i}</span>
                        </div>
                      ))}
                   </div>

                   {/* Hours */}
                   {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map((hour) => (
                     <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', height: '48px', borderBottom: '1px dotted #e2e8f0' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textAlign: 'right', padding: '12px' }}>{hour}:00</div>
                        {Array(7).fill(0).map((_, i) => (
                          <div key={i} style={{ borderLeft: '1px solid #e2e8f0', position: 'relative' }}>
                             {hour === 8 && i === 2 && (
                               <div style={{ position: 'absolute', inset: '4px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '4px 8px', fontSize: '10px' }}>
                                  <strong style={{ display: 'block', color: 'var(--primary)' }}>Matemáticas</strong>
                                  <span style={{ color: 'var(--text-dim)' }}>Grado 10-A</span>
                               </div>
                             )}
                             {hour === 10 && i === 4 && (
                               <div style={{ position: 'absolute', inset: '4px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '4px 8px', fontSize: '10px' }}>
                                  <strong style={{ display: 'block', color: '#3b82f6' }}>Física Lab</strong>
                                  <span style={{ color: 'var(--text-dim)' }}>Grado 11-B</span>
                               </div>
                             )}
                          </div>
                        ))}
                     </div>
                   ))}
                </>
              )}

              {scheduleView === 'Día' && (
                <>
                   <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ padding: '12px', background: '#f8fafc' }} />
                      <div style={{ padding: '12px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', background: '#f8fafc' }}>
                         <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Mié</span>
                         <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>2</span>
                      </div>
                   </div>

                   {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map((hour) => (
                     <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', height: '60px', borderBottom: '1px dotted #e2e8f0' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textAlign: 'right', padding: '20px 12px' }}>{hour}:00</div>
                        <div style={{ borderLeft: '1px solid #e2e8f0', position: 'relative' }}>
                           {hour === 8 && (
                             <div style={{ position: 'absolute', inset: '4px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                                <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: '4px' }}>Matemáticas</strong>
                                <span style={{ color: 'var(--text-dim)' }}>Grado 10-A • Prof. Juan Pérez</span>
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                </>
              )}

              {scheduleView === 'Mes' && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                        <div key={day} style={{ padding: '12px', textAlign: 'center', background: '#f8fafc', borderLeft: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                           {day}
                        </div>
                      ))}
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', flex: 1 }}>
                     {Array(35).fill(0).map((_, i) => {
                       const isCurrentMonth = i >= 1 && i <= 30; // Mock current month days
                       const date = isCurrentMonth ? i : i < 1 ? 31 : i - 30;
                       const hasEvents = isCurrentMonth && (i === 4 || i === 12 || i === 18 || i === 25);
                       return (
                         <div key={i} style={{ borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '8px', position: 'relative', background: !isCurrentMonth ? '#fdfdfd' : 'white' }}>
                           <span style={{ fontSize: '13px', fontWeight: '700', color: !isCurrentMonth ? '#cbd5e1' : i === 2 ? 'var(--primary)' : 'var(--text-main)', background: i === 2 ? 'rgba(16, 185, 129, 0.1)' : 'transparent', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{date}</span>
                           {hasEvents && (
                             <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <div style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>2 Clases program.</div>
                             </div>
                           )}
                           {i === 2 && (
                             <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <div style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '4px', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>08:00 Matemáticas</div>
                               <div style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>10:00 Física Lab</div>
                             </div>
                           )}
                         </div>
                       );
                     })}
                   </div>
                </div>
              )}
            </div>
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

