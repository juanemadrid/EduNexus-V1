'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
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

const INITIAL_REPORTS: CustomReport[] = [
  { id: '1', originalName: 'ANULACIONES Y DEVOLUCIONES', customTitle: 'ANULACIONES Y DEVOLUCIONES', code: '01', version: '0.1', paperType: 'Carta', date: '15/05/2014' },
  { id: '2', originalName: 'Pagos a Pensiones', customTitle: 'Archivo de Movimientos', code: '01', version: '0.1', paperType: 'Carta', date: '6/02/2020' },
  { id: '3', originalName: 'Asignación evidencias por curso', customTitle: 'Asignación evidencias por curso', code: '0', version: '', paperType: 'Carta', date: '24/01/2023' },
  { id: '4', originalName: 'CARTERA - CRÉDITOS', customTitle: 'CARTERA - CRÉDITOS', code: '0', version: '1', paperType: 'Carta', date: '20/08/2014' },
  { id: '5', originalName: 'CARTERA - PENSIONES', customTitle: 'CARTERA - PENSIONES', code: '0', version: '1', paperType: 'Carta', date: '20/08/2014' },
  { id: '6', originalName: 'COMPROBANTE DE PAZ Y SALVO', customTitle: 'COMPROBANTE DE PAZ Y SALVO', code: '0', version: '1', paperType: 'Carta', date: '9/10/2014' },
  { id: '7', originalName: 'CONSOLIDADO PLANES DE PAGO', customTitle: 'CONSOLIDADO PLANES DE PAGO', code: '01', version: '0.1', paperType: 'Carta', date: '4/05/2014' },
  { id: '8', originalName: 'FACTURA DE VENTA', customTitle: 'FACTURA DE VENTA', code: '01', version: '1', paperType: 'Carta', date: '28/07/2014' }
];

export default function ReportsConfigurationPage() {
  const [reports, setReports] = useState<CustomReport[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_reports_config');
      return saved ? JSON.parse(saved) : INITIAL_REPORTS;
    }
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('edunexus_reports_config', JSON.stringify(reports));
  }, [reports]);

  const handleUpdate = () => {
    if (!editingReport) return;
    
    setReports(reports.map(r => r.id === editingReport.id ? editingReport : r));
    setSuccess(true);
    setTimeout(() => {
      setEditingReport(null);
      setSuccess(false);
    }, 1500);
  };

  const filtered = reports.filter(r => 
    r.originalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.customTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Reportes Personalizados</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
          Personalización de títulos, versiones y formatos de impresión institucional
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre original o título personalizado..." 
            className="input-premium"
            style={{ paddingLeft: '48px', height: '52px', fontSize: '15px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Nombre original', 'Título personalizado', 'Código', 'Versión', 'Tipo papel', 'Fecha', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 6 ? 'right' : 'left', padding: '16px 32px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '16px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <FileText size={16} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                     <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{r.originalName}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 32px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-main)' }}>{r.customTitle}</span>
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
                     style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '6px', borderRadius: '8px', transition: '0.2s' }} 
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

      {/* Edit Modal */}
      {editingReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Personalizar Reporte</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '12px', fontWeight: '500' }}>{editingReport.originalName}</p>
              </div>
              <button onClick={() => setEditingReport(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                   <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={32} />
                   </div>
                   <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>¡Reporte Actualizado!</h3>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Título personalizado</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '44px' }}
                      value={editingReport.customTitle}
                      onChange={e => setEditingReport({...editingReport, customTitle: e.target.value})}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Código</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '44px' }}
                        value={editingReport.code}
                        onChange={e => setEditingReport({...editingReport, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Versión</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '44px' }}
                        value={editingReport.version}
                        onChange={e => setEditingReport({...editingReport, version: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Papel</label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '44px', padding: '0 12px' }}
                      value={editingReport.paperType}
                      onChange={e => setEditingReport({...editingReport, paperType: e.target.value})}
                    >
                      <option value="Carta">Carta</option>
                      <option value="Oficio">Oficio</option>
                      <option value="A4">A4</option>
                      <option value="Media Carta">Media Carta</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {!success && (
              <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => setEditingReport(null)}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdate}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                >
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
