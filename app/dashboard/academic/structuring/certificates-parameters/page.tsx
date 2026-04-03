'use client';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search, Plus, Filter, X, Edit, Trash2, FileText, Calendar,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, Indent, Outdent, Undo, Redo, Link,
  Image, Table, ChevronDown, Superscript, Subscript, Type, Palette,
  Eye, Copy, Download
} from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/db';

// ─── Variable categories using ##Variable## format (matching Q10) ─────────────
const VARIABLE_GROUPS = [
  {
    group: 'Datos del Estudiante',
    vars: [
      { label: 'Apellidos y Nombres',         value: '##ApellidosNombresEstudiante##' },
      { label: 'Nombres y Apellidos',         value: '##NombresApellidosEstudiante##' },
      { label: 'Primer Nombre',               value: '##PrimerNombreEstudiante##' },
      { label: 'Primer Apellido',             value: '##PrimerApellidoEstudiante##' },
      { label: 'Foto',                        value: '##FotoEstudiante##' },
      { label: 'Identificación',              value: '##IdentificacionEstudiante##' },
      { label: 'Tipo Identificación',         value: '##TipoIdentificacionEstudiante##' },
      { label: 'Municipio Identificación',    value: '##MunicipioIdentificacion##' },
      { label: 'Fecha de Nacimiento',         value: '##FechaNacimientoEstudiante##' },
      { label: 'Género',                      value: '##GeneroEstudiante##' },
      { label: 'Dirección',                   value: '##DireccionEstudiante##' },
      { label: 'Ciudad',                      value: '##CiudadEstudiante##' },
      { label: 'Teléfono',                    value: '##TelefonoEstudiante##' },
      { label: 'Email',                       value: '##EmailEstudiante##' },
    ]
  },
  {
    group: 'Datos Académicos',
    vars: [
      { label: 'Código Matrícula',            value: '##CodigoMatricula##' },
      { label: 'Grado / Curso',               value: '##GradoCursoEstudiante##' },
      { label: 'Programa Académico',          value: '##ProgramaAcademico##' },
      { label: 'Sede',                        value: '##SedeEstudiante##' },
      { label: 'Jornada',                     value: '##JornadaEstudiante##' },
      { label: 'Año Académico',               value: '##AñoAcademico##' },
      { label: 'Período',                     value: '##PeriodoAcademico##' },
      { label: 'Promedio General',            value: '##PromedioGeneralEstudiante##' },
      { label: 'Promedio Período',            value: '##PromedioPeriodoEstudiante##' },
      { label: 'Tipo Evaluación',             value: '##TipoEvaluacion##' },
      { label: 'Estado Matrícula',            value: '##EstadoMatricula##' },
      { label: 'Fecha Matrícula',             value: '##FechaMatricula##' },
    ]
  },
  {
    group: 'Datos del Acudiente',
    vars: [
      { label: 'Nombre Acudiente',            value: '##NombreAcudiente##' },
      { label: 'Identificación Acudiente',    value: '##IdentificacionAcudiente##' },
      { label: 'Teléfono Acudiente',          value: '##TelefonoAcudiente##' },
      { label: 'Email Acudiente',             value: '##EmailAcudiente##' },
      { label: 'Parentesco',                  value: '##ParentescoAcudiente##' },
    ]
  },
  {
    group: 'Datos del Docente',
    vars: [
      { label: 'Nombres y Apellidos Docente', value: '##NombresApellidosDocente##' },
      { label: 'Identificación Docente',      value: '##IdentificacionDocente##' },
      { label: 'Asignatura',                  value: '##AsignaturaDocente##' },
      { label: 'Cargo',                       value: '##CargoDocente##' },
    ]
  },
  {
    group: 'Datos de la Institución',
    vars: [
      { label: 'Nombre Colegio',              value: '##NombreColegio##' },
      { label: 'NIT Colegio',                 value: '##NitColegio##' },
      { label: 'Dirección Colegio',           value: '##DireccionColegio##' },
      { label: 'Ciudad Colegio',              value: '##CiudadColegio##' },
      { label: 'Teléfono Colegio',            value: '##TelefonoColegio##' },
      { label: 'Nombre Rector',               value: '##NombreRector##' },
      { label: 'Cargo Rector',                value: '##CargoRector##' },
      { label: 'Logo Colegio',                value: '##LogoColegio##' },
      { label: 'Sello Colegio',               value: '##SelloColegio##' },
    ]
  },
  {
    group: 'Fecha y Consecutivo',
    vars: [
      { label: 'Fecha de Expedición',         value: '##FechaExpedicion##' },
      { label: 'Día Expedición',              value: '##DiaExpedicion##' },
      { label: 'Mes Expedición (texto)',      value: '##MesExpedicion##' },
      { label: 'Año Expedición',              value: '##AñoExpedicion##' },
      { label: 'Número de Constancia',        value: '##NumeroConstancia##' },
    ]
  },
];

