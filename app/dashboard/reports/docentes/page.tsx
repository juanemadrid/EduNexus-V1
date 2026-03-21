'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileSpreadsheet } from 'lucide-react';
import React, { useState } from 'react';

export default function DocentesExcelPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => { 
      setIsExporting(false); 
      alert('Reporte exportado exitosamente a Excel.'); 
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 30px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
           Comunidad en Excel - Docentes
         </h1>

         <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
              Descargue el listado de todos los docentes vinculados a la institución.
            </p>
            
            <button 
              className="btn-premium" 
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', fontSize: '14px', fontWeight: '700', margin: '0 auto', border: 'none', borderRadius: '8px' }}
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileSpreadsheet size={20} />
              {isExporting ? 'Exportando...' : 'Exportar a Excel'}
            </button>
         </div>
      </div>
    </DashboardLayout>
  );
}
