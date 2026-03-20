'use client';
import React, { useState } from 'react';
import { Search, ChevronDown, FileDown, Ghost } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function PreEnrollmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    dates: 'Todas',
    campus: 'Todos',
    program: 'Todos'
  });
  const [localStudents, setLocalStudents] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_students');
    if (saved) setLocalStudents(JSON.parse(saved));
  }, []);

  const filteredStudents = localStudents
    .filter((s: any, index: number, self: any[]) => 
      index === self.findIndex((t) => t.id === s.id)
    )
    .filter((s: any) => {
      const isNotEnrolled = s.isEnrolled === false;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.id && s.id.includes(searchTerm));
      const matchesProgram = filters.program === 'Todos' || s.details?.program === filters.program;
      const matchesCampus = filters.campus === 'Todos' || s.details?.campus === filters.campus;
      
      return isNotEnrolled && matchesSearch && matchesProgram && matchesCampus;
    });

  return (
    <DashboardLayout>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>
            Preinscripciones
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Gestión y seguimiento de solicitudes de pre-ingreso institucional
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button className="btn-premium" style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileDown size={18} /> Exportar <ChevronDown size={14} />
           </button>
        </div>
      </div>

      {/* Main Search Panel - Following Q10 Screenshot Structure */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1 }}>
             <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
               type="text" 
               placeholder="Buscar preinscripciones..." 
               className="input-premium" 
               style={{ 
                 paddingLeft: '48px', 
                 height: '48px', 
                 background: '#f8fafc', 
                 border: '1px solid #e2e8f0',
                 width: '100%',
                 fontSize: '14px'
               }}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          {/* Action buttons matching Q10 layout */}
          <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white', fontWeight: '700' }}>
            Buscar
          </button>
          
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: '700', 
              fontSize: '14px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '0 10px'
            }}>
            Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>

        {showAdvanced && (
          <div style={{ 
            marginTop: '20px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9'
          }}>
            {/* Date Filter */}
            <div className="input-group">
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Fechas:</label>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '40px', background: 'white', border: '1px solid #e2e8f0' }}
                value={filters.dates}
                onChange={(e) => setFilters({...filters, dates: e.target.value})}
              >
                <option>Todas</option>
                <option>Hoy</option>
                <option>Esta semana</option>
                <option>Este mes</option>
                <option>Personalizado...</option>
              </select>
            </div>

            {/* Campus Filter */}
            <div className="input-group">
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Sede - jornada:</label>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '40px', background: 'white', border: '1px solid #e2e8f0' }}
                value={filters.campus}
                onChange={(e) => setFilters({...filters, campus: e.target.value})}
              >
                <option>Todos</option>
                <option>Principal - Mañana</option>
                <option>Sede B - Tarde</option>
              </select>
            </div>

            {/* Program Filter */}
            <div className="input-group">
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block' }}>Programa:</label>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '40px', background: 'white', border: '1px solid #e2e8f0' }}
                value={filters.program}
                onChange={(e) => setFilters({...filters, program: e.target.value})}
              >
                <option>Todos</option>
                <option>Bachillerato Académico</option>
                <option>Técnico en Sistemas</option>
                <option>Técnico en Contabilidad</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Table - Syncing with other modules */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
        {filteredStudents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Nombre completo</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Programa</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Sede</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
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
                    {s.details?.program || 'No asignado'}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#334155' }}>
                    {s.details?.campus || 'Sede Principal'}
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      background: '#eff6ff', 
                      color: '#2563eb',
                      textTransform: 'uppercase'
                    }}>
                      Preinscrito
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ 
            padding: '100px 40px', 
            textAlign: 'center', 
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                background: '#f8fafc', 
                width: '90px', 
                height: '90px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#cbd5e1',
                border: '1px solid #f1f5f9'
              }}>
                <Ghost size={48} strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
                  No hay preinscripciones.
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '300px' }}>
                  No existen solicitudes registradas para los filtros seleccionados actualmente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Styles */}
      <style jsx global>{`
        .glass-panel {
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .input-premium {
          border-radius: 12px;
          padding: 0 16px;
          outline: none;
          transition: 0.2s;
        }
        .input-premium:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 4px var(--primary-glow);
        }
        .btn-premium:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
      `}</style>
    </DashboardLayout>
  );
}
