'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';

export default function ResultadosAcademicosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [form, setForm] = useState({ 
    filtro: 'Período',
    sedeJornada: '', 
    programaId: '', 
    nivel: '', 
    periodo: '',
    fechaRango: 'Hoy',
    tipoInforme: 'Básico'
  });
  const [touched, setTouched] = useState({ 
    sedeJornada: false, 
    programaId: false, 
    nivel: false, 
    periodo: false,
    fechaRango: false
  });
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));
  }, []);

  const handleCharge = () => {
    setTouched({ 
      sedeJornada: true, 
      programaId: true, 
      nivel: true, 
      periodo: true,
      fechaRango: true
    });
    
    const isPeriodValid = form.filtro === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtro === 'Fechas' ? !!form.fechaRango : true;

    if (!form.sedeJornada || !form.programaId || !form.nivel || !isPeriodValid || !isDateValid) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Resultados académicos cargado exitosamente.');
    }, 1500);
  };

  const handleGenerate = () => {
    setTouched({ 
      sedeJornada: true, 
      programaId: true, 
      nivel: true, 
      periodo: true,
      fechaRango: true
    });
    
    const isPeriodValid = form.filtro === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtro === 'Fechas' ? !!form.fechaRango : true;

    if (!form.sedeJornada || !form.programaId || !form.nivel || !isPeriodValid || !isDateValid) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Boletín generado exitosamente para cada estudiante.');
    }, 2000);
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
            Resultados académicos
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar un boletín de las notas obtenidas por cada estudiante.
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
              Nivel <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid('nivel') ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.nivel} 
                onChange={e => { setTouched(p => ({...p, nivel: true})); handleChange('nivel', e.target.value); }}
              >
                <option value="">Seleccione</option>
                <option value="NIVEL 1">NIVEL 1</option>
                <option value="NIVEL 2">NIVEL 2</option>
              </select>
              {isInvalid('nivel') && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Tipo informe
            </label>
            <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                <input type="radio" value="Básico" checked={form.tipoInforme === 'Básico'} onChange={() => handleChange('tipoInforme', 'Básico')} />
                Básico
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                <input type="radio" value="Detallado" checked={form.tipoInforme === 'Detallado'} onChange={() => handleChange('tipoInforme', 'Detallado')} />
                Detallado
              </label>
            </div>
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
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
            disabled={isLoading || isGenerating}
          >
            <FileDown size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
          <button 
            className="btn-premium" 
            style={{ 
              background: '#1e293b', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              fontSize: '13px', 
              fontWeight: '700', 
              opacity: isGenerating ? 0.7 : 1, 
              cursor: isGenerating ? 'wait' : 'pointer', 
              border: 'none' 
            }} 
            onClick={handleGenerate} 
            disabled={isLoading || isGenerating}
          >
            <FileDown size={18} />
            {isGenerating ? 'Generando...' : 'Generar reporte'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
