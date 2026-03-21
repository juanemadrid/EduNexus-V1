'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';

export default function CuadreCajaProductoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ 
    filtroFecha: 'Fechas',
    periodo: '2026-01',
    fechaRango: 'Hoy', 
    valorInicial: ''
  });
  const [touched, setTouched] = useState({ periodo: false, fechaRango: false });

  const handleCharge = () => {
    setTouched({ periodo: true, fechaRango: true });
    
    const isPeriodValid = form.filtroFecha === 'Período' ? !!form.periodo : true;
    const isDateValid = form.filtroFecha === 'Fechas' ? !!form.fechaRango : true;

    if (!isPeriodValid || !isDateValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Cuadre de caja por producto cargado exitosamente.');
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
            Cuadre de Caja por Producto
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite visualizar los pagos registrados agrupados por productos, permitiendo visualizar lo recaudado por cada uno.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
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

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Valor inicial de efectivo
            </label>
            <div>
              <input 
                type="text" 
                placeholder="Valor inicial de efectivo"
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0 16px' }} 
                value={form.valorInicial} 
                onChange={e => handleChange('valorInicial', e.target.value)} 
              />
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
