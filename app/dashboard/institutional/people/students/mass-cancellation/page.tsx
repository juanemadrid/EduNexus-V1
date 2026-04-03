'use client';
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, UserX, AlertCircle, Trash2, X, Info, CheckSquare, Square } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';

export default function MassCancellationPage() {
  const [filters, setFilters] = useState({
    period: '2026 - 01',
    campus: 'PRINCIPAL - MAÑANA',
    program: 'Seleccione',
    level: 'Seleccione',
    group: 'Seleccione',
    filter: 'Matriculados'
  });
  
  const [matchingStudents, setMatchingStudents] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [cancellationData, setCancellationData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    motivo: 'Retiro Voluntario',
    observacion: ''
  });

  const handleConsultar = async () => {
    setIsLoading(true);
    try {
      const allStudents = await db.list<any>('students');
      const filtered = allStudents.filter(s => 
        (s.isEnrolled !== false) && 
        (s.isActive !== false) &&
        (filters.program === 'Seleccione' || (s.details?.program === filters.program || s.details?.programa === filters.program))
      );
      setMatchingStudents(filtered);
      setShowResults(true);
    } catch (error) {
       console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === matchingStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(matchingStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleProcessCancellation = () => {
    if (selectedIds.length === 0) return;
    setShowModal(true);
  };

  const confirmCancellation = async () => {
    setIsLoading(true);
    try {
      const promises = selectedIds.map(id => 
        db.update('students', id, { 
          isActive: false, 
          isEnrolled: false, 
          cancellationDate: cancellationData.fecha,
          cancellationReason: cancellationData.motivo,
          cancellationNote: cancellationData.observacion
        })
      );
      await Promise.all(promises);
      
      setMatchingStudents(matchingStudents.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      setShowModal(false);
      alert(`Se han cancelado ${selectedIds.length} matrículas exitosamente.`);
    } catch (error) {
       console.error("Error performing mass cancellation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
             <div style={{ background: '#ef4444', color: 'white', padding: '8px', borderRadius: '10px' }}>
                <UserX size={20} />
             </div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>
               Cancelación Masiva
             </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginLeft: '40px' }}>
             Procesamiento masivo de anulación de matrículas y retiro de estudiantes
          </p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Periodo *</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', appearance: 'none' }} value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})}>
                <option>2026 - 01</option>
                <option>2026 - 02</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Sede - Jornada *</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', appearance: 'none' }} value={filters.campus} onChange={e => setFilters({...filters, campus: e.target.value})}>
                <option>PRINCIPAL - MAÑANA</option>
                <option>PRINCIPAL - NOCHE</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Programa</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', appearance: 'none' }} value={filters.program} onChange={e => setFilters({...filters, program: e.target.value})}>
                <option value="Seleccione">Todos los programas</option>
                <option>Bachillerato Académico</option>
                <option>Técnico en Sistemas</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Estado de Matrícula</label>
            <div style={{ position: 'relative' }}>
              <select className="input-premium" style={{ width: '100%', height: '42px', appearance: 'none' }} value={filters.filter} onChange={e => setFilters({...filters, filter: e.target.value})}>
                <option>Matriculados</option>
                <option>En proceso</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-premium" 
            style={{ padding: '12px 32px', background: '#334155', color: 'white', fontWeight: '800' }}
            onClick={handleConsultar}
            disabled={isLoading}
          >
            {isLoading ? 'Buscando...' : 'Consultar para Cancelación'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="glass-panel" style={{ background: 'white', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div onClick={toggleSelectAll} style={{ cursor: 'pointer', color: selectedIds.length === matchingStudents.length && matchingStudents.length > 0 ? '#ef4444' : '#94a3b8' }}>
                  {selectedIds.length === matchingStudents.length && matchingStudents.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
               </div>
               <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Seleccionados: {selectedIds.length} / {matchingStudents.length}</h3>
            </div>
            {selectedIds.length > 0 && (
              <button 
                onClick={handleProcessCancellation}
                className="btn-premium" 
                style={{ padding: '8px 20px', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
                disabled={isLoading}
              >
                <Trash2 size={16} /> Cancelar Matrículas
              </button>
            )}
          </div>

          {matchingStudents.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                   <th style={{ width: '60px', padding: '16px 24px' }}></th>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Identificación</th>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Nombre completo</th>
                   <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Programa</th>
                 </tr>
               </thead>
               <tbody>
                 {matchingStudents.map(s => (
                   <tr key={s.id} onClick={() => toggleSelect(s.id)} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selectedIds.includes(s.id) ? '#fff1f2' : 'transparent' }}>
                     <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ color: selectedIds.includes(s.id) ? '#ef4444' : '#cbd5e1' }}>
                           {selectedIds.includes(s.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                     </td>
                     <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{s.id}</td>
                     <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{s.name}</td>
                     <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{s.details?.programa || s.details?.program || 'Bachillerato Académico'}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          ) : (
            <div style={{ padding: '80px', textAlign: 'center' }}>
               <AlertCircle size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
               <p style={{ margin: 0, fontWeight: '700', color: '#64748b' }}>No hay estudiantes pendientes de cancelación para estos filtros.</p>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━ CANCELLATION MODAL ━━━━━━━━━━ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '550px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#ef4444', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white' }}>Procesar Cancelación</h2>
                 <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Registros afectados: {selectedIds.length}</p>
               </div>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} disabled={isLoading}><X size={22} /></button>
            </div>
            
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Fecha de Retiro</label>
                  <input type="date" className="input-premium" style={{ width: '100%', height: '40px' }} value={cancellationData.fecha} onChange={e => setCancellationData({...cancellationData, fecha: e.target.value})} disabled={isLoading} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Motivo General</label>
                  <select className="input-premium" style={{ width: '100%', height: '40px' }} value={cancellationData.motivo} onChange={e => setCancellationData({...cancellationData, motivo: e.target.value})} disabled={isLoading}>
                    <option value="Retiro Voluntario">Retiro Voluntario</option>
                    <option value="Bajo Rendimiento">Bajo Rendimiento</option>
                    <option value="Problemas Económicos">Problemas Económicos</option>
                    <option value="Sanción Disciplinaria">Sanción Disciplinaria</option>
                    <option value="Traslado">Traslado Institucional</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Observación de Soporte</label>
                <textarea 
                  className="input-premium" 
                  style={{ width: '100%', height: '100px', padding: '12px', fontSize: '14px', resize: 'none' }} 
                  placeholder="Detalles adicionales sobre el retiro masivo..."
                  value={cancellationData.observacion}
                  onChange={e => setCancellationData({...cancellationData, observacion: e.target.value})}
                  disabled={isLoading}
                ></textarea>
              </div>

              <div style={{ marginTop: '20px', background: '#fef2f2', padding: '12px', borderRadius: '12px', display: 'flex', gap: '10px', border: '1px solid #fee2e2' }}>
                 <Info size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                 <p style={{ margin: 0, fontSize: '12px', color: '#991b1b', lineHeight: '1.4' }}>
                   <strong>Atención:</strong> Esta acción inactivará a los estudiantes seleccionados y anulará su matrícula vigente. No afectará su historial académico previo.
                 </p>
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fafafa' }}>
               <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', cursor: 'pointer' }} disabled={isLoading}>Cerrar</button>
               <button 
                 onClick={confirmCancellation} 
                 style={{ padding: '10px 32px', borderRadius: '10px', background: '#ef4444', color: 'white', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                 disabled={isLoading}
               >
                 {isLoading ? 'Procesando...' : <><Trash2 size={18} /> Confirmar Cancelación</>}
               </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-panel { border-radius: 20px; border: 1px solid #e2e8f0; }
        .input-premium { border-radius: 12px; outline: none; transition: 0.2s; padding: 0 16px; border: 1px solid #e2e8f0; font-size: 14px; }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .btn-premium { border-radius: 12px; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn-premium:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>
    </DashboardLayout>
  );
}
