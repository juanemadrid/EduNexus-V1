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
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '40px auto', background: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#1e293b', margin: '0 0 12px 0', fontFamily: 'inherit' }}>
            Cuadre de Caja por Producto
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
            Permite visualizar los pagos registrados agrupados por productos, permitiendo visualizar lo recaudado por cada uno.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', alignItems: 'center' }}>
            
            <label style={{ textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              Fechas
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '400px', height: '40px', fontSize: '14px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                value={form.fechaRango} 
                onChange={e => handleChange('fechaRango', e.target.value)}
              >
                <option value="Hoy">Hoy</option>
                <option value="Ayer">Ayer</option>
                <option value="Esta semana">Esta semana</option>
                <option value="Mes actual">Mes actual</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              Valor inicial de efectivo
            </label>
            <div>
              <input 
                type="text" 
                placeholder="Valor inicial de efectivo"
                className="input-premium" 
                style={{ width: '400px', height: '40px', fontSize: '14px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0 12px' }} 
                value={form.valorInicial} 
                onChange={e => handleChange('valorInicial', e.target.value)} 
              />
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          <button 
            className="btn-premium" 
            style={{ 
              background: '#4CAF50', 
              color: 'white', 
              padding: '10px 24px', 
              fontSize: '14px', 
              fontWeight: '500', 
              borderRadius: '4px',
              border: 'none',
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.8 : 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} 
            onClick={handleCharge} 
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
