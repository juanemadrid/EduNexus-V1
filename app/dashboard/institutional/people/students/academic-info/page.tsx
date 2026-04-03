'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, ChevronRight, ChevronLeft, Plus, ChevronDown, GraduationCap, Building2, Calendar, UserCheck, LayoutGrid } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';

export default function AcademicInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    db.list('students')
      .then(data => {
        setStudents(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredStudents = students.filter((student: any) => {
    const name = (student.name || '').toLowerCase();
    const idNum = (student.id || student.idNumber || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || idNum.includes(searchTerm.toLowerCase());
    
    const isActive = student.isActive !== false;
    const matchesActive = includeInactive || isActive;
    
    const matchesType = typeFilter === 'Todos' || (student.type || 'Estudiante') === typeFilter;
    
    return matchesSearch && matchesActive && matchesType;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentItems = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <LayoutGrid size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Información académica</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Consulta detallada de programas, sedes y estados académicos</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link 
            href="/dashboard/institutional/people/students/register"
            className="btn-premium" 
            style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
          >
            <Plus size={18} /> Registrar Nuevo
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
             <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
               type="text" 
               placeholder="Buscar por nombre o identificación..." 
               className="input-premium" 
               style={{ paddingLeft: '48px', height: '52px', background: '#f8fafc', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
             />
          </div>
          
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', height: '52px', borderRadius: '12px', transition: '0.2s' }}>
            Filtros <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>

        {showAdvanced && (
          <div style={{ marginTop: '20px', padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '32px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Filtrar Rol:</label>
               <select 
                className="input-premium" 
                style={{ height: '40px', padding: '0 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '700' }}
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
               >
                  <option value="Todos">Todos</option>
                  <option value="Estudiante">Solo Estudiantes</option>
                  <option value="Docente">Solo Docentes</option>
                  <option value="Administrativo">Administrativo</option>
               </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', color: '#1f2937' }}>
               <input 
                 type="checkbox" 
                 style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                 checked={includeInactive}
                 onChange={(e) => { setIncludeInactive(e.target.checked); setCurrentPage(1); }}
               />
               Incluir inactivos
            </label>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={14} /> Estudiante</div>
                </th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={14} /> Sede / Jornada</div>
                </th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={14} /> Programa Académico</div>
                </th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={14} /> Periodo</div>
                </th>
                <th style={{ textAlign: 'center', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
              </tr>
            </thead>
            <tbody style={{ opacity: isLoading ? 0.6 : 1, transition: '0.3s' }}>
              {isLoading ? (
                <tr>
                   <td colSpan={5} style={{ padding: '120px 0', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <p style={{ fontWeight: '800', color: '#64748b', fontSize: '14px' }}>Sincronizando con la nube...</p>
                      </div>
                   </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((student: any) => (
                  <tr key={student.id} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '14px' }}>{student.name.toUpperCase()}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>IDENTIDAD: {student.idNumber || student.id}</span>
                       </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '700' }}>{student.campus || student.details?.campus || 'SEDE PRINCIPAL'}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '700' }}>{student.program || student.details?.program || 'PENDIENTE'}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{student.period || student.details?.period || '2026-01'}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '10px', 
                        fontSize: '10px', 
                        fontWeight: '900', 
                        textTransform: 'uppercase',
                        background: student.isActive === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: student.isActive === false ? '#ef4444' : '#22c55e'
                      }}>
                        {student.isActive === false ? 'Retirado' : 'Activo'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '100px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                        <Search size={40} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0' }}>Búsqueda sin resultados</h3>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Intente ajustar los filtros de búsqueda.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
             <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#64748b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
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
                      borderRadius: '10px', 
                      background: currentPage === page ? '#2563eb' : 'white', 
                      color: currentPage === page ? 'white' : '#64748b',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: currentPage === page ? 'none' : '1px solid #e2e8f0'
                    }}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#64748b', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                   <ChevronRight size={18} />
                </button>
             </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
