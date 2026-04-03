'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X, Edit, Trash2, Search, ChevronDown, BookOpen, RefreshCw, Layers } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function EvalParamsPage() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [evalParams, setEvalParams] = useState<any[]>([]);
  const [selectedSedeJornada, setSelectedSedeJornada] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    porcentaje: '',
    modificable: 'No' as 'Sí' | 'No',
    estado: 'Activo' as 'Activo' | 'Inactivo'
  });

  const fetchData = async () => {
    const [sData, pData, eData] = await Promise.all([
      db.list('sedes'),
      db.list('academic_programs'),
      db.list('eval_params')
    ]);
    setSedes(sData);
    setPrograms(pData);
    setEvalParams(eData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.nombre || !form.porcentaje || !selectedSedeJornada || !selectedProgram) {
      alert('Complete los campos obligatorios y asegúrese de seleccionar Sede y Programa');
      return;
    }

    const data = {
      ...form,
      sedeJornadaId: selectedSedeJornada,
      programId: selectedProgram,
      porcentaje: parseFloat(form.porcentaje)
    };

    if (isEditing && editingId) {
      await db.update('eval_params', editingId, data);
    } else {
      await db.create('eval_params', data);
    }

    await fetchData();
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ nombre: '', porcentaje: '', modificable: 'No', estado: 'Activo' });
  };

  const handleEdit = (p: any) => {
    setForm({
      nombre: p.nombre,
      porcentaje: p.porcentaje.toString(),
      modificable: p.modificable || 'No',
      estado: p.estado || 'Activo'
    });
    setEditingId(p.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este parámetro?')) {
      await db.delete('eval_params', id);
      await fetchData();
    }
  };

  // Build options for Sede-Jornada
  const sjOptions: any[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      sjOptions.push({ label: `${s.nombre} - ${j.nombre}`, value: `${s.id}::${j.id}` });
    });
  });

  // Filter eval params based on selection
  const filteredParams = evalParams.filter(p => 
    p.sedeJornadaId === selectedSedeJornada && p.programId === selectedProgram
  );

  const totalPct = filteredParams.reduce((acc, p) => acc + (parseFloat(p.porcentaje) || 0), 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Parámetros de Evaluación</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Definición de cortes y porcentajes por programa académico</p>
      </div>

      {/* Filters Bar (mirroring Q10) */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '28px', display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Sede - Jornada</label>
          <div style={{ position: 'relative' }}>
            <select className="input-premium" style={{ height: '44px', width: '100%', background: '#f8fafc' }} value={selectedSedeJornada} onChange={e => setSelectedSedeJornada(e.target.value)}>
              <option value="">Selecciona...</option>
              {sjOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Programa</label>
          <div style={{ position: 'relative' }}>
            <select className="input-premium" style={{ height: '44px', width: '100%', background: '#f8fafc' }} value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
              <option value="">Selecciona...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-premium" style={{ height: '44px', padding: '0 18px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <RefreshCw size={14} /> Replicar
          </button>
          <button className="btn-premium" style={{ height: '44px', padding: '0 20px', background: '#10b981', color: 'white' }} onClick={() => { setIsEditing(false); setShowModal(true); }}>
             Crear parámetro de evaluación
          </button>
        </div>
      </div>

      {/* Accordion / List of Parameters */}
      {!selectedProgram || !selectedSedeJornada ? (
        <div style={{ background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0', padding: '80px 40px', textAlign: 'center', color: '#94a3b8' }}>
          <Layers size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Selecciona una Sede y Programa para configurar sus notas</p>
          <p style={{ margin: '8px 0 0', fontSize: '13px' }}>El diseño se habilitará una vez carges los filtros superiores.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
          {filteredParams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Este programa no tiene parámetros. Haz clic en "Crear" para empezar.</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                 <div style={{ padding: '8px 16px', borderRadius: '12px', background: totalPct === 100 ? '#ecfdf5' : '#fff7ed', border: `1px solid ${totalPct === 100 ? '#10b981' : '#f59e0b'}` }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: totalPct === 100 ? '#059669' : '#d97706' }}>
                      Total Definido: {totalPct}% {totalPct === 100 ? '✅ Configuración Óptima' : '⚠️ Debe sumar 100%'}
                    </span>
                 </div>
              </div>
              {filteredParams.map((p) => (
                <div key={p.id} className="glass-panel" style={{ border: '1px solid #e2e8f0', borderRadius: '14px', background: 'white', overflow: 'hidden' }}>
                   {/* Top Bar for each parameter */}
                   <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{p.nombre.toUpperCase()} ({p.porcentaje}%)</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <button style={{ border: 'none', background: 'none', color: '#10b981', cursor: 'pointer' }}><Plus size={16} /></button>
                         <button onClick={() => handleEdit(p)} style={{ border: 'none', background: 'none', color: '#6366f1', cursor: 'pointer' }}><Edit size={16} /></button>
                         <button onClick={() => handleDelete(p.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                      </div>
                   </div>
                   {/* Content */}
                   <div style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b' }}>
                      No hay subparámetros de evaluación para este parámetro, <span style={{ color: '#10b981', fontWeight: '700', cursor: 'pointer' }}>cree uno nuevo</span>
                   </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Create Modal (mirroring Q10) */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ background: '#10b981', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800' }}>Crear parámetro de evaluación</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre *</label>
                  <input type="text" className="input-premium" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: ASISTENCIA" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Porcentaje *</label>
                  <input type="number" className="input-premium" value={form.porcentaje} onChange={e => setForm({...form, porcentaje: e.target.value})} placeholder="Ej: 10" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Modificable al evaluar</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', cursor: 'pointer' }}>
                    <input type="radio" checked={form.modificable === 'Sí'} onChange={() => setForm({...form, modificable: 'Sí'})} style={{ accentColor: '#10b981' }} /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', cursor: 'pointer' }}>
                    <input type="radio" checked={form.modificable === 'No'} onChange={() => setForm({...form, modificable: 'No'})} style={{ accentColor: '#10b981' }} /> No
                  </label>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
               <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
               <button onClick={handleSave} style={{ padding: '10px 30px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
