'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Lock, Calendar, Clock, User, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

const emptyForm = {
  programaId: 'TODOS',
  periodoId: '',
  docente: 'Todos los Docentes',
  fechaInicio: new Date().toISOString().split('T')[0],
  horaInicio: '08:00',
  fechaFin: new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0],
  horaFin: '18:00',
};

export default function EvalRestrictionsPage() {
  const [restrictions, setRestrictions] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // filters
  const [filterPrograma, setFilterPrograma] = useState('TODOS');

  // modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rData, pData, perData, tData] = await Promise.all([
        db.list('eval_restrictions'),
        db.list('academic_programs'),
        db.list('academic_periods'),
        db.list('teachers'),
      ]);
      setRestrictions(rData.sort((a: any, b: any) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1));
      setPrograms(pData);
      setPeriods(perData);
      setTeachers(tData);
    } catch (e) {
      console.error('Error fetching eval restrictions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setFormError('');
    setSaved(false);
    setShowModal(true);
  };

  const openEdit = (r: any) => {
    setForm({
      programaId: r.programaId || 'TODOS',
      periodoId: r.periodoId || '',
      docente: r.docente || 'Todos los Docentes',
      fechaInicio: r.fechaInicio || emptyForm.fechaInicio,
      horaInicio: r.horaInicio || '08:00',
      fechaFin: r.fechaFin || emptyForm.fechaFin,
      horaFin: r.horaFin || '18:00',
    });
    setEditingId(r.id);
    setIsEditing(true);
    setFormError('');
    setSaved(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setSaved(false);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setFormError('');
    if (!form.periodoId) { setFormError('Seleccione un período.'); return; }
    if (!form.fechaInicio || !form.fechaFin) { setFormError('Las fechas de inicio y fin son obligatorias.'); return; }
    if (form.fechaFin < form.fechaInicio) { setFormError('La fecha fin no puede ser anterior a la fecha inicio.'); return; }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        programaNombre: form.programaId === 'TODOS'
          ? 'Todos los Programas'
          : (programs.find((p: any) => p.id === form.programaId)?.nombre || form.programaId),
        periodoNombre: periods.find((p: any) => p.id === form.periodoId)?.nombre || form.periodoId,
      };

      if (isEditing && editingId) {
        await db.update('eval_restrictions', editingId, payload);
      } else {
        await db.create('eval_restrictions', payload);
      }

      setSaved(true);
      await fetchData();
      setTimeout(() => closeModal(), 1600);
    } catch (e: any) {
      setFormError('Error al guardar: ' + (e?.message || 'Intente nuevamente.'));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (r: any) => {
    if (!confirm(`¿Eliminar la restricción del período "${r.periodoNombre || r.periodoId}"?`)) return;
    try {
      await db.delete('eval_restrictions', r.id);
      setRestrictions(prev => prev.filter(x => x.id !== r.id));
    } catch (e) {
      console.error('Error deleting restriction:', e);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = restrictions.filter(r =>
    filterPrograma === 'TODOS' || r.programaId === filterPrograma
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const formatTime = (t: string) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'p.m.' : 'a.m.'}`;
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>Restricciones de Evaluación</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Configure los períodos en que los docentes no pueden registrar notas</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <label style={lblStyle}>Programa</label>
          <select
            value={filterPrograma}
            onChange={e => setFilterPrograma(e.target.value)}
            className="input-premium"
            style={{ height: '44px', padding: '0 14px', borderRadius: '12px', fontSize: '14px', minWidth: '260px' }}
          >
            <option value="TODOS">Todos</option>
            {programs.map((p: any) => (
              <option key={p.id} value={p.id}>{p.nombre || p.codigo}</option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreate}
          style={{ height: '44px', padding: '0 22px', background: '#10b981', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px -5px rgba(16,185,129,0.35)', whiteSpace: 'nowrap' }}
        >
          <Plus size={18} /> Crear restricción de evaluación
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={thStyle}>Período</th>
              <th style={thStyle}>Programa</th>
              <th style={thStyle}>Docente</th>
              <th style={thStyle}>Fecha Inicio</th>
              <th style={thStyle}>Fecha Fin</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Cargando restricciones...
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '80px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '52px', height: '52px', background: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={26} color="#cbd5e1" />
                  </div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>No hay registros</p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                    <span onClick={openCreate} style={{ color: '#10b981', fontWeight: '700', cursor: 'pointer' }}>Cree una restricción nueva</span> para comenzar
                  </p>
                </div>
              </td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="res-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={16} color="#d97706" />
                    </div>
                    <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{r.periodoNombre || r.periodoId}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: '7px' }}>
                    {r.programaNombre || (r.programaId === 'TODOS' ? 'Todos los Programas' : r.programaId)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                    <User size={14} color="#94a3b8" />
                    {r.docente || 'Todos los Docentes'}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    <div style={{ fontWeight: '700' }}>{formatDate(r.fechaInicio)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{formatTime(r.horaInicio)}</div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    <div style={{ fontWeight: '700' }}>{formatDate(r.fechaFin)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{formatTime(r.horaFin)}</div>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '7px', justifyContent: 'center' }}>
                    <button onClick={() => openEdit(r)} title="Editar" style={actionBtn('#eff6ff', '#3b82f6')}><Edit size={15} /></button>
                    <button onClick={() => handleDelete(r)} title="Eliminar" style={actionBtn('#fef2f2', '#ef4444')}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══════════════ MODAL ═══════════════════════════════════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '22px', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ background: '#10b981', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '800' }}>
                  {isEditing ? 'Editar restricción de evaluación' : 'Crear restricción de evaluación'}
                </h2>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                  Configure el período de bloqueo de registro de notas
                </p>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px 32px' }}>
              {saved ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={36} color="#10b981" />
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                    {isEditing ? '¡Restricción actualizada!' : '¡Restricción creada!'}
                  </h3>
                  <p style={{ margin: 0, color: '#64748b' }}>Los cambios se guardaron correctamente.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Inline error */}
                  {formError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px' }}>
                      <AlertCircle size={16} color="#ef4444" />
                      <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{formError}</span>
                    </div>
                  )}

                  {/* Row 1: Periodo + Docente */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={lblStyle}>Período *</label>
                      <select
                        className="input-premium"
                        style={{ width: '100%', height: '46px', borderRadius: '11px', padding: '0 14px' }}
                        value={form.periodoId}
                        onChange={e => setForm({ ...form, periodoId: e.target.value })}
                      >
                        <option value="">Selecciona</option>
                        {periods.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.nombre || p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={lblStyle}>Docente</label>
                      <select
                        className="input-premium"
                        style={{ width: '100%', height: '46px', borderRadius: '11px', padding: '0 14px' }}
                        value={form.docente}
                        onChange={e => setForm({ ...form, docente: e.target.value })}
                      >
                        <option value="Todos los Docentes">Todos los Docentes</option>
                        {teachers.map((t: any) => (
                          <option key={t.id} value={`${t.nombres || t.name} ${t.apellidos || t.surname || ''}`.trim()}>
                            {`${t.nombres || t.name} ${t.apellidos || t.surname || ''}`.trim()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Programa */}
                  <div>
                    <label style={lblStyle}>Programa</label>
                    <select
                      className="input-premium"
                      style={{ width: '100%', height: '46px', borderRadius: '11px', padding: '0 14px' }}
                      value={form.programaId}
                      onChange={e => setForm({ ...form, programaId: e.target.value })}
                    >
                      <option value="TODOS">Todos los Programas</option>
                      {programs.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nombre || p.codigo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 3: Fecha Inicio + Hora Inicio */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={lblStyle}>Fecha inicio *</label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="date"
                          className="input-premium"
                          style={{ width: '100%', height: '46px', borderRadius: '11px', paddingLeft: '38px' }}
                          value={form.fechaInicio}
                          onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={lblStyle}>Hora inicio *</label>
                      <div style={{ position: 'relative' }}>
                        <Clock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="time"
                          className="input-premium"
                          style={{ width: '100%', height: '46px', borderRadius: '11px', paddingLeft: '38px' }}
                          value={form.horaInicio}
                          onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Fecha Fin + Hora Fin */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={lblStyle}>Fecha fin *</label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="date"
                          className="input-premium"
                          style={{ width: '100%', height: '46px', borderRadius: '11px', paddingLeft: '38px' }}
                          value={form.fechaFin}
                          onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={lblStyle}>Hora fin *</label>
                      <div style={{ position: 'relative' }}>
                        <Clock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="time"
                          className="input-premium"
                          style={{ width: '100%', height: '46px', borderRadius: '11px', paddingLeft: '38px' }}
                          value={form.horaFin}
                          onChange={e => setForm({ ...form, horaFin: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!saved && (
              <div style={{ padding: '18px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={closeModal} style={{ height: '44px', padding: '0 22px', borderRadius: '11px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving} style={{ height: '44px', padding: '0 30px', borderRadius: '11px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, fontSize: '14px' }}>
                  {isSaving ? 'Guardando...' : 'Aceptar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; background: white; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        .res-row:hover { background: #fafafa; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const lblStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b',
  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
};
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '14px 20px', fontSize: '11px',
  fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'
};
const tdStyle: React.CSSProperties = { padding: '16px 20px' };
function actionBtn(bg: string, color: string): React.CSSProperties {
  return { width: '32px', height: '32px', borderRadius: '8px', background: bg, color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
}
