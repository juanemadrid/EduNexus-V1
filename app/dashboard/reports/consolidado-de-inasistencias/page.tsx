'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileSpreadsheet } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import DateRangePicker from '@/components/DateRangePicker';

export default function ConsolidadoInasistenciasPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '2026 - 01', 
    fechaRango: 'Hoy',
    filtrarPor: 'Programa',
    sedeJornada: '', 
    programaId: '',
    pensum: '' 
  });
  
  const [touched, setTouched] = useState({ 
    sedeJornada: false, 
    programaId: false, 
    pensum: false 
  });

  useEffect(() => {
    const savedPrograms = localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));
  }, []);

  const handleExport = () => {
    setTouched({ sedeJornada: true, programaId: true, pensum: true });
    
    if (!form.sedeJornada || !form.programaId || !form.pensum) {
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte Consolidado de Inasistencias exportado a Excel.');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Consolidado de Inasistencias
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite visualizar de manera general la cantidad de inasistencias registradas a cada estudiante.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
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
                  Período
                </label>
                <div>
                  <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                    <option value="2026 - 01">2026 - 01</option>
                    <option value="2026 - 02">2026 - 02</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                  Fechas
                </label>
                <div>
                  <DateRangePicker 
                    value={form.fechaRango} 
                    onChange={(val) => handleChange('fechaRango', val)} 
                  />
                </div>
              </>
            )}

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Filtrar por
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.filtrarPor} onChange={e => handleChange('filtrarPor', e.target.value)}>
                <option value="Programa">Programa</option>
                <option value="Docente">Docente</option>
              </select>
            </div>

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
                 <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
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
                 <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
              )}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Pensum <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: touched.pensum && !form.pensum ? '1px solid #ef4444' : '1px solid #e2e8f0' }} 
                value={form.pensum} 
                onChange={e => { setTouched(p => ({...p, pensum: true})); handleChange('pensum', e.target.value); }}
              >
                <option value="">Seleccione</option>
                <option value="1">PENSUM 2026-I</option>
              </select>
              {touched.pensum && !form.pensum && (
                 <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El campo es requerido</div>
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
              opacity: isExporting ? 0.7 : 1, 
              cursor: isExporting ? 'wait' : 'pointer', 
              border: 'none' 
            }} 
            onClick={handleExport} 
            disabled={isExporting}
          >
            <FileSpreadsheet size={18} />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
