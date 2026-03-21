import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  value: string;
  onChange: (val: string, customRange?: { from: string; to: string }) => void;
}

const PREDEFINED_RANGES = [
  'Hoy',
  'Ayer',
  'Últimos 7 días',
  'Últimos 30 días',
  'Este mes',
  'Mes anterior',
  'Rango personalizado'
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalCustom, setInternalCustom] = useState({ from: '', to: '' });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (range: string) => {
    if (range === 'Rango personalizado') {
      onChange(range); // Just sets the label to opening the custom view
    } else {
      onChange(range);
      setIsOpen(false);
    }
  };

  const applyCustomRange = () => {
    if (!internalCustom.from || !internalCustom.to) {
      alert('Por favor ingrese fecha de inicio y fin.');
      return;
    }
    onChange('Rango personalizado', internalCustom);
    setIsOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button pretending to be a select */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-premium"
        style={{ 
          width: '100%', 
          height: '42px', 
          background: '#f8fafc', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          textAlign: 'left',
          fontSize: '14px',
          color: '#1e293b',
          cursor: 'pointer'
        }}
      >
        <span>{value === 'Rango personalizado' && internalCustom.from && internalCustom.to 
           ? `${internalCustom.from} al ${internalCustom.to}` 
           : value || 'Seleccione fecha'}</span>
        <ChevronDown size={16} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Options List */}
          <div style={{ padding: '8px' }}>
            {PREDEFINED_RANGES.map(range => (
               <button
                 key={range}
                 onClick={() => handleSelect(range)}
                 style={{
                   width: '100%',
                   textAlign: 'left',
                   padding: '10px 16px',
                   background: value === range ? 'var(--primary-glow)' : 'transparent',
                   color: value === range ? 'var(--primary)' : '#475569',
                   border: 'none',
                   borderRadius: '10px',
                   cursor: 'pointer',
                   fontSize: '13px',
                   fontWeight: value === range ? '700' : '500',
                   transition: '0.2s'
                 }}
                 onMouseEnter={e => {
                   if (value !== range) e.currentTarget.style.background = '#f1f5f9';
                 }}
                 onMouseLeave={e => {
                   if (value !== range) e.currentTarget.style.background = 'transparent';
                 }}
               >
                 {range}
               </button>
            ))}
          </div>

          {/* Custom Range Inputs (only shows if selected) */}
          {value === 'Rango personalizado' && (
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px', background: '#f8fafc' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Desde</label>
                  <input 
                    type="date" 
                    className="input-premium" 
                    style={{ width: '100%', height: '36px', fontSize: '12px', padding: '0 8px' }} 
                    value={internalCustom.from}
                    onChange={e => setInternalCustom(p => ({ ...p, from: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Hasta</label>
                  <input 
                    type="date" 
                    className="input-premium" 
                    style={{ width: '100%', height: '36px', fontSize: '12px', padding: '0 8px' }}
                    value={internalCustom.to}
                    onChange={e => setInternalCustom(p => ({ ...p, to: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={applyCustomRange}
                  className="btn-premium"
                  style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '8px', fontSize: '12px', border: 'none' }}
                >
                  Aceptar
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', borderRadius: '10px', padding: '8px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
