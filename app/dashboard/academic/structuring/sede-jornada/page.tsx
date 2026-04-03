'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Building2, Clock, BookOpen, ChevronDown, CheckSquare, Square } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

const JORNADAS_DEFAULT = ['Mañana', 'Tarde', 'Noche', 'Sabatina', 'Dominical', 'Virtual'];

const INITIAL_SEDES = [
  { id: 'sede-1', nombre: 'SEDE PRINCIPAL', direccion: 'Cra 10 # 15-20', ciudad: 'Barranquilla', telefono: '3001234567', estado: 'Activa' },
];

export default function SedeJornadaPage() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedSedeJornada, setSelectedSedeJornada] = useState('');
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  // Modal state
  const [showSedeModal, setShowSedeModal] = useState(false);
  const [showJornadaModal, setShowJornadaModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSedeId, setEditingSedeId] = useState<string | null>(null);
  const [editingJornadaId, setEditingJornadaId] = useState<string | null>(null);

  // Forms
  const [sedeForm, setSedeForm] = useState({ nombre: '', direccion: '', ciudad: '', telefono: '', estado: 'Activa' });
  const [jornadaForm, setJornadaForm] = useState({ nombre: 'Mañana', estado: 'Activa', sedeId: '' });
  const [selectedProgramsToAssign, setSelectedProgramsToAssign] = useState<string[]>([]);

  useEffect(() => {
    db.list('sedes').then((data: any[]) => {
      if (data.length === 0) {
        // Seed default sede
        db.create('sedes', INITIAL_SEDES[0]).then(() => {
          db.list('sedes').then(setSedes);
        });
      } else {
        setSedes(data);
      }
    });
    db.list('academic_programs').then(setPrograms);
  }, []);

  const saveSedes = async (updated: any[]) => {
    // Rebuild: delete all then recreate is complex; instead update individually
    // For simplicity, store the full array as a single document
    // Use a special 'sedes_data' collection with one doc
    setSedes(updated);
    // Save each sede that has changed — simpler: upsert each by id
    for (const sede of updated) {
      if (sede._docId) {
        await db.update('sedes', sede._docId, sede);
      }
    }
  };

  // --- Sedes CRUD ---
  const handleSaveSede = () => {
    if (!sedeForm.nombre) return;
    let updated;
    if (editingSedeId) {
      updated = sedes.map(s => s.id === editingSedeId ? { ...s, ...sedeForm } : s);
    } else {
      updated = [...sedes, { id: `sede-${Date.now()}`, ...sedeForm, jornadas: [] }];
    }
    saveSedes(updated);
    setShowSedeModal(false);
    setSedeForm({ nombre: '', direccion: '', ciudad: '', telefono: '', estado: 'Activa' });
    setEditingSedeId(null);
  };

  const handleEditSede = (s: any) => {
    setSedeForm({ nombre: s.nombre, direccion: s.direccion || '', ciudad: s.ciudad || '', telefono: s.telefono || '', estado: s.estado });
    setEditingSedeId(s.id);
    setShowSedeModal(true);
  };

  const handleDeleteSede = (id: string) => {
    if (confirm('¿Eliminar esta sede? Se eliminarán también sus jornadas.')) {
      saveSedes(sedes.filter(s => s.id !== id));
      if (selectedSedeJornada.startsWith(id)) setSelectedSedeJornada('');
    }
  };

  // --- Jornadas CRUD ---
  const getJornadas = (sedeId: string) => {
    const sede = sedes.find(s => s.id === sedeId);
    return sede?.jornadas || [];
  };

  const handleSaveJornada = () => {
    if (!jornadaForm.nombre || !jornadaForm.sedeId) return;
    const updated = sedes.map(s => {
      if (s.id !== jornadaForm.sedeId) return s;
      let jornadas = s.jornadas || [];
      if (editingJornadaId) {
        jornadas = jornadas.map((j: any) => j.id === editingJornadaId ? { ...j, ...jornadaForm } : j);
      } else {
        jornadas = [...jornadas, { id: `jor-${Date.now()}`, ...jornadaForm, programas: [] }];
      }
      return { ...s, jornadas };
    });
    saveSedes(updated);
    setShowJornadaModal(false);
    setJornadaForm({ nombre: 'Mañana', estado: 'Activa', sedeId: '' });
    setEditingJornadaId(null);
  };

  const handleDeleteJornada = (sedeId: string, jornadaId: string) => {
    if (confirm('¿Eliminar esta jornada?')) {
      const updated = sedes.map(s => {
        if (s.id !== sedeId) return s;
        return { ...s, jornadas: (s.jornadas || []).filter((j: any) => j.id !== jornadaId) };
      });
      saveSedes(updated);
      if (selectedSedeJornada === `${sedeId}::${jornadaId}`) setSelectedSedeJornada('');
    }
  };

  // --- Program Assignment ---
  const getProgramsForSelected = () => {
    if (!selectedSedeJornada) return [];
    const [sedeId, jornadaId] = selectedSedeJornada.split('::');
    const sede = sedes.find(s => s.id === sedeId);
    const jornada = (sede?.jornadas || []).find((j: any) => j.id === jornadaId);
    return jornada?.programas || [];
  };

  const handleOpenAssign = () => {
    const assigned = getProgramsForSelected().map((p: any) => p.id);
    setSelectedProgramsToAssign(assigned);
    setShowAssignModal(true);
  };

  const toggleProgramSelect = (id: string) => {
    setSelectedProgramsToAssign(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveAssignment = () => {
    if (!selectedSedeJornada) return;
    const [sedeId, jornadaId] = selectedSedeJornada.split('::');
    const assigned = programs.filter(p => selectedProgramsToAssign.includes(p.id));
    const updated = sedes.map(s => {
      if (s.id !== sedeId) return s;
      return {
        ...s,
        jornadas: (s.jornadas || []).map((j: any) => {
          if (j.id !== jornadaId) return j;
          return { ...j, programas: assigned };
        })
      };
    });
    saveSedes(updated);
    setShowAssignModal(false);
  };

  // Build dropdown options
  const sedeJornadaOptions: { label: string; value: string }[] = [];
  sedes.forEach(s => {
    if (!incluirInactivos && s.estado === 'Inactiva') return;
    (s.jornadas || []).forEach((j: any) => {
      if (!incluirInactivos && j.estado === 'Inactiva') return;
      sedeJornadaOptions.push({ label: `${s.nombre} - ${j.nombre}`, value: `${s.id}::${j.id}` });
    });
  });

  const assignedPrograms = getProgramsForSelected();

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Sedes · Jornadas · Programas</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Estructura organizacional de la corporación</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-premium"
              onClick={() => { setJornadaForm({ nombre: 'Mañana', estado: 'Activa', sedeId: sedes[0]?.id || '' }); setEditingJornadaId(null); setShowJornadaModal(true); }}
              style={{ background: '#6366f1', color: 'white' }}
            >
              <Clock size={16} /> Nueva jornada
            </button>
            <button
              className="btn-premium"
              onClick={() => { setSedeForm({ nombre: '', direccion: '', ciudad: '', telefono: '', estado: 'Activa' }); setEditingSedeId(null); setShowSedeModal(true); }}
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              <Building2 size={16} /> Nueva sede
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px' }}>
          {/* LEFT — Sedes list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sedes.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
                <Building2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>No hay sedes registradas</p>
              </div>
            ) : sedes.map(sede => (
              <div key={sede.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* Sede header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(99,102,241,0.04))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>{sede.nombre}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{sede.ciudad || 'Sin ciudad'} · {(sede.jornadas || []).length} jornadas</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', background: sede.estado === 'Activa' ? '#ecfdf5' : '#fef2f2', color: sede.estado === 'Activa' ? '#059669' : '#dc2626' }}>{sede.estado}</span>
                    <button onClick={() => handleEditSede(sede)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Edit size={14} /></button>
                    <button onClick={() => handleDeleteSede(sede.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Jornadas */}
                <div style={{ padding: '8px 12px 12px' }}>
                  {(sede.jornadas || []).length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '12px 0', margin: 0 }}>Sin jornadas — agrega una</p>
                  ) : (sede.jornadas || []).map((j: any) => {
                    const isSelected = selectedSedeJornada === `${sede.id}::${j.id}`;
                    return (
                      <div
                        key={j.id}
                        onClick={() => setSelectedSedeJornada(isSelected ? '' : `${sede.id}::${j.id}`)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 12px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer',
                          background: isSelected ? 'var(--primary)' : 'transparent',
                          border: isSelected ? 'none' : '1px solid #f1f5f9',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Clock size={14} color={isSelected ? 'white' : '#6366f1'} />
                          <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? 'white' : '#1e293b' }}>{j.nombre}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.7)' : '#94a3b8', fontWeight: '600' }}>
                            {(j.programas || []).length} prog.
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteJornada(sede.id, j.id); }} style={{ background: 'none', border: 'none', color: isSelected ? 'rgba(255,255,255,0.7)' : '#ef4444', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => { setJornadaForm({ nombre: 'Mañana', estado: 'Activa', sedeId: sede.id }); setEditingJornadaId(null); setShowJornadaModal(true); }}
                    style={{ width: '100%', marginTop: '4px', padding: '8px', border: '1px dashed #e2e8f0', borderRadius: '10px', background: 'none', color: '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Plus size={12} /> Agregar jornada
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Programs panel */}
          <div>
            {/* Selector top bar */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Sede - Jornada</label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="input-premium"
                    value={selectedSedeJornada}
                    onChange={e => setSelectedSedeJornada(e.target.value)}
                    style={{ paddingRight: '40px', height: '44px', background: '#f8fafc' }}
                  >
                    <option value="">Selecciona...</option>
                    {sedeJornadaOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', userSelect: 'none', marginTop: '20px' }}>
                <div onClick={() => setIncluirInactivos(!incluirInactivos)} style={{ color: incluirInactivos ? 'var(--primary)' : '#cbd5e1' }}>
                  {incluirInactivos ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                ¿Incluir inactivos?
              </label>
              {selectedSedeJornada && (
                <button
                  className="btn-premium"
                  onClick={handleOpenAssign}
                  style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', fontSize: '13px', marginTop: '20px' }}
                >
                  <BookOpen size={15} /> Asignar programas
                </button>
              )}
            </div>

            {/* Programs table */}
            {!selectedSedeJornada ? (
              <div style={{ background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0', padding: '80px 40px', textAlign: 'center', color: '#94a3b8' }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Por favor selecciona la sede - jornada</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Elige una combinación del panel izquierdo para ver los programas asignados</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                      {sedeJornadaOptions.find(o => o.value === selectedSedeJornada)?.label}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{assignedPrograms.length} programas asignados</p>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Código</th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Programa</th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Categoría</th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedPrograms.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                          No hay programas asignados. Haz clic en "Asignar programas".
                        </td>
                      </tr>
                    ) : assignedPrograms.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{p.codigo}</td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>{p.nombre}</td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{p.categoria || '—'}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: p.estado === 'Activo' ? '#ecfdf5' : '#fef2f2', color: p.estado === 'Activo' ? '#059669' : '#dc2626' }}>{p.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL — Nueva/Editar Sede */}
      {showSedeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800' }}>{editingSedeId ? 'Editar Sede' : 'Nueva Sede'}</h3>
              <button onClick={() => setShowSedeModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '28px', display: 'grid', gap: '18px' }}>
              {[
                { label: 'Nombre de la sede *', key: 'nombre' },
                { label: 'Dirección', key: 'direccion' },
                { label: 'Ciudad', key: 'ciudad' },
                { label: 'Teléfono', key: 'telefono' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>{f.label}</label>
                  <input
                    type="text"
                    className="input-premium"
                    value={(sedeForm as any)[f.key]}
                    onChange={e => setSedeForm({ ...sedeForm, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Estado *</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['Activa', 'Inactiva'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input type="radio" checked={sedeForm.estado === s} onChange={() => setSedeForm({ ...sedeForm, estado: s })} style={{ accentColor: 'var(--primary)' }} /> {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button onClick={() => setShowSedeModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              <button onClick={handleSaveSede} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Nueva Jornada */}
      {showJornadaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ background: '#6366f1', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800' }}>Nueva Jornada</h3>
              <button onClick={() => setShowJornadaModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '28px', display: 'grid', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Sede *</label>
                <select className="input-premium" value={jornadaForm.sedeId} onChange={e => setJornadaForm({ ...jornadaForm, sedeId: e.target.value })}>
                  <option value="">Seleccione...</option>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre de la jornada *</label>
                <select className="input-premium" value={jornadaForm.nombre} onChange={e => setJornadaForm({ ...jornadaForm, nombre: e.target.value })}>
                  {JORNADAS_DEFAULT.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Estado *</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['Activa', 'Inactiva'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input type="radio" checked={jornadaForm.estado === s} onChange={() => setJornadaForm({ ...jornadaForm, estado: s })} style={{ accentColor: '#6366f1' }} /> {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button onClick={() => setShowJornadaModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              <button onClick={handleSaveJornada} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Assign Programs */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800' }}>Asignar Programas</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>Selecciona los programas que ofrece esta jornada:</p>
              {programs.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>No hay programas registrados aún</p>
              ) : programs.map(p => {
                const checked = selectedProgramsToAssign.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProgramSelect(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', background: checked ? 'var(--primary-glow, rgba(16,185,129,0.06))' : 'transparent', border: `1px solid ${checked ? 'var(--primary)' : '#f1f5f9'}` }}
                  >
                    <div style={{ color: checked ? 'var(--primary)' : '#cbd5e1', flexShrink: 0 }}>
                      {checked ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{p.nombre}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{p.codigo} · {p.categoria || 'Sin categoría'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{selectedProgramsToAssign.length} seleccionados</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowAssignModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
                <button onClick={handleSaveAssignment} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
