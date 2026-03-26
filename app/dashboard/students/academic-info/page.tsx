'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, ChevronRight, ChevronLeft, Plus, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AcademicInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [localStudents, setLocalStudents] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_students');
    if (saved) setLocalStudents(JSON.parse(saved));
  }, []);

  const filteredStudents = localStudents.filter((student: any) => {
    const isEnrolled = student.isEnrolled !== false;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = includeInactive || student.isActive !== false;
    const matchesType = typeFilter === 'Todos' || student.type === typeFilter;
    return isEnrolled && matchesSearch && matchesActive && matchesType;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentItems = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Información académica</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Consulta de programas, sedes y estados académicos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link 
            href="/dashboard/institutional/students/register"
            className="btn-premium" 
            style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <Plus size={18} /> Registrar Estudiante
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
             <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
             <input 
               type="text" 
               placeholder="Buscar personas..." 
               className="input-premium" 
               style={{ paddingLeft: '48px', height: '48px', background: 'white', width: '100%' }}
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
             />
          </div>
          <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white' }}>Buscar</button>
          
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Búsqueda avanzada <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>

        {showAdvanced && (
          <div style={{ marginTop: '20px', padding: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '30px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <label style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Tipo:</label>
               <select 
                className="input-premium" 
                style={{ height: '40px', padding: '0 12px', fontSize: '14px' }}
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
               >
                  <option value="Todos">Todos</option>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Docente">Docente</option>
                  <option value="Administrativo">Administrativo</option>
               </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#374151' }}>
               <input 
                 type="checkbox" 
                 style={{ width: '18px', height: '18px' }} 
                 checked={includeInactive}
                 onChange={(e) => { setIncludeInactive(e.target.checked); setCurrentPage(1); }}
               />
               ¿Incluir inactivos?
            </label>
          </div>
        )}
      </div>

      {/* Table Panel */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Nombre completo</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Sede</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Programa</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Periodo</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((student: any) => (
                <tr key={student.id} className="table-row-hover" style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s', opacity: student.isActive === false ? 0.7 : 1 }}>
                  <td style={{ padding: '14px 24px' }}>
                     <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '14px', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
                        {student.name.toUpperCase()}
                     </button>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155' }}>{student.details?.campus || 'Sede Principal'}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155' }}>{student.details?.program || 'Programa General'}</td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#64748b' }}>{student.details?.period || '2025-1'}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      textTransform: 'uppercase',
                      background: student.isActive === false ? '#fee2e2' : '#dcfce7',
                      color: student.isActive === false ? '#ef4444' : '#22c55e'
                    }}>
                      {student.isActive === false ? 'Inactivo' : 'Activo'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '100px 40px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#f3f4f6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <Search size={40} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>No se encontraron registros</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Intente con otros términos de búsqueda.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Dynamic Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center' }}>
             <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#6b7280', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                   <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '8px', 
                      background: currentPage === page ? 'var(--primary)' : 'white', 
                      color: currentPage === page ? 'white' : '#6b7280',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: currentPage === page ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#6b7280', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                   <ChevronRight size={18} />
                </button>
             </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f9fafb !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
