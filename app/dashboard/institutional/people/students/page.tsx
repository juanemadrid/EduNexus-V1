'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { MoreHorizontal, Mail, LineChart, Search, Plus } from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [pageDocs, setPageDocs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadStudents = async (page: number, direction: 'next' | 'prev' | 'initial' = 'initial') => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const options: any = {
        limit: PAGE_SIZE,
        orderByField: 'name'
      };

      if (direction === 'next' && pageDocs.length > 0) {
        options.startAfterDoc = pageDocs[pageDocs.length - 1]._docId;
      }
      
      // Note: Previous pagination in Firestore is tricky without keeping track of all page start docs.
      // For this implementation, we'll focus on "Load More" or simple Forward pagination
      // which is the most cost-effective.
      
      const data = await db.list<any>('students', filters, options);
      
      if (direction === 'initial') {
        setStudents(data);
      } else {
        setStudents(data);
      }
      setPageDocs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(1, 'initial');
  }, [statusFilter]);

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px' }}>Maestro de Estudiantes</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500' }}>Gestión eficiente de registros académicos</p>
        </div>
        <button className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => router.push('/dashboard/institutional/people/students/register')}>
          <Plus size={20} strokeWidth={3} /> Matricular Nuevo
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Filtrar en esta página..." 
                className="input-premium" 
                style={{ paddingLeft: '40px', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <select 
             className="input-premium" 
             value={statusFilter} 
             onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
             style={{ maxWidth: '200px', background: 'white' }}
           >
             <option value="all">Todos los estados</option>
             <option value="active">Activos</option>
             <option value="suspended">En Seguimiento</option>
             <option value="inactive">Retirados</option>
           </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.015)' }}>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>Estudiante</th>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>Grado</th>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>Promedio</th>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>Estado</th>
              <th style={{ textAlign: 'right', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s', cursor: 'pointer' }} onClick={() => alert(`Cargando Hoja de Vida de ${student.name}...`)}>
                <td style={{ padding: '22px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--primary-glow)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>
                      {student.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{student.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '500' }}>{student.email || student.correo}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '22px 32px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{student.level || 'N/A'}</td>
                <td style={{ padding: '22px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '120px', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.03)' }}>
                      <div style={{ width: `${((student.gpa || 0) / 5) * 100}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}></div>
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--primary)' }}>{student.gpa || '0.0'}</span>
                  </div>
                </td>
                <td style={{ padding: '22px 32px' }}>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: (String(student.status || 'active')) === 'active' ? 'rgba(16, 185, 129, 0.12)' : String(student.status || '') === 'suspended' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: (String(student.status || 'active')) === 'active' ? '#059669' : String(student.status || '') === 'suspended' ? '#d97706' : '#dc2626',
                    border: (String(student.status || 'active')) === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                  }}>
                    {String(student.status || 'active').toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '22px 32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                      <Mail size={18} style={{ cursor: 'pointer', transition: '0.2s' }} />
                      <LineChart size={18} style={{ cursor: 'pointer', transition: '0.2s' }} />
                      <MoreHorizontal size={18} style={{ cursor: 'pointer', transition: '0.2s' }} />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.01)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>Página {currentPage}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
               <button 
                 className="btn-premium" 
                 style={{ padding: '8px 16px', background: 'white', color: 'var(--text-main)', border: '1px solid var(--glass-border)', fontSize: '12px', opacity: currentPage === 1 ? 0.5 : 1 }}
                 onClick={() => { if(currentPage > 1) { setCurrentPage(c => c - 1); loadStudents(1, 'initial'); } }}
                 disabled={currentPage === 1 || isLoading}
               >
                 Primera Página
               </button>
               <button 
                 className="btn-premium" 
                 style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', fontSize: '12px', opacity: students.length < PAGE_SIZE ? 0.5 : 1 }}
                 onClick={() => { setCurrentPage(c => c + 1); loadStudents(currentPage + 1, 'next'); }}
                 disabled={students.length < PAGE_SIZE || isLoading}
               >
                 Siguiente Página
               </button>
            </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>
             <h3 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Cargando estudiantes...</h3>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>
             <Search size={56} style={{ marginBottom: '20px', opacity: 0.15 }} />
             <h3 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Sin resultados</h3>
             <p style={{ fontSize: '14px' }}>No hay estudiantes registrados o que coincidan con la búsqueda "{searchTerm}"</p>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
