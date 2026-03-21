'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';

export default function CreditNotesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [creditNotes, setCreditNotes] = useState<any[]>([]);

  // Búsqueda avanzada
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState('Todas');
  const [incluirAnuladas, setIncluirAnuladas] = useState(false);
  const [excluirSinSaldo, setExcluirSinSaldo] = useState(false);

  const filtered = creditNotes.filter((m: any) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', width: '380px' }}>
            <input 
              type="text" 
              placeholder="Buscar notas crédito..." 
              className="input-premium"
              style={{ flex: 1, height: '38px', background: 'white', borderRadius: '4px 0 0 4px', border: '1px solid #e5e7eb', borderRight: 'none', fontSize: '13px', paddingLeft: '12px', outline: 'none' }}
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            <button style={{ width: '40px', height: '38px', background: '#10b981', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Search size={16} />
            </button>
          </div>

          {/* Búsqueda avanzada Toggle */}
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Búsqueda avanzada {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Búsqueda avanzada panel (Dropdown version) */}
        {showAdvanced && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', width: '100%' }}>
            
            <div style={{ position: 'relative' }}>
              <DateRangePicker 
                value={fechaFiltro} 
                onChange={(val: string) => setFechaFiltro(val)} 
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
              <input type="checkbox" checked={incluirAnuladas} onChange={() => setIncluirAnuladas(!incluirAnuladas)} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
              ¿Incluir anuladas?
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
              <input type="checkbox" checked={excluirSinSaldo} onChange={() => setExcluirSinSaldo(!excluirSinSaldo)} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
              Excluir sin saldo disponible
            </label>

          </div>
        )}

      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white', border: '1px solid #e5e7eb', minHeight: '120px', borderRadius: '8px' }}>
        {filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>NOMBRE / DESCRIPCIÓN</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>VALOR</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#6b7280', fontWeight: '700' }}>FECHA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 20px', color: '#1f2937', fontWeight: '600', fontSize: '13px' }}>
                    {m.name}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4b5563', fontWeight: '500' }}>
                    ${m.value}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>
                    {m.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '24px', textAlign: 'left' }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              No hay registros.
            </p>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
