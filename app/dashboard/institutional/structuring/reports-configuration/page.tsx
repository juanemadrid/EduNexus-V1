'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { 
  Search, 
  FileText, 
  Settings2, 
  Edit, 
  X,
  CheckCircle,
  Hash,
  Calendar,
  Layers,
  FileCode,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

interface CustomReport {
  id: string;
  originalName: string;
  customTitle: string;
  code: string;
  version: string;
  paperType: string;
  date: string;
}

const REPORT_NAMES = [
  "academic-records", "actividades-por-oportunidades-crm", "administrativos", "anulaciones-y-devoluciones", 
  "asignacion-academica-docentes", "asistencia-inasistencia-detallada-por-estudiante-asignaturas-individuales", 
  "cancelados-desertores", "cartera-general", "cartera-pagos", 
  "consolidado-de-asistencias-asignaturas-individuales", "consolidado-de-inasistencias", 
  "consolidado-de-matriculados-por-semestre", "consolidado-de-notas", "consolidado-de-pensum", 
  "contactos-por-oportunidad", "cuadre-caja-por-producto", "cuadre-de-caja-por-cajero", 
  "descuentos", "diseno-curricular", "docentes", "docentes-pendientes-por-evaluar", 
  "egresados-graduados", "egresos", "estadistica-de-matriculas", "estudiantes", 
  "estudiantes-asignaturas-canceladas", "estudiantes-asignaturas-reprobadas", "estudiantes-cancelados", 
  "estudiantes-cancelados-por-inasistencia", "estudiantes-con-dificultades", "estudiantes-matriculados", 
  "estudiantes-nuevos-en-la-institucion", "estudiantes-por-cursos", "estudiantes-por-estado-financiero", 
  "familiares-codeudores-estudiantes", "fichas-de-matriculas", "gestion-operadores-crm", 
  "habilitaciones", "historico-de-notas", "historico-inasistencias", "homologaciones", 
  "inasistencias-por-curso", "informe-paz-y-salvo-establecidos", "informe-preguntas-personalizadas", 
  "informe-requisitos-de-matricula", "informes-snies", "ingresos", "ingresos-basicos", 
  "ingresos-consolidados", "ingresos-detallados-por-formas", "ingresos-detallados-por-producto", 
  "inscritos-aun-no-matriculados", "listado-de-cursos", "listado-de-matriculas", "listado-observador", 
  "notas-credito", "notas-credito-aplicadas", "observador", "oportunidades-comerciales-crm", 
  "permisos-asignados-a-perfiles", "permisos-usuarios-administrativos", "planilla", 
  "preinscritos", "proyeccion-de-recaudo", "resultados-academicos", "seguimientos-egresados", 
  "ventas-por-vendedor-crm"
];

const INITIAL_REPORTS: CustomReport[] = REPORT_NAMES.map((name, index) => ({
  id: (index + 1).toString(),
  originalName: name.toUpperCase().replace(/-/g, ' '),
  customTitle: name.toUpperCase().replace(/-/g, ' '),
  code: '01',
  version: '1.0',
  paperType: 'Carta',
  date: '02/04/2026'
}));

