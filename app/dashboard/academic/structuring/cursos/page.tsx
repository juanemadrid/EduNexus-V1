'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Search, Download, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
/* Removed hardcoded PERIODOS */
export default function CursosPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCurso, setViewingCurso] = useState<any>(null);
  const itemsPerPage = 10;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    periodo: '',
    programaId: '',
    asignaturaId: '',
    sedeJornada: '',
    docenteId: '',
    fechas: ''
  });

  // Cascading selects state
  const [selectedSedeJornada, setSelectedSedeJornada] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([]);
  const [filteredPensumSubjects, setFilteredPensumSubjects] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    docenteId: '',
    sedeJornada: '',
    programaId: '',
    pensumLabel: '',
    asignaturaId: '',
    cupoMaximo: '',
    periodo: '2026 - 01',
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    db.list('cursos').then(setCursos);
    db.list('sedes').then(setSedes);
    db.list('academic_programs').then(setPrograms);
    db.list('teachers').then(setTeachers);
    db.list('academic_periods').then(setPeriods);
    db.list('academic_subjects').then(setAllSubjects);
  }, []);

  // Build sede-jornada dropdown options
  const sedeJornadaOptions: { label: string; value: string }[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      sedeJornadaOptions.push({
        label: `${s.nombre} - ${j.nombre}`,
        value: `${s.id}::${j.id}__${JSON.stringify(j.programas || [])}`
      });
    });
  });

  // When sede-jornada changes, update available programs
  const handleSedeJornadaChange = (val: string) => {
    setForm(f => ({ ...f, sedeJornada: val, programaId: '', pensumLabel: '', asignaturaId: '' }));
    setFilteredPrograms([]);
    setFilteredPensumSubjects([]);

    if (!val) return;
    // Extract programs from the selected jornada
    const parts = val.split('__');
    if (parts.length < 2) return;
    try {
      const jornadaPrograms: any[] = JSON.parse(parts[1] ?? '[]');
      setFilteredPrograms(jornadaPrograms);
    } catch { setFilteredPrograms([]); }
  };

  // When program changes, load subjects (from pensum or all subjects fallback)
  const handleProgramChange = (programaId: string) => {
    setForm(f => ({ ...f, programaId, pensumLabel: '', asignaturaId: '' }));
    const prog = programs.find(p => p.id === programaId);
    if (prog?.pensumSubjects && prog.pensumSubjects.length > 0) {
      setFilteredPensumSubjects(prog.pensumSubjects);
    } else {
      // Fallback: show ALL subjects from Firestore
      setFilteredPensumSubjects(allSubjects);
    }
  };

  const getSelectedJornadaLabel = (val: string) => {
    const opt = sedeJornadaOptions.find(o => o.value === val);
    return opt ? opt.label : val;
  };

  const getTeacherName = (id: string) => {
    const t = teachers.find((t: any) => t.id === id);
    return t ? t.name || `${t.nombres} ${t.apellidos}` : '—';
  };

  const getProgramName = (id: string) => {
    const p = programs.find((p: any) => p.id === id);
    return p ? p.nombre : id;
  };

  const getSubjectName = (id: string) => {
    const s = filteredPensumSubjects.find((s: any) => (s.subjectId === id || s.id === id));
    return s ? s.nombre : id;
  };

  const handleSave = async () => {
    if (!form.codigo || !form.nombre || !form.sedeJornada || !form.programaId || !form.asignaturaId || !form.cupoMaximo || !form.fechaInicio || !form.fechaFin) {
      alert('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    const asignatura = filteredPensumSubjects.find((s: any) => s.id === form.asignaturaId || s.subjectId === form.asignaturaId);
    const teacher = teachers.find((t: any) => t.id === form.docenteId);
    const programa = programs.find((p: any) => p.id === form.programaId);

    const curso = {
      id: isEditing && editingId ? editingId : `curso-${Date.now()}`,
      ...form,
      // Resolved display fields
      sedeJornadaLabel: getSelectedJornadaLabel(form.sedeJornada),
      programaNombre: programa?.nombre || '',
      asignaturaNombre: asignatura?.nombre || '',
      docenteNombre: teacher ? teacher.name || `${teacher.nombres} ${teacher.apellidos}` : '',
      cuposOcupados: isEditing ? (cursos.find(c => c.id === editingId)?.cuposOcupados || 0) : 0
    };

    if (isEditing && editingId) {
      await (db as any).update('cursos', editingId, curso);
    } else {
      await (db as any).create('cursos', curso);
    }

    const fresh = await db.list('cursos');
    setCursos(fresh);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFilteredPrograms([]);
    setFilteredPensumSubjects([]);
    setForm({ codigo: '', nombre: '', docenteId: '', sedeJornada: '', programaId: '', pensumLabel: '', asignaturaId: '', cupoMaximo: '', periodo: '2026 - 01', fechaInicio: '', fechaFin: '' });
  };

  const handleEdit = (curso: any) => {
    setForm({
      codigo: curso.codigo || '',
      nombre: curso.nombre || '',
      docenteId: curso.docenteId || '',
      sedeJornada: curso.sedeJornada || '',
      programaId: curso.programaId || '',
      pensumLabel: curso.pensumLabel || '',
      asignaturaId: curso.asignaturaId || '',
      cupoMaximo: curso.cupoMaximo || '',
      periodo: curso.periodo || '2026 - 01',
      fechaInicio: curso.fechaInicio || '',
      fechaFin: curso.fechaFin || ''
    });
    // Re-load cascading data
    handleSedeJornadaChange(curso.sedeJornada || '');
    const prog = programs.find(p => p.id === curso.programaId);
    if (prog?.pensumSubjects && prog.pensumSubjects.length > 0) {
      setFilteredPensumSubjects(prog.pensumSubjects);
    } else {
      setFilteredPensumSubjects(allSubjects);
    }
    setEditingId(curso.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await db.delete('cursos', deletingId);
      const fresh = await db.list('cursos');
      setCursos(fresh);
    }
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const filtered = cursos.filter(c => {
    const matchSearch = c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.programaNombre?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (filters.periodo && c.periodo !== filters.periodo) return false;
    if (filters.programaId && c.programaId !== filters.programaId) return false;
    if (filters.asignaturaId && c.asignaturaId !== filters.asignaturaId) return false;
    if (filters.sedeJornada && c.sedeJornada !== filters.sedeJornada) return false;
    if (filters.docenteId && c.docenteId !== filters.docenteId) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Cursos</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión de cursos por sede, jornada y programa</p>
          </div>
          <button
            className="btn-premium"
            onClick={() => { setIsEditing(false); setShowModal(true); }}
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <Plus size={18} /> Crear curso
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input type="text" placeholder="Buscar cursos..." className="input-premium"
                style={{ paddingLeft: '48px', height: '48px', background: 'white', width: '100%' }}
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>
            <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white' }}>Buscar</button>
            <button style={{ height: '48px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              <Download size={16} /> Exportar
            </button>
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
          </div>
          
          {showAdvanced && (
            <div style={{ marginTop: '20px', padding: '20px 0 0 0', borderTop: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Período</label>
                <select className="input-premium" style={{ width: '100%', height: '40px', fontSize: '13px' }} value={filters.periodo} onChange={e => setFilters(f => ({ ...f, periodo: e.target.value }))}>
                  <option value="">Todos</option>
                  {periods.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Programa</label>
                <select className="input-premium" style={{ width: '100%', height: '40px', fontSize: '13px' }} value={filters.programaId} onChange={e => { setFilters(f => ({ ...f, programaId: e.target.value, asignaturaId: '' })); setCurrentPage(1); }}>
                  <option value="">Todos</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Sede - jornada</label>
                <select className="input-premium" style={{ width: '100%', height: '40px', fontSize: '13px' }} value={filters.sedeJornada} onChange={e => { setFilters(f => ({ ...f, sedeJornada: e.target.value })); setCurrentPage(1); }}>
                  <option value="">Todos</option>
                  {sedeJornadaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Fechas</label>
                <select className="input-premium" style={{ width: '100%', height: '40px', fontSize: '13px' }} value={filters.fechas} onChange={e => { setFilters(f => ({ ...f, fechas: e.target.value })); setCurrentPage(1); }}>
                  <option value="">Todas</option>
                  <option value="mes_actual">Este mes</option>
                  <option value="proximo_mes">Próximo mes</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Asignatura</label>
                <select className="input-premium" style={{ width: '100%', height: '40px', fontSize: '13px' }} value={filters.asignaturaId} disabled={!filters.programaId} onChange={e => { setFilters(f => ({ ...f, asignaturaId: e.target.value })); setCurrentPage(1); }}>
                  <option value="">Todos</option>
                  {programs.find(p => p.id === filters.programaId)?.pensumSubjects?.map((s: any) => <option key={s.id || s.subjectId} value={s.id || s.subjectId}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Docente</label>
                <select className="input-premium" style={{ width: '100%', height: '40px', fontSize: '13px' }} value={filters.docenteId} onChange={e => { setFilters(f => ({ ...f, docenteId: e.target.value })); setCurrentPage(1); }}>
                  <option value="">Todos</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name || `${t.nombres} ${t.apellidos}`}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Curso</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Cupos (máx)</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Fecha</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Período</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Docente</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Asignatura</th>
                <th style={{ textAlign: 'center', padding: '14px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '80px 24px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                    <p style={{ margin: 0, fontWeight: '600' }}>No hay cursos registrados</p>
                    <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Haz clic en "Crear curso" para comenzar</p>
                  </td>
                </tr>
              ) : currentItems.map(curso => (
                <tr key={curso.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 24px' }}>
                    <p style={{ margin: 0, fontWeight: '800', fontSize: '13px', color: 'var(--primary)' }}>{curso.codigo}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{curso.programaNombre}</p>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>
                    {curso.cuposOcupados || 0} ({curso.cupoMaximo})
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Desde {curso.fechaInicio}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Hasta {curso.fechaFin}</p>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{curso.periodo}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>{curso.docenteNombre || '—'}</td>
                  <td style={{ padding: '14px 24px', fontSize: '12px', color: '#475569', maxWidth: '240px' }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {curso.asignaturaNombre}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button title="Ver" onClick={() => { setViewingCurso(curso); setShowViewModal(true); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Eye size={16} /></button>
                      <button title="Editar" onClick={() => handleEdit(curso)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Edit size={16} /></button>
                      <button title="Eliminar" onClick={() => handleDelete(curso.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: '6px' }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#6b7280', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  style={{ width: '34px', height: '34px', borderRadius: '8px', background: currentPage === page ? 'var(--primary)' : 'white', color: currentPage === page ? 'white' : '#6b7280', fontWeight: '700', cursor: 'pointer', border: currentPage === page ? 'none' : '1px solid #e5e7eb' }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#6b7280', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'var(--primary)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>{isEditing ? 'Editar curso' : 'Crear curso'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>

            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Código */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Código *</label>
                <input type="text" className="input-premium" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ej: SIS-001-2026" />
              </div>
              {/* Nombre */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre *</label>
                <input type="text" className="input-premium" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del curso" />
              </div>

              {/* Docente */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Docente</label>
                <select className="input-premium" value={form.docenteId} onChange={e => setForm(f => ({ ...f, docenteId: e.target.value }))}>
                  <option value="">Seleccione Docente</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name || `${t.nombres} ${t.apellidos}`}</option>
                  ))}
                </select>
              </div>

              {/* Sede - Jornada */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Sede - Jornada *</label>
                <select className="input-premium" value={form.sedeJornada} onChange={e => handleSedeJornadaChange(e.target.value)}>
                  <option value="">Seleccione</option>
                  {sedeJornadaOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Programa */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Programa *</label>
                <select className="input-premium" value={form.programaId} onChange={e => handleProgramChange(e.target.value)} disabled={programs.length === 0}>
                  <option value="">Seleccione</option>
                  {programs.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nombre || p.codigo}</option>
                  ))}
                </select>
                {programs.length === 0 && (
                  <p style={{ fontSize: '11px', color: '#f59e0b', margin: '4px 0 0', fontWeight: '600' }}>⚠ No hay programas creados</p>
                )}
              </div>

              {/* Pénsum (informativo) */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Pénsum *</label>
                <select className="input-premium" value={form.pensumLabel} onChange={e => setForm(f => ({ ...f, pensumLabel: e.target.value }))} disabled={!form.programaId}>
                  <option value="">Seleccione</option>
                  {form.programaId && <option value="PENSUM_PRINCIPAL">Pénsum Principal</option>}
                </select>
              </div>

              {/* Asignatura */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Asignatura *</label>
                <select className="input-premium" value={form.asignaturaId} onChange={e => setForm(f => ({ ...f, asignaturaId: e.target.value }))} disabled={false}>
                  <option value="">Seleccione</option>
                  {filteredPensumSubjects.map((s: any) => (
                    <option key={s.id || s.subjectId || Math.random()} value={s.id || s.subjectId}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Cupo máximo */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Cupo máximo *</label>
                <input type="number" className="input-premium" value={form.cupoMaximo} onChange={e => setForm(f => ({ ...f, cupoMaximo: e.target.value }))} placeholder="Ej: 30" />
              </div>

              {/* Período */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Período *</label>
                <select className="input-premium" value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))}>
                  <option value="">Seleccione Período</option>
                  {periods.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              {/* Fecha inicio */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Fecha inicio *</label>
                <input type="date" className="input-premium" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
              </div>

              {/* Fecha fin */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Fecha fin *</label>
                <input type="date" className="input-premium" value={form.fechaFin} onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))} />
              </div>
            </div>

            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb', position: 'sticky', bottom: 0 }}>
              <button onClick={closeModal} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', maxWidth: '400px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Trash2 size={28} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', marginBottom: '10px' }}>¿Eliminar curso?</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Esta acción no se puede deshacer.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA PREVIA DEL CURSO MODAL */}
      {showViewModal && viewingCurso && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'var(--primary)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>Detalles del Curso</h2>
              <button onClick={() => { setShowViewModal(false); setViewingCurso(null); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Código</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.codigo}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Nombre</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.nombre}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Docente a cargo</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.docenteNombre || 'Sin asignar'}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Programa Institucional</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.programaNombre}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Asignatura / Materia</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.asignaturaNombre}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Sede - Jornada</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.sedeJornadaLabel}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Período Académico</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.periodo}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Ocupación / Cupos</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.cuposOcupados || 0} de {viewingCurso.cupoMaximo} max.</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Fecha de Inicio</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.fechaInicio}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Fecha de Fin</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{viewingCurso.fechaFin}</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowViewModal(false); setViewingCurso(null); }} 
                style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
