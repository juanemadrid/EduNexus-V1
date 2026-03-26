'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  Layers, 
  Download, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';

interface Level {
  id: string;
  code: string;
  name: string;
  period: string;
  order: number;
  status: 'Activo' | 'Inactivo';
}

const INITIAL_LEVELS: Level[] = [
  { id: '1', code: '01', name: 'Bimestre Nº 1', period: '2025-01', order: 1, status: 'Activo' },
  { id: '2', code: '02', name: 'Bimestre Nº 2', period: '2025-01', order: 2, status: 'Activo' },
  { id: '3', code: '03', name: 'Bimestre Nº 3', period: '2025-01', order: 3, status: 'Activo' },
  { id: '4', code: '04', name: 'Bimestre Nº 4', period: '2025-01', order: 4, status: 'Activo' },
  { id: '5', code: '05', name: 'Bimestre Nº 5', period: '2025-01', order: 5, status: 'Activo' },
  { id: '6', code: '06', name: 'Bimestre Nº 6', period: '2025-01', order: 6, status: 'Activo' },
  { id: '7', code: '07', name: 'Bimestre Nº 7', period: '2025-01', order: 7, status: 'Activo' },
  { id: '8', code: '08', name: 'Bimestre Nº 8', period: '2025-01', order: 8, status: 'Activo' },
  { id: '9', code: '09', name: 'PRIMERO SEMESTRE', period: '2025-01', order: 9, status: 'Activo' },
  { id: '10', code: '10', name: 'SEGUNDO SEMESTRE', period: '2025-01', order: 10, status: 'Activo' },
  { id: '11', code: '11', name: 'TERCERO SEMESTRE', period: '2025-01', order: 11, status: 'Activo' },
  { id: '12', code: '13', name: 'CUARTO SEMESTRE', period: '2025-02', order: 12, status: 'Activo' },
];

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_levels');
      return saved ? JSON.parse(saved) : INITIAL_LEVELS;
    }
    return INITIAL_LEVELS;
  });

  const [periods, setPeriods] = useState<string[]>(['2025-01', '2025-02']);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPeriods = localStorage.getItem('edunexus_periods');
      if (savedPeriods) {
        const pList = JSON.parse(savedPeriods);
        const pNames = pList.map((p: any) => p.name);
        if (pNames.length > 0) {
          setPeriods(pNames);
          if (!pNames.includes(form.period)) {
            setForm(prev => ({ ...prev, period: pNames[0] || '' }));
          }
        }
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    code: '',
    name: '',
    period: '2025-01',
    order: '',
    status: 'Activo' as 'Activo' | 'Inactivo'
  });

  useEffect(() => {
    localStorage.setItem('edunexus_levels', JSON.stringify(levels));
  }, [levels]);

  const handleSave = () => {
    if (!form.code || !form.name || !form.order) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const newLevel: Level = {
      id: Date.now().toString(),
      code: form.code,
      name: form.name.toUpperCase(),
      period: form.period,
      order: parseInt(form.order),
      status: form.status
    };

    setLevels([...levels, newLevel]);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setForm({ code: '', name: '', period: periods[0] || '', order: '', status: 'Activo' });
    }, 1500);
  };

  const filtered = levels.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Gestión de Niveles</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Niveles Académicos</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <Download size={18} /> Exportar
          </button>
          <button 
            className="btn-premium" 
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
          >
            <Plus size={20} strokeWidth={3} /> Crear nivel
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--primary-glow))' }} />
        <div style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar niveles por nombre o código..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '52px', fontSize: '15px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
        </div>
      </div>

      {/* Levels Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Código', 'Nombre', 'Período', 'Ordenamiento', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a,b) => a.order - b.order).map((level) => (
              <tr key={level.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--primary)' }}>{level.code}</span>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                        <Layers size={16} />
                     </div>
                     <span style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{level.name}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: '6px' }}>{level.period}</span>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowUpDown size={14} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{level.order}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: level.status === 'Activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: level.status === 'Activo' ? '#059669' : '#dc2626'
                  }}>
                    {level.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={18} /></button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Eliminar este nivel?')) {
                            setLevels(levels.filter(l => l.id !== level.id));
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} 
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Crear Nuevo Nivel</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Define un nuevo escalafón académico</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={40} />
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Nivel Registrado!</h3>
                   <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>El nivel académico se ha creado correctamente.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Código *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="14"
                        value={form.code}
                        onChange={e => setForm({...form, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre del Nivel *</label>
                      <input 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="QUINTO SEMESTRE"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Período *</label>
                      <select 
                        className="input-premium" 
                        style={{ width: '100%', height: '48px', appearance: 'none' }}
                        value={form.period}
                        onChange={e => setForm({...form, period: e.target.value})}
                      >
                        {periods.map(p => (
                           <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Ordenamiento *</label>
                      <input 
                        type="number"
                        className="input-premium" 
                        style={{ width: '100%', height: '48px' }} 
                        placeholder="13"
                        value={form.order}
                        onChange={e => setForm({...form, order: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!success && (
              <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-glow)' }}
                >
                  Crear Nivel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(124, 58, 237, 0.02) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
      `}</style>
    </DashboardLayout>
  );
}
