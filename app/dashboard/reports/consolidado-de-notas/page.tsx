'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function ConsolidadoNotasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [programs, setPrograms] = useState<any[]>([]);
  const [pensums, setPensums] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtro: 'Período',
    periodo: '2026 - 01', 
    fechaRango: 'Hoy',
    tipoFiltro: 'Programa', 
    sedeJornada: '', 
    programaId: '', 
    pensum: '' 
  });
  const [touched, setTouched] = useState({ 
    periodo: false, 
    fechaRango: false,
    sedeJornada: false, 
    programaId: false, 
    pensum: false 
  });

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));

    setPensums([
      { id: '1', nombre: 'PENSUM 2026-I' },
      { id: '2', nombre: 'PENSUM 2025-II' }
    ]);
  }, []);

  const handleCharge = () => {
    setTouched({ 
      periodo: true, 
      fechaRango: true,
      sedeJornada: true, 
      programaId: true, 
      pensum: true 
    });
    
    const isPeriodValid = form.filtro === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtro === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid || !form.sedeJornada || (form.tipoFiltro === 'Programa' && (!form.programaId || !form.pensum))) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte cargado exitosamente.');
    }, 1500);
  };

  const handleExport = () => {
    setTouched({ 
      periodo: true, 
      fechaRango: true,
      sedeJornada: true, 
      programaId: true, 
      pensum: true 
    });
    
    const isPeriodValid = form.filtro === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtro === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid || !form.sedeJornada || (form.tipoFiltro === 'Programa' && (!form.programaId || !form.pensum))) return;

    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Excel exportado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: keyof typeof form) => {
    if (field === 'periodo' && form.filtro !== 'Período') return false;
    if (field === 'fechaRango' && form.filtro !== 'Fechas') return false;
    if (form.tipoFiltro !== 'Programa' && (field === 'programaId' || field === 'pensum')) return false;
    return touched[field as keyof typeof touched] && !form[field];
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
             Consolidado de Notas
           </h1>
           <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
             Permite visualizar de manera consolidada las notas de los estudiantes por programa o asignatura.
           </p>
         </div>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Filtrar por
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.filtro} onChange={e => handleChange('filtro', e.target.value)}>
                  <option value="Período">Período</option>
                  <option value="Fechas">Fechas</option>
                </select>
              </div>

              {form.filtro === 'Período' ? (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Período <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.periodo} 
                      onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      <option value="2026 - 01">2026 - 01</option>
                      <option value="2026 - 02">2026 - 02</option>
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
                      onChange={(val) => { setTouched(p => ({...p, fechaRango: true})); handleChange('fechaRango', val); }} 
                    />
                    {isInvalid('fechaRango') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                  </div>
                </>
              )}

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Filtrar por
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.tipoFiltro} onChange={e => handleChange('tipoFiltro', e.target.value)}>
                  <option value="Programa">Programa</option>
                  <option value="Asignatura">Asignatura</option>
                </select>
              </div>

              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Sede - jornada <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('sedeJornada') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                  value={form.sedeJornada} 
                  onChange={e => { setTouched(p => ({...p, sedeJornada: true})); handleChange('sedeJornada', e.target.value); }}
                >
                  <option value="">Seleccione</option>
                  <option value="PRINCIPAL - MAÑANA">PRINCIPAL - MAÑANA</option>
                  <option value="PRINCIPAL - NOCHE">PRINCIPAL - NOCHE</option>
                </select>
                {isInvalid('sedeJornada') && (
                   <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
                )}
              </div>

              {form.tipoFiltro === 'Programa' ? (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Programa <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('programaId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.programaId} 
                      onChange={e => { setTouched(p => ({...p, programaId: true})); handleChange('programaId', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {programs.map(p => (
                        <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                      ))}
                    </select>
                    {isInvalid('programaId') && (
                       <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
                    )}
                  </div>

                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Pensum <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('pensum') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                      value={form.pensum} 
                      onChange={e => { setTouched(p => ({...p, pensum: true})); handleChange('pensum', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {pensums.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    {isInvalid('pensum') && (
                       <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Asignatura <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div>
                    <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <option value="">Seleccione</option>
                      <option value="1">MATEMÁTICAS</option>
                    </select>
                  </div>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Docente
                  </label>
                  <div>
                    <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <option value="">Seleccione</option>
                      <option value="1">DOCENTE PRUEBA</option>
                    </select>
                  </div>
                </>
              )}
              
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', opacity: isExporting ? 0.7 : 1, cursor: isExporting ? 'wait' : 'pointer' }}
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileSpreadsheet size={16} color="#10b981" />
              {isExporting ? 'Exportando Excel...' : 'Exportar Excel'}
            </button>

            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none' }}
              onClick={handleCharge}
              disabled={isLoading}
            >
              <FileDown size={18} />
              {isLoading ? 'Cargando reporte...' : 'Cargar reporte'}
            </button>
         </div>
      </div>
    </DashboardLayout>
  );
}
