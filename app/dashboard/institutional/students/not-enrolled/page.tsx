'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, FileDown, ChevronDown, ChevronLeft, ChevronRight, Upload, MoreVertical } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function NotEnrolledPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [localStudents, setLocalStudents] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_students');
    if (saved) {
      setLocalStudents(JSON.parse(saved));
    }
  }, []);

  const filteredStudents = localStudents.filter((s: any) => {
    const isNotEnrolled = s.isEnrolled === false;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
    return isNotEnrolled && matchesSearch;
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{s.name.toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Preinscrito</div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#334155' }}>{s.id}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>{s.details?.program || 'Bachillerato Académico'}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                    <button className="btn-premium" style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', fontSize: '12px' }}>Matricular</button>
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
