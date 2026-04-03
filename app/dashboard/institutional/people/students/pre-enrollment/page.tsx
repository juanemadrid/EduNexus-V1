'use client';
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, FileDown, Ghost, UserPlus, Filter, Calendar, LayoutGrid, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';
import Link from 'next/link';

export default function PreEnrollmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    dates: 'Todas',
    campus: 'Todos',
    program: 'Todos'
  });
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredStudents = students
    .filter((s: any) => {
      // In EduNexus, isEnrolled: false means they are pre-registered but not yet fully enrolled in a group/course
      const isNotEnrolled = s.isEnrolled === false || !s.courseId; 
      const name = (s.name || '').toLowerCase();
      const idNum = (s.id || s.idNumber || '').toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || idNum.includes(searchTerm.toLowerCase());
      
      const sProgram = s.program || s.details?.program;
      const sCampus = s.campus || s.details?.campus;
      
      const matchesProgram = filters.program === 'Todos' || sProgram === filters.program;
      const matchesCampus = filters.campus === 'Todos' || sCampus === filters.campus;
      
      return isNotEnrolled && matchesSearch && matchesProgram && matchesCampus;
    });

  return (
    <DashboardLayout>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(217, 119, 6, 0.2)' }}>
              <UserPlus size={28} />
           </div>
           <div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>
               Preinscripciones
             </h1>
             <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>
               Candidatos en proceso de admisión y validación de requisitos
             </p>
           </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button className="btn-premium" style={{ background: 'white', color: '#475569', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: '700' }}>
              <FileDown size={18} /> Exportar Listado
           </button>
           <Link href="/dashboard/institutional/people/students/register" className="btn-premium" style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', textDecoration: 'none', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)' }}>
              Nueva Solicitud
           </Link>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
             <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
               type="text" 
               placeholder="Buscar por nombre, documento o número de solicitud..." 
               className="input-premium" 
               style={{ 
                 paddingLeft: '48px', 
                 height: '52px', 
                 background: '#f8fafc', 
                 border: '1px solid #e2e8f0',
                 width: '100%',
                 fontSize: '14px',
                 borderRadius: '14px',
                 outline: 'none'
               }}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              background: showAdvanced ? '#eff6ff' : '#f8fafc', 
              border: '1px solid',
              borderColor: showAdvanced ? '#bfdbfe' : '#e2e8f0',
              color: showAdvanced ? '#2563eb' : '#64748b', 
              fontWeight: '800', 
              fontSize: '13px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '0 20px',
              height: '52px',
              borderRadius: '14px',
              transition: '0.2s'
            }}>
            <Filter size={16} /> Filtros <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>

        {showAdvanced && (
          <div style={{ 
            marginTop: '24px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #f1f5f9',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                <Calendar size={12} /> Rango de Fecha
              </label>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                value={filters.dates}
                onChange={(e) => setFilters({...filters, dates: e.target.value})}
              >
                <option>Todas</option>
                <option>Hoy</option>
                <option>Últimos 7 días</option>
                <option>Este mes</option>
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                <LayoutGrid size={12} /> Sede / Jornada
              </label>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                value={filters.campus}
                onChange={(e) => setFilters({...filters, campus: e.target.value})}
              >
                <option>Todos</option>
                <option>Sede Principal</option>
                <option>Sede Campestre</option>
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                <ArrowRight size={12} /> Programa Interés
              </label>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                value={filters.program}
                onChange={(e) => setFilters({...filters, program: e.target.value})}
              >
                <option>Todos</option>
                <option>Bachillerato Académico</option>
                <option>Primaria</option>
                <option>Pre-escolar</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
             <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1.s linear infinite', margin: '0 auto 16px' }} />
             <p style={{ fontWeight: '800', color: '#64748b', fontSize: '14px' }}>Cargando preinscripciones desde Firestore...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidato</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programa de Interés</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sede Solicitada</th>
                <th style={{ textAlign: 'center', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado del Proceso</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s: any) => (
                <tr key={s.id} className="table-row" style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{s.name.toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>DOC: {s.idNumber || s.id}</div>
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#334155', fontWeight: '700' }}>
                    {s.program || s.details?.program || 'SIN DEFINIR'}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#334155', fontWeight: '700' }}>
                    {s.campus || s.details?.campus || 'SEDE PRINCIPAL'}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 14px', 
                      borderRadius: '10px', 
                      fontSize: '11px', 
                      fontWeight: '900', 
                      background: 'rgba(37, 99, 235, 0.1)', 
                      color: '#2563eb',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em'
                    }}>
                      Pendiente Matricula
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '100px 40px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div style={{ background: '#f8fafc', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', border: '1px solid #f1f5f9' }}>
                <Ghost size={54} strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: '0 0 10px 0' }}>Bandeja de entrada vacía</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '340px', fontWeight: '500', lineHeight: '1.6' }}>
                  No se encontraron solicitudes de preinscripción en el sistema para los criterios seleccionados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .table-row:hover {
          background-color: #f8fafc !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