export default function ReportsConfigurationPage() {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [success, setSuccess] = useState(false);

  const loadReports = async () => {
    setIsInitialLoading(true);
    try {
      const data = await db.list<CustomReport>('reports_config');
      // If we have very few reports saved, use the full list of real files
      if (data.length < 5) {
        setReports(INITIAL_REPORTS);
      } else {
        // Merge saved data with INITIAL_REPORTS to ensure all real files are listed
        const merged = [...INITIAL_REPORTS];
        data.forEach(dbItem => {
          const idx = merged.findIndex(i => i.originalName === dbItem.originalName);
          if (idx !== -1) merged[idx] = dbItem;
        });
        setReports(merged);
      }
    } catch (error) {
       console.error("Error loading reports config:", error);
       setReports(INITIAL_REPORTS);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdate = async () => {
    if (!editingReport) return;
    setIsLoading(true);
    try {
      // Logic for saving: if id starts with INITIAL number (1-67), it might not exist in DB yet
      // Check if it exists or use originalName as key? Let's use db.update/create
      const results = await db.list<CustomReport>('reports_config');
      const existing = results.find(r => r.originalName === editingReport.originalName);
      
      if (existing) {
        await db.update('reports_config', existing.id, editingReport);
      } else {
        await db.create('reports_config', { ...editingReport, id: crypto.randomUUID() });
      }

      setReports(reports.map(r => r.originalName === editingReport.originalName ? editingReport : r));
      setSuccess(true);
      setTimeout(() => {
        setEditingReport(null);
        setSuccess(false);
      }, 1500);
    } catch (error) {
       console.error("Error updating report config:", error);
       alert("Error al actualizar la configuración.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = reports.filter(r => 
    r.originalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.customTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_estru_perf">
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Reportes Personalizados</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Personalización de títulos, versiones y formatos de impresión institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{reports.length} reportes reales detectados</span>
          </p>
        </div>

        {/* Search */}
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar entre los 67 reportes del sistema..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '52px', fontSize: '15px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 10 }}>
                  {['Nombre original del sistema', 'Título personalizado institucional', 'Código', 'Versión', 'Papel', 'Fecha', 'Acciones'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 6 ? 'right' : 'left', padding: '16px 32px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '0.5px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isInitialLoading ? (
                  <tr><td colSpan={7} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>Sincronizando reportes institucionales...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>No se encontraron reportes.</td></tr>
                ) : filtered.map((r, idx) => (
                  <tr key={r.originalName + idx} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                    <td style={{ padding: '16px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <FileText size={16} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                         <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '500' }}>{r.originalName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 32px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>{r.customTitle}</span>
                    </td>
                    <td style={{ padding: '16px 32px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>{r.code}</span>
                    </td>
                    <td style={{ padding: '16px 32px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>{r.version || '-'}</span>
                    </td>
                    <td style={{ padding: '16px 32px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>{r.paperType}</span>
                    </td>
                    <td style={{ padding: '16px 32px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '500' }}>{r.date}</span>
                    </td>
                    <td style={{ padding: '16px 32px', textAlign: 'right' }}>
                       <button 
                         onClick={() => setEditingReport(r)}
                         style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '6px', borderRadius: '8px' }} 
                         className="btn-icon-hover"
                       >
                         <Edit size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {editingReport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ background: 'rgb(34, 197, 94)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Editar reporte institutional</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '12px', fontWeight: '500' }}>{editingReport.originalName}</p>
                </div>
                <button onClick={() => setEditingReport(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '32px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                     <div style={{ width: '56px', height: '56px', background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={32} />
                     </div>
                     <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>¡Reporte Actualizado!</h3>
                     <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Los cambios se aplicarán a todos los impresos institucionales.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Título personalizado institucional</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }}
                        value={editingReport.customTitle}
                        onChange={e => setEditingReport({...editingReport, customTitle: e.target.value.toUpperCase()})}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Código de Calidad</label>
                        <input 
                          className="input-premium" 
                          style={{ width: '100%', height: '48px' }}
                          value={editingReport.code}
                          onChange={e => setEditingReport({...editingReport, code: e.target.value})}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Versión del Formato</label>
                        <input 
                          className="input-premium" 
                          style={{ width: '100%', height: '48px' }}
                          value={editingReport.version}
                          onChange={e => setEditingReport({...editingReport, version: e.target.value})}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Papel</label>
                        <select 
                          className="input-premium" 
                          style={{ width: '100%', height: '48px', padding: '0 12px' }}
                          value={editingReport.paperType}
                          onChange={e => setEditingReport({...editingReport, paperType: e.target.value})}
                        >
                          <option value="Carta">Carta</option>
                          <option value="Oficio">Oficio</option>
                          <option value="A4">A4</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Fecha de Vigencia</label>
                        <input 
                          className="input-premium" 
                          style={{ width: '100%', height: '48px' }}
                          value={editingReport.date}
                          onChange={e => setEditingReport({...editingReport, date: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!success && (
                <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setEditingReport(null)} className="btn-secondary" style={{ padding: '10px 24px' }}>Cancelar</button>
                  <button onClick={handleUpdate} className="btn-premium" style={{ background: 'rgb(34, 197, 94)', padding: '10px 32px' }}>Aceptar</button>
                </div>
              )}
            </div>
          </div>
        )}
      </PermissionGate>

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(124, 58, 237, 0.02) !important;
        }
        .btn-icon-hover:hover {
          background: rgba(0,0,0,0.05) !important;
          color: var(--primary) !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
