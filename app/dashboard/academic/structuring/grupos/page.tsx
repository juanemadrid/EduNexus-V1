'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Eye, Search, Download, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function GruposPage() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [viewingGrupo, setViewingGrupo] = useState<any>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalFilterNivel, setModalFilterNivel] = useState('');
  const [modalFilterPrograma, setModalFilterPrograma] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('');
  const [filterSede, setFilterSede] = useState('');
  const [filterPrograma, setFilterPrograma] = useState('');
  const [showInactivos, setShowInactivos] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    cursoId: '',
    periodoId: '',
    sedeId: '',
    programaId: '',
    cupoMaximo: '',
    estado: 'Activo',
    estudiantes: [] as string[]
  });

  useEffect(() => {
    db.list('grupos').then(setGrupos);
    db.list('cursos').then(setCursos);
    db.list('students').then(setStudents);
    db.list('academic_periods').then(setPeriodos);
    db.list('sedes').then(setSedes);
    db.list('academic_programs').then(setProgramas);
  }, []);

  const save = async (data: any, id?: string) => {
    if (id) {
      await db.update('grupos', id, data);
    } else {
      await db.create('grupos', data);
    }
    const fresh = await db.list('grupos');
    setGrupos(fresh);
  };

  const getCursoLabel = (id: string) => {
    const c = cursos.find((c: any) => c.id === id);
    return c ? `${c.codigo} — ${c.asignaturaNombre}` : id;
  };

  const handleSave = async () => {
    if (!form.codigo || !form.nombre || !form.cupoMaximo) {
      alert('Complete todos los campos obligatorios (*)');
      return;
    }
    
    if (isEditing && editingId) {
      await save(form, editingId);
    } else {
      await save(form);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ codigo: '', nombre: '', cursoId: '', periodoId: '', sedeId: '', programaId: '', cupoMaximo: '', estado: 'Activo', estudiantes: [] });
  };

  const handleEdit = (g: any) => {
    setForm({ 
      codigo: g.codigo, 
      nombre: g.nombre, 
      cursoId: g.cursoId || '', 
      periodoId: g.periodoId || '',
      sedeId: g.sedeId || '',
      programaId: g.programaId || '',
      cupoMaximo: g.cupoMaximo, 
      estado: g.estado, 
      estudiantes: g.estudiantes || [] 
    });
    setEditingId(g.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => { setDeletingId(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (deletingId) {
      await db.delete('grupos', deletingId);
      const fresh = await db.list('grupos');
      setGrupos(fresh);
    }
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const filtered = grupos.filter(g => {
    const matchSearch = g.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || g.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = showInactivos ? true : g.estado === 'Activo';
    const matchPeriodo = filterPeriodo === '' || g.periodoId === filterPeriodo;
    const matchSede = filterSede === '' || g.sedeId === filterSede;
    const matchPrograma = filterPrograma === '' || g.programaId === filterPrograma;
    
    return matchSearch && matchEstado && matchPeriodo && matchSede && matchPrograma;
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Grupos</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Organización de estudiantes por grupo y curso</p>
          </div>
          <button className="btn-premium" onClick={() => { setIsEditing(false); setShowModal(true); }} style={{ background: 'var(--primary)', color: 'white' }}>
            <Plus size={18} /> Crear grupo
          </button>
        </div>

        {/* Search Q10 Style */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '20px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
              <input type="text" placeholder="Buscar grupos..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px 0 0 4px', fontSize: '13px', outline: 'none' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 16px', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}><Search size={16} /></button>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
              <Download size={14} /> Exportar
            </button>
            <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Búsqueda avanzada {showAdvanced ? '▲' : '▼'}
            </button>
          </div>
          
          {showAdvanced && (
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'center', background: '#f9fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', overflow: 'hidden' }}>
                <span style={{ padding: '8px 12px', fontSize: '12px', color: '#6b7280', background: '#f3f4f6', borderRight: '1px solid #d1d5db' }}>Periodo:</span>
                <select value={filterPeriodo} onChange={e => setFilterPeriodo(e.target.value)} style={{ flex: 1, border: 'none', padding: '8px', fontSize: '13px', outline: 'none', background: 'transparent' }}>
                  <option value="">Todos</option>
                  {periodos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', overflow: 'hidden' }}>
                <span style={{ padding: '8px 12px', fontSize: '12px', color: '#6b7280', background: '#f3f4f6', borderRight: '1px solid #d1d5db', whiteSpace: 'nowrap' }}>Sede - jornada:</span>
                <select value={filterSede} onChange={e => setFilterSede(e.target.value)} style={{ flex: 1, border: 'none', padding: '8px', fontSize: '13px', outline: 'none', background: 'transparent' }}>
                  <option value="">Todos</option>
                  {sedes.map((s: any) => <option key={s.id} value={s.id}>{s.nombre || s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', overflow: 'hidden' }}>
                <span style={{ padding: '8px 12px', fontSize: '12px', color: '#6b7280', background: '#f3f4f6', borderRight: '1px solid #d1d5db' }}>Programa:</span>
                <select value={filterPrograma} onChange={e => setFilterPrograma(e.target.value)} style={{ flex: 1, border: 'none', padding: '8px', fontSize: '13px', outline: 'none', background: 'transparent' }}>
                  <option value="">Todos</option>
                  {programas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="inactivos" checked={showInactivos} onChange={e => setShowInactivos(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label htmlFor="inactivos" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>¿Incluir inactivos?</label>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Código', 'Nombre', 'Curso vinculado', 'Cupos', 'Estudiantes', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Acciones' ? 'center' : 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '80px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                  <p style={{ margin: 0, fontWeight: '600' }}>No hay grupos registrados</p>
                </td></tr>
              ) : currentItems.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 24px', fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>{g.codigo}</td>
                  <td style={{ padding: '14px 24px', fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{g.nombre}</td>
                  <td style={{ padding: '14px 24px', fontSize: '12px', color: '#64748b' }}>{g.cursoId ? getCursoLabel(g.cursoId) : '—'}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>
                    {(g.estudiantes || []).length} / {g.cupoMaximo}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, ((g.estudiantes?.length || 0) / parseInt(g.cupoMaximo || '1')) * 100)}%`, background: 'var(--primary)', borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{(g.estudiantes || []).length}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: g.estado === 'Activo' ? '#ecfdf5' : '#fef2f2', color: g.estado === 'Activo' ? '#059669' : '#dc2626' }}>{g.estado}</span>
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button title="Ver estudiantes" onClick={() => { setViewingGrupo(g); setShowStudentsModal(true); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Users size={16} /></button>
                      <button title="Editar" onClick={() => handleEdit(g)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Edit size={16} /></button>
                      <button title="Eliminar" onClick={() => handleDelete(g.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: '6px' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#6b7280', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} style={{ width: '34px', height: '34px', borderRadius: '8px', background: currentPage === p ? 'var(--primary)' : 'white', color: currentPage === p ? 'white' : '#6b7280', fontWeight: '700', cursor: 'pointer', border: currentPage === p ? 'none' : '1px solid #e5e7eb' }}>{p}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#6b7280', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar grupo' : 'Crear grupo'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Código *</label>
                <input type="text" className="input-premium" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ej: GRP-A" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre *</label>
                <input type="text" className="input-premium" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: GRUPO A - MAÑANA" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Periodo vinculado</label>
                <select className="input-premium" value={form.periodoId} onChange={e => setForm(f => ({ ...f, periodoId: e.target.value }))}>
                  <option value="">Opcional...</option>
                  {periodos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Sede vinculada</label>
                <select className="input-premium" value={form.sedeId} onChange={e => setForm(f => ({ ...f, sedeId: e.target.value }))}>
                  <option value="">Opcional...</option>
                  {sedes.map((s: any) => <option key={s.id} value={s.id}>{s.nombre || s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Programa vinculado</label>
                <select className="input-premium" value={form.programaId} onChange={e => setForm(f => ({ ...f, programaId: e.target.value }))}>
                  <option value="">Opcional...</option>
                  {programas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Curso principal</label>
                <select className="input-premium" value={form.cursoId} onChange={e => setForm(f => ({ ...f, cursoId: e.target.value }))}>
                  <option value="">Opcional...</option>
                  {cursos.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} — {c.asignaturaNombre || c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Cupo máximo *</label>
                <input type="number" className="input-premium" value={form.cupoMaximo} onChange={e => setForm(f => ({ ...f, cupoMaximo: e.target.value }))} placeholder="Ej: 25" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Estado *</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                  {['Activo', 'Inactivo'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" checked={form.estado === s} onChange={() => setForm(f => ({ ...f, estado: s }))} style={{ accentColor: 'var(--primary)' }} /> {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
              <button onClick={closeModal} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS IN GROUP MODAL */}
      {showStudentsModal && viewingGrupo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '650px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800' }}>Grupo: {viewingGrupo.nombre}</h3>
              <button onClick={() => setShowStudentsModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Buscar por nombre o ID..." 
                className="input-premium" 
                style={{ flex: 1, minWidth: '150px', padding: '10px 14px', fontSize: '13px' }}
                value={modalSearchTerm}
                onChange={e => setModalSearchTerm(e.target.value)}
              />
              <select 
                className="input-premium" 
                style={{ width: '160px', padding: '10px 14px', fontSize: '13px' }}
                value={modalFilterPrograma}
                onChange={e => setModalFilterPrograma(e.target.value)}
              >
                <option value="">Todos los programas</option>
                {Array.from(new Set(students.map((s:any) => s.programaNombre || s.programaId || s.programa).filter(Boolean))).map(p => (
                  <option key={p as string} value={p as string}>{p as string}</option>
                ))}
              </select>
              <select 
                className="input-premium" 
                style={{ width: '150px', padding: '10px 14px', fontSize: '13px' }}
                value={modalFilterNivel}
                onChange={e => setModalFilterNivel(e.target.value)}
              >
                <option value="">Todos los grados</option>
                {Array.from(new Set(students.map((s:any) => s.nivel).filter(Boolean))).sort().map(n => (
                  <option key={n as string} value={n as string}>{n as string}</option>
                ))}
              </select>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
              {students.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>No hay estudiantes registrados</p>
              ) : students.filter((s:any) => {
                  const matchSearch = modalSearchTerm === '' || (s.name || '').toLowerCase().includes(modalSearchTerm.toLowerCase()) || (s.id || '').toLowerCase().includes(modalSearchTerm.toLowerCase());
                  const matchNivel = modalFilterNivel === '' || s.nivel === modalFilterNivel;
                  const currentProg = s.programaNombre || s.programaId || s.programa;
                  const matchProg = modalFilterPrograma === '' || currentProg === modalFilterPrograma;
                  return matchSearch && matchNivel && matchProg;
              }).map((s: any) => {
                const enrolled = (viewingGrupo.estudiantes || []).includes(s.id);
                return (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', marginBottom: '6px', background: enrolled ? 'rgba(16,185,129,0.05)' : '#f8fafc', border: `1px solid ${enrolled ? 'rgba(16,185,129,0.2)' : '#f1f5f9'}` }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{s.name || `${s.nombres} ${s.apellidos}`}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{s.id || s.documento}</p>
                    </div>
                    <button
                      onClick={() => {
                        const newIds = enrolled
                          ? (viewingGrupo.estudiantes || []).filter((id: string) => id !== s.id)
                          : [...(viewingGrupo.estudiantes || []), s.id];
                        const updatedForm = { ...viewingGrupo, estudiantes: newIds };
                        delete (updatedForm as any).id;
                        delete (updatedForm as any)._docId;
                        
                        save(updatedForm, viewingGrupo.id || viewingGrupo._docId).then(() => {
                          setViewingGrupo({ ...viewingGrupo, estudiantes: newIds });
                        });
                      }}
                      style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: enrolled ? '#ef4444' : 'var(--primary)', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {enrolled ? 'Quitar' : 'Agregar'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowStudentsModal(false)} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', maxWidth: '380px', width: '100%', padding: '40px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Trash2 size={28} color="#dc2626" /></div>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', marginBottom: '10px' }}>¿Eliminar grupo?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
