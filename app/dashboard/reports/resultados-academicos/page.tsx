'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown, ChevronDown, Info, Calculator, FileSpreadsheet, FileText } from 'lucide-react';
import { db } from '@/lib/db';

export default function ResultadosAcademicosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allGrades, setAllGrades] = useState<any[]>([]);
  const [allEvalParams, setAllEvalParams] = useState<any[]>([]);
  const [allCursos, setAllCursos] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allSedes, setAllSedes] = useState<any[]>([]);
  const [allLevels, setAllLevels] = useState<any[]>([]);
  const [allPeriods, setAllPeriods] = useState<any[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [form, setForm] = useState({ 
    filtro: 'Período',
    sedeJornada: 'Todos', 
    programaId: 'Todos', 
    nivel: 'Todos', 
    periodo: '',
    fechaRango: 'Este mes',
    tipoInforme: 'Básico'
  });

  const [touched, setTouched] = useState({ 
    sedeJornada: false, 
    programaId: false, 
    nivel: false, 
    periodo: false
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        const [programsData, sedesData, perData, cData, epData, stData, grData, levelsData] = await Promise.all([
          db.list<any>('academic_programs'),
          db.list<any>('sedes'),
          db.list<any>('academic_periods'),
          db.list<any>('cursos'),
          db.list<any>('eval_params'),
          db.list<any>('students'),
          db.list<any>('academic_grades'),
          db.list<any>('levels').catch(() => [])
        ]);
        setAllPrograms(programsData);
        setAllSedes(sedesData);
        setAllPeriods(perData);
        setAllCursos(cData);
        setAllEvalParams(epData);
        setAllStudents(stData);
        setAllGrades(grData);
        setAllLevels(levelsData);

        if (perData.length > 0) {
          setForm(p => ({ ...p, periodo: perData[0].id }));
        }
      } catch (error) {
        console.error("Error loading academic results data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleCharge = async () => {
    setTouched({ 
      sedeJornada: true, 
      programaId: true, 
      nivel: true, 
      periodo: true
    });
    
    if (form.filtro === 'Período' && !form.periodo) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      // 1. Filter students
      let matchingStudents = allStudents.filter(s => s.isActive !== false);

      if (form.sedeJornada !== 'Todos') {
        matchingStudents = matchingStudents.filter(s => 
          s.sedeId === form.sedeJornada || s.sede === form.sedeJornada
        );
      }

      if (form.programaId !== 'Todos') {
        matchingStudents = matchingStudents.filter(s => 
          s.programaId === form.programaId || s.details?.programaId === form.programaId
        );
      }

      if (form.nivel !== 'Todos') {
        matchingStudents = matchingStudents.filter(s => 
          s.nivel === form.nivel || s.details?.nivel === form.nivel
        );
      }

      // 2. Calculate average
      const calculatedResults = matchingStudents.map(student => {
        const studentGrades = allGrades.filter(g => g.studentId === student.id);
        
        let totalSum = 0;
        let count = 0;

        studentGrades.forEach(gradeDoc => {
          // gradeDoc has a 'grades' object where keys are subject IDs or course IDs
          // Logic depends on how academic_grades is stored. 
          // Assuming it's studentId + grades map
          if (gradeDoc.average) {
            totalSum += parseFloat(gradeDoc.average);
            count++;
          } else if (gradeDoc.grades) {
             Object.values(gradeDoc.grades).forEach((val: any) => {
                if (typeof val === 'number') {
                  totalSum += val;
                  count++;
                } else if (val.definitiva) {
                  totalSum += val.definitiva;
                  count++;
                }
             });
          }
        });

        const avg = count > 0 ? (totalSum / count).toFixed(2) : "0.00";

        return {
          id: student.id,
          name: student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
          documento: student.documento || student.id,
          programa: allPrograms.find(p => p.id === student.programaId)?.nombre || student.programa || '—',
          nivel: student.nivel || '—',
          promedio: avg,
          status: parseFloat(avg) >= 3.0 ? 'Aprobado' : 'Reprobado'
        };
      });

      setResults(calculatedResults);
    } catch (error) {
       console.error("Error charging academic results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) {
      await handleCharge();
    }
    setIsGenerating(true);
    try {
      const XLSX = await import('xlsx');
      const headers = ['Documento', 'Estudiante', 'Programa', 'Nivel', 'Promedio', 'Estado'];
      const rows = results.map(r => [r.documento, r.name, r.programa, r.nivel, r.promedio, r.status]);

      const ws = XLSX.utils.aoa_to_sheet([
        ['Resultados Académicos — EduNexus'],
        [`Período: ${form.periodo} | Sede: ${form.sedeJornada}`],
        [`Total registros: ${rows.length}`],
        [],
        headers,
        ...rows
      ]);

      ws['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
      XLSX.writeFile(wb, `Resultados_Academicos_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
       console.error("Error exporting academic results:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: 'white',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '36px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
            Resultados académicos
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
            Permite generar un boletín de las notas obtenidas por cada estudiante.
          </p>
        </div>

        {/* Form — Q10 layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 150px) 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Filtrar por */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Filtrar por
          </label>
          <div style={{ position: 'relative' }}>
             <select 
               className="input-premium" 
               style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
               value={form.filtro}
               onChange={e => handleChange('filtro', e.target.value)}
             >
               <option value="Período">Período</option>
               <option value="Fechas">Fechas</option>
             </select>
             <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {form.filtro === 'Período' ? (
            <>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
                Período <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="input-premium" 
                  style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: (touched.periodo && !form.periodo) ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }} 
                  value={form.periodo} 
                  onChange={e => { setTouched(p => ({...p, periodo: true})); handleChange('periodo', e.target.value); }}
                >
                  <option value="">Seleccione</option>
                  {allPeriods.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.anio ? `(${p.anio})` : ''}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </>
          ) : (
            <>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
                Fechas <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <DateRangePicker 
                value={form.fechaRango} 
                onChange={(val) => handleChange('fechaRango', val)} 
              />
            </>
          )}

          {/* Sede - jornada */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Sede - jornada <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }} 
              value={form.sedeJornada} 
              onChange={e => handleChange('sedeJornada', e.target.value)}
            >
              <option value="Todos">Todos</option>
              {allSedes.map(s => (s.jornadas || []).map((j: any) => (
                <option key={`${s.id}::${j.id}`} value={`${s.id}::${j.id}`}>{s.nombre} - {j.nombre}</option>
              )))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {/* Programa */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Programa <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }} 
              value={form.programaId} 
              onChange={e => handleChange('programaId', e.target.value)}
            >
              <option value="Todos">Todos</option>
              {allPrograms.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {/* Nivel */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Nivel <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select 
              className="input-premium" 
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }} 
              value={form.nivel} 
              onChange={e => handleChange('nivel', e.target.value)}
            >
              <option value="Todos">Todos</option>
              {allLevels.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {/* Tipo informe */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Tipo informe
          </label>
          <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '10px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
              <input type="radio" value="Básico" checked={form.tipoInforme === 'Básico'} onChange={() => handleChange('tipoInforme', 'Básico')} style={{ accentColor: '#10b981' }} />
              Básico
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
              <input type="radio" value="Detallado" checked={form.tipoInforme === 'Detallado'} onChange={() => handleChange('tipoInforme', 'Detallado')} style={{ accentColor: '#10b981' }} />
              Detallado
            </label>
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            className="btn-premium"
            onClick={handleExport}
            disabled={isGenerating || isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'white', color: '#475569',
              padding: '10px 20px', fontSize: '14px', fontWeight: '700',
              borderRadius: '8px', border: '1px solid #e2e8f0',
              cursor: isGenerating ? 'wait' : 'pointer'
            }}
          >
            <FileSpreadsheet size={18} color="#10b981" />
            Excel
          </button>
          <button
            className="btn-premium"
            onClick={handleCharge}
            disabled={isLoading || isGenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#10b981', color: 'white',
              padding: '10px 24px', fontSize: '14px', fontWeight: '700',
              borderRadius: '8px', border: 'none',
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px -3px rgba(16,185,129,0.4)'
            }}
          >
            <FileText size={18} />
            {isLoading ? 'Cargando...' : 'Cargar reporte'}
          </button>
        </div>

        <div style={{ marginTop: '20px', background: '#f0f9ff', padding: '14px 18px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start', border: '1px solid #e0f2fe' }}>
          <Info size={16} style={{ color: '#0284c7', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
            Los boletines se generan en base a las calificaciones definitivas registradas en el período seleccionado.
          </p>
        </div>
      </div>

      {/* Results Table */}
      {hasSearched && (
        <div style={{ maxWidth: '1000px', margin: '40px auto', paddingBottom: '60px' }}>
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                Resultados Académicos — {results.length} registros
              </h3>
            </div>

            {results.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Estudiante', 'Programa', 'Nivel', 'Promedio', 'Estado'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr key={`${r.id}-${idx}`} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{r.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Doc: {r.documento}</div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{r.programa}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{r.nivel}</td>
                        <td style={{ padding: '16px 24px', fontSize: '15px', color: '#1e293b', fontWeight: '900' }}>{r.promedio}</td>
                        <td style={{ padding: '16px 24px' }}>
                           <span style={{ 
                             background: r.status === 'Aprobado' ? '#ecfdf5' : '#fef2f2', 
                             color: r.status === 'Aprobado' ? '#059669' : '#dc2626', 
                             padding: '4px 12px', 
                             borderRadius: '20px', 
                             fontSize: '11px', 
                             fontWeight: '800' 
                           }}>{r.status.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
               <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <Calculator size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: '700' }}>No se encontraron resultados para los filtros aplicados.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { outline: none; padding-left: 12px; transition: 0.2s; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
      `}</style>
    </DashboardLayout>
  );
}
