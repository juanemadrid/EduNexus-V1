'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, FileDown, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const PERIODOS = ['2026 - 01', '2026 - 02'];

export default function ConsolidadoNotasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Storage data
  const [allSedes, setAllSedes] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);

  // Filtered lists
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([]);
  const [filteredPensums, setFilteredPensums] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtro: 'Período',
    periodo: '', 
    fechaRango: 'Hoy',
    tipoFiltro: 'Programa' as 'Programa' | 'Asignatura', 
    sedeJornada: '', 
    programaId: '', 
    pensum: '',
    subjectId: '',
    teacherId: ''
  });
  
  const [touched, setTouched] = useState({ 
    periodo: false, 
    fechaRango: false,
    sedeJornada: false, 
    programaId: false, 
    pensum: false,
    subjectId: false,
    teacherId: false
  });

  useEffect(() => {
    // Load all required data from localStorage
    const savedSedes = localStorage.getItem('edunexus_sedes');
    if (savedSedes) setAllSedes(JSON.parse(savedSedes));

    const savedPrograms = localStorage.getItem('edunexus_academic_programs');
    if (savedPrograms) setAllPrograms(JSON.parse(savedPrograms));

    const savedSubjects = localStorage.getItem('edunexus_academic_subjects');
    if (savedSubjects) setAllSubjects(JSON.parse(savedSubjects));

    const savedTeachers = localStorage.getItem('edunexus_registered_teachers');
    if (savedTeachers) setAllTeachers(JSON.parse(savedTeachers));
  }, []);

  const handleSedeChange = (val: string) => {
    setForm(p => ({ ...p, sedeJornada: val, programaId: '', pensum: '', subjectId: '', teacherId: '' }));
    setFilteredPrograms([]);
    
    if (!val) return;
    
    const [sedeId, jornadaId] = val.split('::');
    const sede = allSedes.find(s => s.id === sedeId);
    if (!sede) return;
    
    const jornada = (sede.jornadas || []).find((j: any) => j.id === jornadaId);
    if (jornada && jornada.programas) {
      setFilteredPrograms(jornada.programas);
    }
  };

  const handleProgramChange = (progId: string) => {
    setForm(p => ({ ...p, programaId: progId, pensum: '' }));
    
    if (!progId) {
      setFilteredPensums([]);
      return;
    }

    // In this system, programs are essentially the pensum containers
    // We can offer a "PENSUM ÚNICO" or derive from the program name
    setFilteredPensums([{ id: 'unico', nombre: 'PENSUM ÚNICO - ALTA CALIDAD' }]);
    setForm(p => ({ ...p, pensum: 'unico' }));
  };

  const validate = () => {
    setTouched({ 
      periodo: true, 
      fechaRango: true,
      sedeJornada: true, 
      programaId: true, 
      pensum: true,
      subjectId: true,
      teacherId: true
    });
    
    const isTimeValid = form.filtro === 'Período' ? !!form.periodo : !!form.fechaRango;
    const isSedeValid = !!form.sedeJornada;
    let isModeValid = false;

    if (form.tipoFiltro === 'Programa') {
      isModeValid = !!form.programaId && !!form.pensum;
    } else {
      isModeValid = !!form.subjectId; // Teacher is optional in some Q10 reports, but subject is mandatory
    }

    return isTimeValid && isSedeValid && isModeValid;
  };

  const handleCharge = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte cargado exitosamente.');
    }, 1500);
  };

  const handleExport = () => {
    if (!validate()) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Excel exportado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isError = (field: string) => {
    // @ts-ignore
    return touched[field] && !form[field];
  };

  // Build Sede-Jornada options
  const sedeJornadaOptions: { label: string; value: string }[] = [];
  allSedes.forEach(s => {
    if (s.estado === 'Inactiva') return;
    (s.jornadas || []).forEach((j: any) => {
      if (j.estado === 'Inactiva') return;
      sedeJornadaOptions.push({ label: `${s.nombre} - ${j.nombre}`, value: `${s.id}::${j.id}` });
    });
  });

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
             Consolidado de Notas
           </h1>
           <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
             Reporte ejecutivo que integra las calificaciones finales y definitivas.
           </p>
         </div>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              
              {/* Filter Type (Period/Date) */}
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Filtrar por
              </label>
              <div style={{ position: 'relative' }}>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} value={form.filtro} onChange={e => handleChange('filtro', e.target.value)}>
                  <option value="Período">Período</option>
                  <option value="Fechas">Fechas</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>

              {form.filtro === 'Período' ? (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Período <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isError('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                      value={form.periodo} 
                      onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    {isError('periodo') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
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
                  </div>
                </>
              )}

              {/* Mode Selection (Program/Subject) */}
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Ver reporte por
              </label>
              <div style={{ position: 'relative' }}>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} value={form.tipoFiltro} onChange={e => handleChange('tipoFiltro', e.target.value)}>
                  <option value="Programa">Programa</option>
                  <option value="Asignatura">Asignatura</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>

              {/* Campus/Shift Selection */}
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Sede - jornada <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isError('sedeJornada') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                  value={form.sedeJornada} 
                  onChange={e => { setTouched(p => ({...p, sedeJornada: true})); handleSedeChange(e.target.value); }}
                >
                  <option value="">Seleccione</option>
                  {sedeJornadaOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                {isError('sedeJornada') && (
                   <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
                )}
              </div>

              {form.tipoFiltro === 'Programa' ? (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Programa <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-premium" 
                      disabled={!form.sedeJornada}
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: !form.sedeJornada ? '#f1f5f9' : '#f8fafc', border: isError('programaId') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                      value={form.programaId} 
                      onChange={e => { setTouched(p => ({...p, programaId: true})); handleProgramChange(e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {filteredPrograms.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    {isError('programaId') && (
                       <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
                    )}
                  </div>

                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Pensum <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-premium" 
                      disabled={!form.programaId}
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: !form.programaId ? '#f1f5f9' : '#f8fafc', border: isError('pensum') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                      value={form.pensum} 
                      onChange={e => { setTouched(p => ({...p, pensum: true})); handleChange('pensum', e.target.value); }}
                    >
                      {filteredPensums.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </>
              ) : (
                <>
                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Asignatura <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isError('subjectId') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                      value={form.subjectId}
                      onChange={e => { setTouched(p => ({...p, subjectId: true})); handleChange('subjectId', e.target.value); }}
                    >
                      <option value="">Seleccione</option>
                      {allSubjects.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.codigo})</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    {isError('subjectId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
                  </div>

                  <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Docente
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }}
                      value={form.teacherId}
                      onChange={e => handleChange('teacherId', e.target.value)}
                    >
                      <option value="">Seleccione (Opcional)</option>
                      {allTeachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </>
              )}
              
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isExporting ? 0.7 : 1, cursor: isExporting ? 'wait' : 'pointer' }}
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileSpreadsheet size={16} color="#10b981" />
              {isExporting ? 'Exportando Excel...' : 'Exportar Excel'}
            </button>

            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none' }}
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
