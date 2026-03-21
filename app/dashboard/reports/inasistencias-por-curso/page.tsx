'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function InasistenciasPorCursoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);

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
    const savedPrograms = localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));

    const savedCursos = localStorage.getItem('edunexus_academic_cursos');
    if (savedCursos) setCursos(JSON.parse(savedCursos));
  }, []);

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
            
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Sede - jornada <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: touched.sedeJornada && !form.sedeJornada ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.sedeJornada} 
                onChange={e => { setTouched(p => ({...p, sedeJornada: true})); handleChange('sedeJornada', e.target.value); }}
              >
                <option value="">Seleccione</option>
                <option value="PRINCIPAL - MAÑANA">PRINCIPAL - MAÑANA</option>
                <option value="PRINCIPAL - NOCHE">PRINCIPAL - NOCHE</option>
              </select>
              {touched.sedeJornada && !form.sedeJornada && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Programa <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: touched.programaId && !form.programaId ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.programaId} 
                onChange={e => { setTouched(p => ({...p, programaId: true})); handleChange('programaId', e.target.value); }}
              >
                <option value="">Seleccione</option>
                {programs.map(p => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
              {touched.programaId && !form.programaId && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>
              )}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Filtrar por
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                value={form.filtroFecha} 
                onChange={e => handleChange('filtroFecha', e.target.value)}
              >
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
              Curso <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: touched.cursoId && !form.cursoId ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.cursoId} 
                onChange={e => { setTouched(p => ({...p, cursoId: true})); handleChange('cursoId', e.target.value); }}
              >
                <option value="">Seleccione</option>
                {cursos.map(c => (
                  <option key={c.codigo} value={c.codigo}>{c.nombre} - {c.codigo}</option>
                ))}
              </select>
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
