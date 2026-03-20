'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Printer, ShieldCheck } from 'lucide-react';
import React from 'react';

export default function ReportsPage() {
  const reports = [
    { title: 'Boletines Académicos', desc: 'Generación masiva de informes de periodo.' },
    { title: 'Certificados de Estudio', desc: 'Documentos oficiales con firma digital.' },
    { title: 'Actas de Grado', desc: 'Registros finales de graduación.' },
  ];

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px' }}>Centro de Informes</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Producción de documentos oficiales y estadísticas institucionales.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {reports.map((r) => (
          <div key={r.title} className="glass-panel" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                  <FileText size={24} />
               </div>
               <div>
                  <h3 style={{ fontWeight: '800', fontSize: '18px' }}>{r.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{r.desc}</p>
               </div>
            </div>
            <button style={{ background: 'white', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Printer size={18} /> Generar PDF
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
