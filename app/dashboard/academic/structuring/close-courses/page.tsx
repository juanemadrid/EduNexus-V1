'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function CloseCoursesPage() {
  // --- Data from Firestore ---
  const [sedes, setSedes] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allPeriods, setAllPeriods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filter state ---
  const [sedeJornada, setSedeJornada] = useState('');
  const [programa, setPrograma] = useState('');
  const [pensum, setPensum] = useState('Todos');
  const [asignatura, setAsignatura] = useState('Todos');
  const [periodo, setPeriodo] = useState('Todos');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [sedesData, programsData, subjectsData, periodsData] = await Promise.all([
          db.list<any>('sedes'),
          db.list<any>('academic_programs'),
          db.list<any>('academic_subjects'),
          db.list<any>('academic_periods'),
        ]);
        setSedes(sedesData);
        setAllPrograms(programsData);
        setAllSubjects(subjectsData);
        setAllPeriods(periodsData);
      } catch (error) {
        console.error('Error loading close-courses data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Build Sede-Jornada options (same structure as cursos page)
  const sedeJornadaOptions: { label: string; value: string; programas: any[] }[] = [];
  sedes.forEach(s => {
    (s.jornadas || []).forEach((j: any) => {
      if (s.estado !== 'Inactiva' && j.estado !== 'Inactiva') {
        sedeJornadaOptions.push({
          label: `${s.nombre} - ${j.nombre}`,
          value: `${s.id}::${j.id}`,
          programas: j.programas || []
        });
      }
    });
  });

  // Programas for selected sede-jornada
  // If the jornada has assigned programs, show those; otherwise show ALL programs
  const selectedOpt = sedeJornadaOptions.find(o => o.value === sedeJornada);
  const programasOptions: any[] = selectedOpt
    ? (selectedOpt.programas.length > 0
        ? selectedOpt.programas.map((p: any) => allPrograms.find(ap => ap.id === p.id) || p).filter(Boolean)
        : allPrograms)
    : allPrograms;

  // Pénsum subjects: from selected program's pensumSubjects, or all subjects as fallback
  const selectedProgram = allPrograms.find(p => p.id === programa);
  const pensumSubjects: any[] = selectedProgram?.pensumSubjects?.length > 0
    ? selectedProgram.pensumSubjects
    : allSubjects;

  // Periods sorted desc by name
  const periodOptions = [...allPeriods].sort((a, b) => {
    const aStr = a.name || a.nombre || '';
    const bStr = b.name || b.nombre || '';
    return bStr.localeCompare(aStr);
  });

  const hasSelection = sedeJornada && asignatura !== 'Todos';

  return (
    <DashboardLayout>
      {/* Filtros */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '16px', marginBottom: '24px', alignItems: 'end' }}>

        {/* Sede-Jornada */}
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Sede - jornada</label>
          <select
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={sedeJornada}
            onChange={e => { setSedeJornada(e.target.value); setPrograma(''); setPensum('Todos'); setAsignatura('Todos'); }}
            disabled={isLoading}
          >
            <option value="">{isLoading ? 'Cargando...' : 'Seleccione'}</option>
            {sedeJornadaOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Programa */}
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Programa</label>
          <select
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={programa}
            onChange={e => { setPrograma(e.target.value); setPensum('Todos'); setAsignatura('Todos'); }}
            disabled={isLoading}
          >
            <option value="">Seleccione</option>
            {programasOptions.map((p: any) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Pénsum */}
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Pénsum</label>
          <select
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={pensum}
            onChange={e => setPensum(e.target.value)}
            disabled={isLoading || !programa}
          >
            <option value="Todos">Todos</option>
            {selectedProgram?.pensum && (
              <option value={selectedProgram.pensum}>{selectedProgram.pensum}</option>
            )}
          </select>
        </div>

        {/* Asignatura */}
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Asignatura</label>
          <select
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={asignatura}
            onChange={e => setAsignatura(e.target.value)}
            disabled={isLoading}
          >
            <option value="Todos">Todos</option>
            {pensumSubjects.map((s: any) => (
              <option key={s.id || s.subjectId} value={s.id || s.subjectId}>{s.nombre}</option>
            ))}
          </select>
        </div>

        {/* Período */}
        <div style={{ minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Periodo</label>
          <select
            className="input-premium"
            style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 10px', background: 'white', outline: 'none', color: '#374151' }}
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            disabled={isLoading}
          >
            <option value="Todos">Todos</option>
            {periodOptions.map(p => {
              const label = p.name || p.nombre || p.id;
              return <option key={p.id} value={p.id}>{label}</option>;
            })}
          </select>
        </div>

      </div>

      {/* Mensaje / resultado */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '16px 20px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
          {isLoading
            ? 'Cargando datos...'
            : !hasSelection
            ? 'Por favor seleccione una Asignatura'
            : 'No hay cursos disponibles para cerrar con los filtros seleccionados.'
          }
        </p>
      </div>
    </DashboardLayout>
  );
}
