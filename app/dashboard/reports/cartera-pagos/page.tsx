'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';

export default function CarteraPagosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ 
    filtro: 'Período',
    periodo: 'Todos', 
    fechaRango: 'Hoy',
    filtrarPor: 'Programa',
    sedeJornada: 'Todos',
    programa: 'Todos',
    producto: 'Todos',
    soloPendientes: false
  });

  const handleCharge = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Cartera - pagos cargado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Cartera - Pagos
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite obtener el listado de saldos pendientes por los diferentes productos cargados.
          </p>
        </div>

        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Período
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="2026-01">2026-01</option>
                <option value="2026-02">2026-02</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Filtrar por
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.filtrarPor} onChange={e => handleChange('filtrarPor', e.target.value)}>
                <option value="Programa">Programa</option>
                <option value="Curso">Curso</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Sede - jornada
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                <option value="Todos">Todos</option>
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
              Producto
            </label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={form.producto} onChange={e => handleChange('producto', e.target.value)}>
                <option value="Todos">Todos</option>
              </select>
            </div>

            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              ¿Solo estudiantes con saldo pendiente?
            </label>
            <div>
              <div 
                onClick={() => handleChange('soloPendientes', !form.soloPendientes)}
                style={{ 
                  width: '60px', 
                  height: '24px', 
                  background: form.soloPendientes ? '#10b981' : '#f1f5f9', 
                  borderRadius: '12px', 
                  position: 'relative', 
                  cursor: 'pointer',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: form.soloPendientes ? 'flex-end' : 'flex-start',
                  padding: '0 2px',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '28px', height: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: form.soloPendientes ? '#10b981' : '#64748b' }}>
                  {form.soloPendientes ? 'Si' : 'No'}
                </div>
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
