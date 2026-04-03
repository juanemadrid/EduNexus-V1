'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { FileDown, Search, X, Printer, Users, GraduationCap } from 'lucide-react';
import { db } from '@/lib/db';

export default function EstudiantesMatriculadosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [programs, setPrograms] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  const [form, setForm] = useState({
    periodo: '',
    sedeJornada: 'Todos',
    programaId: 'Todos',
    nivel: 'Todos',
    estado: 'Todos',
    incluirGraduados: false
  });
  const [touched, setTouched] = useState({ periodo: false });

  const [results, setResults] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      db.list<any>('academic_programs'),
      db.list<any>('sedes'),
      db.list<any>('academic_periods'),
    ]).then(([progs, sedesData, peri]) => {
      setPrograms(progs);
      setSedes(sedesData);
      setPeriods(peri);
      if (peri.length > 0) {
        setForm(f => ({ ...f, periodo: peri[0].nombre || peri[0].name || peri[0].id }));
      }
    }).catch(console.error).finally(() => setIsInitialLoading(false));
  }, []);

  const handleCharge = async () => {
    setTouched({ periodo: true });
    if (!form.periodo) return;

    setIsLoading(true);
    setShowReport(false);
    try {
      const students = await db.list<any>('students');

      let filtered = students.filter((s: any) => {
        // Estado: activo = matriculado
        if (form.estado === 'Matriculado' && s.isActive === false) return false;
        if (form.estado === 'Pendiente' && s.isActive !== false) return false;

        // Excluir graduados si no se incluyen
        if (!form.incluirGraduados && s.graduado === true) return false;

        // Programa
        if (form.programaId !== 'Todos') {
          const selectedProg = programs.find(p => p.id === form.programaId);
          const progName = selectedProg?.nombre?.trim()?.toLowerCase();
          
          const matchesId = s.programaId === form.programaId || s.programId === form.programaId || s.details?.programaId === form.programaId;
          
          const studentProgVal = (s.programa || s.program || s.details?.programa || s.details?.program || 'bachillerato académico').toLowerCase();
          const matchesName = progName && studentProgVal.includes(progName.replace(/[áéíóú]/g, (m: string) => "aeiou"["áéíóú".indexOf(m)] || m));
          
          if (!matchesId && !matchesName) return false;
        }

        // Sede
        if (form.sedeJornada !== 'Todos') {
          const selectedSede = sedes.find(se => se.id === form.sedeJornada);
          const sedeName = selectedSede?.nombre?.trim()?.toLowerCase();
          
          const matchesId = s.sedeId === form.sedeJornada || s.sedeJornada === form.sedeJornada || s.sede === form.sedeJornada;
          
          const studentSedeVal = (s.sede || s.sedeJornada || s.details?.sede || 'sede principal').toLowerCase();
          const matchesName = sedeName && studentSedeVal.includes(sedeName.replace(/[áéíóú]/g, (m: string) => "aeiou"["áéíóú".indexOf(m)] || m));
          
          if (!matchesId && !matchesName) return false;
        }

        // Período
        if (form.periodo && form.periodo !== 'Todos') {
            const sPeriodo = s.periodo || s.period || s.details?.periodo || s.details?.period;
            // Si el estudiante no tiene periodo, para no ocultarlo asumimos que es del actual
            if (sPeriodo && sPeriodo !== form.periodo) return false;
        }

        return true;
      });

      // Sort alphabetically
      filtered.sort((a: any, b: any) =>
        (a.name || '').localeCompare(b.name || '')
      );

      setResults(filtered);
      setShowReport(true);
    } catch (err) {
      console.error('Error cargando reporte:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const headers = ['N°', 'Documento', 'Nombre Completo', 'Programa', 'Sede / Jornada', 'Estado', 'Correo'];
    const rows = displayResults.map((s: any, i: number) => [
      i + 1,
      s.documento || s.id,
      s.name || `${s.nombres || ''} ${s.apellidos || ''}`.trim(),
      programs.find(p => p.id === s.programaId || p.id === s.programId)?.nombre || s.programa || '—',
      sedes.find(se => se.id === s.sedeId)?.nombre || s.sedeJornada || '—',
      s.isActive !== false ? 'MATRICULADO' : 'INACTIVO',
      s.correo || s.email || '—'
    ]);
    const ws = XLSX.utils.aoa_to_sheet([
      [`Estudiantes Matriculados — Período: ${form.periodo}`],
      [`Institución: Nueva Esperanza   Fecha: ${new Date().toLocaleDateString('es-CO')}`],
      [],
      headers,
      ...rows
    ]);
    ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 35 }, { wch: 28 }, { wch: 28 }, { wch: 14 }, { wch: 28 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matriculados');
    XLSX.writeFile(wb, `Estudiantes_Matriculados_${form.periodo.replace(/\s/g, '_')}.xlsx`);
  };

  const displayResults = results.filter((s: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) ||
      (s.documento || s.id || '').toLowerCase().includes(q);
  });

  const isInvalid = touched.periodo && !form.periodo;

  return (
    <DashboardLayout>
      {/* Filter Panel */}
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              Estudiantes Matriculados
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite observar un listado detallado de los estudiantes matriculados en la institución.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 200px) 1fr', gap: '18px', alignItems: 'center' }}>

          {/* Sede - Jornada */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155' }}>Sede - jornada</label>
          <div style={{ position: 'relative' }}>
            <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={form.sedeJornada} onChange={e => setForm(f => ({ ...f, sedeJornada: e.target.value }))}>
              <option value="Todos">Todos</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Programa */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155' }}>Programa</label>
          <div style={{ position: 'relative' }}>
            <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={form.programaId} onChange={e => setForm(f => ({ ...f, programaId: e.target.value }))}>
              <option value="Todos">Todos</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {/* Período */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
            Período <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div>
            <select className="input-premium"
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: isInvalid ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
              value={form.periodo}
              onChange={e => { setTouched({ periodo: true }); setForm(f => ({ ...f, periodo: e.target.value })); }}>
              <option value="">Seleccione</option>
              {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
            </select>
            {isInvalid && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>El campo es requerido</div>}
          </div>

          {/* Nivel */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155' }}>Nivel</label>
          <select className="input-premium" style={{ height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
            value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}>
            <option value="Todos">Todos</option>
            <option value="Básica">Básica</option>
            <option value="Media">Media</option>
          </select>

          {/* Estado */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155' }}>Estado</label>
          <select className="input-premium" style={{ height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
            value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
            <option value="Todos">Todos</option>
            <option value="Matriculado">Matriculado</option>
            <option value="Pendiente">Pendiente</option>
          </select>

          {/* Incluir graduados */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155' }}>¿Incluir estudiantes graduados?</label>
          <div onClick={() => setForm(f => ({ ...f, incluirGraduados: !f.incluirGraduados }))}
            style={{ width: '72px', height: '26px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', position: 'relative', cursor: 'pointer', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: form.incluirGraduados ? '#cbd5e1' : '#475569', zIndex: 1 }}>No</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: form.incluirGraduados ? '#10b981' : '#cbd5e1', zIndex: 1 }}>Sí</div>
            <div style={{ position: 'absolute', top: 0, left: form.incluirGraduados ? '50%' : 0, width: '50%', height: '100%', background: 'white', borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s ease' }} />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-premium"
            style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '13px', fontWeight: '800', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none', borderRadius: '12px', boxShadow: '0 4px 14px -3px rgba(16,185,129,0.4)' }}
            onClick={handleCharge} disabled={isLoading}>
            <FileDown size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>
      </div>

      {/* Results Table */}
      {showReport && (
        <div style={{ maxWidth: '1100px', margin: '28px auto 0' }}>

          {/* Results Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                Resultados — {displayResults.length} estudiante{displayResults.length !== 1 ? 's' : ''} encontrado{displayResults.length !== 1 ? 's' : ''}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Período: <strong>{form.periodo}</strong></p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleExportExcel}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 10px -2px rgba(16,185,129,0.35)' }}>
                <FileDown size={15} /> Exportar Excel
              </button>
              <button onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                <Printer size={15} /> Imprimir
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input className="input-premium" placeholder="Buscar por nombre o documento..."
              style={{ paddingLeft: '42px', height: '42px', width: '100%', background: 'white', fontSize: '14px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>}
          </div>

          {/* Table */}
          <div id="print-area" className="glass-panel" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.06)' }}>
            
            {/* Print Header (Only visible in PDF/Print) */}
            <div className="print-header" style={{ padding: '30px 40px 20px', display: 'none', borderBottom: '2px solid #e2e8f0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>EduNexus</h1>
                   <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginTop: '2px', textTransform: 'uppercase' }}>EduNexus Cloud — Innovación Educativa</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Estudiantes Matriculados</h2>
                   <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                     Generado: {new Date().toLocaleDateString('es-CO')}
                   </div>
                 </div>
               </div>
               <div style={{ marginTop: '20px', display: 'flex', gap: '20px', fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '10px 16px', borderRadius: '8px' }}>
                 <span><strong>Período:</strong> {form.periodo}</span>
                 <span><strong>Sede:</strong> {sedes.find(s=>s.id===form.sedeJornada)?.nombre || 'Todas'}</span>
                 <span><strong>Programa:</strong> {programs.find(p=>p.id===form.programaId)?.nombre || 'Todos'}</span>
                 <span><strong>Estado:</strong> {form.estado}</span>
                 <span><strong>Total:</strong> {displayResults.length}</span>
               </div>
            </div>
            {/* Summary bar */}
            <div className="no-print" style={{ padding: '14px 24px', background: '#ecfdf5', borderBottom: '1px solid #d1fae5', display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#065f46' }}>
                <GraduationCap size={16} /> {results.filter(s => s.isActive !== false).length} Matriculados activos
              </div>
              <div style={{ fontSize: '13px', color: '#047857', fontWeight: '600' }}>
                {results.filter(s => s.isActive === false).length} Inactivos
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>N°</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documento</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre completo</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Programa</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Grado</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sede</th>
                  <th style={{ padding: '13px 20px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {displayResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                      No se encontraron estudiantes con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  displayResults.map((s: any, idx: number) => {
                    const prog = programs.find(p => p.id === (s.programaId || s.programId));
                    const sede = sedes.find(se => se.id === s.sedeId);
                    const isActive = s.isActive !== false;
                    const nivelLabels: Record<string, string> = {
                      'párvulos': 'Párvulos', 'prejardín': 'Prejardín', 'jardín': 'Jardín', 'transición': 'Transición',
                      '1': 'Primero (1°)', '2': 'Segundo (2°)', '3': 'Tercero (3°)', '4': 'Cuarto (4°)', '5': 'Quinto (5°)',
                      '6': 'Sexto (6°)', '7': 'Séptimo (7°)', '8': 'Octavo (8°)', '9': 'Noveno (9°)',
                      '10': 'Décimo (10°)', '11': 'Once (11°)'
                    };
                    // s.nivel now stores the full name (e.g. "Octavo (8°)") for students enrolled with the new modal.
                    // For older records it may be a number; use the label map as fallback.
                    const gradoLabel = s.nivel
                      ? (nivelLabels[String(s.nivel)] || s.nivel)
                      : <span style={{ color: '#cbd5e1' }}>—</span>;
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafdf9')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', fontFamily: 'monospace', fontWeight: '600' }}>{s.documento || s.id}</td>
                        <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                          {s.name || `${s.nombres || ''} ${s.apellidos || ''}`.trim()}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                          {prog?.nombre || s.programa || <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                          {gradoLabel}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                          {sede?.nombre || s.sedeJornada || <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.3px',
                            background: isActive ? '#ecfdf5' : '#fef2f2',
                            color: isActive ? '#065f46' : '#dc2626'
                          }}>
                            {isActive ? 'MATRICULADO' : 'INACTIVO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { border-radius: 10px; border: 1px solid #e2e8f0; outline: none; padding: 0 14px; transition: all 0.2s; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .btn-premium { transition: all 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
        
        @media print {
          /* Esconder elementos innecesarios */
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          
          /* Formatear el layout general para que parezca PDF nativo */
          @page { margin: 15mm; size: auto; }
          
          /* Solo mostrar el área a imprimir, reajustando la posición */
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          
          /* Mostrar el encabezado formal */
          .print-header { display: block !important; }
          
          /* Ajustes visuales de la tabla para impresión en blanco y negro (ahorro tinta) */
          table { width: 100% !important; }
          th { background-color: #f1f5f9 !important; color: #334155 !important; border-bottom: 2px solid #cbd5e1 !important; border-top: none !important; padding: 10px !important; }
          td { border-bottom: 1px solid #e2e8f0 !important; padding: 10px !important; }
          
          /* Etiquetas dentro de la tabla */
          span[style*="background: #ecfdf5"] { background: transparent !important; color: #000 !important; border: 1px solid #000 !important; }
          span[style*="background: #fef2f2"] { background: transparent !important; color: #000 !important; border: 1px dashed #000 !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
