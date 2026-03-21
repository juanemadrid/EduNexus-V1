'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';

export default function InformesSniesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    informe: 'Participante',
    tipo: '',
    programa: 'Todos',
    periodo: ''
  });
  const [touched, setTouched] = useState({ tipo: false, periodo: false });

  const handleCharge = () => {
    setTouched({ tipo: true, periodo: true });
    if (!form.tipo || !form.periodo) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte SNIES exportado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalidTipo = touched.tipo && !form.tipo;
  const isInvalidPeriodo = touched.periodo && !form.periodo;

  const labelStyle: React.CSSProperties = { textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' };
  const getInputStyle = (isInvalid: boolean): React.CSSProperties => ({ 
    width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', 
    border: isInvalid ? '1px solid #ef4444' : '1px solid #e2e8f0', 
    borderRadius: '8px', padding: '0 12px', outline: 'none' 
  });
  const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Informes SNIES
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite descargar la plantilla con la información necesaria para cargar al ministerio de educación (SNIES).
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>

          {/* Informe */}
          <div style={rowStyle}>
            <label style={labelStyle}>Informe</label>
            <div>
              <select style={getInputStyle(false)} value={form.informe} onChange={e => handleChange('informe', e.target.value)}>
                <option value="Participante">Participante</option>
                {/* Posibles otros informes que mencionabas se agregarán aquí */}
              </select>
            </div>
          </div>

          {/* Tipo */}
          <div style={rowStyle}>
            <label style={labelStyle}>
              Tipo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select style={getInputStyle(isInvalidTipo)} value={form.tipo} onChange={e => { setTouched(prev => ({...prev, tipo: true})); handleChange('tipo', e.target.value); }}>
                <option value="">Seleccione</option>
                <option value="1">Tipo 1</option>
              </select>
              {isInvalidTipo && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>
          </div>

          {/* Programa */}
          <div style={rowStyle}>
            <label style={labelStyle}>Programa</label>
            <div>
              <select style={getInputStyle(false)} value={form.programa} onChange={e => handleChange('programa', e.target.value)}>
                <option value="Todos">Todos</option>
              </select>
            </div>
          </div>

          {/* Período */}
          <div style={{...rowStyle, marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9'}}>
            <label style={labelStyle}>
              Período <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select style={getInputStyle(isInvalidPeriodo)} value={form.periodo} onChange={e => { setTouched(prev => ({...prev, periodo: true})); handleChange('periodo', e.target.value); }}>
                <option value="">Seleccione</option>
                <option value="2026-01">2026-01</option>
                <option value="2026-02">2026-02</option>
              </select>
              {isInvalidPeriodo && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px' }}>
          <button
            className="btn-premium"
            style={{
              background: '#10b981', color: 'white', display: 'flex', alignItems: 'center',
              gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700',
              opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none'
            }}
            onClick={handleCharge}
            disabled={isLoading}
          >
            <FileDown size={18} />
            {isLoading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
