'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';

export default function IngresosDetalladosPorProductoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ 
    fechaRango: 'Hoy', 
    producto: 'Todos'
  });

  const handleCharge = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Ingresos detallados por producto exportado exitosamente.');
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
            Ingresos Detallados por Producto
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite visualizar los pagos registrados agrupados por productos, con detalle de cada transacción realizada.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Fechas
            </label>
            <div>
              <DateRangePicker 
                value={form.fechaRango} 
                onChange={(val) => handleChange('fechaRango', val)} 
              />
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Producto
            </label>
            <div>
              <select 
                className="input-premium" 
                style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                value={form.producto} 
                onChange={e => handleChange('producto', e.target.value)}
              >
                <option value="Todos">Todos</option>
              </select>
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
            {isLoading ? 'Exportando...' : 'Exportar reporte'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
