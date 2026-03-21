'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';

export default function CarteraGeneralPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ 
    periodo: '',
    sede: 'Todas',
    programa: 'Todos',
    curso: 'Todos',
    incluirPazSalvo: false
  });
  const [touched, setTouched] = useState({ periodo: false });

  const handleCharge = () => {
    setTouched({ periodo: true });
    if (!form.periodo) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Cartera general exportado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isInvalidPeriodo = touched.periodo && !form.periodo;

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Cartera General
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite exportar el listado de saldos pendientes de todos los estudiantes agrupados por sede, programa y curso para el período seleccionado.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Período <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div>
              <select
                className="input-premium"
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalidPeriodo ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                value={form.periodo}
                onChange={e => { setTouched({ periodo: true }); handleChange('periodo', e.target.value); }}
              >
                <option value="">Seleccione</option>
                <option value="2026-01">2026-01</option>
                <option value="2026-02">2026-02</option>
              </select>
              {isInvalidPeriodo && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>El campo es requerido</div>}
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Sede
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.sede} onChange={e => handleChange('sede', e.target.value)}>
                <option value="Todas">Todas</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Programa
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.programa} onChange={e => handleChange('programa', e.target.value)}>
                <option value="Todos">Todos</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Curso
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.curso} onChange={e => handleChange('curso', e.target.value)}>
                <option value="Todos">Todos</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Incluir créditos en Paz y salvo
            </label>
            <div>
              <div
                onClick={() => handleChange('incluirPazSalvo', !form.incluirPazSalvo)}
                style={{
                  width: '60px', height: '24px',
                  background: form.incluirPazSalvo ? '#10b981' : '#f1f5f9',
                  borderRadius: '12px', position: 'relative', cursor: 'pointer',
                  border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                  justifyContent: form.incluirPazSalvo ? 'flex-end' : 'flex-start',
                  padding: '0 2px', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '28px', height: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: form.incluirPazSalvo ? '#10b981' : '#64748b' }}>
                  {form.incluirPazSalvo ? 'Si' : 'No'}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
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
            {isLoading ? 'Exportando...' : 'Exportar reporte'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
