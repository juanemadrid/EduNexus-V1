'use client';
import DashboardLayout from '@/components/DashboardLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { FileSpreadsheet, ChevronDown, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function SeguimientosEgresadosPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [usuarios, setUsuarios] = useState<any[]>([]);

  const [form, setForm] = useState({
    fechaRango: 'Hoy',
    usuarioId: 'Todos'
  });

  const [touched, setTouched] = useState({ fechaRango: false });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load users who have registered follow-ups
        const [followups, graduates] = await Promise.all([
          db.list<any>('graduate_followups').catch(() => []),
          db.list<any>('graduates').catch(() => [])
        ]);

        // Build unique user list from follow-up registrars
        const userMap: Record<string, string> = {};
        followups.forEach((f: any) => {
          if (f.registradoPor || f.userId) {
            const key = f.userId || f.registradoPor;
            userMap[key] = f.registradoPorNombre || f.userName || key;
          }
        });
        graduates.forEach((g: any) => {
          if (g.registradoPor || g.userId) {
            const key = g.userId || g.registradoPor;
            userMap[key] = g.registradoPorNombre || g.userName || key;
          }
        });

        setUsuarios(Object.entries(userMap).map(([id, nombre]) => ({ id, nombre })));
      } catch (error) {
        console.error('Error loading seguimientos data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    setTouched({ fechaRango: true });
    if (!form.fechaRango) return;

    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');

      const [followups, graduates] = await Promise.all([
        db.list<any>('graduate_followups').catch(() => []),
        db.list<any>('graduates').catch(() => [])
      ]);

      // Filter by user if specified
      let filteredFollowups = followups;
      if (form.usuarioId !== 'Todos') {
        filteredFollowups = followups.filter(
          (f: any) => f.userId === form.usuarioId || f.registradoPor === form.usuarioId
        );
      }

      // Build rows — join follow-ups with graduate data
      const rows = filteredFollowups.map((f: any) => {
        const grad = graduates.find((g: any) => g.id === f.graduateId || g.studentId === f.studentId);
        return [
          f.fecha ? new Date(f.fecha).toLocaleDateString('es-CO') : (f.createdAt ? new Date(f.createdAt).toLocaleDateString('es-CO') : 'N/A'),
          f.studentName || grad?.name || grad?.nombre || f.graduateId || '—',
          f.documento || grad?.documento || '—',
          f.tipo || f.tipoSeguimiento || '—',
          f.observacion || f.descripcion || f.notas || '—',
          f.registradoPorNombre || f.userName || '—',
          f.empresa || grad?.empresa || '—',
          f.cargo || grad?.cargo || '—'
        ];
      });

      const headers = ['Fecha', 'Egresado', 'Documento', 'Tipo Seguimiento', 'Observaciones', 'Registrado Por', 'Empresa', 'Cargo'];

      const ws = XLSX.utils.aoa_to_sheet([
        ['Seguimientos Egresados — EduNexus'],
        [`Usuario: ${form.usuarioId === 'Todos' ? 'Todos' : usuarios.find(u => u.id === form.usuarioId)?.nombre || form.usuarioId} | Fecha filtro: ${form.fechaRango}`],
        [],
        headers,
        ...rows
      ]);

      ws['!cols'] = [
        { wch: 14 }, { wch: 30 }, { wch: 14 }, { wch: 18 },
        { wch: 50 }, { wch: 20 }, { wch: 25 }, { wch: 20 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Seguimientos');
      XLSX.writeFile(wb, `Seguimientos_Egresados_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting seguimientos:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isFechaInvalid = touched.fechaRango && !form.fechaRango;

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
            Seguimientos egresados
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
            Exporta la bitácora de seguimiento profesional y académico de los egresados de la institución.
          </p>
        </div>

        {/* Form Fields — Q10-aligned layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 140px) 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Fechas */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Fechas <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div>
            <DateRangePicker
              value={form.fechaRango}
              onChange={(val) => { setTouched({ fechaRango: true }); setForm(p => ({ ...p, fechaRango: val })); }}
            />
            {isFechaInvalid && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>El rango de fechas es obligatorio</div>}
          </div>

          {/* Usuario */}
          <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#334155', paddingTop: '11px' }}>
            Usuario
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input-premium"
              style={{
                width: '100%', height: '42px', fontSize: '14px', background: '#fff',
                border: '1px solid #d1d5db', borderRadius: '8px',
                paddingRight: '36px', appearance: 'none', cursor: 'pointer'
              }}
              value={form.usuarioId}
              onChange={e => setForm(p => ({ ...p, usuarioId: e.target.value }))}
            >
              <option value="Todos">Todos</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

        </div>

        {/* Export Button */}
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
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>

        {/* Info note */}
        <div style={{ marginTop: '20px', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Info size={16} style={{ color: '#64748b', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
            Los seguimientos se registran en <strong>Institucional › Egresados</strong>. El reporte incluyó los campos: fecha, nombre, tipo de seguimiento, empresa, cargo y observaciones.
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
