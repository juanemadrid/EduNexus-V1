'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import React, { useState, useEffect } from 'react';
import { FileDown, Printer, Users } from 'lucide-react';
import { db } from '@/lib/db';

export default function EstudiantesNuevosInstitucionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [programs, setPrograms] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '',
    fechaRango: 'Hoy',
    customFecha: { from: '', to: '' }
  });
  const [touched, setTouched] = useState({ periodo: false, fechaRango: false });

  // Record<GroupName, Student[]>
  const [groupedResults, setGroupedResults] = useState<Record<string, any[]>>({});
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    Promise.all([
      db.list<any>('academic_programs'),
      db.list<any>('sedes'),
      db.list<any>('academic_periods'),
    ]).then(([progs, sedesData, peri]) => {
      setPrograms(progs);
      setSedes(sedesData);
      setPeriods(peri);
      if (peri.length > 0) {
        setForm(f => ({ ...f, periodo: peri[0].nombre || peri[0].name || peri[0].id }));
      }
    }).catch(console.error).finally(() => setIsInitialLoading(false));
  }, []);

  const handleCharge = async () => {
    setTouched({ periodo: true, fechaRango: true });
    
    const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid) return;

    setIsLoading(true);
    setShowReport(false);
    try {
      const students = await db.list<any>('students');
      
      const filtered = students.filter((s: any) => {
          // Filtramos solo los que estén con algo de actividad/matriculados
          if (s.isActive === false) return false;

          // Si es por Período
          if (form.filtroFecha === 'Período') {
              const sPeriodo = s.periodo || s.period || s.details?.periodo || s.details?.period;
              // Si no tiene periodo y el reporte exige por periodo, los admitimos si formamos parte del fallback
              // Pero acá como es para "Nuevos", exigiremos que tenga el periodo o si no tiene periodo, que su createdAt sea reciente.
              // Para ser seguros con la data heredada, si sPeriodo existe debe coincidir. Si no, lo mostramos.
              if (sPeriodo && sPeriodo !== form.periodo) return false;
          } 
          // Fechas
          else if (form.filtroFecha === 'Fechas') {
              if (!s.createdAt) return false;
              
              const now = new Date();
              now.setHours(0,0,0,0);
              const todayStart = now.getTime();
              now.setHours(23,59,59,999);
              const todayEnd = now.getTime();
              
              let start = 0;
              let end = Infinity;
              
              switch(form.fechaRango) {
                  case 'Hoy': start = todayStart; end = todayEnd; break;
                  case 'Ayer': start = todayStart - 86400000; end = todayEnd - 86400000; break;
                  case 'Últimos 7 días': start = todayStart - (6 * 86400000); end = todayEnd; break;
                  case 'Últimos 30 días': start = todayStart - (29 * 86400000); end = todayEnd; break;
                  case 'Este mes': 
                      start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                      end = todayEnd;
                      break;
                  case 'Mes anterior':
                      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
                      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
                      break;
                  case 'Rango personalizado':
                      if (form.customFecha.from && form.customFecha.to) {
                          start = new Date(form.customFecha.from + 'T00:00:00').getTime();
                          end = new Date(form.customFecha.to + 'T23:59:59').getTime();
                      }
                      break;
              }
              
              if (s.createdAt < start || s.createdAt > end) return false;
          }
          
          return true;
      });

      // Agrupación
      const groups: Record<string, any[]> = {};
      let total = 0;

      filtered.forEach((s: any) => {
          const prog = programs.find(p => p.id === (s.programaId || s.programId))?.nombre || 
                       s.programa || s.program || s.details?.programa || s.details?.program || 'Sin Programa Asignado';
          
          let sedeLabel = sedes.find(se => se.id === s.sedeId)?.nombre || 
                          s.sedeJornadaLabel || s.sede || s.sedeJornada || s.details?.sede || 'Sin Sede Asignada';
          
          // Formato Q10: Principal - Mañana - Programa
          const groupName = `${sedeLabel} - ${prog}`;
          
          if (!groups[groupName]) {
              groups[groupName] = [];
          }
          groups[groupName].push(s);
          total++;
      });

      // Ordenar a los alumnos dentro de cada grupo
      Object.keys(groups).forEach(key => {
          groups[key].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      });

      setGroupedResults(groups);
      setTotalStudents(total);
      setShowReport(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: keyof typeof form) => {
    if (field === 'periodo' && form.filtroFecha !== 'Período') return false;
    if (field === 'fechaRango' && form.filtroFecha !== 'Fechas') return false;
    return touched[field as keyof typeof touched] && !form[field as keyof typeof form];
  };

  const formatearFecha = (ts: any) => {
      if (!ts) return '—';
      try {
          const d = new Date(ts);
          return d.toLocaleDateString('es-CO');
      } catch (e) {
          return '—';
      }
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              Estudiantes nuevos en la institución
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar un informe de los estudiantes matriculados por primera vez en la institución.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Filtrar por
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                value={form.filtroFecha} onChange={e => handleChange('filtroFecha', e.target.value)}>
                <option value="Período">Período</option>
                <option value="Fechas">Fechas</option>
              </select>
            </div>

            {form.filtroFecha === 'Período' ? (
              <>
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Período <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div>
                  <select className="input-premium" 
                    style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                    value={form.periodo} onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}>
                    <option value="">Seleccione</option>
                    {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
                  </select>
                  {isInvalid('periodo') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                </div>
              </>
            ) : (
              <>
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Fechas <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div>
                  <DateRangePicker 
                      value={form.fechaRango} 
                      onChange={(val, custom) => { 
                          setTouched(p => ({...p, fechaRango: true})); 
                          handleChange('fechaRango', val); 
                          if (custom) setForm(p => ({...p, customFecha: custom}));
                      }} 
                  />
                  {isInvalid('fechaRango') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                </div>
              </>
            )}
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-premium" style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '13px', fontWeight: '800', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '12px', boxShadow: '0 4px 14px -3px rgba(16,185,129,0.4)' }} 
            onClick={handleCharge} disabled={isLoading}>
            <FileDown size={18} /> {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>

      {showReport && (
         <div style={{ maxWidth: '1100px', margin: '28px auto 0' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                    Resultados — {totalStudents} estudiante{totalStudents !== 1 ? 's' : ''} nuevo{totalStudents !== 1 ? 's' : ''}
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                    <Printer size={15} /> Imprimir
                  </button>
                </div>
            </div>

            <div id="print-area" className="glass-panel" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.06)', paddingBottom: '30px' }}>
                
                {/* Print Header */}
                <div className="print-header" style={{ padding: '30px 40px', display: 'none', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>EduNexus</h1>
                       <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginTop: '2px', textTransform: 'uppercase' }}>EduNexus Cloud — Innovación Educativa</div>
                     </div>
                     <div style={{ textAlign: 'center', flex: 1 }}>
                       <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase' }}>Estudiantes Nuevos en la Institución</h2>
                       <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                         {form.filtroFecha === 'Período' ? `Período: ${form.periodo}` : `Fechas: ${form.fechaRango}`}
                         {form.filtroFecha === 'Fechas' && form.fechaRango === 'Rango personalizado' && ` (${form.customFecha.from} al ${form.customFecha.to})`}
                       </div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Generado: {new Date().toLocaleDateString('es-CO')}</div>
                     </div>
                   </div>
                </div>

                {Object.keys(groupedResults).length === 0 ? (
                    <div className="no-print" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                      No se encontraron estudiantes nuevos para los parámetros seleccionados.
                    </div>
                ) : (
                    <div style={{ padding: '0 20px' }}>
                        {Object.keys(groupedResults).map((groupName, idx) => (
                            <div key={idx} style={{ marginBottom: '30px' }}>
                                {/* Group Title */}
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '0 8px' }}>
                                    <span style={{ color: '#ef4444' }}>Sede - Jornada - Programa:</span> {groupName}
                                </div>
                                
                                {/* Group Table */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', fontWeight: '800' }}>Fecha Matrícula</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', fontWeight: '800' }}>Estudiante</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', fontWeight: '800' }}>Identificación</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', fontWeight: '800' }}>Teléfono - Celular</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', fontWeight: '800' }}>Correo Electrónico</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedResults[groupName].map((s: any, i: number) => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '8px 10px', color: '#64748b' }}>{formatearFecha(s.createdAt)}</td>
                                                <td style={{ padding: '8px 10px', color: '#1e293b', fontWeight: '600' }}>
                                                    {s.name || `${s.nombres || ''} ${s.apellidos || ''}`.trim()}
                                                </td>
                                                <td style={{ padding: '8px 10px', color: '#475569' }}>{s.documento || s.identificacion || s.id}</td>
                                                <td style={{ padding: '8px 10px', color: '#475569' }}>
                                                    {s.celular ? `Cel. ${s.celular}` : (s.telefono ? `Tel. ${s.telefono}` : '—')}
                                                </td>
                                                <td style={{ padding: '8px 10px', color: '#475569', textTransform: 'uppercase' }}>
                                                    {s.correo || s.email || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>

         </div>
      )}

      <style jsx global>{`
        .input-premium { border-radius: 10px; border: 1px solid #e2e8f0; outline: none; padding: 0 14px; transition: all 0.2s; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .btn-premium { transition: all 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
        
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: auto; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            border-radius: 0 !important;
          }
          .print-header { display: block !important; }
          table { width: 100% !important; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          th { background-color: white !important; border-bottom: 2px solid #000 !important; color: #000 !important; padding: 6px !important; font-size: 10px !important; }
          td { border-bottom: 1px solid #ccc !important; padding: 6px !important; font-size: 10px !important; color: #000 !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
