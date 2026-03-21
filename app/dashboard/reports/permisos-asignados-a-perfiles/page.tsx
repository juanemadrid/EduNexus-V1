'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';

export default function PermisosAsignadosPerfilesPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    perfil: 'Todos'
  });

  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte exportado a Excel exitosamente.');
    }, 1500);
  };

  const handleCharge = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte cargado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const labelStyle: React.CSSProperties = { textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' };
  const inputStyle: React.CSSProperties = { width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none' };
  const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Permisos asignados a perfiles
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite generar un listado de los permisos que han sido asignados a un perfil en específico o a todos los perfiles.
          </p>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Perfil */}
          <div style={rowStyle}>
            <label style={labelStyle}>Perfil</label>
            <div>
              <input 
                type="text" 
                style={inputStyle} 
                value={form.perfil} 
                onChange={e => handleChange('perfil', e.target.value)} 
              />
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          
          <button 
            className="btn-premium" 
            style={{ background: 'white', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isExporting ? 0.7 : 1, cursor: isExporting ? 'wait' : 'pointer', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
            onClick={handleExportExcel} 
            disabled={isExporting || isLoading}>
            <FileSpreadsheet size={16} />
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </button>

          <button 
            className="btn-premium" 
            style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '8px' }} 
            onClick={handleCharge} 
            disabled={isLoading || isExporting}>
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>

        </div>
      </div>
    </DashboardLayout>
  );
}
