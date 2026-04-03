'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown, Info, User, BookOpen, MapPin, Calendar, Clock, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';

export default function AsignacionAcademicaDocentesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  // Data from Firestore
  const [sedes, setSedes] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({ 
    sedeJornada: 'Todos', 
    periodo: 'Todos',
    docenteId: 'Todos'
  });

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [sedesData, periodsData, teachersData] = await Promise.all([
        db.list<any>('sedes'),
        db.list<any>('academic_periods'),
        db.list<any>('teachers')
      ]);
      setSedes(sedesData);
      setPeriods(periodsData);
      setTeachers(teachersData);
    } catch (error) {
       console.error("Error loading report initial data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Build sede-jornada dropdown options
  const sedeJornadaOptions: string[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      sedeJornadaOptions.push(`${s.nombre} - ${j.nombre}`);
    });
  });

  const handleCharge = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      // Fetch all courses
      const cursosData = await db.list<any>('cursos');
      
      let filtered = [...cursosData];

      // Filter by Sede - jornada
      if (form.sedeJornada !== 'Todos') {
        filtered = filtered.filter(c => c.sedeJornadaLabel === form.sedeJornada);
      }

      // Filter by Periodo
      if (form.periodo !== 'Todos') {
        filtered = filtered.filter(c => c.periodo === form.periodo);
      }

      // Filter by Docente
      if (form.docenteId !== 'Todos') {
        filtered = filtered.filter(c => c.docenteId === form.docenteId);
      }

      setResults(filtered);
    } catch (error) {
       console.error("Error fetching courses for report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;
    
    // Create CSV content
    const headers = ['Docente', 'ID Docente', 'Asignatura', 'Programa', 'Sede - Jornada', 'Periodo', 'Fecha Inicio', 'Fecha Fin'];
    const rows = results.map(r => [
      r.docenteNombre,
      r.docenteId,
      r.asignaturaNombre,
      r.programaNombre,
      r.sedeJornadaLabel,
      r.periodo,
      r.fechaInicio,
      r.fechaFin
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `asignacion_academica_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Main Form Panel */}
        <div className="glass-panel" style={{ 
          background: 'white', 
          padding: '40px 60px', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          
          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Asignación Académica Docentes
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
              Permite visualizar la carga académica de cada docente en cada uno de los cursos que se encuentre asignado.
            </p>
            <div style={{ height: '1px', background: '#f1f5f9', width: '100%', marginTop: '24px' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
            
            {/* Sede - jornada */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '800', color: '#334155', textAlign: 'right' }}>
                Sede - jornada
              </label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', appearance: 'none', background: '#f8fafc' }} 
                  value={form.sedeJornada} 
                  onChange={e => handleChange('sedeJornada', e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {sedeJornadaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Período */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '800', color: '#334155', textAlign: 'right' }}>
                Período
              </label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', appearance: 'none', background: '#f8fafc' }} 
                  value={form.periodo} 
                  onChange={e => handleChange('periodo', e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {periods.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Docentes */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '800', color: '#334155', textAlign: 'right' }}>
                Docentes
              </label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', appearance: 'none', background: '#f8fafc' }} 
                  value={form.docenteId} 
                  onChange={e => handleChange('docenteId', e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name || `${t.nombres} ${t.apellidos}`}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={handleCharge} 
                className="btn-premium" 
                style={{ 
                  height: '42px', 
                  padding: '0 32px', 
                  background: '#22c55e', 
                  color: 'white', 
                  fontWeight: '800',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                }} 
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Cargar reporte'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {hasSearched && (
          <div style={{ marginTop: '40px', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="glass-panel" style={{ 
              background: 'white', 
              padding: '0', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
            }}>
               <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                       Resultados de Carga Académica
                    </h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                       {results.length} asignaciones encontradas para los filtros seleccionados.
                    </p>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="btn-premium" 
                    style={{ 
                      height: '36px', 
                      padding: '0 16px', 
                      background: '#334155', 
                      color: 'white', 
                      fontSize: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}
                  >
                    <FileDown size={16} /> Exportar Excel
                  </button>
               </div>

               {results.length > 0 ? (
                 <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Docente</th>
                          <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Asignatura / Plan</th>
                          <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Sede - Jornada</th>
                          <th style={{ textAlign: 'center', padding: '16px 32px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Período</th>
                          <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Programación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, idx) => (
                          <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="row-hover">
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                     <User size={20} />
                                  </div>
                                  <div>
                                     <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{r.docenteNombre}</div>
                                     <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>ID: {r.docenteId}</div>
                                  </div>
                               </div>
                            </td>
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ fontSize: '13px', fontWeight: '750', color: '#334155' }}>{r.asignaturaNombre}</div>
                               <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{r.programaNombre}</div>
                            </td>
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                                  <MapPin size={14} style={{ color: '#94a3b8' }} /> {r.sedeJornadaLabel}
                               </div>
                            </td>
                            <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                               <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                                  {r.periodo}
                               </span>
                            </td>
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                                     <Calendar size={13} style={{ color: '#3b82f6' }} /> {r.fechaInicio}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                                     <Clock size={13} style={{ color: '#ef4444' }} /> {r.fechaFin}
                                  </div>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               ) : (
                 <div style={{ textAlign: 'center', padding: '80px 40px', color: '#94a3b8' }}>
                    <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <Info size={32} style={{ opacity: 0.5 }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#64748b' }}>No se encontraron registros</p>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#94a3b8' }}>Intente ajustar los filtros de búsqueda para obtener resultados.</p>
                 </div>
               )}
            </div>

            <div style={{ marginTop: '30px', background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #dcfce7', display: 'flex', gap: '15px', alignItems: 'center' }}>
               <div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                  <CheckCircle2 size={24} />
               </div>
               <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#166534', fontWeight: '700' }}>
                     Reporte Generado Exitosamente
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#15803d', opacity: 0.9 }}>
                     La información mostrada corresponde a la programación académica vigente en el sistema.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row-hover {
          transition: 0.2s;
        }
        .row-hover:hover {
          background-color: #f8fafc !important;
          transform: scale(1.002);
        }
        .glass-panel { transition: 0.3s; }
        .input-premium { border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; padding: 0 16px; font-size: 14px; color: #1e293b; font-weight: 500; }
        .input-premium:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08); background: white !important; }
        .btn-premium { border-radius: 12px; border: none; cursor: pointer; transition: 0.3s; display: flex; alignItems: center; justifyContent: center; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
        .btn-premium:active:not(:disabled) { transform: translateY(0); }
        .btn-premium:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </DashboardLayout>
  );
}
