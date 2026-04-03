'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, ChevronDown, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function EstudiantesCanceladosPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  const [form, setForm] = useState({
    sedeJornada: 'Todos',
    programaId: 'Todos',
    fechaRango: 'Este mes'
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [sedesData, programsData] = await Promise.all([
          db.list<any>('sedes'),
          db.list<any>('academic_programs')
        ]);
        setSedes(sedesData);
        setPrograms(programsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');

      // Fetch cancelled students from the correct collection
      const allStudents = await db.list<any>('registered_students');

      // Filter: inactive students not graduated
      let cancelled = allStudents.filter(s =>
        s.isActive === false || s.status === 'cancelled' || s.estado === 'Cancelado'
      );

      // Apply sede filter
      if (form.sedeJornada !== 'Todos') {
        cancelled = cancelled.filter(s =>
          s.sedeId === form.sedeJornada ||
          s.sede === form.sedeJornada ||
          s.sedeJornada === form.sedeJornada
        );
      }

      // Apply program filter
      if (form.programaId !== 'Todos') {
        cancelled = cancelled.filter(s =>
          s.programaId === form.programaId ||
          s.details?.programa === form.programaId ||
          s.programa === form.programaId
        );
      }

      // Also try cancellations collection for extra metadata
      const cancellations = await db.list<any>('student_cancellations').catch(() => []);

      const headers = [
        'Documento', 'Nombre Estudiante', 'Programa', 'Sede - Jornada',
        'Fecha Cancelación', 'Motivo', 'Observaciones'
      ];

      const rows = cancelled.map(s => {
        const meta = cancellations.find((c: any) => c.studentId === s.id || c.documento === s.documento);
        const programa = programs.find(p =>
          p.id === s.programaId || p.id === s.details?.programaId
        )?.nombre || s.details?.programa || s.programa || '—';
        const sede = sedes.find(sd => sd.id === s.sedeId)?.nombre || s.sede || '—';

        return [
          s.documento || s.id,
          s.name || `${s.nombres || ''} ${s.apellidos || ''}`.trim(),
          programa,
          sede,
          meta?.fecha || s.fechaCancelacion || s.cancellationDate || '—',
          meta?.motivo || s.motivoCancelacion || s.cancellationReason || '—',
          meta?.observaciones || s.observaciones || '—'
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([
        ['Estudiantes Cancelados — EduNexus'],
        [`Sede: ${form.sedeJornada} | Programa: ${form.programaId} | Fechas: ${form.fechaRango}`],
        [`Total registros: ${rows.length}`],
        [],
        headers,
        ...rows
      ]);

      ws['!cols'] = [
        { wch: 14 }, { wch: 30 }, { wch: 28 }, { wch: 20 },
        { wch: 16 }, { wch: 25 }, { wch: 35 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cancelados');
      XLSX.writeFile(wb, `Estudiantes_Cancelados_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting estudiantes cancelados:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{
        maxWidth: '680px',
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
            Estudiantes cancelados
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
            Permite exportar a un archivo de Excel la información de los estudiantes cancelados.
          </p>
        </div>

        {/* Form — Q10 layout: label right / field right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 150px) 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Sede - jornada */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Sede - jornada
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input-premium"
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
              value={form.sedeJornada}
              onChange={e => setForm(p => ({ ...p, sedeJornada: e.target.value }))}
              disabled={isLoading}
            >
              <option value="Todos">Todos</option>
              {sedes.map(s => (
                (s.jornadas || []).length > 0
                  ? (s.jornadas || []).map((j: any) => (
                    <option key={`${s.id}::${j.id}`} value={`${s.id}::${j.id}`}>{s.nombre} - {j.nombre}</option>
                  ))
                  : <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {/* Programa */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Programa
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input-premium"
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
              value={form.programaId}
              onChange={e => setForm(p => ({ ...p, programaId: e.target.value }))}
              disabled={isLoading}
            >
              <option value="Todos">Todos</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {/* Fechas */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Fechas
          </label>
          <DateRangePicker
            value={form.fechaRango}
            onChange={val => setForm(p => ({ ...p, fechaRango: val }))}
          />

        </div>

        {/* Export Button (Q10-style: right-aligned, "Exportar reporte") */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-premium"
            onClick={handleExport}
            disabled={isExporting || isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#10b981', color: 'white',
              padding: '10px 24px', fontSize: '14px', fontWeight: '700',
              borderRadius: '8px', border: 'none',
              cursor: isExporting || isLoading ? 'wait' : 'pointer',
              opacity: isExporting ? 0.7 : 1,
              boxShadow: '0 4px 14px -3px rgba(16,185,129,0.4)'
            }}
          >
            <FileSpreadsheet size={18} />
            {isExporting ? 'Exportando...' : 'Exportar reporte'}
          </button>
        </div>

        {/* Info note */}
        <div style={{ marginTop: '20px', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Info size={16} style={{ color: '#64748b', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
            Incluye estudiantes con estado <strong>Cancelado</strong> o <strong>Inactivo</strong>. El Excel contiene: documento, nombre, programa, sede, fecha de cancelación, motivo y observaciones.
          </p>
        </div>
      </div>

      <style jsx global>{`
        .input-premium { outline: none; padding-left: 12px; }
        .input-premium:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .btn-premium { transition: all 0.2s; }
        .btn-premium:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
      `}</style>
    </DashboardLayout>
  );
}
