'use client';
import React, { useState, useEffect } from 'react';
import { Search, FileDown, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';

export default function NotEnrolledPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [localStudents, setLocalStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  
  const [programs, setPrograms] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [niveles, setNiveles] = useState<any[]>([]);

  const [form, setForm] = useState({
    programaId: '',
    sedeId: '',
    periodo: '',
    nivel: ''
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await db.list<any>('students', { isEnrolled: false });
      setLocalStudents(data);
    } catch (error) {
       console.error("Error fetching not enrolled students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    Promise.all([
      db.list<any>('academic_programs'),
      db.list<any>('sedes'),
      db.list<any>('academic_periods'),
      db.list<any>('levels'),
    ]).then(([progs, sedesData, peri, nivelesData]) => {
      setPrograms(progs);
      setSedes(sedesData);
      setPeriods(peri);
      // Sort niveles by order field
      const sorted = [...nivelesData].sort((a, b) => (a.order || 0) - (b.order || 0));
      setNiveles(sorted);
      if (peri.length > 0) setForm(f => ({ ...f, periodo: peri[0].nombre || peri[0].name || peri[0].id }));
      if (progs.length > 0) setForm(f => ({ ...f, programaId: progs[0].id }));
      if (sedesData.length > 0) setForm(f => ({ ...f, sedeId: sedesData[0].id }));
      // Default first nivel
      if (sorted.length > 0) setForm(f => ({ ...f, nivel: sorted[0].id }));
    });
  }, []);

  const openEnrollModal = (id: string) => {
    setEnrollingId(id);
    setShowModal(true);
  };

  const handleEnroll = async () => {
    if (!enrollingId) return;
    if (!form.programaId || !form.sedeId || !form.periodo) {
        alert('Debe seleccionar Programa, Sede y Período.');
        return;
    }
    try {
      const selectedProg = programs.find(p => p.id === form.programaId);
      const selectedSede = sedes.find(s => s.id === form.sedeId);

      await db.update('students', enrollingId, { 
          isEnrolled: true, 
          isActive: true,
          programaId: form.programaId,
          programa: selectedProg?.nombre || selectedProg?.name || '',
          sedeId: form.sedeId,
          sede: selectedSede?.nombre || selectedSede?.name || '',
          periodo: form.periodo,
          nivelId: form.nivel,
          nivel: niveles.find(n => n.id === form.nivel)?.name || form.nivel
      });
      alert('Matrícula formalizada exitosamente.');
      setShowModal(false);
      setEnrollingId(null);
      fetchStudents();
    } catch (error) {
       console.error("Error formalizing enrollment:", error);
    }
  };

  const filteredStudents = localStudents.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>Inscritos no matriculados</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión de alumnos preinscritos pendientes de matrícula formal</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button className="btn-premium" style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileDown size={18} /> Exportar Excel
           </button>
           <button className="btn-premium" style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileDown size={18} /> Exportar PDF
           </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o identificación..." 
                className="input-premium" 
                style={{ paddingLeft: '48px', height: '48px', background: 'white', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="btn-premium" style={{ height: '48px', padding: '0 24px', background: 'var(--primary)', color: 'white' }}>Buscar</button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Estudiante</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Identificación</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Programa</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '12px', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Cargando información...</td></tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{s.name.toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Preinscrito</div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155' }}>{s.id}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{s.details?.programa || s.details?.program || 'Bachillerato Académico'}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <button 
                      onClick={() => openEnrollModal(s.id)}
                      className="btn-premium" 
                      style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', fontSize: '12px' }}
                    >
                      Matricular
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No se encontraron registros</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ENROLLMENT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '450px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'var(--primary)', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white' }}>Formalizar Matrícula</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><X size={22} /></button>
            </div>
            
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>Sede *</label>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px' }}
                  value={form.sedeId} onChange={e => setForm(f => ({ ...f, sedeId: e.target.value }))}>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre || s.name}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>Programa *</label>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px' }}
                  value={form.programaId} onChange={e => setForm(f => ({ ...f, programaId: e.target.value }))}>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>Nivel / Grado *</label>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px' }}
                  value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}>
                  {(() => {
                    const selectedProgName = programs.find(p => p.id === form.programaId)?.nombre?.toLowerCase() || '';
                    
                    // Determine which categories of levels to show based on the selected program
                    let allowedCategories: string[] = [];
                    if (selectedProgName.includes('prees') || selectedProgName.includes('infantil')) {
                      allowedCategories = ['Preescolar'];
                    } else if (selectedProgName.includes('primaria')) {
                      allowedCategories = ['Básica Primaria'];
                    } else if (selectedProgName.includes('media')) {
                      allowedCategories = ['Media'];
                    } else {
                      // Bachillerato / Secundaria / default = show all secondary + media
                      allowedCategories = ['Básica Secundaria', 'Media'];
                    }

                    const filtered = niveles.filter(n => allowedCategories.includes(n.category));
                    
                    if (filtered.length === 0) {
                      // Fallback: show all niveles if categorization doesn't match
                      return niveles.map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ));
                    }
                    return filtered.map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ));
                  })()}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>Período Académico *</label>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px' }}
                  value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))}>
                  {periods.map(p => <option key={p.id} value={p.nombre || p.name || p.id}>{p.nombre || p.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fafafa' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleEnroll} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>
                Confirmar Matrícula
              </button>
            </div>
          </div>
        </div>
      )}


      <style jsx global>{`
        .glass-panel { border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .input-premium { border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; }
        .input-premium:focus { border-color: var(--primary); }
        .btn-premium { border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-premium:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>
    </DashboardLayout>
  );
}
