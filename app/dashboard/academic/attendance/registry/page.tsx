'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  User,
  Search, 
  Save, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  UserCheck,
  UserMinus,
  AlertTriangle,
  History,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { db } from '@/lib/db';

export default function ManualAttendanceRegistry() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedPrograma, setSelectedPrograma] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'A' | 'I' | 'T' | 'J'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    db.list('sedes').then(setSedes);
    db.list('academic_programs').then(setProgramas);
  }, []);

  useEffect(() => {
    if (selectedSede && selectedPrograma) {
      db.list('cursos').then((allCursos: any[]) => {
        const filtered = allCursos.filter((c: any) => 
          (c.sedeId === selectedSede || c.sede === selectedSede || c.sedeJornada?.startsWith(selectedSede)) && 
          (c.programaId === selectedPrograma || c.programa === selectedPrograma)
        );
        setCursos(filtered);
      });
    } else {
      setCursos([]);
    }
    setSelectedCurso('');
    setStudents([]);
    setAttendance({});
  }, [selectedSede, selectedPrograma]);

  const handleConsultar = async () => {
    if (!selectedCurso) return;

    const allGrupos = await db.list('grupos');
    const group = allGrupos.find((g: any) => g.id === selectedCurso || g.cursoId === selectedCurso);
    
    if (group && ((group as any).students || (group as any).estudiantes)) {
      const studentIds = (group as any).students || (group as any).estudiantes;
      // Fetch actual student objects
      const allStudents = await db.list('registered_students');
      const groupStudents = allStudents.filter((s: any) => studentIds.includes(s.id));
      setStudents(groupStudents);
      
      // Load existing attendance for this date (FILTERED)
      const dateRecords = await db.list('attendance_records', { 
        cursoId: selectedCurso, 
        date: selectedDate 
      });
      
      const initialAttendance: Record<string, 'A' | 'I' | 'T' | 'J'> = {};
      groupStudents.forEach((s: any) => {
        const record = dateRecords.find((r: any) => r.studentId === s.id);
        initialAttendance[s.id] = record ? (record as any).status : 'A';
      });
      setAttendance(initialAttendance);
    } else {
      const allStudents = await db.list('registered_students');
      const courseStudents = allStudents.filter((s: any) => s.details?.cursoId === selectedCurso);
      setStudents(courseStudents);
      
      const dateRecords = await db.list('attendance_records', { 
        cursoId: selectedCurso, 
        date: selectedDate 
      });

      const initialAttendance: Record<string, 'A' | 'I' | 'T' | 'J'> = {};
      courseStudents.forEach((s: any) => {
        const record = dateRecords.find((r: any) => r.studentId === s.id);
        initialAttendance[s.id] = record ? (record as any).status : 'A';
      });
      setAttendance(initialAttendance);
    }
    setSaveStatus('idle');
  };

  const handleStatusChange = (studentId: string, status: 'A' | 'I' | 'T' | 'J') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const existingRecords = await db.list('attendance_records', {
        cursoId: selectedCurso,
        date: selectedDate
      });
      
      const batchItems = students.map(s => {
        const existing = existingRecords.find((r: any) => r.studentId === s.id);
        const recordData = {
          studentId: s.id,
          studentName: s.name || `${s.nombres} ${s.apellidos}`,
          cursoId: selectedCurso,
          date: selectedDate,
          status: attendance[s.id] || 'A',
          periodo: '2026-01',
          recordedAt: new Date().toISOString()
        };

        return {
          id: existing ? ((existing as any).id || (existing as any)._docId) : undefined,
          data: recordData
        };
      });

      await db.batchSave('attendance_records', batchItems);
      setSaveStatus('success');
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '32px', margin: 0 }}>Registro de Asistencia</h1>
            <p style={{ color: '#64748b' }}>Control manual de asistencia por curso y fecha.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/dashboard/academic/attendance/scanner">
              <button className="btn-premium" style={{ background: '#475569', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} /> Modo Escáner
              </button>
            </Link>
            <Link href="/dashboard/reports/consolidado-de-asistencias-asignaturas-individuales">
              <button className="btn-premium" style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} /> Ver Consolidado
              </button>
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass-panel" style={{ padding: '25px', marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Sede - Jornada</label>
              <select value={selectedSede} onChange={(e) => setSelectedSede(e.target.value)} style={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 15px', fontSize: '14px' }}>
                <option value="">Seleccione Sede...</option>
                {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre} - {s.jornada}</option>)}
              </select>
            </div>
            
            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Programa</label>
              <select value={selectedPrograma} onChange={(e) => setSelectedPrograma(e.target.value)} style={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 15px', fontSize: '14px' }}>
                <option value="">Seleccione Programa...</option>
                {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Curso / Asignatura</label>
              <select value={selectedCurso} onChange={(e) => setSelectedCurso(e.target.value)} style={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 15px', fontSize: '14px' }}>
                <option value="">Seleccione Curso...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Fecha de Sesión</label>
              <div style={{ position: 'relative' }}>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 15px', fontSize: '14px' }} />
              </div>
            </div>

            <button onClick={handleConsultar} className="btn-premium" style={{ height: '45px', background: '#1e40af', color: 'white' }}>
              CARGAR LISTADO
            </button>
          </div>
        </div>

        {/* Attendance List */}
        <AnimatePresence>
          {students.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9', background: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={20} color="#1e40af" />
                    <span style={{ fontWeight: '800', fontSize: '15px' }}>Listado de Estudiantes</span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>{students.length} estudiantes inscritos</span>
                 </div>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></div> Asistió
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></div> Inasistencia
                    </div>
                 </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <th style={{ padding: '15px 30px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Estudiante</th>
                      <th style={{ padding: '15px 30px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>ID / Documento</th>
                      <th style={{ padding: '15px 30px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Estado de Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'transparent' : 'rgba(248, 250, 252, 0.5)' }}>
                        <td style={{ padding: '15px 30px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={18} color="#1e40af" />
                            </div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>{s.id}</td>
                        <td style={{ padding: '15px 30px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            {[
                              { id: 'A', label: 'Asistió', color: '#059669', icon: <UserCheck size={14} /> },
                              { id: 'I', label: 'Inasistencia', color: '#dc2626', icon: <UserMinus size={14} /> },
                              { id: 'T', label: 'Tardanza', color: '#d97706', icon: <Clock size={14} /> },
                              { id: 'J', label: 'Justificada', color: '#2563eb', icon: <AlertCircle size={14} /> }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => handleStatusChange(s.id, opt.id as any)}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid',
                                  borderColor: attendance[s.id] === opt.id ? opt.color : '#e2e8f0',
                                  background: attendance[s.id] === opt.id ? opt.color : 'white',
                                  color: attendance[s.id] === opt.id ? 'white' : '#64748b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {opt.icon} {opt.id}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '30px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'center' }}>
                <AnimatePresence>
                  {saveStatus === 'success' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: '800', fontSize: '14px' }}>
                      <CheckCircle2 size={18} /> ¡Asistencia guardada con éxito!
                    </motion.div>
                  )}
                  {saveStatus === 'error' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '800', fontSize: '14px' }}>
                      <AlertTriangle size={18} /> Error al guardar los datos.
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="btn-premium" 
                  style={{ background: '#1e40af', color: 'white', padding: '12px 35px', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  {isSaving ? <History className="spin-slow" size={18} /> : <Save size={18} />}
                  {isSaving ? 'GUARDANDO...' : 'GUARDAR ASISTENCIA'}
                </button>
              </div>
            </motion.div>
          ) : selectedCurso && (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
               <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 15px' }} />
               <h3 style={{ margin: 0, color: '#1e293b' }}>No se encontraron estudiantes</h3>
               <p style={{ color: '#64748b', fontSize: '14px' }}>Asegúrese de que el curso tenga estudiantes vinculados en el módulo de Estructuración.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .spin-slow { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
