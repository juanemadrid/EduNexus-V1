'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { MOCK_COURSES } from '@/lib/mockData';
import { Edit3, CheckCircle, AlertTriangle } from 'lucide-react';
import React from 'react';

export default function GradesPage() {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px' }}>Gestión de Calificaciones</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Ingreso masivo de notas y control de promedios por curso.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
        {MOCK_COURSES.map((course) => (
          <div key={course.id} className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{course.name}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>Docente: {course.teacher}</p>
              <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', marginTop: '14px' }}>{course.students} Estudiantes Matriculados</p>
            </div>
            <button className="btn-premium" style={{ padding: '12px 20px', fontSize: '12px' }}>
              <Edit3 size={16} /> Abrir Planilla
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
