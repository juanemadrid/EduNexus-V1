'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, FileDown } from 'lucide-react';
import React, { useState } from 'react';

export default function PermisosAdministrativosPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCharge = () => {
    setIsLoading(true);
    setTimeout(() => { 
      setIsLoading(false); 
      alert('Reporte de permisos cargado exitosamente.'); 
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 30px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           Permisos usuarios administrativos
         </h1>

         <div style={{ padding: '0 40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Usuario
              </label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <option value="Todos">Todos los administrativos</option>
                </select>
              </div>
           </div>

           <div style={{ marginTop: '40px', textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
              <Shield size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Consulte y audite los niveles de acceso y permisos específicos otorgados a cada cuenta administrativa.
              </p>
           </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '6px' }}
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
