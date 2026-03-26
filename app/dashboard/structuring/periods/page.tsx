'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  Calendar, 
  Download, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  Clock,
  UserX,
  ArrowUpDown
} from 'lucide-react';

interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  inactivationDate: string;
  order: number;
  status: 'Activo' | 'Inactivo';
}

const INITIAL_PERIODS: Period[] = [
  { id: '1', name: '2025-01', startDate: '2025-02-03', endDate: '2025-06-28', inactivationDate: '', order: 1, status: 'Activo' },
  { id: '2', name: '2025-02', startDate: '2025-07-01', endDate: '2025-11-29', inactivationDate: '', order: 2, status: 'Activo' },
  { id: '3', name: '2024-01', startDate: '2024-02-17', endDate: '2024-06-22', inactivationDate: '', order: 3, status: 'Activo' },
  { id: '4', name: '2024-02', startDate: '2024-08-10', endDate: '2024-12-14', inactivationDate: '', order: 4, status: 'Activo' },
  { id: '5', name: '2026-01', startDate: '2026-02-16', endDate: '2026-06-27', inactivationDate: '', order: 5, status: 'Activo' },
];

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_periods');
      return saved ? JSON.parse(saved) : INITIAL_PERIODS;
    }
    return INITIAL_PERIODS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    inactivationDate: '',
    order: '',
    status: 'Activo' as 'Activo' | 'Inactivo'
  });

  useEffect(() => {
    localStorage.setItem('edunexus_periods', JSON.stringify(periods));
  }, [periods]);

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate || !form.order) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const newPeriod: Period = {
      id: Date.now().toString(),
      name: form.name.toUpperCase(),
      startDate: form.startDate,
      endDate: form.endDate,
      inactivationDate: form.inactivationDate,
      order: parseInt(form.order),
      status: form.status
    };

    setPeriods([...periods, newPeriod]);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setForm({ name: '', startDate: '', endDate: '', inactivationDate: '', order: '', status: 'Activo' });
    }, 1500);
  };

  const filtered = periods.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Períodos Académicos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Ciclos Educativos</span>
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
            <Plus size={20} strokeWidth={3} /> Crear período
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
              placeholder="Buscar períodos por nombre..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '52px', fontSize: '15px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-premium" style={{ padding: '0 24px', height: '52px' }}>Buscar</button>
        </div>
      </div>

      {/* Table Content */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {['Ordenamiento', 'Período', 'Fecha inicio', 'Fecha fin', 'Inactivar estudiantes', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 6 ? 'right' : 'left', padding: '20px 32px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a,b) => b.order - a.order).map((period) => (
              <tr key={period.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-dim)' }}>{period.order}</span>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Calendar size={18} />
                    </div>
                    <span style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{period.name}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px', fontSize: '14px', fontWeight: '500' }}>{formatDate(period.startDate)}</td>
                <td style={{ padding: '24px 32px', fontSize: '14px', fontWeight: '500' }}>{formatDate(period.endDate)}</td>
                <td style={{ padding: '24px 32px', fontSize: '14px', fontWeight: '500', color: period.inactivationDate ? '#dc2626' : 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {period.inactivationDate && <UserX size={14} />}
                    {formatDate(period.inactivationDate)}
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: period.status === 'Activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: period.status === 'Activo' ? '#059669' : '#dc2626'
                  }}>
                    {period.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={18} /></button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Eliminar este período?')) {
                            setPeriods(periods.filter(p => p.id !== period.id));
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
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Crear período</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Agregue un nuevo ciclo académico al sistema</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={40} />
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Período Creado!</h3>
                   <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>La información ha sido guardada exitosamente.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre *</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="Ej: 2026-02"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Fecha inicio *</label>
                    <input 
                      type="date"
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      value={form.startDate}
                      onChange={e => setForm({...form, startDate: e.target.value})}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Fecha fin *</label>
                    <input 
                      type="date"
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      value={form.endDate}
                      onChange={e => setForm({...form, endDate: e.target.value})}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Inactivar estudiantes</label>
                    <input 
                      type="date"
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      value={form.inactivationDate}
                      onChange={e => setForm({...form, inactivationDate: e.target.value})}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Ordenamiento *</label>
                    <input 
                      type="number"
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="6"
                      value={form.order}
                      onChange={e => setForm({...form, order: e.target.value})}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado *</label>
                    <div style={{ display: 'flex', gap: '20px', height: '48px', alignItems: 'center' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                          <input type="radio" checked={form.status === 'Activo'} onChange={() => setForm({...form, status: 'Activo'})} /> Activo
                       </label>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                          <input type="radio" checked={form.status === 'Inactivo'} onChange={() => setForm({...form, status: 'Inactivo'})} /> Inactivo
                       </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
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
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(16, 185, 129, 0.02) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </DashboardLayout>
  );
}
