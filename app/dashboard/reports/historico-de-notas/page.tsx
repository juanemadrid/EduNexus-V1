'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';

export default function HistoricoNotasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ 
    filtro: 'Período',
    periodo: '', 
    fechaRango: 'Hoy',
    sedeJornada: '', 
    programaId: '', 
    asignaturaId: '', 
    cursoId: '',
    incluirObservaciones: false 
  });
  const [touched, setTouched] = useState({ 
    periodo: false, 
    fechaRango: false,
    sedeJornada: false, 
    programaId: false, 
    asignaturaId: false, 
    cursoId: false 
  });
  const [programs, setPrograms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));
    const savedSubjects = localStorage.getItem('edunexus_academic_subjects');
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
  }, []);

  const handleCharge = () => {
    setTouched({ 
      periodo: true, 
      fechaRango: true,
      sedeJornada: true, 
      programaId: true, 
      asignaturaId: true, 
      cursoId: true 
    });
    
    const isPeriodValid = form.filtro === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtro === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid || !form.sedeJornada || !form.programaId || !form.asignaturaId || !form.cursoId) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Histórico de notas cargado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalid = (field: keyof typeof form) => {
    if (field === 'periodo' && form.filtro !== 'Período') return false;
    if (field === 'fechaRango' && form.filtro !== 'Fechas') return false;
    return touched[field as keyof typeof touched] && !form[field];
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Histórico de notas
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar la planilla de los cursos que han sido archivados con sus respectivos estudiantes y notas.
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
              </select>
              {isInvalid('sedeJornada') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

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
                {programs.map(p => <option key={p.codigo} value={p.codigo}>{p.nombre}</option>)}
              </select>
              {isInvalid('programaId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Asignatura <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('asignaturaId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.asignaturaId} 
                onChange={e => { setTouched(p => ({...p, asignaturaId: true})); handleChange('asignaturaId', e.target.value); }}
              >
                <option value="">Seleccione</option>
                {subjects.map(s => <option key={s.codigo} value={s.codigo}>{s.nombre}</option>)}
              </select>
              {isInvalid('asignaturaId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Curso <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('cursoId') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.cursoId} 
                onChange={e => { setTouched(p => ({...p, cursoId: true})); handleChange('cursoId', e.target.value); }}
              >
                <option value="">Seleccione</option>
                <option value="101A">101A</option>
              </select>
              {isInvalid('cursoId') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Incluir observaciones
            </label>
            <div>
               <div 
                 onClick={() => handleChange('incluirObservaciones', !form.incluirObservaciones)}
                 style={{ 
                   width: '64px', 
                   height: '24px', 
                   background: '#f1f5f9', 
                   borderRadius: '12px', 
                   display: 'flex', 
                   position: 'relative', 
                   cursor: 'pointer',
                   border: '1px solid #e2e8f0',
                   overflow: 'hidden'
                 }}
               >
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '11px', 
                    fontWeight: '700',
                    color: form.incluirObservaciones ? '#cbd5e1' : '#64748b',
                    zIndex: 1
                  }}>No</div>
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '11px', 
                    fontWeight: '700',
                    color: form.incluirObservaciones ? '#10b981' : '#cbd5e1',
                    zIndex: 1
                  }}>Sí</div>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: form.incluirObservaciones ? '50%' : 0, 
                    width: '50%', 
                    height: '100%', 
                    background: 'white', 
                    borderRadius: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'left 0.2s ease'
                  }}></div>
               </div>
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
            onClick={handleCharge} 
            disabled={isLoading}
          >
            <FileDown size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
