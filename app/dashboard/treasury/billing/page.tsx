'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { MOCK_PAYMENTS } from '@/lib/mockData';
import { FileText, Download, Filter } from 'lucide-react';
import React from 'react';

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px' }}>Tesoreria - Facturación</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Control de recaudos, cartera y facturación electrónica.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
           <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px' }}>RECAUDOS MES</p>
           <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)' }}>$42.8M</h2>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
           <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px' }}>CARTERA PENDIENTE</p>
           <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444' }}>$12.5M</h2>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
           <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px' }}>RECIBOS GENERADOS</p>
           <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)' }}>148</h2>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.015)' }}>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800' }}>Factura</th>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800' }}>Estudiante</th>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800' }}>Monto</th>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800' }}>Estado</th>
              <th style={{ textAlign: 'right', padding: '18px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800' }}>CSV/PDF</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PAYMENTS.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '20px 32px', fontWeight: '700' }}>{p.id}</td>
                <td style={{ padding: '20px 32px', fontWeight: '600' }}>{p.student}</td>
                <td style={{ padding: '20px 32px', fontWeight: '700' }}>${p.amount.toLocaleString()}</td>
                <td style={{ padding: '20px 32px' }}>
                   <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', background: p.status === 'paid' ? '#10b98120' : '#ef444420', color: p.status === 'paid' ? 'var(--primary)' : '#ef4444' }}>
                     {p.status.toUpperCase()}
                   </span>
                </td>
                <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                   <Download size={18} style={{ color: 'var(--primary)', cursor: 'pointer' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
