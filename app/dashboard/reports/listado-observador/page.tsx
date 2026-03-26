'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown, Search, Filter, AlertCircle, CheckCircle, Info, User, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function ListadoObservadorPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [fechaOption, setFechaOption] = useState('Este mes');
  const [customRange, setCustomRange] = useState<{from: string; to: string} | null>(null);
  const [periodo, setPeriodo] = useState('Todos');
  const [programaId, setProgramaId] = useState('Todos');
  const [showNoResultsModal, setShowNoResultsModal] = useState(false);

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));
  }, []);

  const handleExport = () => {
    // 1. Obtener o generar datos sincrónicamente
    let storedObs = [];
    try {
      storedObs = JSON.parse(localStorage.getItem('edunexus_observations') || '[]');
    } catch (e) {}
    
    if (storedObs.length === 0) {
      setIsExporting(false);
      setShowNoResultsModal(true);
      return;
    }
    
    setObservations(storedObs);
    
    // 2. Generar archivo Excel Real (XLSX) con diseño y anchos perfectos
    const headers = ['ID Estudiante', 'Nombre Completo', 'Fecha', 'Tipo de Falta', 'Descripcion', 'Docente'];
    const rowData = storedObs.map((o: any) => [
      o.studentId || '',
      o.studentName || '',
      o.date || '',
      o.type || '',
      o.description || '',
      o.teacher || ''
    ]);
    
    try {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rowData]);
      
      // Autoajustar el ancho de las columnas (haciendo que los números grandes no colapsen a científica)
      ws['!cols'] = [
        { wch: 16 }, // ID Estudiante
        { wch: 35 }, // Nombre
        { wch: 14 }, // Fecha
        { wch: 22 }, // Tipo
        { wch: 65 }, // Descripcion
        { wch: 25 }, // Docente
      ];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Observador");
      XLSX.writeFile(wb, `Listado_Observador_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exportando Excel', err);
    }
    
    // 3. Simular progreso para mostrar la tabla resumen abajo
    setIsExporting(true);
    setHasLoaded(false);
    setTimeout(() => {
      setIsExporting(false);
      setHasLoaded(true);
    }, 1000);
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
           Listado observador
         </h1>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Fechas</label>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <DateRangePicker 
                  value={fechaOption} 
                  onChange={(val, custom) => {
                    setFechaOption(val);
                    if(custom) setCustomRange(custom);
                  }} 
                />
              </div>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período</label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
                <option>Todos</option>
                <option>2026 - 01</option>
                <option>2026 - 02</option>
              </select>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Programas</label>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc' }} value={programaId} onChange={e => setProgramaId(e.target.value)}>
                <option>Todos</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: isExporting ? 'wait' : 'pointer', border: 'none', borderRadius: '12px', opacity: isExporting ? 0.7 : 1 }}
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileDown size={18} /> 
              {isExporting ? 'Generando archivo...' : 'Exportar reporte'}
            </button>
         </div>
      </div>

      {hasLoaded && (
        <div className="glass-panel animate-fade" style={{ maxWidth: '1000px', margin: '30px auto 0', background: 'white', padding: '30px 40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Resumen del Exportable</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Se exportaron {filteredObservations.length} registros a la hoja de cálculo.</p>
              </div>
              <div style={{ position: 'relative', width: '300px' }}>
                 <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                 <input 
                   type="text" 
                   className="input-premium" 
                   placeholder="Buscar en la vista previa..."
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
                     <th style={{ padding: '14px', textAlign: 'left', fontWeight: '800', color: '#475569' }}>Descripción extraída</th>
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
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           ) : (
             <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
               <AlertCircle size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
               <h3 style={{ margin: 0, color: '#475569', fontSize: '15px', fontWeight: '800' }}>No hay resultados</h3>
               <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13px' }}>No hay datos en el archivo exportado.</p>
             </div>
           )}
        </div>
      )}

      {showNoResultsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fade" style={{ background: 'white', width: '380px', padding: '32px 24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}>
             <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Sin resultados</h2>
             <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
               De acuerdo a los filtros seleccionados no se encontraron resultados, por favor verifique los filtros e inténtelo nuevamente.
             </p>
             <button 
               className="btn-premium"
               onClick={() => setShowNoResultsModal(false)}
               style={{ background: '#22c55e', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', width: '120px' }}
             >
               Aceptar
             </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { outline: none; transition: 0.2s; border: 1px solid #e2e8f0; }
        .input-premium:focus { border-color: #10b981; background: white !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        .btn-premium:hover { filter: brightness(1.05); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
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
