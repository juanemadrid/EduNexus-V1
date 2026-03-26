'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, Search, ChevronDown, Users, Phone, Mail, ShieldCheck, Clock, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function FamiliaresCodeudoresEstudiantesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const [form, setForm] = useState({ 
    filtroFecha: 'Período',
    periodo: '2026 - 01', 
    fechaRango: 'Hoy',
    sedeJornada: 'Todos', 
    programaId: 'Todos' 
  });

  useEffect(() => {
    // Load programs
    const savedPrograms = localStorage.getItem('edunexus_academic_programs_data');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));

    // Load and join data
    loadReportData();
  }, []);

  const loadReportData = () => {
    const students = JSON.parse(localStorage.getItem('edunexus_registered_students') || '[]');
    const links = JSON.parse(localStorage.getItem('edunexus_student_family_links') || '[]');
    const family = JSON.parse(localStorage.getItem('edunexus_registered_family') || '[]');

    const joined = links.map((link: any) => {
      const student = students.find((s: any) => s.id === link.studentId);
      const familiar = family.find((f: any) => f.id === link.familiarId);
      
      return {
        ...link,
        studentName: student?.name || 'ESTUDIANTE NO ENCONTRADO',
        studentProgram: student?.details?.program || 'Bachillerato Académico',
        studentCampus: student?.details?.campus || 'PRINCIPAL - MAÑANA',
        studentPeriod: student?.details?.period || '2026 - 01',
        familiarEmail: familiar?.correo || familiar?.details?.correo || 'N/A',
        familiarPhone: familiar?.celular || familiar?.details?.celular || 'N/A'
      };
    });

    setReportData(joined);
    setFilteredData(joined);
  };

  const handleCharge = () => {
    setIsLoading(true);
    setTimeout(() => {
      let result = [...reportData];

      if (form.sedeJornada !== 'Todos') {
        result = result.filter(r => r.studentCampus === form.sedeJornada);
      }

      if (form.programaId !== 'Todos') {
        result = result.filter(r => r.studentProgram === form.programaId);
      }

      if (form.filtroFecha === 'Período') {
        result = result.filter(r => r.studentPeriod === form.periodo);
      }

      setFilteredData(result);
      setIsLoading(false);
    }, 800);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Reporte de familiares codeudores exportado exitosamente a Excel.');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
         <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                Familiares y Codeudores Estudiante
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                Consolidado de acudientes y codeudores vinculados a los estudiantes para seguimiento administrativo y financiero.
              </p>
            </div>
            <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Users size={20} style={{ color: '#0ea5e9' }} />
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Vínculos Totales</div>
                 <div style={{ fontSize: '18px', fontWeight: '900', color: '#0ea5e9' }}>{filteredData.length}</div>
               </div>
            </div>
         </div>

         {/* Filter Area */}
         <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
             <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Filtrar por</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.filtroFecha} onChange={e => handleChange('filtroFecha', e.target.value)}>
                    <option value="Período">Período</option>
                    <option value="Fechas">Fechas</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
             </div>

             {form.filtroFecha === 'Período' ? (
               <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Período</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                      <option>2026 - 01</option>
                      <option>2026 - 02</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
               </div>
             ) : (
               <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Rango de Fechas</label>
                  <DateRangePicker value={form.fechaRango} onChange={val => handleChange('fechaRango', val)} />
               </div>
             )}

             <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Sede - Jornada</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option>PRINCIPAL - MAÑANA</option>
                    <option>Sede B - Tarde</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
             </div>

             <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Programa</label>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '40px', appearance: 'none' }} value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option>Bachillerato Académico</option>
                    <option>Técnico en Sistemas</option>
                    {programs.map(p => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
             </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
             <button onClick={handleCharge} className="btn-premium" style={{ height: '42px', padding: '0 32px', background: '#334155', color: 'white', fontWeight: '800' }} disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Consultar Reporte'}
             </button>
             <button onClick={handleExport} className="btn-premium" style={{ height: '42px', padding: '0 24px', background: '#10b981', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={isExporting}>
                <FileSpreadsheet size={18} /> {isExporting ? 'Exportando...' : 'Exportar Excel'}
             </button>
         </div>

         {/* Results Table */}
         <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflowX: 'auto' }}>
            {filteredData.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Estudiante</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Familiar / Codeudor</th>
                     <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Relación</th>
                     <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Tipo</th>
                     <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                         <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{r.studentName}</div>
                         <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {r.studentId} • {r.studentProgram}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                         <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{r.familiarName}</div>
                         <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {r.familiarId}</div>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                         <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{r.parentesco}</span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                         <span style={{ 
                           background: r.esCodeudor ? '#ecfdf5' : '#f1f5f9', 
                           color: r.esCodeudor ? '#10b981' : '#64748b',
                           padding: '4px 10px', 
                           borderRadius: '12px', 
                           fontSize: '10px', 
                           fontWeight: '800',
                           textTransform: 'uppercase',
                           display: 'inline-flex',
                           gap: '4px',
                           alignItems: 'center'
                         }}>
                           {r.esCodeudor && <ShieldCheck size={12} />} {r.esCodeudor ? 'Codeudor' : 'Acudiente'}
                         </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                            <Phone size={12} /> {r.familiarPhone}
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                            <Mail size={12} /> {r.familiarEmail}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                <Clock size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '700' }}>No se registran vínculos de familiares para los criterios seleccionados.</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Asegúrese de vincular familiares en la pestaña del perfil del estudiante.</p>
              </div>
            )}
         </div>

         <div style={{ marginTop: '24px', background: '#fefce8', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid #fef3c7' }}>
            <Info size={20} style={{ color: '#d97706', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#b45309', lineHeight: '1.4' }}>
              <strong>Importante:</strong> Este reporte consolida la información de responsabilidad civil y financiera. Los familiares marcados como <em>Codeudores</em> son los responsables legales ante la institución por conceptos de cartera pendientes.
            </p>
         </div>
      </div>

      <style jsx global>{`
        .glass-panel { border-radius: 20px; border: 1px solid #e2e8f0; }
        .input-premium { border-radius: 12px; outline: none; transition: 0.2s; padding: 0 16px; border: 1px solid #e2e8f0; font-size: 14px; }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .btn-premium { border-radius: 12px; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn-premium:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>
    </DashboardLayout>
  );
}
