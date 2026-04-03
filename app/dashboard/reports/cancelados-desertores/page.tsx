'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown, ChevronDown, UserX, AlertCircle, Calendar, MapPin, BookOpen } from 'lucide-react';
import { db } from '@/lib/db';

export default function CanceladosDesertoresPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [cancellationTypes, setCancellationTypes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [instConfig, setInstConfig] = useState<any>({});

  const [form, setForm] = useState({
    periodo: 'Todos',
    sedeJornada: 'Todos',
    programaId: 'Todos'
  });

  useEffect(() => {
    Promise.all([
      db.list('academic_programs'),
      db.list('sedes'),
      db.list('cancellation_types'),
      db.list('academic_periods'),
      db.get<any>('settings', 'appearance')
    ]).then(([prog, sede, types, per, config]) => {
      setPrograms(prog as any[]);
      setSedes(sede as any[]);
      setCancellationTypes(types as any[]);
      setPeriods(per as any[]);
      if (config) setInstConfig(config);
    }).catch(console.error);
  }, []);

  const handleCharge = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const students = await db.list<any>('students');
      const filtered = students.filter(s => {
        const isCancelled = !s.isActive || s.status === 'cancelled' || s.status === 'Cancelado' || s.estado === 'Cancelado';
        if (!isCancelled) return false;
        if (form.periodo !== 'Todos' && s.periodoCancelacion !== form.periodo && s.cancellationPeriod !== form.periodo) return false;
        if (form.sedeJornada !== 'Todos' && s.sedeJornada !== form.sedeJornada && s.sedeId !== form.sedeJornada) return false;
        if (form.programaId !== 'Todos' && s.programaId !== form.programaId && s.programa !== form.programaId) return false;
        return true;
      });

      const prog = programs.find(p => p.id === form.programaId);
      const sede = sedes.find(s => s.id === form.sedeJornada || s.nombre === form.sedeJornada);

      const mappedResults = filtered.map(s => {
        const type = cancellationTypes.find(t => t.id === s.cancellationTypeId || t.codigo === s.cancellationType);
        const studentProg = programs.find(p => p.id === s.programaId);
        return {
          ...s,
          programaNombre: studentProg?.nombre || s.programa || 'Sin programa',
          causaNombre: type?.nombre || s.cancellationType || 'No especificada',
          cancelDate: s.cancellationDate || s.fechaCancelacion || 'N/A',
          cancelDescription: s.cancellationDescription || s.motivoCancelacion || 'Sin observación adicional'
        };
      });

      setResults(mappedResults);
      setGeneratedReport({
        filtros: {
          periodo: form.periodo,
          sede: sede?.nombre || form.sedeJornada,
          programa: prog?.nombre || form.programaId
        },
        data: mappedResults
      });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const handleExport = () => {
    if (results.length === 0) return;
    let csv = "Estudiante;Documento;Programa;Causa;Fecha;Descripción\n";
    results.forEach(r => {
      csv += `${r.name || ((r.nombres || '') + ' ' + (r.apellidos || ''))};${r.documento || r.id};${r.programaNombre};${r.causaNombre};${r.cancelDate};${r.cancelDescription}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_cancelados_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>
            Cancelados - Desertores
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            Gestión de retiros estudiantiles y análisis de causas institucionales.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="glass-panel" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '32px', padding: '56px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
          <div style={{ maxWidth: '620px', margin: '0 auto' }}>

            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6', fontWeight: '500' }}>
                Permite observar los estudiantes que han cancelado su matrícula con su respectiva causa y descripción.
              </p>
              <div style={{ width: '60px', height: '4px', background: '#10b981', borderRadius: '2px', margin: '20px auto 0', opacity: 0.3 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Período */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                  <Calendar size={16} color="#94a3b8" />
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}
                    value={form.periodo} onChange={e => handleChange('periodo', e.target.value)}>
                    <option value="Todos">Todos</option>
                    {periods.map((p: any) => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Sede - jornada */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                  <MapPin size={16} color="#94a3b8" />
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Sede - jornada</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}
                    value={form.sedeJornada} onChange={e => handleChange('sedeJornada', e.target.value)}>
                    <option value="Todos">Todos</option>
                    {sedes.map((s: any) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Programa */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                  <BookOpen size={16} color="#94a3b8" />
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Programa</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <select className="input-premium" style={{ width: '100%', height: '48px', appearance: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '600' }}
                    value={form.programaId} onChange={e => handleChange('programaId', e.target.value)}>
                    <option value="Todos">Todos</option>
                    {programs.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}>
              <button onClick={handleCharge} className="btn-premium" disabled={isLoading}
                style={{ background: '#10b981', color: 'white', padding: '16px 48px', fontWeight: '900', borderRadius: '20px', fontSize: '15px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'GENERANDO REPORTE...' : 'CARGAR REPORTE'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div style={{ marginTop: '60px', animation: 'fadeUp 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>Resultados del Reporte</h2>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0', fontWeight: '500' }}>{results.length} registros identificados.</p>
              </div>
              {results.length > 0 && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleExport} className="btn-premium" style={{ border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px' }}>
                    <FileDown size={16} /> CSV
                  </button>
                  <button onClick={() => setGeneratedReport({ ...generatedReport })} className="btn-premium"
                    style={{ background: '#3b82f6', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', border: 'none' }}>
                    Ver PDF
                  </button>
                </div>
              )}
            </div>

            {results.length > 0 ? (
              <div className="glass-panel" style={{ background: 'white', borderRadius: '28px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <th style={{ padding: '20px 28px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>Estudiante / ID</th>
                      <th style={{ padding: '20px 28px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>Programa</th>
                      <th style={{ padding: '20px 28px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>Causa de Retiro</th>
                      <th style={{ padding: '20px 28px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>Detalles / Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="row-hover">
                        <td style={{ padding: '20px 28px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{r.name || `${r.nombres || ''} ${r.apellidos || ''}`}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Doc: {r.documento || r.id}</div>
                        </td>
                        <td style={{ padding: '20px 28px' }}>
                          <div style={{ fontSize: '14px', color: '#334155', fontWeight: '600' }}>{r.programaNombre}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sede: {r.sedeJornada || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '20px 28px' }}>
                          <span style={{ padding: '6px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #fee2e2' }}>
                            <AlertCircle size={12} />
                            {r.causaNombre}
                          </span>
                        </td>
                        <td style={{ padding: '20px 28px' }}>
                          <div style={{ fontSize: '13px', color: '#475569', fontWeight: '500', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.cancelDescription}>
                            {r.cancelDescription}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginTop: '4px' }}>F. Retiro: {r.cancelDate}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '120px 40px', background: 'white', borderRadius: '40px', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <UserX size={40} color="#94a3b8" />
                </div>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '900' }}>Sin registros identificados</h3>
                <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>Ajuste los criterios de Programa o Sede para intentar nuevamente.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Viewer */}
      {generatedReport && results.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: '#525659', zIndex: 9999, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '950px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Visor de Reporte PDF</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Exportar PDF (Imprimir)</button>
              <button onClick={() => setGeneratedReport(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Cerrar Visor</button>
            </div>
          </div>

          <div id="print-area" style={{ background: 'white', width: '100%', maxWidth: '950px', minHeight: '1100px', padding: '60px 70px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', fontFamily: '"Inter", Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '10px' }}>
              <div style={{ flex: '1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px' }}>E</div>
                  <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b', fontWeight: '900' }}>EduNexus</h2>
                </div>
              </div>
              <div style={{ textAlign: 'center', flex: '2' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>CENTRO EDUCATIVO INSTITUCIONAL</p>
                <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '900', color: '#000' }}>CANCELADOS - DESERTORES</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '9px', marginTop: '6px' }}>
                  <span>Código: REP-08</span><span>Versión: 1.0</span><span>Fecha: {new Date().toLocaleDateString('es-CO')}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', flex: '1' }}>Página: 1 de 1</div>
            </div>

            <div style={{ margin: '20px 0 30px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 4px', color: '#1e293b' }}>
                Período: {generatedReport.filtros?.periodo} &nbsp;|&nbsp; Sede: {generatedReport.filtros?.sede} &nbsp;|&nbsp; Programa: {generatedReport.filtros?.programa}
              </h3>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                Total registros: {results.length} estudiante(s) con retiro académico
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '30%' }}>Estudiante</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '22%' }}>Programa</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '20%' }}>Causa de Retiro</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '15%' }}>Fecha Retiro</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '800', width: '13%' }}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      <div style={{ fontWeight: '700', textTransform: 'uppercase' }}>{r.name || `${r.nombres || ''} ${r.apellidos || ''}`}</div>
                      <div style={{ fontSize: '9px', color: '#4b5563' }}>ID: {r.documento || r.id}</div>
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase', fontSize: '9px' }}>{r.programaNombre}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', color: '#dc2626', fontWeight: '700' }}>{r.causaNombre}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{r.cancelDate}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '9px', color: '#4b5563' }}>{r.cancelDescription?.substring(0, 60)}{r.cancelDescription?.length > 60 ? '...' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '50px', fontSize: '9px', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '16px' }}>
              <span>EduNexus Académico</span><span>Emitido por Sistema Central</span>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; box-shadow: none !important; width: 100% !important; } }
        .input-premium { border-radius: 16px; border: 1px solid #e2e8f0; outline: none; padding: 0 20px; font-size: 14px; transition: all 0.2s; }
        .input-premium:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .btn-premium { transition: all 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
        .row-hover:hover { background: #f8fafc; }
      `}} />
    </DashboardLayout>
  );
}
