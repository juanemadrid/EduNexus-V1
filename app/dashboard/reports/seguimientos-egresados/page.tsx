'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, ChevronDown, History, Search, User, Calendar, Briefcase, Info, X, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function SeguimientosEgresadosPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [followups, setFollowups] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({ 
    filtroFecha: 'Fechas',
    periodo: '',
    fechaRango: 'Hoy',
    tipo: 'Todos'
  });

  useEffect(() => {
    const savedFollowups = localStorage.getItem('edunexus_graduate_followups');
    if (savedFollowups) {
      const data = JSON.parse(savedFollowups);
      setFollowups(data);
      setFilteredData(data);
    }
  }, []);

  const handleFilter = () => {
    let result = [...followups];

    if (searchTerm) {
      result = result.filter(f => 
        f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.studentId.includes(searchTerm)
      );
    }

    if (form.tipo !== 'Todos') {
      result = result.filter(f => f.tipo === form.tipo);
    }

    setFilteredData(result);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte de seguimientos exportado exitosamente a Excel.');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                Seguimientos Egresados
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                Consulte y exporte la bitácora de seguimiento profesional y académico de sus egresados.
              </p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <History size={20} style={{ color: '#10b981' }} />
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Registros</div>
                 <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>{filteredData.length}</div>
               </div>
            </div>
         </div>

         {/* Filters Area */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Buscar Egresado</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  className="input-premium" 
                  style={{ width: '100%', paddingLeft: '36px', height: '40px' }} 
                  placeholder="Nombre o identificación..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Seguimiento</label>
              <div style={{ position: 'relative' }}>
                <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.tipo} onChange={e => handleChange('tipo', e.target.value)}>
                   <option value="Todos">Todos los tipos</option>
                   <option value="Laboral">Laboral</option>
                   <option value="Académico">Académico</option>
                   <option value="Personal">Personal</option>
                   <option value="Encuesta">Encuesta</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
               <button onClick={handleFilter} className="btn-premium" style={{ flex: 1, height: '40px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '800', fontSize: '12px' }}>Filtrar</button>
               <button 
                 onClick={handleExport}
                 className="btn-premium" 
                 style={{ flex: 1, height: '40px', background: '#10b981', color: 'white', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                 disabled={isExporting}
               >
                 <FileSpreadsheet size={16} /> 
                 {isExporting ? '...' : 'Excel'}
               </button>
            </div>
         </div>

         {/* Data Table */}
         <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
            {filteredData.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Fecha</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Egresado</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Tipo</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Calendar size={14} /> {f.fecha}
                         </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                         <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{f.studentName}</div>
                         <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {f.studentId}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                         <span style={{ 
                           background: f.tipo === 'Laboral' ? '#eff6ff' : f.tipo === 'Académico' ? '#f5f3ff' : '#fef2f2', 
                           color: f.tipo === 'Laboral' ? '#3b82f6' : f.tipo === 'Académico' ? '#8b5cf6' : '#ef4444',
                           padding: '4px 10px', 
                           borderRadius: '12px', 
                           fontSize: '11px', 
                           fontWeight: '800',
                           textTransform: 'uppercase'
                         }}>
                           {f.tipo}
                         </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', maxWidth: '300px' }}>
                         {f.observacion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <Clock size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '700' }}>No hay registros de seguimiento que coincidan con los filtros.</p>
              </div>
            )}
         </div>

         <div style={{ marginTop: '24px', background: '#fffbeb', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid #fef3c7' }}>
            <Info size={20} style={{ color: '#d97706', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#92400e', lineHeight: '1.4' }}>
              <strong>Importante:</strong> Los seguimientos se registran en el módulo de <em>Institucional &gt; Estudiantes &gt; Egresados</em>. Asegúrese de mantener actualizada la información para cumplir con los procesos de aseguramiento de la calidad.
            </p>
         </div>
      </div>

      <style jsx global>{`
        .glass-panel { border-radius: 20px; border: 1px solid #e2e8f0; }
        .input-premium { border-radius: 12px; outline: none; transition: 0.2s; padding: 0 16px; border: 1px solid #e2e8f0; font-size: 14px; }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .btn-premium { border-radius: 12px; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn-premium:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>
    </DashboardLayout>
  );
}