const FONTS = ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Helvetica', 'Courier New', 'Tahoma', 'Trebuchet MS'];
const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '48', '72'];

// ─── Toolbar Button ──────────────────────────────────────────────────────────
function TBtn({ children, onClick, title, active = false }: any) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        width: '30px', height: '30px', borderRadius: '6px',
        border: active ? '1px solid #10b981' : '1px solid #e2e8f0',
        background: active ? '#f0fdf4' : 'white',
        color: active ? '#10b981' : '#475569',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: '0.15s', flexShrink: 0
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: '1px', background: '#e2e8f0', margin: '2px 4px', alignSelf: 'stretch' }} />;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CertificatesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showVarsMenu, setShowVarsMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    aplicaPara: 'Estudiantes',
    fecha: new Date().toISOString().split('T')[0],
    nombre: '',
    estado: 'Activo',
    contenido: ''
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const varsMenuRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // ── Data Fetching
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await db.list('academic_certificates');
      setItems(data.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Close vars menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (varsMenuRef.current && !varsMenuRef.current.contains(e.target as Node)) {
        setShowVarsMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Save selection before clicking toolbar
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // ── execCommand wrapper
  const exec = useCallback((cmd: string, val?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, val ?? undefined);
    editorRef.current?.focus();
  }, []);

  // ── Insert variable at cursor
  const insertVariable = (varValue: string) => {
    restoreSelection();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const span = document.createElement('span');
      span.textContent = varValue;
      span.style.cssText = 'background:#dcfce7;color:#15803d;font-weight:700;border-radius:4px;padding:1px 4px;font-family:monospace;font-size:0.9em;';
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    setShowVarsMenu(false);
  };

  // ── Handle save
  const handleSave = async () => {
    const content = editorRef.current?.innerHTML || '';
    if (!form.nombre.trim()) { alert('Por favor ingrese el nombre de la constancia.'); return; }
    if (!content.trim() || content === '<br>') { alert('Por favor escriba el contenido de la constancia.'); return; }

    const data = { ...form, contenido: content };
    try {
      if (isEditing && editingId) {
        await db.update('academic_certificates', editingId, data);
      } else {
        await db.create('academic_certificates', data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setShowModal(false);
      resetForm();
      await fetchData();
    } catch (err) {
      alert('Error al guardar. Intente nuevamente.');
    }
  };

  const handleEdit = (item: any) => {
    setForm({ aplicaPara: item.aplicaPara || 'Estudiantes', fecha: item.fecha || '', nombre: item.nombre || '', estado: item.estado || 'Activo', contenido: item.contenido || '' });
    setEditingId(item.id);
    setIsEditing(true);
    setShowModal(true);
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = item.contenido || ''; }, 50);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta constancia? Esta acción no se puede deshacer.')) {
      await db.delete('academic_certificates', id);
      await fetchData();
    }
  };

  const handleDuplicate = async (item: any) => {
    await db.create('academic_certificates', { ...item, nombre: item.nombre + ' (Copia)', id: undefined, createdAt: undefined });
    await fetchData();
  };

  const resetForm = () => {
    setForm({ aplicaPara: 'Estudiantes', fecha: new Date().toISOString().split('T')[0], nombre: '', estado: 'Activo', contenido: '' });
    if (editorRef.current) editorRef.current.innerHTML = '';
    setIsEditing(false);
    setEditingId(null);
  };

  const handlePreview = () => {
    setPreviewContent(editorRef.current?.innerHTML || form.contenido || '');
    setShowPreview(true);
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || i.aplicaPara?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Todos' || i.aplicaPara === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleColors: any = {
    Estudiantes:   { bg: '#f0fdf4', text: '#16a34a' },
    Docentes:      { bg: '#eff6ff', text: '#2563eb' },
    Administrativos: { bg: '#faf5ff', text: '#7c3aed' },
  };

  return (
    <DashboardLayout>
      {/* ── Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>Constancias - Certificados</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Configuración de plantillas con variables dinámicas para documentos institucionales</p>
      </div>

      {/* ── Toolbar Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '700px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={17} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar constancias - certificados..."
              className="input-premium"
              style={{ width: '100%', height: '44px', paddingLeft: '46px', fontSize: '14px', borderRadius: '12px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="input-premium"
              style={{ height: '44px', padding: '0 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', minWidth: '160px' }}
            >
              <option value="Todos">Todos los destinatarios</option>
              <option value="Estudiantes">Estudiantes</option>
              <option value="Docentes">Docentes</option>
              <option value="Administrativos">Administrativos</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ height: '44px', background: '#10b981', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 22px', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px -5px rgba(16,185,129,0.35)', fontSize: '14px', whiteSpace: 'nowrap' }}
        >
          <Plus size={18} /> Crear constancia - certificado
        </button>
      </div>

      {/* ── Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: items.length, color: '#6366f1' },
          { label: 'Estudiantes', count: items.filter(i => i.aplicaPara === 'Estudiantes').length, color: '#10b981' },
          { label: 'Docentes', count: items.filter(i => i.aplicaPara === 'Docentes').length, color: '#3b82f6' },
          { label: 'Administrativos', count: items.filter(i => i.aplicaPara === 'Administrativos').length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '14px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: s.color }}>{s.count}</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Table */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aplica para</th>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha</th>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</th>
              <th style={{ textAlign: 'center', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Cargando registros...
                </div>
              </td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '80px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '56px', height: '56px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} color="#cbd5e1" />
                  </div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>No hay registros</p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Verifique los filtros de la consulta o <span style={{ color: '#10b981', cursor: 'pointer', fontWeight: '700' }} onClick={() => { resetForm(); setShowModal(true); }}>cree uno nuevo</span></p>
                </div>
              </td></tr>
            ) : filteredItems.map(item => {
              const rc = roleColors[item.aplicaPara] || { bg: '#f1f5f9', text: '#64748b' };
              return (
                <tr key={item.id} className="cert-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: '#f0fdf4', padding: '9px', borderRadius: '10px', color: '#10b981', flexShrink: 0 }}>
                        <FileText size={17} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{item.nombre}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {item.contenido ? 'Con contenido' : 'Sin contenido'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '8px', background: rc.bg, color: rc.text }}>
                      {item.aplicaPara}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                      <Calendar size={13} />
                      {item.fecha}
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '8px', background: item.estado === 'Activo' ? '#f0fdf4' : '#f1f5f9', color: item.estado === 'Activo' ? '#16a34a' : '#94a3b8' }}>
                      {item.estado || 'Activo'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(item)} title="Editar" style={actionBtnStyle('#eff6ff', '#3b82f6')}><Edit size={15} /></button>
                      <button onClick={() => handleDuplicate(item)} title="Duplicar" style={actionBtnStyle('#f5f3ff', '#7c3aed')}><Copy size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} title="Eliminar" style={actionBtnStyle('#fef2f2', '#ef4444')}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══════════════ MODAL ═══════════════════════════════════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '1140px', maxHeight: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px -16px rgba(0,0,0,0.3)' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>{isEditing ? 'Editar Constancia' : 'Registrar Constancia'}</h2>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>Complete los campos. Use variables dinámicas para personalizar el documento.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={handlePreview} style={{ height: '38px', padding: '0 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                  <Eye size={16} /> Vista previa
                </button>
                <button onClick={() => setShowModal(false)} style={{ width: '38px', height: '38px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

              {/* Form Fields Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 200px 1fr auto', gap: '20px', alignItems: 'end', marginBottom: '20px' }}>
                {/* Aplica para */}
                <div>
                  <label style={labelStyle}>Aplica para *</label>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    {['Administrativos', 'Docentes', 'Estudiantes'].map(role => (
                      <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '14px', color: '#1e293b', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        <input type="radio" checked={form.aplicaPara === role} onChange={() => setForm({ ...form, aplicaPara: role })} style={{ width: '17px', height: '17px', accentColor: '#10b981' }} />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Fecha */}
                <div>
                  <label style={labelStyle}>Fecha *</label>
                  <input type="date" className="input-premium" style={{ width: '100%', height: '44px', borderRadius: '11px', padding: '0 14px', fontSize: '14px' }} value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                </div>
                {/* Nombre */}
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input type="text" className="input-premium" placeholder="Ej: Certificado de Excelencia Académica" style={{ width: '100%', height: '44px', borderRadius: '11px', padding: '0 14px', fontSize: '14px' }} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                {/* Estado */}
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select className="input-premium" style={{ height: '44px', borderRadius: '11px', padding: '0 14px', fontSize: '14px', minWidth: '120px' }} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* EDITOR */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                {/* Toolbar Row 1 - Font controls */}
                <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 12px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Font Family */}
                  <select onChange={e => exec('fontName', e.target.value)} onMouseDown={saveSelection} style={selectStyle} title="Fuente">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {/* Font Size */}
                  <select onChange={e => exec('fontSize', e.target.value)} onMouseDown={saveSelection} style={{ ...selectStyle, width: '65px' }} title="Tamaño">
                    {FONT_SIZES.map(s => <option key={s} value={s === '12' ? '3' : s === '16' ? '4' : s === '24' ? '5' : '3'}>{s}px</option>)}
                  </select>
                  <Divider />
                  {/* Colors */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label title="Color de texto" style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white' }}>
                      <Type size={14} color="#475569" />
                      <input type="color" onChange={e => { saveSelection(); exec('foreColor', e.target.value); }} style={{ width: '20px', height: '16px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }} />
                    </label>
                    <label title="Color de fondo" style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white' }}>
                      <Palette size={14} color="#475569" />
                      <input type="color" onChange={e => { saveSelection(); exec('hiliteColor', e.target.value); }} style={{ width: '20px', height: '16px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }} />
                    </label>
                  </div>
                  <Divider />
                  {/* Text formatting */}
                  <TBtn onClick={() => exec('bold')} title="Negrita (Ctrl+B)"><Bold size={14} /></TBtn>
                  <TBtn onClick={() => exec('italic')} title="Cursiva (Ctrl+I)"><Italic size={14} /></TBtn>
                  <TBtn onClick={() => exec('underline')} title="Subrayado (Ctrl+U)"><Underline size={14} /></TBtn>
                  <TBtn onClick={() => exec('strikeThrough')} title="Tachado"><Strikethrough size={14} /></TBtn>
                  <TBtn onClick={() => exec('superscript')} title="Superíndice"><Superscript size={14} /></TBtn>
                  <TBtn onClick={() => exec('subscript')} title="Subíndice"><Subscript size={14} /></TBtn>
                  <Divider />
                  {/* Alignment */}
                  <TBtn onClick={() => exec('justifyLeft')} title="Alinear izquierda"><AlignLeft size={14} /></TBtn>
                  <TBtn onClick={() => exec('justifyCenter')} title="Centrar"><AlignCenter size={14} /></TBtn>
                  <TBtn onClick={() => exec('justifyRight')} title="Alinear derecha"><AlignRight size={14} /></TBtn>
                  <TBtn onClick={() => exec('justifyFull')} title="Justificar"><AlignJustify size={14} /></TBtn>
                  <Divider />
                  {/* Lists */}
                  <TBtn onClick={() => exec('insertUnorderedList')} title="Lista con viñetas"><List size={14} /></TBtn>
                  <TBtn onClick={() => exec('insertOrderedList')} title="Lista numerada"><ListOrdered size={14} /></TBtn>
                  <TBtn onClick={() => exec('outdent')} title="Reducir sangría"><Outdent size={14} /></TBtn>
                  <TBtn onClick={() => exec('indent')} title="Aumentar sangría"><Indent size={14} /></TBtn>
                  <Divider />
                  {/* Undo / Redo */}
                  <TBtn onClick={() => exec('undo')} title="Deshacer (Ctrl+Z)"><Undo size={14} /></TBtn>
                  <TBtn onClick={() => exec('redo')} title="Rehacer (Ctrl+Y)"><Redo size={14} /></TBtn>
                  <Divider />
                  {/* Insert link */}
                  <TBtn onClick={() => { saveSelection(); const url = prompt('URL del enlace:', 'https://'); if (url) exec('createLink', url); }} title="Insertar enlace"><Link size={14} /></TBtn>
                  {/* Insert image */}
                  <TBtn onClick={() => { saveSelection(); const url = prompt('URL de la imagen:', 'https://'); if (url) exec('insertImage', url); }} title="Insertar imagen"><Image size={14} /></TBtn>
                  {/* Insert horizontal line */}
                  <TBtn onClick={() => exec('insertHorizontalRule')} title="Línea horizontal"><span style={{ fontWeight: '800', fontSize: '12px', lineHeight: 1 }}>—</span></TBtn>
                  <Divider />
                   {/* Variables dropdown */}
                  <div ref={varsMenuRef} style={{ position: 'relative' }}>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowVarsMenu(v => !v); }}
                      style={{ height: '30px', padding: '0 10px', background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <span>Variable...</span>
                      <ChevronDown size={13} />
                    </button>
                    {showVarsMenu && (
                      <div style={{ position: 'absolute', top: '36px', left: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px 4px', zIndex: 9999, minWidth: '320px', boxShadow: '0 16px 40px -8px rgba(0,0,0,0.18)', maxHeight: '380px', overflowY: 'auto' }}>
                        <p style={{ margin: '0 8px 6px', padding: '4px 8px', fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Variables Disponibles</p>
                        {VARIABLE_GROUPS.map(group => (
                          <div key={group.group}>
                            <p style={{ margin: 0, padding: '8px 12px 4px', fontSize: '10px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{group.group}</p>
                            {group.vars.map((v: { label: string; value: string }) => (
                              <button key={v.value} onClick={() => insertVariable(v.value)}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', transition: '0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                <span style={{ color: '#15803d', fontWeight: '700', fontFamily: 'monospace', fontSize: '11px' }}>{v.value}</span>
                                <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '12px' }}>{v.label}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Content area label */}
                <div style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', padding: '6px 16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Contenido *</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Las variables en verde serán reemplazadas al imprimir</span>
                </div>

                {/* Editable content */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  style={{ minHeight: '380px', padding: '28px 36px', background: 'white', outline: 'none', fontSize: '14px', lineHeight: '1.7', color: '#1e293b', cursor: 'text', fontFamily: 'Georgia, serif' }}
                  data-placeholder="Escribe el contenido de la constancia aquí. Usa la barra de herramientas para formatearlo y el botón 'Variable...' para insertar datos dinámicos..."
                />

                {/* Status bar */}
                <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>body</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Editor de texto enriquecido</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', color: saved ? '#10b981' : '#94a3b8', fontWeight: '600', transition: '0.3s' }}>
                {saved ? '✅ Guardado exitosamente' : ''}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ height: '42px', padding: '0 22px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '11px', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
                <button onClick={handleSave} style={{ height: '42px', padding: '0 30px', background: '#10b981', border: 'none', borderRadius: '11px', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px', boxShadow: '0 8px 20px -5px rgba(16,185,129,0.3)' }}>Aceptar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ PREVIEW MODAL ═══════════════════════════════════════ */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#10b981" /> Vista Previa del Documento
              </h3>
              <button onClick={() => setShowPreview(false)} style={{ width: '36px', height: '36px', border: 'none', background: '#f1f5f9', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '60px', minHeight: '600px', fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.8', color: '#1e293b' }}
                dangerouslySetInnerHTML={{ __html: previewContent || '<p style="color:#94a3b8;text-align:center;padding:80px 0">Sin contenido para mostrar</p>' }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; background: white; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        .cert-row:hover { background: #fafafa; }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; display: block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const selectStyle: React.CSSProperties = { height: '30px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', padding: '0 8px', background: 'white', color: '#475569', outline: 'none', cursor: 'pointer' };
function actionBtnStyle(bg: string, color: string): React.CSSProperties {
  return { width: '32px', height: '32px', borderRadius: '9px', background: bg, color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.15s' };
}
