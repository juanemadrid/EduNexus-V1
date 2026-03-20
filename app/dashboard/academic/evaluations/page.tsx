'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';

export default function EvaluationsPage() {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', margin: 0, marginBottom: '24px' }}>
          Evaluaciones
        </h1>
        
        <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Sede - jornada
            </label>
            <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '13px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', appearance: 'none', background: 'white', color: '#6b7280' }}>
              <option value="">Seleccione Sede - jornada</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Asignatura
            </label>
            <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '13px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', appearance: 'none', background: 'white', color: '#6b7280' }}>
              <option value="">Seleccione asignatura</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Curso
            </label>
            <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '13px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', appearance: 'none', background: 'white', color: '#6b7280' }}>
              <option value="">Seleccione curso</option>
            </select>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
