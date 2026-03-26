'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { Search, Filter, AlertCircle, CheckCircle, Info, MoreHorizontal, User, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function ObservadorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [studentsParams, setStudentsParams] = useState<any[]>([]);
  
  const [fechaOption, setFechaOption] = useState('Este mes');
  const [customRange, setCustomRange] = useState<{from: string; to: string} | null>(null);
  const [periodo, setPeriodo] = useState('');
  const [programaId, setProgramaId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));
  }, []);

  const handleCharge = () => {
    if (!periodo) {
      alert('Por favor seleccione un período (*)');
      return;
    }
    setIsLoading(true);
    setHasLoaded(false);
    
    setTimeout(() => {
      let storedObs = [];
      try {
        storedObs = JSON.parse(localStorage.getItem('edunexus_observations') || '[]');
      } catch (e) {}
      
      setObservations(storedObs);
      setIsLoading(false);
      setHasLoaded(true);
    }, 800);
  };

  const filteredObservations = observations.filter(obs => 
    obs.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obs.studentId?.includes(searchTerm) ||
    obs.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeStyle = (type: string) => {
    if (type.includes('Grave')) return { bg: '#fee2e2', text: '#ef4444', icon: <AlertCircle size={14} /> };
    if (type.includes('Leve')) return { bg: '#fef3c7', text: '#d97706', icon: <AlertCircle size={14} /> };
    if (type.includes('Mérito')) return { bg: '#dcfce3', text: '#16a34a', icon: <CheckCircle size={14} /> };
    return { bg: '#f1f5f9', text: '#64748b', icon: <Info size={14} /> };
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 30px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           Consultar Observador del Alumno
         </h1>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Fechas
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

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Período <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
                <option value="">Seleccione</option>
                <option value="2026 - 01">2026 - 01</option>
                <option value="2026 - 02">2026 - 02</option>
              </select>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Programas
              </label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={programaId} onChange={e => setProgramaId(e.target.value)}>
                <option value="">Todos</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13.5px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '12px' }}
              onClick={handleCharge}
              disabled={isLoading}
            >
              {isLoading ? 'Consultando historial...' : 'Cargar reporte'}
            </button>
         </div>
      </div>

      {hasLoaded && (
        <div className="glass-panel animate-fade" style={{ maxWidth: '1000px', margin: '30px auto 0', background: 'white', padding: '30px 40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Resultados del Observador</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Se encontraron {filteredObservations.length} registros en el período {periodo}.</p>
              </div>
              <div style={{ position: 'relative', width: '300px' }}>
                 <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                 <input 
                   type="text" 
                   className="input-premium" 
                   placeholder="Buscar estudiante o falta..."
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
                     <th style={{ padding: '14px', textAlign: 'left', fontWeight: '800', color: '#475569' }}>Estudiante</th>
                     <th style={{ padding: '14px', textAlign: 'left', fontWeight: '800', color: '#475569' }}>Fecha</th>
                     <th style={{ padding: '14px', textAlign: 'left', fontWeight: '800', color: '#475569' }}>Tipo de anotación</th>
                     <th style={{ padding: '14px', textAlign: 'left', fontWeight: '800', color: '#475569' }}>Descripción</th>
                     <th style={{ padding: '14px', textAlign: 'right', fontWeight: '800', color: '#475569' }}>Acción</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredObservations.map(obs => {
                     const tStyle = getTypeStyle(obs.type);
                     return (
                       <tr key={obs.id} style={{ borderBottom: '1px solid #f1f5f9', background: 'white', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                         <td style={{ padding: '14px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <User size={16} />
                             </div>
                             <div>
                               <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>{obs.studentName}</p>
                               <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{obs.studentId}</p>
                             </div>
                           </div>
                         </td>
                         <td style={{ padding: '14px', color: '#64748b', fontWeight: '600' }}>{obs.date}</td>
                         <td style={{ padding: '14px' }}>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: tStyle.bg, color: tStyle.text, padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                             {tStyle.icon} {obs.type}
                           </span>
                         </td>
                         <td style={{ padding: '14px', color: '#475569', maxWidth: '300px' }}>
                           <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.4' }}>
                             {obs.description}
                           </p>
                         </td>
                         <td style={{ padding: '14px', textAlign: 'right' }}>
                           <button style={{ border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: '0.2s', background: 'white' }} onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}>
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
             <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
               <AlertCircle size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
               <h3 style={{ margin: 0, color: '#475569', fontSize: '15px', fontWeight: '800' }}>No hay anotaciones</h3>
               <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13px' }}>Intente con otros filtros de búsqueda para este período o el estudiante seleccionado no tiene historial disciplinario.</p>
             </div>
           )}
        </div>
      )}

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; }
        .input-premium:focus { border-color: #10b981; background: white !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        .btn-premium:hover { filter: brightness(1.05); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .btn-premium:active { transform: translateY(0); }
        .animate-fade { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
