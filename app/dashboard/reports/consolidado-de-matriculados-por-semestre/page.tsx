'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ChevronDown, 
  Calendar,
  Layers,
  UserCheck
} from 'lucide-react';
import { db } from '@/lib/db';
import { motion } from 'framer-motion';

export default function ConsolidadoMatriculadosSemestrePage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Data State
  const [periods, setPeriods] = useState<any[]>([]);
  const [conditions, setConditions] = useState<string[]>(['Todas']);

  // Form State
  const [form, setForm] = useState({ 
    periodo: '',
    condicion: 'Todas',
    filtro: 'Consolidado'
  });

  useEffect(() => {
    Promise.all([
      db.list('academic_periods'),
      db.list('enrollment_conditions')
    ]).then(([peri, conds]: [any[], any[]]) => {
      setPeriods(peri);
      if (peri.length > 0) setForm(p => ({ ...p, periodo: peri[0].name || peri[0].id }));
      
      const activeConds = conds.filter((c:any) => c.isActive).map((c:any) => c.name);
      setConditions(['Todas', ...activeConds]);
    }).catch(console.error).finally(() => setIsInitialLoading(false));
  }, []);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const students = await db.list<any>('registered_students');

      // Filtering logic
      const filtered = students.filter(s => {
        // Enrolled in specific period (assuming student has a period field)
        if (form.periodo && s.periodo !== form.periodo) return false;
        
        // Filter by Condición Matrícula
        const studentCond = s.enrollmentCondition || s.condicionMatricula;
        if (form.condicion !== 'Todas' && studentCond !== form.condicion) return false;
        
        return true;
      });

      // Prepare Excel Data
      let ws;
      if (form.filtro === 'Consolidado') {
        const stats: Record<string, number> = {};
        filtered.forEach(s => {
          const prog = s.programaNombre || s.programa || 'Sin Programa';
          stats[prog] = (stats[prog] || 0) + 1;
        });
        const headers = ['Programa', 'Total Matriculados'];
        const rows = Object.entries(stats).map(([prog, count]) => [prog, count]);
        ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      } else {
        const headers = ['Documento', 'Estudiante', 'Programa', 'Sede', 'Condición'];
        const rows = filtered.map(s => [
          s.documento || s.document, 
          s.name || `${s.nombres} ${s.apellidos}`, 
          s.programaNombre || s.programa,
          s.sedeJornada || 'N/A',
          s.enrollmentCondition || s.condicionMatricula || 'N/A'
        ]);
        ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Matriculados');
      const fileName = `Consolidado_Matriculados_${form.periodo.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Header (Clean & Consistent) */}
        <div style={{ marginBottom: '40px' }}>
           <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>
             Consolidado de matriculados por semestre
           </h1>
           <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
             Exportación detallada de la población estudiantil matriculada por periodos académicos.
           </p>
        </div>

        {/* Filter Configuration Card (Premium Glass) */}
        <div className="glass-panel" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '32px', padding: '56px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
          <div style={{ maxWidth: '620px', margin: '0 auto' }}>
             
             {/* Report Description */}
             <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6', fontWeight: '500' }}>
                  Permite exportar a un archivo de Excel la cantidad de estudiantes matriculados a un periodo en específico filtrado por condición.
                </p>
                <div style={{ width: '60px', height: '4px', background: '#10b981', borderRadius: '2px', margin: '20px auto 0', opacity: 0.3 }} />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Período */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                     <Calendar size={16} color="#94a3b8" />
                     <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período *</label>
                   </div>
                   <div style={{ position: 'relative' }}>
                      <select className="input-premium" value={form.periodo} onChange={e => handleChange('periodo', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                        <option value="">Seleccione</option>
                        {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                   </div>
                </div>

                {/* 2. Condición Matrícula */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                     <UserCheck size={16} color="#94a3b8" />
                     <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Condición Matrícula</label>
                   </div>
                   <div style={{ position: 'relative' }}>
                      <select className="input-premium" value={form.condicion} onChange={e => handleChange('condicion', e.target.value)} style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                   </div>
                </div>

                {/* 3. Radio Filter */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                     <Layers size={16} color="#94a3b8" />
                     <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Filtro</label>
                   </div>
                   <div style={{ display: 'flex', gap: '30px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: form.filtro === 'Consolidado' ? '#10b981' : '#64748b' }}>
                        <input type="radio" checked={form.filtro === 'Consolidado'} onChange={() => handleChange('filtro', 'Consolidado')} style={{ accentColor: '#10b981', width: '18px', height: '18px' }} />
                        Consolidado
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: form.filtro === 'Detallado' ? '#10b981' : '#64748b' }}>
                        <input type="radio" checked={form.filtro === 'Detallado'} onChange={() => handleChange('filtro', 'Detallado')} style={{ accentColor: '#10b981', width: '18px', height: '18px' }} />
                        Detallado
                      </label>
                   </div>
                </div>

             </div>

             {/* Export Button Area */}
             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn-premium"
                  style={{ 
                    background: '#16a34a', 
                    color: 'white', 
                    padding: '16px 48px', 
                    fontWeight: '900', 
                    borderRadius: '20px', 
                    fontSize: '15px', 
                    border: 'none', 
                    cursor: isExporting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <FileSpreadsheet size={20} />
                  {isExporting ? 'EXPORTANDO...' : 'EXPORTAR REPORTE'}
                </button>
             </div>

          </div>
        </div>

      </div>

      <style jsx global>{`
        .input-premium {
          border-radius: 16px; border: 1px solid #e2e8f0; outline: none; padding: 0 20px; transition: all 0.3s ease;
        }
        .input-premium:focus {
          border-color: #10b981; box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.1); transform: translateY(-1px);
        }
        .btn-premium {
          transition: all 0.3s ease;
        }
        .btn-premium:hover:not(:disabled) {
          transform: translateY(-2px); filter: brightness(1.05);
        }
      `}</style>
    </DashboardLayout>
  );
}
