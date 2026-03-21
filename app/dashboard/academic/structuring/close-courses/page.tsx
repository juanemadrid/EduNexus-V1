'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';

export default function CloseCoursesPage() {
  const [sedeJornada, setSedeJornada] = useState('');
  const [programa, setPrograma] = useState('');
  const [pensum, setPensum] = useState('Todos');
  const [asignatura, setAsignatura] = useState('Todos');
  const [periodo, setPeriodo] = useState('Todos');

  return (
    <DashboardLayout>
      
      {/* Filtros */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '16px', marginBottom: '24px', alignItems: 'end' }}>
        
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Sede - jornada</label>
          <select 
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={sedeJornada}
            onChange={e => setSedeJornada(e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="principal-manana">Sede Principal - Mañana</option>
            <option value="principal-tarde">Sede Principal - Tarde</option>
          </select>
        </div>

        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Programa</label>
          <select 
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={programa}
            onChange={e => setPrograma(e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="salud">Técnico en Salud Pública</option>
            <option value="sistemas">Técnico en Sistemas</option>
          </select>
        </div>

        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Pénsum</label>
          <select 
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={pensum}
            onChange={e => setPensum(e.target.value)}
          >
            <option value="Todos">Todos</option>
          </select>
        </div>

        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Asignatura</label>
          <select 
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={asignatura}
            onChange={e => setAsignatura(e.target.value)}
          >
            <option value="Todos">Todos</option>
          </select>
        </div>

        <div style={{ minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Periodo</label>
          <select 
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="2024-1">2024-1</option>
            <option value="2024-2">2024-2</option>
          </select>
        </div>

      </div>

      {/* Caja de mensaje */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '16px 20px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
          Por favor seleccione una Asignatura
        </p>
      </div>

    </DashboardLayout>
  );
}
