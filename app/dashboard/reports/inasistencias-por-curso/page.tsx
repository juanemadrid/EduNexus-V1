'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const PERIODOS = ['2026 - 01', '2026 - 02'];

export default function InasistenciasPorCursoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Data from localStorage
  const [allSedes, setAllSedes] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allCursos, setAllCursos] = useState<any[]>([]);

  // Filtered lists for selects
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    sedeJornada: '', 
    programaId: '', 
    periodo: '', 
    cursoId: '',
    fechaRango: 'Hoy'
  });
  
  const [touched, setTouched] = useState({ sedeJornada: false, programaId: false, periodo: false, cursoId: false, fechaRango: false });

  useEffect(() => {
    // 1. Load Sedes (campuses and jornadas)
    const savedSedes = localStorage.getItem('edunexus_sedes');
    if (savedSedes) setAllSedes(JSON.parse(savedSedes));

    // 2. Load Programs (global list)
    const savedPrograms = localStorage.getItem('edunexus_academic_programs');
    if (savedPrograms) setAllPrograms(JSON.parse(savedPrograms));

    // 3. Load Courses
    const savedCursos = localStorage.getItem('edunexus_cursos');
    if (savedCursos) setAllCursos(JSON.parse(savedCursos));

    setIsLoaded(true);
  }, []);

  // Cascading Selection Handlers
  const handleSedeChange = (val: string) => {
    setForm(p => ({ ...p, sedeJornada: val, programaId: '', cursoId: '' }));
    setFilteredPrograms([]);
    setFilteredCursos([]);

    if (!val) return;
    
    // Extract programs from the selected jornada in the sedes array
    const [sedeId, jornadaId] = val.split('::');
    const sede = allSedes.find(s => s.id === sedeId);
    if (!sede) return;
    
    const jornada = (sede.jornadas || []).find((j: any) => j.id === jornadaId);
    if (jornada && jornada.programas) {
      setFilteredPrograms(jornada.programas);
    }
  };

  const handleProgramChange = (progId: string) => {
    setForm(p => ({ ...p, programaId: progId, cursoId: '' }));
    setFilteredCursos([]);

    if (!progId || !form.sedeJornada) return;

    // Filter courses that belong to selected program AND selected sedeJornada
    // In edunexus_cursos, sedeJornada is stored as 'sedeId::jornadaId__...' which is our val string format
    const matched = allCursos.filter(c => 
      c.programaId === progId && 
      c.sedeJornada.startsWith(form.sedeJornada)
    );
    setFilteredCursos(matched);
  };

  const handleExport = () => {
    setTouched({ sedeJornada: true, programaId: true, periodo: true, cursoId: true, fechaRango: true });
    
    const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;

    if (!form.sedeJornada || !form.programaId || !form.cursoId || !isPeriodValid || !isDateValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte exportado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: keyof typeof form) => {
    if (field === 'periodo' && form.filtroFecha !== 'Período') return false;
    if (field === 'fechaRango' && form.filtroFecha !== 'Fechas') return false;
    return touched[field as keyof typeof touched] && !form[field as keyof typeof touched];
  };

  // Build Sede-Jornada options for dropdown
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
            Inasistencias por curso
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar un reporte detallado de inasistencias por cada curso seleccionado.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
            {/* Sede - Jornada */}
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Sede - jornada <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: touched.sedeJornada && !form.sedeJornada ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.sedeJornada} 
                onChange={e => { setTouched(p => ({...p, sedeJornada: true})); handleSedeChange(e.target.value); }}
              >
                <option value="">Seleccione</option>
                {sedeJornadaOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {touched.sedeJornada && !form.sedeJornada && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>

            {/* Programa */}
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Programa <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                disabled={!form.sedeJornada}
                style={{ width: '100%', height: '42px', fontSize: '14px', background: !form.sedeJornada ? '#f1f5f9' : '#f8fafc', border: touched.programaId && !form.programaId ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.programaId} 
                onChange={e => { setTouched(p => ({...p, programaId: true})); handleProgramChange(e.target.value); }}
              >
                <option value="">Seleccione</option>
                {filteredPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {touched.programaId && !form.programaId && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>

            {/* Filtrar por (Período / Fechas) */}
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Filtrar por
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.filtroFecha} 
                onChange={e => handleChange('filtroFecha', e.target.value)}
              >
                <option value="Período">Período</option>
                <option value="Fechas">Fechas</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {form.filtroFecha === 'Período' ? (
              <>
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Período <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('periodo') ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                    value={form.periodo} 
                    onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                  >
                    <option value="">Seleccione</option>
                    {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
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

            {/* Curso */}
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Curso <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-premium" 
                disabled={!form.programaId}
                style={{ width: '100%', height: '42px', fontSize: '14px', background: !form.programaId ? '#f1f5f9' : '#f8fafc', border: touched.cursoId && !form.cursoId ? '1px solid #ef4444' : '1px solid #e2e8f0', appearance: 'none', paddingRight: '36px' }} 
                value={form.cursoId} 
                onChange={e => { setTouched(p => ({...p, cursoId: true})); handleChange('cursoId', e.target.value); }}
              >
                <option value="">Seleccione</option>
                {filteredCursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.codigo})</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              {(form.programaId && filteredCursos.length === 0) && (
                <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '6px' }}>No hay cursos creados para este programa en esta sede</div>
              )}
              {touched.cursoId && !form.cursoId && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button 
            className="btn-premium" 
            style={{ 
              background: '#10b981', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              fontSize: '13px', 
              fontWeight: '700', 
              opacity: isLoading ? 0.7 : 1, 
              cursor: isLoading ? 'wait' : 'pointer', 
              border: 'none' 
            }} 
            onClick={handleExport} 
            disabled={isLoading}
          >
            <FileDown size={18} />
            {isLoading ? 'Exportando...' : 'Exportar reporte'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
