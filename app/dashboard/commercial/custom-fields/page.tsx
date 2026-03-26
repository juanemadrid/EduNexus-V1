'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus } from 'lucide-react';
import React from 'react';

export default function CustomFieldsPage() {
  const Section = ({ title }: { title: string }) => (
    <div className="glass-panel" style={{ marginBottom: '20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ background: '#f9fafb', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#4b5563', fontWeight: '600' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', fontWeight: '600' }}>
             <input type="checkbox" style={{ width: '13px', height: '13px', margin: 0 }} />
             Incluir inactivos
          </label>
          <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={14} /> Crear campo personalizado
          </button>
        </div>
      </div>
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, fontWeight: '500' }}>
           No hay registros, verifique los filtros de la consulta o <span style={{ color: '#3b82f6', cursor: 'pointer' }}>cree uno nuevo</span>
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px' }}>
        <Section title="Campos personalizados oportunidades" />
        <Section title="Campos personalizados negocios" />
        <Section title="Campos personalizados contactos" />
      </div>
    </DashboardLayout>
  );
}
