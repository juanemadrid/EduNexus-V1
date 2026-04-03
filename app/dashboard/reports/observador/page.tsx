'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { Search, Filter, AlertCircle, CheckCircle, Info, MoreHorizontal, User, Plus, ClipboardList } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function ObservadorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [periods, setPeriods] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  
  const [fechaOption, setFechaOption] = useState('Este mes');
  const [customRange, setCustomRange] = useState<{from: string; to: string} | null>(null);
  const [periodo, setPeriodo] = useState('');
  const [programaId, setProgramaId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      db.list<any>('academic_programs'),
      db.list<any>('academic_periods'),
      db.list<any>('students')
    ]).then(([progData, perData, studData]) => {
      setPrograms(progData);
      setPeriods(perData);
      setAllStudents(studData);
      if (perData.length > 0) {
        setPeriodo(perData[0].nombre || perData[0].nombre || perData[0].name || perData[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleCharge = async () => {
    if (!periodo) {
      alert('Por favor seleccione un período (*)');
      return;
    }
    setIsLoading(true);
    setHasLoaded(false);
    
    try {
      const storedObs = await db.list<any>('student_observations');
      
      const enriched = storedObs.filter(obs => {
         const matchPeriod = !periodo || obs.periodo === periodo || obs.periodoId === periodo;
         const matchProgram = !programaId || obs.programaId === programaId;
         return matchPeriod && matchProgram;
      }).map(obs => {
        const student = allStudents.find(s => s.id === obs.studentId);
        return {
          ...obs,
          studentName: student ? (student.name || `${student.nombres} ${student.apellidos}`) : (obs.studentName || 'Estudiante desconocido'),
          studentDocumento: student?.documento || obs.studentId
        };
      });

      setObservations(enriched);
    } catch (error) {
      console.error("Error loading observations:", error);
      alert('Error al cargar historial del observador.');
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  const filteredObservations = observations.filter(obs => 
    obs.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obs.studentDocumento?.includes(searchTerm) ||
    obs.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeStyle = (type: string) => {
    if (!type) return { bg: '#f1f5f9', text: '#64748b', icon: <Info size={14} /> };
    if (type.includes('Grave')) return { bg: '#fee2e2', text: '#ef4444', icon: <AlertCircle size={14} /> };
    if (type.includes('Leve')) return { bg: '#fef3c7', text: '#d97706', icon: <AlertCircle size={14} /> };
    if (type.includes('Mérito')) return { bg: '#dcfce3', text: '#16a34a', icon: <CheckCircle size={14} /> };
    return { bg: '#f1f5f9', text: '#64748b', icon: <Info size={14} /> };
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
        <div className="glass-panel" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
           <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ClipboardList size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: 0 }}>
                  Consultar Observador del Alumno
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Historial disciplinario y seguimiento conductual por estudiante</p>
              </div>
           </div>

           <div style={{ padding: '0 20px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                <label style={{ textAlign: 'right', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Filtrar Fechas
                </label>
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <DateRangePicker 
                    value={fechaOption} 
                    onChange={(val, custom) => {
                      setFechaOption(val);
                      if(custom) setCustomRange(custom);
                    }} 
                  />
                </div>

                <label style={{ textAlign: 'right', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Período <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select className="input-premium" style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc' }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
                  <option value="">Seleccione el período</option>
                  {periods.map(p => (
                    <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>
                  ))}
                </select>

                <label style={{ textAlign: 'right', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Programa
                </label>
                <select className="input-premium" style={{ width: '100%', height: '44px', fontSize: '14px', background: '#f8fafc' }} value={programaId} onChange={e => setProgramaId(e.target.value)}>
                  <option value="">Todos los programas</option>
                  {programs.map(p => (
                    <option key={p.id || p.codigo} value={p.id || p.codigo}>{p.nombre}</option>
                  ))}
                </select>
             </div>
           </div>

           <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <button 
                className="btn-premium" 
                style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 32px', fontSize: '14px', fontWeight: '800', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '12px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}
                onClick={handleCharge}
                disabled={isLoading}
              >
                {isLoading ? 'Consultando...' : 'Cargar reporte'}
              </button>
           </div>
        </div>

        {hasLoaded && (
          <div className="glass-panel animate-fade" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#1e293b' }}>Anulaciones y Anotaciones</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>Se encontraron {filteredObservations.length} registros para el período {periodo}.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                   <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                   <input 
                     type="text" 
                     className="input-premium" 
                     placeholder="Buscar en resultados..."
                     style={{ paddingLeft: '42px', height: '40px', borderRadius: '10px', background: '#f8fafc', width: '100%' }}
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>

             {filteredObservations.length > 0 ? (
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '800', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Estudiante</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '800', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Fecha</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '800', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Falta / Mérito</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '800', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Descripción</th>
                        <th style={{ padding: '16px', textAlign: 'right', fontWeight: '800', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredObservations.map((obs, idx) => {
                        const tStyle = getTypeStyle(obs.type);
                        return (
                          <tr key={obs.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: 'white', transition: '0.2s' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                   <User size={18} />
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>{obs.studentName}</p>
                                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Doc: {obs.studentDocumento}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>{obs.date}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: tStyle.bg, color: tStyle.text, padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                                {tStyle.icon} {obs.type}
                              </span>
                            </td>
                            <td style={{ padding: '16px', color: '#475569', maxWidth: '300px' }}>
                              <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.4' }}>
                                {obs.description}
                              </p>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <button style={{ border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px', background: 'white' }}>
                                <MoreHorizontal size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
             ) : (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                  <AlertCircle size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ margin: 0, color: '#475569', fontSize: '16px', fontWeight: '900' }}>Sin registros encontrados</h3>
                  <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '14px', maxWidth: '400px', marginInline: 'auto' }}>No se registran novedades disciplinarias para los filtros aplicados en este período académico.</p>
                </div>
             )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 16px; }
        .input-premium:focus { border-color: #10b981; background: white !important; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .btn-premium:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .btn-premium:active { transform: translateY(0); }
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
