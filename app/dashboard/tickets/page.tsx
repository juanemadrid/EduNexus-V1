'use client';
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Download, Plus, ChevronDown, ChevronUp, Filter } from 'lucide-react';

export default function TicketsPage() {
  const [showAdvanced, setShowAdvanced] = useState(true);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '28px', fontWeight: '800' }}>Mis tickets</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Gestiona tus solicitudes y soporte técnico.</p>
        </div>
        <button className="btn-premium" style={{ background: 'var(--primary)', padding: '12px 24px', fontSize: '14px' }}>
          <Plus size={18} /> Crear ticket
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Buscar ticket..." 
                className="input-premium"
                style={{ paddingLeft: '48px', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
            </div>
            <button style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '0 20px', 
              borderTopRightRadius: '12px', 
              borderBottomRightRadius: '12px',
              cursor: 'pointer'
            }}>
              <Search size={18} />
            </button>
          </div>

          {/* Export Button */}
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'white', 
            border: '1px solid var(--glass-border)', 
            padding: '12px 20px', 
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-main)',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}>
            <Download size={18} /> Exportar
          </button>

          {/* Advanced Search Toggle */}
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Búsqueda avanzada {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Filters Row */}
        {showAdvanced && (
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginTop: '20px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <select className="input-premium" style={{ paddingRight: '40px' }}>
                <option>2026</option>
                <option>2026</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <select className="input-premium" style={{ paddingRight: '40px' }}>
                <option>Nuevo</option>
                <option>En proceso</option>
                <option>Cerrado</option>
              </select>
            </div>
            <div style={{ flex: 2 }}></div>
          </div>
        )}
      </div>

      {/* Empty State */}
      <div className="glass-panel" style={{ 
        padding: '60px 40px', 
        textAlign: 'center', 
        background: 'rgba(255,255,255,0.4)',
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderColor: 'rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          background: 'white', 
          width: '64px', 
          height: '64px', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          color: 'var(--text-dim)'
        }}>
          <Filter size={28} />
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '600', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
          No hay registros, verifique los filtros de la consulta e inténtelo nuevamente
        </p>
      </div>
    </DashboardLayout>
  );
}
