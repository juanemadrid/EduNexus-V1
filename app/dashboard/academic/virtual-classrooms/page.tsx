'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Archive } from 'lucide-react';
import React from 'react';

export default function VirtualClassroomsPage() {
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <Archive size={14} /> Clases finalizadas
        </button>
      </div>

      <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
          No hay registros
        </p>
      </div>
    </DashboardLayout>
  );
}
