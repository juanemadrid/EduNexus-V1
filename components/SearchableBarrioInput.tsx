'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { BARRIOS_BY_CITY } from '@/lib/colombiaData';

export default function SearchableBarrioInput({ city, value, onChange }: { city: string, value: string, onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const [customBarrios, setCustomBarrios] = useState<Record<string, string[]>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_custom_barrios');
      if (saved) setCustomBarrios(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const baseBarrios = (city && BARRIOS_BY_CITY[city]) ? BARRIOS_BY_CITY[city] : [];
  const addedBarrios = (city && customBarrios[city]) ? customBarrios[city] : [];
  const allBarrios = [...new Set([...baseBarrios, ...addedBarrios])];

  const q = (value || '').toLowerCase().trim();
  const filtered = allBarrios.filter(b => b.toLowerCase().includes(q));
  const exactMatch = allBarrios.some(b => b.toLowerCase() === q);

  const handleAdd = () => {
    if (!city || !q) return;
    const updated = { ...customBarrios };
    if (!updated[city]) updated[city] = [];
    if (!exactMatch) {
      updated[city].push(value.trim());
      setCustomBarrios(updated);
      localStorage.setItem('edunexus_custom_barrios', JSON.stringify(updated));
    }
    onChange(value.trim());
    setShow(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input 
          className="input-premium" 
          style={{ width: '100%', paddingRight: q.length > 0 && !exactMatch ? '85px' : '36px', fontSize: '13px', height: '38px', background: 'white' }}
          value={value} 
          onChange={e => { onChange(e.target.value); setShow(true); }} 
          onFocus={() => setShow(true)} 
          placeholder={city ? "Buscar o escribir barrio..." : "Primero seleccione municipio..."}
          disabled={!city}
        />
        {q.length > 0 && !exactMatch && city ? (
           <button 
             onClick={(e) => { e.preventDefault(); handleAdd(); }}
             style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', height: '26px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 5px rgba(16, 185, 129, 0.3)', zIndex: 10 }}
             title="Guardar barrio"
             type="button"
             onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
             onMouseLeave={e => e.currentTarget.style.filter = 'none'}
           >
             Guardar
           </button>
        ) : (
           <Search size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
        )}
      </div>
      
      {show && city && filtered.length > 0 && (
        <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 3500, marginTop: '4px', padding: '6px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          {filtered.map((b, i) => (
            <div key={i} onClick={() => { onChange(b); setShow(false); }}
              style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-main)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {b}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
