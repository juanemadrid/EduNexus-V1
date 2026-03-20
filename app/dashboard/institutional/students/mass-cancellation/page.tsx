'use client';
import React, { useState } from 'react';
import { Search, ChevronDown, UserX, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function MassCancellationPage() {
  const [filters, setFilters] = useState({
    period: 'Seleccione',
    campus: 'Seleccione',
    program: 'Seleccione',
    level: 'Seleccione',
    group: 'Seleccione',
    filter: 'Seleccione'
  });
  const [localStudents, setLocalStudents] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_students');
    if (saved) setLocalStudents(JSON.parse(saved));
  }, []);

  const handleCancel = (id: string) => {
    const updated = localStudents.map(s => s.id === id ? { ...s, isEnrolled: false, isActive: false } : s);
    setLocalStudents(updated);
    localStorage.setItem('edunexus_registered_students', JSON.stringify(updated));
    alert('Matrícula cancelada exitosamente. El estudiante ha sido inactivado.');
  };

  const filteredStudents = localStudents.filter((s: any) => {
    const isEnrolled = s.isEnrolled === true;
    const isActive = s.isActive !== false;
    const matchesPeriod = filters.period === 'Seleccione' || s.details?.period === filters.period;
    const matchesCampus = filters.campus === 'Seleccione' || s.details?.campus === filters.campus;
    const matchesProgram = filters.program === 'Seleccione' || s.details?.program === filters.program;
    
    return isEnrolled && isActive && matchesPeriod && matchesCampus && matchesProgram;
  });

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
               Cancelación masiva
             </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginLeft: '40px' }}>
            Búsqueda y cancelación masiva de matrículas por criterios múltiples
          </p>
        </div>
      </div>

      {/* Filter Panel - Following Q10 Screenshot Grid */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Period Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Periodo *</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.period}
              onChange={(e) => setFilters({...filters, period: e.target.value})}
            >
              <option>Seleccione</option>
              <option>2024-1</option>
              <option>2023-2</option>
            </select>
          </div>

          {/* Sede-Jornada Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Sede - jornada *</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.campus}
              onChange={(e) => setFilters({...filters, campus: e.target.value})}
            >
              <option>Seleccione</option>
              <option>Principal - Mañana</option>
              <option>Sede B - Tarde</option>
            </select>
          </div>

          {/* Program Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Programa *</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.program}
              onChange={(e) => setFilters({...filters, program: e.target.value})}
            >
              <option>Seleccione</option>
              <option>Bachillerato Académico</option>
              <option>Bachillerato Adultos</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Nivel *</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.level}
              onChange={(e) => setFilters({...filters, level: e.target.value})}
            >
              <option>Seleccione</option>
              <option>Nivel 1</option>
              <option>Nivel 2</option>
              <option>Nivel 3</option>
            </select>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px',
          alignItems: 'end'
        }}>
          {/* Group Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Grupo</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.group}
              onChange={(e) => setFilters({...filters, group: e.target.value})}
            >
              <option>Seleccione</option>
              <option>Grupo A</option>
              <option>Grupo B</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Filtro *</label>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={filters.filter}
              onChange={(e) => setFilters({...filters, filter: e.target.value})}
            >
              <option>Seleccione</option>
              <option>Todos</option>
              <option>Matriculados</option>
              <option>En proceso</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
            <button className="btn-premium" style={{ flex: 1, height: '40px', background: '#ef4444', color: 'white', fontWeight: '700', borderRadius: '10px' }}>
               Consultar para Cancelación
            </button>
          </div>
        </div>
      </div>

      {/* Results Table - Syncing with other modules */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
        {filteredStudents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Estudiante</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Programa</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{s.name.toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {s.id}</div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#334155' }}>
                    {s.details?.program || 'Bachillerato Académico'}
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleCancel(s.id)}
                      className="btn-premium"
                      style={{ 
                        padding: '6px 16px', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        background: '#fee2e2', 
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Anular Matrícula
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ 
            padding: '120px 40px', 
            textAlign: 'center', 
            background: '#fcfcfc',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #e2e8f0',
            borderWidth: '1px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <AlertCircle size={48} color="#cbd5e1" strokeWidth={1.5} />
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#64748b', margin: 0 }}>
                Por favor verifique los filtros.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .glass-panel {
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .input-premium {
          border-radius: 10px;
          padding: 0 12px;
          outline: none;
          transition: 0.2s;
          font-size: 13px;
        }
        .input-premium:focus {
          border-color: #ef4444 !important;
          background: white !important;
        }
        .btn-premium:hover {
          filter: brightness(0.95);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </DashboardLayout>
  );
}
