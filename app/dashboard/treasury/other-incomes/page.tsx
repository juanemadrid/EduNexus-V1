'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, X as XIcon, Info, Receipt, User, Calendar, Filter, ArrowRight, Trash2, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function OtherIncomesPage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddThirdPartyModal, setShowAddThirdPartyModal] = useState(false);
  const [newThirdPartyName, setNewThirdPartyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayer, setSelectedPayer] = useState('');
  
  const [thirdParties, setThirdParties] = useState([
    { value: 'tercero1', label: 'Estudiante Ejemplo' },
    { value: 'tercero2', label: 'Acudiente Ejemplo' }
  ]);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    setIsLoading(true);
    try {
      const data = await db.list('other_incomes');
      setIncomes(data);
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPayer) {
      alert('Por favor seleccione un tercero.');
      return;
    }
    const payerName = thirdParties.find(t => t.value === selectedPayer)?.label || 'Desconocido';
    const newIncome = {
      name: payerName,
      payerId: selectedPayer,
      createdAt: new Date().toISOString(),
      type: 'OTHER_INCOME'
    };

    try {
      const docId = await db.create('other_incomes', newIncome);
      setIncomes(prev => [{ ...newIncome, id: docId, _docId: docId }, ...prev]);
      setShowModal(false);
      setSelectedPayer('');
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Error al registrar el ingreso.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este registro de ingreso?')) {
      try {
        await db.delete('other_incomes', id);
        setIncomes(prev => prev.filter(inc => inc.id !== id));
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const filtered = incomes.filter((m: any) =>
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.2)' }}>
              <Receipt size={28} />
           </div>
           <div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>Otros Ingresos</h1>
             <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>Registro de recaudos por conceptos extraordinarios</p>
           </div>
        </div>
        <button
          className="btn-premium"
          style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Registrar Ingreso
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
           <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
           <input 
             type="text" 
             placeholder="Buscar por nombre del pagador..." 
             className="input-premium"
             style={{ width: '100%', height: '52px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', paddingLeft: '48px', outline: 'none', fontSize: '14px' }}
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
           />
        </div>
      </div>

      <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
             <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
             <p style={{ marginTop: '16px', fontWeight: '800', color: '#64748b', fontSize: '14px' }}>Accediendo a registros financieros...</p>
          </div>
        ) : filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pagador / Tercero</th>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de Registro</th>
                <th style={{ textAlign: 'right', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} className="table-row" style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <User size={18} />
                       </div>
                       <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{m.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Calendar size={14} />
                       {new Date(m.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                     <button onClick={() => handleDelete(m.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff1f2', color: '#e11d48', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', margin: '0 auto 24px', border: '1px solid #f1f5f9' }}>
               <Receipt size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0' }}>Bandeja vacía</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', maxWidth: '300px', margin: '0 auto' }}>
              No se han registrado otros ingresos en el periodo actual.
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '500px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', animation: 'modalSlide 0.3s ease-out' }}>
            <div style={{ background: '#2563eb', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                     <Receipt size={20} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white' }}>Registrar Nuevo Ingreso</h2>
               </div>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><XIcon size={24} /></button>
            </div>

            <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Tercero de Pago <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowAddThirdPartyModal(true); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Plus size={14} /> Nuevo Tercero
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%', height: '52px', fontSize: '14px', borderRadius: '14px', appearance: 'none', background: '#f8fafc', color: '#1e293b', fontWeight: '600' }}
                    value={selectedPayer}
                    onChange={(e) => setSelectedPayer(e.target.value)}
                  >
                    <option value="">Seleccione un tercero de la lista</option>
                    {thirdParties.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: '#f8fafc' }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)' }}
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddThirdPartyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 3010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)', animation: 'modalSlide 0.2s ease-out' }}>
            <div style={{ background: '#1e293b', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'white' }}>Crear Nuevo Tercero</h2>
              <button onClick={() => { setShowAddThirdPartyModal(false); setNewThirdPartyName(''); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><XIcon size={20} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Nombre Completo o Razón Social *</label>
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Ej. Suministros Escolares S.A."
                style={{ width: '100%', height: '48px', background: '#f8fafc' }}
                value={newThirdPartyName}
                onChange={e => setNewThirdPartyName(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setShowAddThirdPartyModal(false); setNewThirdPartyName(''); }} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              <button 
                onClick={() => {
                  if (!newThirdPartyName.trim()) { alert('Debe ingresar un nombre'); return; }
                  const newValue = 'tercero_' + Date.now();
                  setThirdParties(prev => [...prev, { value: newValue, label: newThirdPartyName.trim() }]);
                  setSelectedPayer(newValue);
                  setShowAddThirdPartyModal(false);
                  setNewThirdPartyName('');
                }} 
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#1e293b', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                Crear Tercero
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; padding: 0 16px; }
        .input-premium:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); background: white !important; }
        .table-row:hover { background-color: #f8fafc !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalSlide { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </DashboardLayout>
  );
}
