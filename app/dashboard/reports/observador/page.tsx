'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import React, { useState, useEffect } from 'react';

export default function ObservadorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [fechaOption, setFechaOption] = useState('Este mes');
  const [customRange, setCustomRange] = useState<{from: string; to: string} | null>(null);
  const [periodo, setPeriodo] = useState('');
  const [programaId, setProgramaId] = useState('');

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));
  }, []);

  const handleCharge = () => {
    if (!periodo) {
      alert('Por favor seleccione un período (*)');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // For now we just mock an alert. In production it would fetch the report data
      alert('Reporte del Observador cargado exitosamente.');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 30px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           Observador
         </h1>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Fechas
              </label>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <DateRangePicker 
                  value={fechaOption} 
                  onChange={(val, custom) => {
                    setFechaOption(val);
                    if(custom) setCustomRange(custom);
                  }} 
                />
              </div>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Período <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
                <option value="">Seleccione</option>
                <option value="2026 - 01">2026 - 01</option>
                <option value="2026 - 02">2026 - 02</option>
              </select>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Programas
              </label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={programaId} onChange={e => setProgramaId(e.target.value)}>
                <option value="">Todos</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none' }}
              onClick={handleCharge}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando reporte...' : 'Cargar reporte'}
            </button>
         </div>
      </div>
    </DashboardLayout>
  );
}
