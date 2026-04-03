'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileSpreadsheet, ChevronDown, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function InformeRequisitosMatriculaPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [periods, setPeriods] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [studentRequirements, setStudentRequirements] = useState<any[]>([]);

  const [form, setForm] = useState({
    periodo: '',
    sedeJornada: 'Todos',
    programaId: 'Todos',
    estado: 'Todos'
  });

  const [touched, setTouched] = useState({ periodo: false });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [perData, sedesData, progsData, reqsData, studsData, stuReqsData] = await Promise.all([
          db.list<any>('academic_periods'),
          db.list<any>('sedes'),
          db.list<any>('academic_programs'),
          db.list<any>('enrollment_requirements'),
          db.list<any>('students'),
          db.list<any>('student_requirements')
        ]);
        setPeriods(perData);
        setSedes(sedesData);
        setPrograms(progsData);
        setRequirements(reqsData);
        setAllStudents(studsData);
        setStudentRequirements(stuReqsData || []);
        if (perData.length > 0) {
          setForm(p => ({ ...p, periodo: perData[0].nombre || perData[0].name || perData[0].id }));
        }
      } catch (error) {
        console.error("Error loading enrollment requirements data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    setTouched({ periodo: true });
    if (!form.periodo) return;

    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');

      const filteredStudents = allStudents.filter(s =>
        (form.sedeJornada === 'Todos' || s.sedeJornada === form.sedeJornada || s.sedeId === form.sedeJornada) &&
        (form.programaId === 'Todos' || s.programaId === form.programaId)
      );

      const activeReqs = requirements.filter(r => r.estado === 'Activo' || !r.estado);

      const rows: any[] = [];
      filteredStudents.forEach(student => {
        activeReqs.forEach(req => {
          const fulfillment = studentRequirements.find(
            sr => sr.studentId === student.id && sr.requirementId === req.id
          );
          const status = fulfillment
            ? (fulfillment.status || 'Entregado')
            : 'Faltante';

          if (form.estado !== 'Todos' && status !== form.estado) return;

          rows.push([
            student.name || `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
            student.documento || student.id,
            student.details?.programa || student.programa || '—',
            req.nombre || req.name || '—',
            status,
            fulfillment?.date ? new Date(fulfillment.date).toLocaleDateString() : 'N/A'
          ]);
        });
      });

      const headers = ['Estudiante', 'Documento', 'Programa', 'Requisito', 'Estado', 'Fecha Entrega'];
      const ws = XLSX.utils.aoa_to_sheet([
        [`Requisitos de Matrícula — Período: ${form.periodo}`],
        [],
        headers,
        ...rows
      ]);
      ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 16 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Requisitos');
      XLSX.writeFile(wb, `Requisitos_Matricula_${form.periodo.replace(/\s/g, '_')}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const isPeriodicInvalid = touched.periodo && !form.periodo;

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
            Requisitos de Matrícula
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5', maxWidth: '500px' }}>
            Permite exportar a Excel un reporte por programa de los requisitos de matrícula de cada estudiante con su respectivo estado.
          </p>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 160px) 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Período */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Período <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div>
            <div style={{ position: 'relative' }}>
              <select
                className="input-premium"
                style={{
                  width: '100%', height: '42px', fontSize: '14px', background: '#fff',
                  border: isPeriodicInvalid ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer',
                  color: form.periodo ? '#1e293b' : '#94a3b8'
                }}
                value={form.periodo}
                onChange={e => { setTouched({ periodo: true }); handleChange('periodo', e.target.value); }}
              >
                <option value="">Seleccione</option>
                {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
            {isPeriodicInvalid && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El período es obligatorio</div>}
          </div>

          {/* Sede - Jornada */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Sede - jornada
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input-premium"
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
              value={form.sedeJornada}
              onChange={e => handleChange('sedeJornada', e.target.value)}
            >
              <option value="Todos">Todos</option>
              {sedes.map(s => (s.jornadas || []).map((j: any) => (
                <option key={`${s.id}::${j.id}`} value={`${s.id}::${j.id}`}>{s.nombre} - {j.nombre}</option>
              )))}
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
              onChange={e => handleChange('programaId', e.target.value)}
            >
              <option value="Todos">Todos</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          {/* Estado */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Estado
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input-premium"
              style={{ width: '100%', height: '42px', fontSize: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
              value={form.estado}
              onChange={e => handleChange('estado', e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Entregado">Entregado</option>
              <option value="Faltante">Faltante</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

        </div>

        {/* Divider + Export Button (matching Q10 style) */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-premium"
            onClick={handleExport}
            disabled={isExporting || isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#10b981', color: 'white',
              padding: '10px 24px', fontSize: '14px', fontWeight: '700',
              borderRadius: '8px', border: 'none', cursor: isExporting ? 'wait' : 'pointer',
              opacity: isExporting || isLoading ? 0.7 : 1,
              boxShadow: '0 4px 14px -3px rgba(16, 185, 129, 0.4)'
            }}
          >
            <FileSpreadsheet size={18} />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>

        {/* Info note */}
        <div style={{ marginTop: '20px', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Info size={16} style={{ color: '#64748b', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
            Los datos se extraen de la gestión de requisitos registrada por estudiante. Configure los requisitos en el módulo de Estructuración antes de generar el informe.
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
