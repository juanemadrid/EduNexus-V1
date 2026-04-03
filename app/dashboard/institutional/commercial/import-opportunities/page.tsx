'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Filter } from 'lucide-react';

export default function Page() {
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', width: '400px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Buscar..." className="input-premium" style={{ height: '38px', paddingLeft: '36px', fontSize: '13px' }} />
          </div>
          <button style={{ height: '38px', padding: '0 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#4b5563', cursor: 'pointer' }}>
            <Filter size={14} /> Filtrar
          </button>
        </div>
        <button style={{ height: '38px', padding: '0 16px', background: '#10b981', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'white', cursor: 'pointer' }}>
          <Plus size={16} /> Nuevo registro
        </button>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 24px', background: '#f9fafb' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#374151' }}>Listado General</h2>
        </div>
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#9ca3af' }}>
            <Search size={24} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px' }}>No hay registros configurados</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>No se encontraron datos en esta vista. Intenta limpiar los filtros o agregar un registro nuevo.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
