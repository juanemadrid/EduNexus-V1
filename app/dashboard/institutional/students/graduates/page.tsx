'use client';
import React, { useState } from 'react';
import { Search, ChevronDown, GraduationCap, Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function GraduatesPage() {
  const [filters, setFilters] = useState({
    program: 'Seleccione',
    period: 'Seleccione',
    status: 'Todos'
  });
  const [localStudents, setLocalStudents] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_students');
    if (saved) setLocalStudents(JSON.parse(saved));
  }, []);

  const handleGraduate = (id: string) => {
    const updated = localStudents.map(s => s.id === id ? { ...s, isGraduated: true } : s);
    setLocalStudents(updated);
    localStorage.setItem('edunexus_registered_students', JSON.stringify(updated));
    alert('Estudiante graduado exitosamente');
  };

  const filteredStudents = localStudents.filter((s: any) => {
    const isEnrolled = s.isEnrolled === true;
    const isNotGraduated = s.isGraduated !== true;
    const matchesProgram = filters.program === 'Seleccione' || s.details?.program === filters.program;
    const matchesPeriod = filters.period === 'Seleccione' || s.details?.period === filters.period;
    
    return isEnrolled && isNotGraduated && matchesProgram && matchesPeriod;
  });

  return (
    <DashboardLayout>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
             <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                <GraduationCap size={20} />
             </div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>
               Establecer egresados graduados
             </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginLeft: '40px' }}>
            Procesamiento masivo de graduación y cambio de estado a egresado
          </p>
        </div>
      </div>

      {/* Filter Panel - Replicating Q10 Screenshot Structure */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1fr 1fr 100px', 
          gap: '20px',
          alignItems: 'end'
        }}>
          {/* Program Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Programa</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '45px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.program}
              onChange={(e) => setFilters({...filters, program: e.target.value})}
            >
              <option>Seleccione</option>
              <option>Bachillerato Académico</option>
              <option>Técnico en Sistemas</option>
              <option>Técnico en Contabilidad</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Periodo</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '45px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.period}
              onChange={(e) => setFilters({...filters, period: e.target.value})}
            >
              <option>Seleccione</option>
              <option>2024-1</option>
              <option>2023-2</option>
              <option>2023-1</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Filtro</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '45px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option>Todos</option>
              <option>Solo con deudas</option>
              <option>Solo solventes</option>
            </select>
          </div>

          <button className="btn-premium" style={{ height: '45px', background: 'var(--primary)', color: 'white', fontWeight: '700' }}>
            Listar
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="glass-panel" style={{ background: 'white', overflow: 'hidden' }}>
        {filteredStudents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Estudiante</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Programa / Periodo</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                   <td style={{ padding: '14px 24px' }}>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{s.name.toUpperCase()}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {s.id}</div>
                   </td>
                   <td style={{ padding: '14px 24px' }}>
                      <div style={{ fontSize: '13px', color: '#334155' }}>{s.details?.program || 'Bachillerato Académico'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Periodo: {s.details?.period || '2024-1'}</div>
                   </td>
                   <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <span style={{ background: '#ecfdf5', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>Solvente</span>
                   </td>
                   <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <button onClick={() => handleGraduate(s.id)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>Graduar</button>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '80px', textAlign: 'center' }}>
             <Users size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
             <p style={{ margin: 0, fontWeight: '700', color: '#64748b' }}>Seleccione filtros para listar estudiantes</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .glass-panel { border-radius: 20px; border: 1px solid #e2e8f0; }
        .input-premium { border-radius: 12px; outline: none; transition: 0.2s; padding: 0 16px; }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .btn-premium { border-radius: 12px; border: none; cursor: pointer; transition: 0.2s; padding: 0 20px; }
        .btn-premium:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>
    </DashboardLayout>
  );
}
